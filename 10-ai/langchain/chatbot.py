# =============================================
# LangGraph 简单对话机器人案例
# 功能：创建一个使用Deepseek模型的对话机器人，支持多轮对话
# =============================================

# ----------------------------
# 1. 导入必要的库
# ----------------------------
# 类型注解工具，用于为类型添加额外元数据
from typing import Annotated
# 用于定义类型化字典，明确指定字典中每个键的类型
from typing_extensions import TypedDict
# LangGraph核心组件：状态图、起点和终点
from langgraph.graph import StateGraph, START, END
# 消息更新函数：定义消息列表的更新规则（追加而非覆盖）
from langgraph.graph.message import add_messages
# 用于兼容OpenAI格式的模型封装
from langchain_openai import ChatOpenAI
# 系统相关操作
import os
# 用于处理图像
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
from io import BytesIO

# ----------------------------
# 2. 定义工作流状态
# ----------------------------
class State(TypedDict):
    """
    定义工作流的状态结构
    
    状态是工作流中需要持久化维护的数据容器，类似于全局变量
    所有节点都可以访问和修改这些状态数据
    """
    # 存储对话消息历史（用户提问、AI回复等）
    # Annotated[list, add_messages]表示：
    # - 基础类型是list（列表），按顺序存储消息
    # - 使用add_messages规则更新：新消息追加到列表末尾，保留历史记录
    messages: Annotated[list, add_messages]

# ----------------------------
# 3. 配置Deepseek模型
# ----------------------------
# 设置Deepseek API密钥（请替换为您自己的密钥）
os.environ["OPENAI_API_KEY"] = ""
# Deepseek的OpenAI兼容接口地址
os.environ["OPENAI_BASE_URL"] = ""

# 初始化Deepseek模型（以OpenAI兼容模式）
llm = ChatOpenAI(
    model_name="deepseek-chat",  # Deepseek对话模型名称
    temperature=0.7,             # 随机性参数，0表示更确定，1表示更多样
)

# ----------------------------
# 4. 定义对话节点逻辑
# ----------------------------
def chatbot(state: State):
    """
    对话机器人节点处理函数
    
    接收当前状态，调用LLM生成回复，返回更新后的状态
    """
    # 调用Deepseek模型，传入当前对话历史
    response = llm.invoke(state["messages"])
    # 返回更新后的消息列表（会自动通过add_messages规则追加）
    return {"messages": [response]}

# ----------------------------
# 5. 构建工作流图
# ----------------------------
# 初始化状态图构建器，指定管理的状态类型
graph_builder = StateGraph(State)

# 添加对话机器人节点
# 第一个参数是节点唯一名称，第二个参数是节点调用的函数
graph_builder.add_node("chatbot", chatbot)

# 定义节点间的连接关系
graph_builder.add_edge(START, "chatbot")  # 从起点连接到chatbot节点
graph_builder.add_edge("chatbot", END)    # 从chatbot节点连接到终点

# 编译生成可执行的图
graph = graph_builder.compile()

# ----------------------------
# 6. 可视化工作流图并保存到本地
# ----------------------------
def save_workflow_graph(graph, filename="workflow_graph.png"):
    """将工作流图保存到本地文件"""
    try:
        # 获取图形的PNG数据
        graph_png = graph.get_graph().draw_mermaid_png()
        
        # 将图片数据保存到文件
        with open(filename, "wb") as f:
            f.write(graph_png)
        
        print(f"工作流图已保存到: {os.path.abspath(filename)}")
        
        # 可选：显示图片
        # img = mpimg.imread(BytesIO(graph_png))
        # plt.figure(figsize=(10, 6))
        # plt.imshow(img)
        # plt.axis('off')  # 不显示坐标轴
        # plt.show()
        
    except Exception as e:
        print(f"保存图形时出错: {e}")
        print("请确保已安装必要的依赖：pip install matplotlib mermaid-cli")

# 保存工作流图到本地
save_workflow_graph(graph)

# ----------------------------
# 7. 定义对话交互函数
# ----------------------------
def stream_graph_updates(user_input: str):
    """处理用户输入，获取并显示AI回复"""
    # 向图中输入用户消息并获取流式输出
    for event in graph.stream({"messages": [{"role": "user", "content": user_input}]}):
        # 处理每个事件的输出
        for value in event.values():
            # 输出AI的回复
            print("Assistant:", value["messages"][-1].content)

# ----------------------------
# 8. 运行对话循环
# ----------------------------
if __name__ == "__main__":
    print("欢迎使用LangGraph对话机器人！")
    print("输入 'quit', 'exit' 或 'q' 退出程序")
    
    while True:
        try:
            # 获取用户输入
            user_input = input("User: ")
            
            # 检查是否退出
            if user_input.lower() in ["quit", "exit", "q"]:
                print("Goodbye!")
                break
            
            # 处理用户输入并获取回复
            stream_graph_updates(user_input)
            
        except KeyboardInterrupt:
            # 处理Ctrl+C中断
            print("\n程序已中断")
            break
        except Exception as e:
            # 处理其他异常
            print(f"发生错误: {e}")
            # 使用示例问题继续
            user_input = "What do you know about LangGraph?"
            print(f"User: {user_input}")
            stream_graph_updates(user_input)
            break
    