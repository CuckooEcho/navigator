import { createSlice} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// 定义状态类型
interface CounterState {
  value: number;
}

// 初始状态
const initialState: CounterState = {
  value: 0,
};

// 创建状态切片
export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1; // state 的初始值为 initialState, 他的类型 自动被推断为 { value: number } ,所以不用指定
    },
    decrement: (state) => {
      state.value -= 1;
    },
    setValue: (state, action: PayloadAction<number>) => {
      state.value = action.payload;
    },
  },
});

// 导出 action creators
export const { increment, decrement, setValue } = counterSlice.actions;

// 导出 reducer
export default counterSlice.reducer;  