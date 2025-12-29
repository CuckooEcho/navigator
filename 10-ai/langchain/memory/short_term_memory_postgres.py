from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, MessagesState, START
from langgraph.checkpoint.postgres import PostgresSaver

# 创建 LLM 实例
model = ChatOpenAI(
    model="deepseek-chat",
    base_url="https://api.deepseek.com/",
    api_key="sk-4033745115d74c5eb361b957f1a72b91",
    timeout=300)


DB_URI = "postgresql://postgres:123@localhost:5432/postgres?sslmode=disable"

with PostgresSaver.from_conn_string(DB_URI) as checkpointer:
    # 首次使用时需要调用 setup()
    checkpointer.setup()

    def call_model(state: MessagesState):
        response = model.invoke(state["messages"])
        return {"messages": response}

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
