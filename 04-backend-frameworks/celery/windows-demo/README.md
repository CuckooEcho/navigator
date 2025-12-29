Celery+Redis+FastAPI 异步任务回调测试操作文档
一、测试概述

1. 测试目标
   验证基于 Celery+Redis 的异步任务队列能力，以及 FastAPI 接口的回调机制：

- FastAPI 接收短时间内 1000 次任务提交请求，将任务存入 Redis 队列；
- Celery Worker 以单进程方式依次处理队列中的任务（排队执行）；
- 每个任务处理完成后，通过 HTTP 回调将结果发送至独立的 FastAPI 回调服务。

2. 核心组件及分工
   | 组件 | 作用 | 端口 | 启动命令 |
   |---------------------|----------------------------------------|-------|-----------------------------------------------|
   | Redis | 作为 Celery 的消息队列和结果存储 | 6379 | 本地启动 Redis（默认配置） |
   | FastAPI 主服务 | 接收任务提交、查询任务状态 | 8000 | uvicorn main_api:app --host 0.0.0.0 --port 8000 |
   | FastAPI 回调服务 | 接收任务处理完成后的回调数据 | 8001 | uvicorn callback_receiver:app --host 0.0.0.0 --port 8001 |
   | Celery Worker | 消费 Redis 队列任务，依次处理并触发回调 | - | - |

补充说明：

- Celery Worker 无固定端口（其通过 Redis 与其他组件通信，非端口监听模式），因此端口列填 `-`；
- 若需补充 Celery Worker 启动命令，可参考典型写法：`celery -A celery_worker worker --loglevel=info`（需根据实际项目的 Celery 实例名称调整）。

- celery -A tasks.celery_app worker --loglevel=info -c 1
  二、环境准备

1. 基础环境要求

- Python 3.8+
- Redis 6.0+（本地运行，默认端口 6379，无需额外配置）
- 依赖包安装：
  pip install fastapi uvicorn celery redis requests

2. 代码文件准备
   将以下 3 个文件放在同一目录下：

（1）tasks.py（Celery 任务定义）

# tasks.py 最终可运行版本（兼容 Windows+Celery 5.x，全局信号回调）

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(**file**)))

from celery import Celery
import requests
from datetime import datetime
from celery.signals import task_success, task_failure # 全局信号依赖

# 初始化 Celery

celery_app = Celery(
"task_queue",
broker="redis://localhost:6379/0",
backend="redis://localhost:6379/0",
timezone="Asia/Shanghai",
enable_utc=True
)

# Celery 配置（Windows+单进程适配）

celery_app.conf.update(
task_serializer="json",
result_serializer="json",
accept_content=["json"],
worker_concurrency=1, # 单进程排队执行
task_acks_late=True, # 任务完成后再确认
worker_prefetch_multiplier=1, # 每次仅预取 1 个任务
result_expires=3600, # 结果 1 小时后清理
worker_pool="solo", # Windows 专用池，避免兼容性问题
task_reject_on_worker_lost=True # Worker 丢失时拒绝任务
)

# 回调服务地址（优先用 127.0.0.1，避免 Windows localhost 解析问题）

CALLBACK_URL = "http://127.0.0.1:8001/receive-task-result"

def send_callback(task_id: str, status: str, result: dict = None, error: str = None):
"""通用回调函数（增加详细日志，便于排查）"""
callback_data = {
"task_id": task_id,
"status": status,
"result": result,
"error": error,
"timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
} # 打印发送日志，确认回调请求已触发
print(f"\n📤 准备发送回调请求：")
print(f" URL: {CALLBACK_URL}")
print(f" 数据: {callback_data}")

    try:
        response = requests.post(
            url=CALLBACK_URL,
            json=callback_data,
            headers={"Content-Type": "application/json"},
            timeout=10  # 延长超时，适配Windows网络
        )
        # 打印响应日志，确认回调服务接收情况
        print(f"📥 回调响应：状态码={response.status_code}，响应体={response.text}")
        response.raise_for_status()  # 触发HTTP错误（如404/500）
        print(f"✅ 任务 {task_id} 回调成功")
    except requests.exceptions.ConnectionError:
        print(f"❌ 任务 {task_id} 回调失败：无法连接到回调服务（请检查8001端口是否启动）")
    except requests.exceptions.Timeout:
        print(f"❌ 任务 {task_id} 回调失败：请求超时（回调服务响应过慢）")
    except Exception as e:
        print(f"❌ 任务 {task_id} 回调失败：{str(e)}（类型：{type(e)}）")

# 定义核心业务任务

@celery_app.task(bind=True, max_retries=0, ignore_result=False)
def process_task(self, task_id: str, data: dict):
"""核心业务任务（1 秒/任务，排队执行）"""
try:
import time
print(f"\n🔄 开始处理任务 [业务 ID: {task_id}]")
print(f" 任务数据: {data}")
time.sleep(1) # 模拟业务处理耗时

        # 构造任务结果
        task_result = {
            "status": "success",
            "business_task_id": task_id,
            "data": data,
            "message": "任务执行完成",
            "process_time": 1.0
        }
        print(f"✅ 完成处理任务 [业务ID: {task_id}]")
        return task_result

    except Exception as e:
        error_msg = str(e)
        print(f"\n❌ 处理任务失败 [业务ID: {task_id}]：{error_msg}")
        raise e  # 抛出异常，触发失败信号

# ========== 全局信号回调（核心：替代原有 on_success 绑定） ==========

@task_success.connect(sender=process_task)
def handle_task_success_signal(sender=None, result=None, \*\*kwargs):
"""任务成功全局信号回调（精准绑定 process_task 任务）""" # 修复：从 sender.request 中获取 Celery 内部 ID 和业务参数
celery_task_id = sender.request.id # Celery 内部任务 ID
task_kwargs = sender.request.kwargs # 任务提交时的关键字参数
business_task_id = task_kwargs.get("task_id") or celery_task_id

    print(f"\n🚀 全局成功信号触发 [Celery ID: {celery_task_id}]")
    send_callback(
        task_id=business_task_id,
        status="success",
        result=result
    )

@task_failure.connect(sender=process_task)
def handle_task_failure_signal(sender=None, exception=None, \*\*kwargs):
"""任务失败全局信号回调"""
celery_task_id = sender.request.id
task_kwargs = sender.request.kwargs
business_task_id = task_kwargs.get("task_id") or celery_task_id

    print(f"\n🚨 全局失败信号触发 [Celery ID: {celery_task_id}]")
    send_callback(
        task_id=business_task_id,
        status="failed",
        error=str(exception)
    )

# 模块加载验证（运行 tasks.py 时执行）

if **name** == "**main**":
print("✅ Celery 任务模块加载成功！无语法错误！")
print(f"✅ 回调服务地址：{CALLBACK_URL}")
print(f"✅ Redis 连接地址：redis://localhost:6379/0")

（2）main_api.py（FastAPI 主服务：任务提交/状态查询）
from fastapi import FastAPI, HTTPException
from uuid import uuid4
from celery.result import AsyncResult
from typing import Optional
from tasks import process_task, celery_app

app = FastAPI(title="任务提交服务")

@app.post("/submit-task")
async def submit_task(data: dict):
"""接收任务提交，存入 Celery 队列"""
try:
task_id = str(uuid4()) # 生成业务唯一任务 ID
celery_task = process_task.delay(task_id=task_id, data=data)
return {
"code": 200,
"message": "任务已提交至队列",
"business_task_id": task_id,
"celery_task_id": celery_task.id
}
except Exception as e:
raise HTTPException(
status_code=500,
detail={"code": 500, "message": f"任务提交失败：{str(e)}"}
)

@app.get("/task-status/{task_id}")
async def get_task_status(task_id: str):
"""查询任务状态（仅测试用）"""
try: # 查找业务 ID 对应的 Celery 任务 ID
inspect = celery_app.control.inspect()
active_tasks = inspect.active() or {}
reserved_tasks = inspect.reserved() or {}
target_celery_id = None

        # 检查活跃/排队任务
        for worker_tasks in list(active_tasks.values()) + list(reserved_tasks.values()):
            for task in worker_tasks:
                if task.get("kwargs", {}).get("task_id") == task_id:
                    target_celery_id = task.get("id")
                    break
            if target_celery_id:
                break

        if target_celery_id:
            async_result = AsyncResult(target_celery_id, app=celery_app)
            return {
                "code": 200,
                "business_task_id": task_id,
                "celery_task_id": target_celery_id,
                "status": async_result.state,
                "result": async_result.result if async_result.state == "SUCCESS" else None
            }
        else:
            raise HTTPException(status_code=404, detail={"code": 404, "message": "任务不存在或已完成清理"})
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"code": 500, "message": f"查询失败：{str(e)}"}
        )

if **name** == "**main**":
import uvicorn
uvicorn.run(app, host="0.0.0.0", port=8000)

（3）callback_receiver.py（FastAPI 回调服务：接收任务结果）
from fastapi import FastAPI, Request

app = FastAPI(title="任务回调接收服务")

@app.post("/receive-task-result")
async def receive_task_result(request: Request):
"""接收 Celery 任务处理完成后的回调数据"""
try:
data = await request.json()
print(f"【回调接收】任务 {data.get('task_id')}，状态：{data.get('status')}，数据：{data}") # 可扩展：将回调数据写入日志/数据库
return {
"code": 200,
"message": "回调数据已接收",
"received_data": data
}
except Exception as e:
return {"code": 500, "message": f"回调处理失败：{str(e)}"}

if **name** == "**main**":
import uvicorn
uvicorn.run(app, host="0.0.0.0", port=8001)

三、测试步骤
步骤 1：启动基础服务（按顺序执行）
1.1 启动 Redis

- 本地 Redis 无需额外配置，直接启动：

# Windows（Redis 安装目录下）

redis-server.exe redis.windows.conf

# Linux/Mac

redis-server

- 验证 Redis 可用：执行 redis-cli ping，返回 PONG 则正常。
  1.2 启动 FastAPI 回调服务
  打开新终端，执行：
  uvicorn callback_receiver:app --host 0.0.0.0 --port 8001
- 日志显示 Uvicorn running on http://0.0.0.0:8001 则启动成功。
  1.3 启动 Celery Worker
  打开新终端，进入代码目录，执行：
  celery -A tasks.celery_app worker --loglevel=info -c 1 #linux
  python -m celery -A tasks.celery_app worker --loglevel=info -c 1 # windows
- 关键日志：celery@xxx ready. 且 concurrency: 1（确认单进程），启动成功。
  1.4 启动 FastAPI 主服务
  打开新终端，执行：
  uvicorn main_api:app --host 0.0.0.0 --port 8000
- 日志显示 Uvicorn running on http://0.0.0.0:8000 则启动成功。
  步骤 2：批量提交 1000 个任务
  创建测试脚本 test_batch_submit.py，短时间内向主服务提交 1000 个任务：
  import requests
  import time
  import threading

# 目标接口地址

API_URL = "http://localhost:8000/submit-task"

# 总任务数

TOTAL_TASKS = 1000

# 记录提交成功/失败的任务

success_tasks = []
failed_tasks = []

def submit_task(task_index):
"""单任务提交函数"""
try: # 构造任务数据（包含任务序号，便于追踪）
task_data = {"task_index": task_index, "content": f"测试任务{task_index}"}
response = requests.post(
API_URL,
json=task_data,
timeout=10
)
if response.status_code == 200:
result = response.json()
success_tasks.append({
"task_index": task_index,
"business_task_id": result["business_task_id"],
"celery_task_id": result["celery_task_id"]
})
print(f"提交任务{task_index}成功：{result['business_task_id']}")
else:
failed_tasks.append({"task_index": task_index, "error": f"状态码：{response.status_code}"})
print(f"提交任务{task_index}失败：状态码{response.status_code}")
except Exception as e:
failed_tasks.append({"task_index": task_index, "error": str(e)})
print(f"提交任务{task_index}失败：{str(e)}")

if **name** == "**main**":
start_time = time.time() # 多线程提交（短时间内完成 1000 次请求）
threads = []
for i in range(TOTAL_TASKS):
t = threading.Thread(target=submit_task, args=(i+1,))
threads.append(t)
t.start() # 等待所有线程完成
for t in threads:
t.join() # 输出提交统计
end_time = time.time()
print("\n===== 任务提交统计 =====")
print(f"总提交任务数：{TOTAL_TASKS}")
print(f"提交成功数：{len(success_tasks)}")
print(f"提交失败数：{len(failed_tasks)}")
print(f"总耗时：{end_time - start_time:.2f}秒") # 可选：将成功任务 ID 写入文件，便于后续核对
with open("submitted_tasks.txt", "w", encoding="utf-8") as f:
for task in success_tasks:
f.write(f"{task['task_index']},{task['business_task_id']},{task['celery_task_id']}\n")

执行测试脚本，批量提交任务：
python test_batch_submit.py

- 预期结果：1000 个任务在几秒内提交完成，success_tasks 数量接近 1000（少量失败可忽略，网络波动导致）。
  (px_ri_project) PS D:\Project\gitee\research-institute-project\app\tests\test_celery> python .\test_batch_submit.py
  提交任务 6 成功：216b3ed0-9df1-4ddf-aeb9-1d678bc882a2
  提交任务 3 成功：a66f7202-0969-4bf6-a0d2-66e77c47aab3
  提交任务 31 成功：ba7fd324-a923-4b09-8524-bf5511daa936
  提交任务 32 成功：3b3741b4-0bc1-42a0-8022-a242d28c1cc3
  提交任务 28 成功：d3a82c23-e756-4798-9da1-1c7db269f553
  ...
  提交任务 539 成功：4bf83687-29a3-4733-b548-e0ef6d04a517
  提交任务 632 成功：6c35cb61-8917-40bf-8ab6-6bda36e01279
  提交任务 587 成功：a8c56801-685a-4712-a810-6236288577a8
  提交任务 596 成功：f83a3a36-aba4-4443-a6df-34dddcf78ee7
  提交任务 604 成功：4ab7120f-7f8c-4e46-8cd6-d6ff0d7e0ccb

===== 任务提交统计 =====
总提交任务数：1000
提交成功数：1000
提交失败数：0
总耗时：5.19 秒
步骤 3：验证任务处理与回调
3.1 验证 Celery 任务排队执行
查看 Celery Worker 终端日志：

- 日志按顺序显示 完成任务 xxx，每秒处理 1 个任务（因 time.sleep(1)）；
- 无并发执行日志（确认单进程排队）；
- 每个任务完成后显示 任务 xxx 回调成功。
  [2025-12-19 12:44:00,104: INFO/MainProcess] Task tasks.process_task[c3c002ad-73b9-43c6-8393-21a5ad38ab10] received
  [2025-12-19 12:44:00,105: WARNING/MainProcess]
  🔄 开始处理任务 [业务 ID: 0d9793a1-9c53-4d6e-90bb-ee591fc787b0]
  [2025-12-19 12:44:00,105: WARNING/MainProcess] 任务数据: {'task_index': 640, 'content': '测试任务 640'}
  [2025-12-19 12:44:01,107: WARNING/MainProcess] ✅ 完成处理任务 [业务 ID: 0d9793a1-9c53-4d6e-90bb-ee591fc787b0]
  [2025-12-19 12:44:01,108: WARNING/MainProcess]
  🚀 全局成功信号触发 [Celery ID: c3c002ad-73b9-43c6-8393-21a5ad38ab10]
  [2025-12-19 12:44:01,108: WARNING/MainProcess]
  📤 准备发送回调请求：
  [2025-12-19 12:44:01,108: WARNING/MainProcess] URL: http://127.0.0.1:8001/receive-task-result
  [2025-12-19 12:44:01,109: WARNING/MainProcess] 数据: {'task_id': '0d9793a1-9c53-4d6e-90bb-ee591fc787b0', 'status': 'success', 'result': {'status': 'success', 'business_task_id': '0d9793a1-9c53-4d6e-90bb-ee591fc787b0', 'data': {'task_index': 640, 'content': '测试任务 640'}, 'message': '任务执行完成', 'process_time': 1.0}, 'error': None, 'timestamp': '2025-12-19 12:44:01'}
  [2025-12-19 12:44:01,127: WARNING/MainProcess] 📥 回调响应：状态码=200，响应体={"code":200,"message":"回调数据已接收","received_data":{"task_id":"0d9793a1-9c53-4d6e-90bb-ee591fc787b0","status":"success","result":{"status":"success","business_task_id":"0d9793a1-9c53-4d6e-90bb-ee591fc787b0","data":{"task_index":640,"content":"测试任
  务 640"},"message":"任务执行完成","process_time":1.0},"error":null,"timestamp":"2025-12-19 12:44:01"}}
  3.2 验证回调服务接收数据
  查看回调服务终端日志：
- 持续显示 【回调接收】任务 xxx，状态：success；
- 回调数据包含 task_id、status、result 等字段，与任务一一对应。
  【回调接收】任务 65cb0842-ac52-47fa-86f4-9bb8be00e391，状态：success，数据：{'task_id': '65cb0842-ac52-47fa-86f4-9bb8be00e391', 'status': 'success', 'result': {'status': 'success', 'business_task_id': '65cb0842-ac52-47fa-86f4-9bb8be00e391', 'data': {'task_index': 676, 'content': '测试任务 676'}, 'message': '任务执行完成', 'process_time': 1.0}, 'error': None, 'timestamp': '2025-12-19 12:44:17'}
  INFO: 127.0.0.1:50586 - "POST /receive-task-result HTTP/1.1" 200 OK
  3.3 核对任务处理完整性（可选）
- 统计 Celery Worker 日志中 完成任务 的数量，应与提交成功数一致；
- 统计回调服务日志中 回调接收 的数量，应与处理完成数一致；
- 可通过 submitted_tasks.txt 中的 business_task_id，调用 /task-status/{task_id} 接口验证单个任务状态。
  四、预期结果

1. 任务提交：1000 个任务在几秒内提交完成，成功数 ≥ 990（网络正常情况下）；
2. 任务处理：Celery 以单进程依次处理任务，每秒完成 1 个，总处理耗时约 1000 秒（符合排队逻辑）；
3. 回调验证：所有处理完成的任务，均向回调服务发送了回调数据，回调成功率 100%（网络正常情况下）；
4. 数据一致性：提交成功的任务数 = Celery 处理完成数 = 回调服务接收数。
   五、常见问题排查
   问题现象
   排查方向
   任务提交失败率高
5. 主服务端口是否被占用；2. Redis 是否正常运行；3. 提交线程数过多导致端口耗尽（可减少线程数）
   Celery 未处理任务
6. Broker 地址是否正确（redis://localhost:6379/0）；2. Worker 是否启动（celery -A tasks.celery_app worker）
   任务并发执行（未排队）
   检查 Celery 配置：worker_concurrency=1 和 worker_prefetch_multiplier=1 是否生效
   回调失败
7. 回调服务是否启动（端口 8001）；2. CALLBACK_URL 是否正确；3. 回调服务是否能被 Celery 访问
   任务状态查询不到
8. 任务是否已完成并被清理（result_expires=3600，1 小时后清理）；2. 业务 ID 与 Celery ID 映射是否正确

六、扩展说明

1. 性能调优：若需提高处理速度，可调整 worker_concurrency（如改为 10，同时调整 worker_prefetch_multiplier=10），仍保持排队但提升并发度；
2. 数据持久化：可在回调服务中添加数据库写入逻辑，将回调数据存入 MySQL/PostgreSQL，便于后续统计；
3. 监控告警：可通过 Redis 监控队列长度（LLEN celery），若队列堆积过多，及时告警；
4. 异常重试：若需任务失败重试，可修改 max_retries（如 max_retries=3），并设置重试间隔：self.retry(exc=e, countdown=5)。
