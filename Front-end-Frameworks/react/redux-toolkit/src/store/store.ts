import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';

// 自动推导 RootState 类型
export type RootState = ReturnType<typeof store.getState>;

// 创建 store
export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});  