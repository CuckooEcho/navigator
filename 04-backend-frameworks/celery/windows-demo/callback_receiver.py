from fastapi import FastAPI, Request

app = FastAPI(title="任务回调接收服务")

@app.post("/receive-task-result")
async def receive_task_result(request: Request):
    """接收Celery任务处理完成后的回调数据"""
    try:
        data = await request.json()
        print(f"【回调接收】任务 {data.get('task_id')}，状态：{data.get('status')}，数据：{data}")
        # 可扩展：将回调数据写入日志/数据库
        return {
            "code": 200,
            "message": "回调数据已接收",
            "received_data": data
        }
    except Exception as e:
        return {"code": 500, "message": f"回调处理失败：{str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)