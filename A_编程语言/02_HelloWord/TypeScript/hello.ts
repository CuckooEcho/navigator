// 基本输出
console.log('Hello, World!');

const new_name = 'World';
console.log(`Hello, ${new_name}!`);  // 输出：Hello, World!

// 模板字符串
console.log(`当前时间: ${new Date().toLocaleTimeString()}, 版本: ${process.versions.node}`);

// 数字格式化
console.log('圆周率: ' + Math.PI.toFixed(5));
console.log(`大额数字: ${Number(1_234_567).toLocaleString()}`);

// 日期格式化
const now = new Date();
console.log(`本地时间: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);

// 高级格式化
console.log('进度: %d%%', 75.5);
console.log('JSON格式: %j', { name: 'John', age: 30 });