# LangGraph 内存机制中文说明文档

## 概述

LangGraph 是 LangChain 生态系统中的一个重要组件，专门用于构建状态机和代理系统。内存机制是 LangGraph 的核心功能之一，它使 AI 应用能够在多次交互之间共享上下文。在 LangGraph 中，内存分为两种主要类型：

1. **短期记忆（Short-term Memory）**：用于在多轮对话中跟踪上下文
2. **长期记忆（Long-term Memory）**：用于跨会话存储用户或应用特定的数据

## 短期记忆（Short-term Memory）

短期记忆（线程级持久化）使代理能够在多轮对话中跟踪上下文。它主要用于保存对话历史，让 AI 能够记住之前的交互内容。

### 基本实现

```python
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import StateGraph

# 创建内存检查点
checkpointer = InMemorySaver()

# 构建状态图
builder = StateGraph(...)

# 编译图时添加检查点
graph = builder.compile(checkpointer=checkpointer)

# 调用时指定线程ID
graph.invoke(
    {"messages": [{"role": "user", "content": "hi! i am Bob"}]},
    {"configurable": {"thread_id": "1"}},
)
```

在这个例子中：

- `InMemorySaver()` 提供了内存中的检查点存储
- 每个对话线程都有唯一的 `thread_id`
- 图的状态在每次交互后会被自动保存

### 生产环境中的使用

在生产环境中，应该使用基于数据库的检查点存储器，而不是内存中的存储器：

#### PostgreSQL 检查点

```bash
pip install -U "psycopg[binary,pool]" langgraph langgraph-checkpoint-postgres
```

```python
from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, MessagesState, START
from langgraph.checkpoint.postgres import PostgresSaver

model = init_chat_model(model="claude-haiku-4-5-20251001")

DB_URI = "postgresql://postgres:postgres@localhost:5442/postgres?sslmode=disable"
with PostgresSaver.from_conn_string(DB_URI) as checkpointer:
    # 首次使用时需要调用 setup()
    # checkpointer.setup()

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
```

#### MongoDB 检查点

```bash
pip install -U pymongo langgraph langgraph-checkpoint-mongodb
```

```python
from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, MessagesState, START
from langgraph.checkpoint.mongodb import MongoDBSaver

model = init_chat_model(model="claude-haiku-4-5-20251001")

DB_URI = "localhost:27017"
with MongoDBSaver.from_conn_string(DB_URI) as checkpointer:
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

    for chunk in graph.stream(
        {"messages": [{"role": "user", "content": "hi! I'm bob"}]},
        config,
        stream_mode="values"
    ):
        chunk["messages"][-1].pretty_print()

    for chunk in graph.stream(
        {"messages": [{"role": "user", "content": "what's my name?"}]},
        config,
        stream_mode="values"
    ):
        chunk["messages"][-1].pretty_print()
```

#### Redis 检查点

```bash
pip install -U langgraph langgraph-checkpoint-redis
```

```python
from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, MessagesState, START
from langgraph.checkpoint.redis import RedisSaver

model = init_chat_model(model="claude-haiku-4-5-20251001")

DB_URI = "redis://localhost:6379"
with RedisSaver.from_conn_string(DB_URI) as checkpointer:
    # 首次使用时需要调用 setup()
    # checkpointer.setup()

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

    for chunk in graph.stream(
        {"messages": [{"role": "user", "content": "hi! I'm bob"}]},
        config,
        stream_mode="values"
    ):
        chunk["messages"][-1].pretty_print()

    for chunk in graph.stream(
        {"messages": [{"role": "user", "content": "what's my name?"}]},
        config,
        stream_mode="values"
    ):
        chunk["messages"][-1].pretty_print()
```

### 子图中的内存使用

如果图包含子图，只需要在编译父图时提供检查点存储器，LangGraph 会自动将检查点传播到子图：

```python
from langgraph.graph import START, StateGraph
from langgraph.checkpoint.memory import InMemorySaver
from typing import TypedDict

class State(TypedDict):
    foo: str

# 子图
def subgraph_node_1(state: State):
    return {"foo": state["foo"] + "bar"}

subgraph_builder = StateGraph(State)
subgraph_builder.add_node(subgraph_node_1)
subgraph_builder.add_edge(START, "subgraph_node_1")
subgraph = subgraph_builder.compile()

# 父图
builder = StateGraph(State)
builder.add_node("node_1", subgraph)
builder.add_edge(START, "node_1")

checkpointer = InMemorySaver()
graph = builder.compile(checkpointer=checkpointer)
```

如果希望子图拥有自己的内存，可以使用适当的检查点选项编译它。这在多代理系统中很有用，如果希望代理跟踪其内部消息历史记录：

```python
subgraph_builder = StateGraph(...)
subgraph = subgraph_builder.compile(checkpointer=True)
```

## 长期记忆（Long-term Memory）

长期记忆用于跨对话存储用户特定或应用特定的数据。与短期记忆不同，长期记忆是持久化的，可以在多个会话之间保持数据。

### 基本实现

```python
from langgraph.store.memory import InMemoryStore
from langgraph.graph import StateGraph

store = InMemoryStore()

builder = StateGraph(...)
graph = builder.compile(store=store)
```

### 生产环境中的使用

在生产环境中，应使用基于数据库的存储：

```python
from langgraph.store.postgres import PostgresStore

DB_URI = "postgresql://postgres:postgres@localhost:5442/postgres?sslmode=disable"
with PostgresSaver.from_conn_string(DB_URI) as store:
    builder = StateGraph(...)
    graph = builder.compile(store=store)
```

## 与现有代码的关联

在您项目的 `chatbot.py` 文件中，我们已经实现了一个基础的对话机器人，但尚未使用内存机制。通过添加检查点存储器，我们可以让机器人记住对话历史：

```python
# 在现有chatbot.py基础上添加内存支持
from langgraph.checkpoint.memory import InMemorySaver

# 创建检查点存储器
checkpointer = InMemorySaver()

# 编译图时添加检查点
graph = graph_builder.compile(checkpointer=checkpointer)

# 调用时指定线程ID以保持对话上下文
for event in graph.stream(
    {"messages": [{"role": "user", "content": user_input}]},
    {"configurable": {"thread_id": "user-session-123"}}  # 添加配置以保持会话
):
    # 处理输出
    for value in event.values():
        print("Assistant:", value["messages"][-1].content)
```

这样，机器人就能在多轮对话中记住上下文，例如记住用户的姓名或之前讨论过的话题。

## 总结

LangGraph 的内存机制为 AI 应用提供了强大的上下文管理能力：

1. **短期记忆**：适用于单个对话会话中的上下文保持
2. **长期记忆**：适用于跨会话的持久化数据存储
3. **多种存储后端**：支持内存、PostgreSQL、MongoDB、Redis 等多种存储方式
4. **子图支持**：能够在复杂图结构中正确管理内存

通过合理使用这些内存机制，可以构建更加智能和上下文感知的 AI 应用。
