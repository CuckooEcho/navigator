import sqlite3
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, MessagesState, START
from langgraph.checkpoint.sqlite import SqliteSaver
# pip install langgraph-checkpoint-sqlite

# 创建 LLM 实例
model = ChatOpenAI(
    model="deepseek-chat",
    base_url="https://api.deepseek.com/",
    api_key="sk-4033745115d74c5eb361b957f1a72b91",
    timeout=300)


def call_model(state: MessagesState):
    response = model.invoke(state["messages"])
    return {"messages": response}


# Create a new SqliteSaver instance
# Note: check_same_thread=False is OK as the implementation uses a lock
# to ensure thread safety.
conn = sqlite3.connect("checkpoints.sqlite", check_same_thread=False)
checkpointer = SqliteSaver(conn)

builder = StateGraph(MessagesState)
builder.add_node(call_model)
builder.add_edge(START, "call_model")

graph = builder.compile(checkpointer=checkpointer)

config = {
    "configurable": {
        "thread_id": "1"
    }
}

# 第一次交互 - 用户介绍自己

for chunk in graph.stream(
    {"messages": [{"role": "user", "content": "hi! I'm bob"}]},
    config,
    stream_mode="values"
):
    chunk["messages"][-1].pretty_print()

# 第二次交互 - AI应该记住用户的名字
for chunk in graph.stream(
    {"messages": [{"role": "user", "content": "what's my name?"}]},
    config,
    stream_mode="values"
):
    chunk["messages"][-1].pretty_print()
