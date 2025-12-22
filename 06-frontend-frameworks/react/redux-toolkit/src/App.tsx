// src/App.tsx
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, setValue } from './store/counterSlice';
import type { RootState } from './store/store'; // 使用 import type 导入类型

function App() {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Redux Toolkit 基础示例</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-4">
        <p className="text-4xl font-bold mb-6">{count}</p>
        
        <div className="flex justify-center gap-4 mb-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={() => dispatch(decrement())}
          >
            减少
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            onClick={() => dispatch(increment())}
          >
            增加
          </button>
        </div>
        
        <div className="flex flex-col items-center">
          <input
            type="number"
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded mb-2"
            placeholder="输入数值"
            onChange={(e) => dispatch(setValue(Number(e.target.value) || 0))}
          />
        </div>
      </div>
    </div>
  );
}

export default App;