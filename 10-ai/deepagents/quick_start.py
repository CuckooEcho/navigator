import os
from typing import Literal
from tavily import TavilyClient
from deepagents import create_deep_agent
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
load_dotenv()


tavily_client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])

# 设置Deepseek API密钥（请替换为您自己的密钥）
os.environ["OPENAI_API_KEY"] = os.environ["OPENAI_API_KEY"]
# Deepseek的OpenAI兼容接口地址
os.environ["OPENAI_BASE_URL"] = os.environ["OPENAI_BASE_URL"]

# 初始化Deepseek模型（以OpenAI兼容模式）
llm = ChatOpenAI(
    model_name="deepseek-chat",  # Deepseek对话模型名称
    temperature=0.7,             # 随机性参数，0表示更确定，1表示更多样
)

def internet_search(
    query: str,
    max_results: int = 5,
    topic: Literal["general", "news", "finance"] = "general",
    include_raw_content: bool = False,
):
    """Run a web search"""
    return tavily_client.search(
        query,
        max_results=max_results,
        include_raw_content=include_raw_content,
        topic=topic,
    )

# System prompt to steer the agent to be an expert researcher
research_instructions = """You are an expert researcher. Your job is to conduct thorough research and then write a polished report.

You have access to an internet search tool as your primary means of gathering information.

## `internet_search`

Use this to run an internet search for a given query. You can specify the max number of results to return, the topic, and whether raw content should be included.
"""



agent = create_deep_agent(
    model=llm,
    tools=[internet_search],
    system_prompt=research_instructions
)

result = agent.invoke({"messages": [{"role": "user", "content": "What is langgraph?"}]})

# Print the agent's response
print(result["messages"][-1].content)


