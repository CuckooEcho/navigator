from fastapi import FastAPI, HTTPException
from uuid import uuid4
from celery.result import AsyncResult
from typing import Optional
from tasks import process_task, celery_app

app = FastAPI(title="任务提交服务")

@app.post("/submit-task")
async def submit_task(data: dict):
    """接收任务提交，存入Celery队列"""
    try:
        task_id = str(uuid4())  # 生成业务唯一任务ID
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
    try:
        # 查找业务ID对应的Celery任务ID
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)