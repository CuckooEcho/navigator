const myPromise = new Promise((resolve, reject) => {
  // 模拟异步操作（如网络请求、文件读取等）
  setTimeout(() => {
    const isSuccess = Math.random() > 0.5; // 随机决定成功或失败
    
    if (isSuccess) {
     // 操作成功时调用resolve(), 当执行 resolve() 时，Promise 状态变为 fulfilled，并触发 .then() 回调,并传递结果
      resolve('✅ 操作成功'); 
    } else {
     // 操作失败时调用 reject(),当执行 reject() 时，Promise 状态变为 rejected，并触发 .catch() 回调,并传递 Error 对象
      reject(new Error('❌ 操作失败')); 
    }
  }, 1000);
});

// 处理 Promise 结果
myPromise
  .then((result) => {
    console.log('成功:', result); // 当 Promise 被 resolve 时执行
  })
  .catch((error) => {
    console.error('失败:', error.message); // 当 Promise 被 reject 时执行
  });