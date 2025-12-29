# tasks.py 最终可运行版本（兼容Windows+Celery 5.x，全局信号回调）
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from celery import Celery
import requests
from datetime import datetime
from celery.signals import task_success, task_failure  # 全局信号依赖

# 初始化Celery
celery_app = Celery(
    "task_queue",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    timezone="Asia/Shanghai",
    enable_utc=True
)

# Celery配置（Windows+单进程适配）
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    worker_concurrency=1,          # 单进程排队执行
    task_acks_late=True,            # 任务完成后再确认
    worker_prefetch_multiplier=1,   # 每次仅预取1个任务
    result_expires=3600,            # 结果1小时后清理
    worker_pool="solo",             # Windows专用池，避免兼容性问题
    task_reject_on_worker_lost=True # Worker丢失时拒绝任务
)

# 回调服务地址（优先用127.0.0.1，避免Windows localhost解析问题）
CALLBACK_URL = "http://127.0.0.1:8001/receive-task-result"

def send_callback(task_id: str, status: str, result: dict = None, error: str = None):
    """通用回调函数（增加详细日志，便于排查）"""
    callback_data = {
        "task_id": task_id,
        "status": status,
        "result": result,
        "error": error,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    # 打印发送日志，确认回调请求已触发
    print(f"\n📤 准备发送回调请求：")
    print(f"   URL: {CALLBACK_URL}")
    print(f"   数据: {callback_data}")
    
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
    """核心业务任务（1秒/任务，排队执行）"""
    try:
        import time
        print(f"\n🔄 开始处理任务 [业务ID: {task_id}]")
        print(f"   任务数据: {data}")
        time.sleep(1)  # 模拟业务处理耗时
        
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

# ========== 全局信号回调（核心：替代原有on_success绑定） ==========
@task_success.connect(sender=process_task)
def handle_task_success_signal(sender=None, result=None, **kwargs):
    """任务成功全局信号回调（精准绑定process_task任务）"""
    # 修复：从sender.request中获取Celery内部ID和业务参数
    celery_task_id = sender.request.id  # Celery内部任务ID
    task_kwargs = sender.request.kwargs  # 任务提交时的关键字参数
    business_task_id = task_kwargs.get("task_id") or celery_task_id
    
    print(f"\n🚀 全局成功信号触发 [Celery ID: {celery_task_id}]")
    send_callback(
        task_id=business_task_id,
        status="success",
        result=result
    )

@task_failure.connect(sender=process_task)
def handle_task_failure_signal(sender=None, exception=None, **kwargs):
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

# 模块加载验证（运行tasks.py时执行）
if __name__ == "__main__":
    print("✅ Celery任务模块加载成功！无语法错误！")
    print(f"✅ 回调服务地址：{CALLBACK_URL}")
    print(f"✅ Redis连接地址：redis://localhost:6379/0")