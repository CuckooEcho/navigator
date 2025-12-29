import sys
import os
import logging
from logging.handlers import RotatingFileHandler
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from celery import Celery
import requests
from datetime import datetime
from celery.signals import task_success, task_failure

# ===================== 日志配置（Linux 生产级）=====================
# 日志存储路径（Linux 建议放在 /var/log 或项目目录）
LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")
os.makedirs(LOG_DIR, exist_ok=True)  # 自动创建日志目录

# 日志格式
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(process)d - %(filename)s:%(lineno)d - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# 初始化logger
logger = logging.getLogger("celery_task")
logger.setLevel(logging.INFO)  # 日志级别：DEBUG/INFO/WARNING/ERROR/CRITICAL

# 1. 控制台处理器（实时查看）
console_handler = logging.StreamHandler()
console_handler.setFormatter(logging.Formatter(LOG_FORMAT, DATE_FORMAT))
console_handler.setLevel(logging.INFO)

# 2. 文件处理器（按大小轮转，避免日志文件过大）
file_handler = RotatingFileHandler(
    filename=os.path.join(LOG_DIR, "celery_task.log"),
    maxBytes=10 * 1024 * 1024,  # 单个日志文件最大10MB
    backupCount=5,  # 最多保留5个备份文件
    encoding="utf-8"
)
file_handler.setFormatter(logging.Formatter(LOG_FORMAT, DATE_FORMAT))
file_handler.setLevel(logging.INFO)

# 避免重复添加处理器
if not logger.handlers:
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

# ===================== Celery 初始化 =====================
celery_app = Celery(
    "task_queue",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    timezone="Asia/Shanghai",
    enable_utc=True
)

# Celery配置（Linux 适配版）
# Celery配置（Linux 适配版，针对大模型低并发/长耗时任务优化）
celery_app.conf.update(
    # ========== 序列化配置 ==========
    # 任务序列化格式：使用JSON（跨语言兼容、轻量，避免pickle安全风险）
    task_serializer="json",
    # 任务结果序列化格式：与任务序列化保持一致，确保结果解析无兼容问题
    result_serializer="json",
    # 允许接收的内容类型：仅接收JSON格式，过滤非法请求，提升安全性
    accept_content=["json"],

    # ========== 并发控制（核心：适配大模型低并发特性） ==========
    # Worker并发数：Linux多核环境下设为2（可按CPU核心数调整，如4/8）
    # 取值原因：大模型推理是计算密集型任务，并发过高会导致CPU/GPU资源耗尽，触发超时
    worker_concurrency=2,         

    # ========== 任务确认机制（避免任务丢失） ==========
    # 任务延迟确认：Worker执行完任务后再向Broker确认任务完成
    # 作用：若Worker执行中崩溃，Broker会将任务重新分发给其他Worker，避免任务丢失
    task_acks_late=True,

    # ========== 任务预取控制（避免堆积） ==========
    # Worker预取任务数：每次仅从Broker预取1个任务
    # 取值原因：大模型任务耗时极长（分钟/小时级），预取过多会导致任务堆积在Worker本地，无法被其他Worker调度
    worker_prefetch_multiplier=1,

    # ========== 结果存储配置 ==========
    # 任务结果过期时间：3600秒（1小时）
    # 作用：避免Redis中积压大量过期结果，占用内存；大模型任务结果无需长期存储，1小时足够业务回调处理
    result_expires=3600,

    # ========== 异常容错配置 ==========
    # Worker丢失时拒绝任务：若Worker进程意外终止（如OOM、崩溃），Broker会拒绝该Worker未完成的任务
    # 作用：防止无效任务占用队列，确保任务重新分发到健康的Worker
    task_reject_on_worker_lost=True,

    # ========== 日志格式化配置 ==========
    # Worker进程日志格式：使用自定义的LOG_FORMAT（包含时间/进程ID/文件行号，便于定位问题）
    worker_log_format=LOG_FORMAT,
    # 任务执行日志格式：与Worker日志格式统一，确保任务全生命周期日志格式一致
    worker_task_log_format=LOG_FORMAT
)

# 回调服务地址
CALLBACK_URL = "http://127.0.0.1:8001/receive-task-result"

def send_callback(task_id: str, status: str, result: dict = None, error: str = None):
    """通用回调函数（日志版）"""
    callback_data = {
        "task_id": task_id,
        "status": status,
        "result": result,
        "error": error,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    logger.info(f"准备发送回调请求 | URL: {CALLBACK_URL} | 数据: {callback_data}")
    try:
        response = requests.post(
            url=CALLBACK_URL,
            json=callback_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        logger.info(f"回调响应 | 任务ID: {task_id} | 状态码: {response.status_code} | 响应体: {response.text}")
        response.raise_for_status()
        logger.info(f"✅ 任务 {task_id} 回调成功")
    except requests.exceptions.ConnectionError:
        logger.error(f"❌ 任务 {task_id} 回调失败：无法连接到回调服务（8001端口未启动？）")
    except requests.exceptions.Timeout:
        logger.error(f"❌ 任务 {task_id} 回调失败：请求超时（回调服务响应过慢）")
    except Exception as e:
        logger.error(f"❌ 任务 {task_id} 回调失败：{str(e)} | 异常类型: {type(e)}", exc_info=True)

# ===================== 核心业务任务 =====================
@celery_app.task(bind=True, max_retries=0, ignore_result=False)
def process_task(self, task_id: str, data: dict):
    """核心业务任务（日志版）"""
    try:
        import time
        logger.info(f"🔄 开始处理任务 | 业务ID: {task_id} | 任务数据: {data}")
        time.sleep(1)  # 模拟业务处理耗时
        
        task_result = {
            "status": "success",
            "business_task_id": task_id,
            "data": data,
            "message": "任务执行完成",
            "process_time": 1.0
        }
        logger.info(f"✅ 完成处理任务 | 业务ID: {task_id}")
        return task_result
    
    except Exception as e:
        error_msg = str(e)
        logger.error(f"❌ 处理任务失败 | 业务ID: {task_id} | 错误信息: {error_msg}", exc_info=True)
        raise e

# ===================== 全局信号回调 =====================
@task_success.connect(sender=process_task)
def handle_task_success_signal(sender=None, result=None, **kwargs):
    """任务成功全局信号回调"""
    celery_task_id = sender.request.id
    task_kwargs = sender.request.kwargs
    business_task_id = task_kwargs.get("task_id") or celery_task_id
    
    logger.info(f"🚀 全局成功信号触发 | Celery ID: {celery_task_id} | 业务ID: {business_task_id}")
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
    
    logger.error(f"🚨 全局失败信号触发 | Celery ID: {celery_task_id} | 业务ID: {business_task_id} | 异常: {str(exception)}")
    send_callback(
        task_id=business_task_id,
        status="failed",
        error=str(exception)
    )

# ===================== 模块加载验证 =====================
if __name__ == "__main__":
    logger.info("✅ Celery任务模块加载成功！无语法错误！")
    logger.info(f"✅ 回调服务地址：{CALLBACK_URL}")
    logger.info(f"✅ Redis连接地址：redis://localhost:6379/0")
    logger.info(f"✅ 适配系统：Linux（Celery池类型：prefork）")
    logger.info(f"✅ 日志存储路径：{LOG_DIR}")