import os
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI  # 用于兼容 OpenAI 格式的模型

# 1. 配置 Deepseek 模型（利用其 OpenAI 兼容接口）
os.environ["OPENAI_API_KEY"] = ""  # 替换为实际密钥
os.environ["OPENAI_BASE_URL"] = ""  # Deepseek 的 OpenAI 兼容接口

# 初始化 Deepseek 模型（以 OpenAI 兼容模式）
deepseek_model = ChatOpenAI(
    model_name="deepseek-chat",  # Deepseek 对话模型名称
    temperature=0.7
)

# 2. 定义工具（示例：获取天气的工具）
def get_weather(city: str) -> str:
    """Get weather for a given city."""
    return f"It's always sunny in {city}!"

# 3. 创建 LangGraph 代理，使用 Deepseek 模型
agent = create_react_agent(
    model=deepseek_model,  # 传入配置好的 Deepseek 模型
    tools=[get_weather],
    prompt="You are a helpful assistant. Use tools when needed."
)

# 4. 运行代理
response = agent.invoke({
    "messages": [{"role": "user", "content": "what is the weather in San Francisco?"}]
})

# 输出结果
print(response["messages"][-1].content) 
