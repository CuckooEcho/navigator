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
    try:
        # 构造任务数据（包含任务序号，便于追踪）
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

if __name__ == "__main__":
    start_time = time.time()
    # 多线程提交（短时间内完成1000次请求）
    threads = []
    for i in range(TOTAL_TASKS):
        t = threading.Thread(target=submit_task, args=(i+1,))
        threads.append(t)
        t.start()
    # 等待所有线程完成
    for t in threads:
        t.join()
    # 输出提交统计
    end_time = time.time()
    print("\n===== 任务提交统计 =====")
    print(f"总提交任务数：{TOTAL_TASKS}")
    print(f"提交成功数：{len(success_tasks)}")
    print(f"提交失败数：{len(failed_tasks)}")
    print(f"总耗时：{end_time - start_time:.2f}秒")
    # 可选：将成功任务ID写入文件，便于后续核对
    with open("submitted_tasks.txt", "w", encoding="utf-8") as f:
        for task in success_tasks:
            f.write(f"{task['task_index']},{task['business_task_id']},{task['celery_task_id']}\n")