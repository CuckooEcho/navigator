# Redux Toolkit 基础示例

这是一个极简的 Redux Toolkit 示例项目，主要展示了使用 Redux Toolkit 进行全局状态管理的基本用法，不涉及异步操作，适合初学者快速理解 Redux Toolkit 的核心概念。

## 项目技术栈
- **React**：用于构建用户界面的 JavaScript 库。
- **Redux Toolkit**：Redux 的官方推荐工具包，简化了 Redux 的使用，提供了诸如创建 reducer、action 等便捷的方法。
- **TypeScript**：为 JavaScript 添加类型支持，增强代码的可维护性和健壮性。
- **React-Redux**：用于在 React 组件中连接 Redux store 的库。

## 核心概念

### 1. createSlice 函数
`createSlice` 是 Redux Toolkit 提供的一个重要函数，用于创建 Redux 中的状态切片（Slice）。它简化了 Redux 中 reducer 和 action 的创建过程，减少了样板代码。

`createSlice` 接收一个配置对象，主要包含以下属性：
- **name**: 状态切片的名称，用于在 Redux store 中标识该切片，同时也会作为 action type 的前缀。
- **initialState**: 状态切片的初始状态，是一个 JavaScript 对象。
- **reducers**: 包含多个 reducer 函数的对象，每个 reducer 函数对应一个 action。Redux Toolkit 内部使用 Immer 库，允许在 reducer 函数中直接修改状态，Immer 会自动处理不可变更新。

示例代码：
```typescript
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
  },
});

// 导出 action creators
export const { increment, decrement } = counterSlice.actions;
// 导出 reducer
export default counterSlice.reducer;
```

PS: 在 Redux Toolkit 中，`createSlice` 的 `name` 参数扮演着两个关键角色：**命名空间**和**action type 前缀**。让我通过一个具体例子帮你理解：


### 1. **作为 Redux store 中的命名空间**
Redux store 是一个单一的状态树。当你使用多个 `createSlice` 创建不同的状态切片时，`name` 参数决定了这些切片在 store 中的**路径**。

#### 示例：
假设你有两个切片：
```typescript
// counterSlice.ts
const counterSlice = createSlice({
  name: 'counter',  // 命名空间
  initialState: { value: 0 },
  // ...
});

// userSlice.ts
const userSlice = createSlice({
  name: 'user',    // 命名空间
  initialState: { name: 'Guest' },
  // ...
});
```

最终的 store 结构会是：
```javascript
{
  counter: { value: 0 },     // 由 counterSlice 管理
  user: { name: 'Guest' }    // 由 userSlice 管理
}
```

当你在组件中使用 `useSelector` 时，需要通过 `name` 指定路径：
```tsx
const count = useSelector((state) => state.counter.value);
const userName = useSelector((state) => state.user.name);
```


### 2. **作为 action type 的前缀**
Redux Toolkit 会自动为每个 reducer 函数生成对应的 action type，格式为：**`${name}/${reducerName}`**。

#### 示例：
```typescript
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1 },
    // 这个 reducer 会生成 action type: "counter/increment"
  },
});
```

当你 dispatch 一个 action 时，实际的 type 是：
```javascript
dispatch({ type: 'counter/increment' }); // 由 Redux Toolkit 自动生成
```

这种设计避免了 action type 冲突（例如，不同切片的 `increment` 不会冲突），同时让开发者无需手动编写冗长的 action type 字符串。


### 3. **为什么这很重要？**
- **模块化**：不同功能模块的状态和 action 被清晰隔离（例如，`counter/increment` 和 `user/login`）。
- **可维护性**：从 action type 就能直观知道它属于哪个模块（例如，看到 `cart/addItem` 就知道这是购物车模块的 action）。
- **调试友好**：在 Redux DevTools 中，可以清晰看到每个 action 来自哪个切片。


### 总结
`name` 参数就像一个**文件夹名称**：
- 它决定了状态在 store 中的位置（路径）。
- 它为该切片生成的所有 action type 提供前缀（避免命名冲突）。

这是 Redux Toolkit 简化开发的一个重要设计，让你无需手动管理复杂的 action type 命名规则。

### 2. PayloadAction 类型
`PayloadAction` 是 `@reduxjs/toolkit` 中定义的一个类型，用于表示 Redux action 及其负载（payload）。它确保了 action payload 的类型安全。

`PayloadAction<T>` 是一个泛型类型，`T` 表示 action 的负载类型。例如，`PayloadAction<number>` 表示该 action 的负载是一个数字类型。

示例代码：
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const { incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
```

### 3. Store 配置
在 Redux Toolkit 中，使用 `configureStore` 函数来配置 Redux store。`configureStore` 函数自动设置了 Redux 的中间件（如 thunk 中间件），并开启了 Redux DevTools（如果在开发环境中）。

示例代码：
```typescript
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';

const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

export default store;
```

### 4. 组件连接
在 React 组件中，通过 `react-redux` 库提供的 `useSelector` 和 `useDispatch` 钩子函数来连接 Redux store。
- `useSelector`：接收一个选择器函数，从 Redux store 中选择需要的状态。
- `useDispatch`：返回一个函数，用于触发 action，从而更新 Redux store 中的状态。

示例代码：
```tsx
import React from 'react';
import { useSelector, useDispatch } from'react-redux';
import { increment, decrement } from './store/counterSlice';

function App() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <h1>{count}</h1>
      <button onClick={() => dispatch(increment())}>增加</button>
      <button onClick={() => dispatch(decrement())}>减少</button>
    </div>
  );
}

export default App;
```

## 项目结构
```
src/
├── store/
│   ├── counterSlice.ts    // 状态切片定义
│   └── store.ts           // Redux store 配置
├── App.tsx                // 应用主组件
├── index.tsx              // 应用入口
└── react-app-env.d.ts     // TypeScript 环境定义
```

## 使用方法
1. 安装项目依赖：
```bash
npm install
```
2. 启动开发服务器：
```bash
npm run dev
```
3. 在浏览器中访问项目，即可看到应用界面，通过点击按钮来体验状态的增加和减少操作。

这个示例展示了 Redux Toolkit 的基础用法，通过理解这些概念和代码结构，你可以进一步扩展和应用 Redux Toolkit 到更复杂的项目中。 


## 使用方法

1. 安装依赖
   ```bash
   npm install
   ```

2. 启动开发服务器
   ```bash
   npm run dev
   ```

3. 功能说明
   - 点击"增加"按钮：状态值 +1
   - 点击"减少"按钮：状态值 -1
   - 输入框中输入数值：直接设置状态值

这个示例展示了 Redux Toolkit 的最基础用法，适合初学者理解全局状态管理的核心概念。