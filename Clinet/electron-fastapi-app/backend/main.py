from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
import uuid
import uvicorn

app = FastAPI(
    title="Electron App API",
    description="Backend API for Electron application",
    version="1.0.0"
)

# 数据模型
class Item(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: Optional[float] = Field(None, ge=0)
    item_id: str = Field(default_factory=lambda: str(uuid.uuid4()))

# 模拟数据库
items_db = []

# API端点
@app.get("/items", response_model=list[Item])
def get_all_items():
    """获取所有项目"""
    return items_db

@app.get("/items/{item_id}", response_model=Item)
def get_item(item_id: str):
    """获取单个项目"""
    item = next((item for item in items_db if item.item_id == item_id), None)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@app.post("/items", response_model=Item, status_code=201)
def create_item(item: Item):
    """创建新项目"""
    # 检查名称是否已存在
    if any(existing_item.name == item.name for existing_item in items_db):
        raise HTTPException(status_code=400, detail="Item name already exists")
    
    # 生成唯一ID
    item.item_id = str(uuid.uuid4())
    items_db.append(item)
    return item

@app.put("/items/{item_id}", response_model=Item)
def update_item(item_id: str, updated_item: Item):
    """更新项目"""
    index = next((i for i, item in enumerate(items_db) if item.item_id == item_id), None)
    if index is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # 确保ID不变
    updated_item.item_id = item_id
    
    # 检查新名称是否已存在(除了当前项目)
    if updated_item.name != items_db[index].name and any(
        existing_item.name == updated_item.name for existing_item in items_db
    ):
        raise HTTPException(status_code=400, detail="Item name already exists")
    
    items_db[index] = updated_item
    return updated_item

@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: str):
    """删除项目"""
    global items_db
    items_db = [item for item in items_db if item.item_id != item_id]
    return None

if __name__ == "__main__":
    print("Starting FastAPI server on http://localhost:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)  