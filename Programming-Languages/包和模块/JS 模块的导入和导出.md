下面按照导出方式分类，结合完整的导入示例进行说明，每种方式都包含基础导入、重命名导入、命名空间导入和动态导入的完整示例：


### **一、命名导出（Named Exports）**
**特点**：可导出多个成员，导入时需使用对应名称（或重命名）。

#### **1. 基础命名导出**
```javascript
// 📁 math-named.js（导出）
export const PI = 3.14;
export function calculateCircleArea(radius) {
  return PI * radius ** 2;
}
export class Calculator {
  static add(a, b) {
    return a + b;
  }
}
export const config = {
  precision: 2
};
```

#### **2. 导入方式**
```javascript
// 📁 main.js（基础导入）
import { PI, calculateCircleArea, Calculator, config } from './math-named.js';

console.log(calculateCircleArea(5)); // 78.5
console.log(Calculator.add(3, 4)); // 7
```

```javascript
// 📁 main-renamed.js（重命名导入）
import { 
  PI as MATH_PI, 
  calculateCircleArea as getArea, 
  Calculator as MathCalculator,
  config as mathConfig
} from './math-named.js';

console.log(getArea(5)); // 78.5
console.log(MathCalculator.add(3, 4)); // 7
```

```javascript
// 📁 main-namespace.js（命名空间导入）
import * as Math from './math-named.js';

console.log(Math.calculateCircleArea(5)); // 78.5
console.log(Math.Calculator.add(3, 4)); // 7
```

```javascript
// 📁 main-dynamic.js（动态导入）
// 在 JavaScript 的模块系统中，动态导入是一种在运行时按需加载模块的机制，
// 它返回一个 Promise，可以使用 await 或 then 来处理加载后的模块。
async function loadMathModule() {
  try {
    // 使用 import() 函数，传入模块路径作为参数，该函数返回一个 Promise
    // await 用于等待 Promise 解决，然后将加载的模块赋值给 mathModule。
    const mathModule = await import('./math-named.js');
    
    // 使用 Promise 方式
    // 由于 import() 返回的是一个 Promise，可以使用 .then() 来处理加载后的模块
    mathModule.calculateCircleArea(5).then(area => {
      console.log(area); // 78.5
    });
    
    // 或者直接使用（已 await）
    // 在 async 函数中，可以使用 await 直接获取函数执行的结果。
    console.log(mathModule.Calculator.add(3, 4)); // 7
    
  } catch (error) {
    console.error('加载模块失败:', error);
  }
}

// 条件加载示例
// 动态导入常用于条件加载模块的场景。
// 这里 needMath 是一个条件，只有当 needMath 为 true 时，才会调用 loadMathModule 函数来动态加载模块
if (needMath) {
  loadMathModule();
}
```


### **二、默认导出（Default Export）**
**特点**：每个模块只能有一个默认导出，导入时可自定义名称。

#### **1. 基础默认导出**
```javascript
// 📁 math-default.js（导出）
const MathUtils = {
  PI: 3.14,
  calculateCircleArea(radius) {
    return this.PI * radius ** 2;
  },
  add(a, b) {
    return a + b;
  }
};

export default MathUtils;
```

#### **2. 导入方式**
```javascript
// 📁 main.js（基础导入）
import utils from './math-default.js';

console.log(utils.calculateCircleArea(5)); // 78.5
console.log(utils.add(3, 4)); // 7
```

```javascript
// 📁 main-renamed.js（重命名导入）
import { default as MathHelper } from './math-default.js';

console.log(MathHelper.calculateCircleArea(5)); // 78.5
```

```javascript
// 📁 main-namespace.js（命名空间导入）
import * as Math from './math-default.js';

console.log(Math.default.calculateCircleArea(5)); // 78.5
```

```javascript
// 📁 main-dynamic.js（动态导入）
async function loadMathModule() {
  try {
    const mathModule = await import('./math-default.js');
    
    // 默认导出作为模块的 default 属性
    console.log(mathModule.default.calculateCircleArea(5)); // 78.5
    
    // 解构赋值获取默认导出
    const { default: utils } = await import('./math-default.js');
    console.log(utils.add(3, 4)); // 7
    
  } catch (error) {
    console.error('加载模块失败:', error);
  }
}
```


### **三、混合导出（命名 + 默认）**
**特点**：同时使用默认导出和命名导出，导入时需分别处理。

#### **1. 基础混合导出**
```javascript
// 📁 math-mixed.js（导出）
export default function add(a, b) {
  return a + b;
}

export const PI = 3.14;
export function calculateCircleArea(radius) {
  return PI * radius ** 2;
}
export class Calculator {
  static multiply(a, b) {
    return a * b;
  }
}
```

#### **2. 导入方式**
```javascript
// 📁 main.js（基础导入）
import add, { PI, calculateCircleArea, Calculator } from './math-mixed.js';

console.log(calculateCircleArea(5)); // 78.5
console.log(add(3, 4)); // 7
```

```javascript
// 📁 main-renamed.js（重命名导入）
import sum, { 
  PI as MATH_PI, 
  calculateCircleArea as getArea,
  Calculator as MathCalculator
} from './math-mixed.js';

console.log(getArea(5)); // 78.5
console.log(sum(3, 4)); // 7
```

```javascript
// 📁 main-namespace.js（命名空间导入）
import * as Math from './math-mixed.js';

console.log(Math.calculateCircleArea(5)); // 78.5
console.log(Math.default(3, 4)); // 7 (默认导出作为 default 属性)
```

```javascript
// 📁 main-dynamic.js（动态导入）
async function loadMathModule() {
  try {
    const mathModule = await import('./math-mixed.js');
    
    // 访问默认导出和命名导出
    console.log(mathModule.default(3, 4)); // 7
    console.log(mathModule.calculateCircleArea(5)); // 78.5
    
    // 解构赋值
    const { default: add, PI, Calculator } = await import('./math-mixed.js');
    console.log(Calculator.multiply(3, 4)); // 12
    
  } catch (error) {
    console.error('加载模块失败:', error);
  }
}
```


### **四、命名导出的重导出（Re-export）**
**特点**：在当前模块中导出其他模块的命名成员。

#### **1. 基础重导出**
```javascript
// 📁 math-index.js（重导出）
export { PI, calculateCircleArea, Calculator } from './math-named.js';
export { default as add } from './math-mixed.js'; // 重导出默认导出为命名导出
```

#### **2. 导入方式**
```javascript
// 📁 main.js（基础导入）
import { PI, calculateCircleArea, add } from './math-index.js';

console.log(calculateCircleArea(5)); // 78.5
console.log(add(3, 4)); // 7
```

```javascript
// 📁 main-renamed.js（重命名导入）
import { 
  PI as MATH_PI, 
  calculateCircleArea as getArea,
  add as sum
} from './math-index.js';

console.log(getArea(5)); // 78.5
console.log(sum(3, 4)); // 7
```

```javascript
// 📁 main-namespace.js（命名空间导入）
import * as Math from './math-index.js';

console.log(Math.calculateCircleArea(5)); // 78.5
console.log(Math.add(3, 4)); // 7
```

```javascript
// 📁 main-dynamic.js（动态导入）
async function loadMathModule() {
  try {
    const mathModule = await import('./math-index.js');
    
    console.log(mathModule.calculateCircleArea(5)); // 78.5
    console.log(mathModule.add(3, 4)); // 7
    
  } catch (error) {
    console.error('加载模块失败:', error);
  }
}
```


### **五、默认导出的重导出**
**特点**：在当前模块中重导出其他模块的默认导出。

#### **1. 基础重导出**
```javascript
// 📁 math-utils.js（重导出）
export { default } from './math-default.js'; // 重导出默认导出
export { PI } from './math-named.js'; // 同时重导出命名成员
```

#### **2. 导入方式**
```javascript
// 📁 main.js（基础导入）
import utils, { PI } from './math-utils.js';

console.log(utils.calculateCircleArea(5)); // 78.5
console.log(PI); // 3.14
```

```javascript
// 📁 main-renamed.js（重命名导入）
import { default as MathHelper, PI as MATH_PI } from './math-utils.js';

console.log(MathHelper.add(3, 4)); // 7
console.log(MATH_PI); // 3.14
```

```javascript
// 📁 main-dynamic.js（动态导入）
async function loadMathModule() {
  try {
    const mathModule = await import('./math-utils.js');
    
    console.log(mathModule.default.calculateCircleArea(5)); // 78.5
    console.log(mathModule.PI); // 3.14
    
    // 解构赋值
    const { default: utils, PI } = await import('./math-utils.js');
    console.log(utils.add(3, 4)); // 7
    
  } catch (error) {
    console.error('加载模块失败:', error);
  }
}
```


### **六、混合导出的重导出**
**特点**：在当前模块中同时重导出其他模块的默认导出和命名导出。

#### **1. 基础重导出**
```javascript
// 📁 math-all.js（重导出）
export { default } from './math-mixed.js'; // 重导出默认导出
export { PI, calculateCircleArea } from './math-named.js'; // 重导出命名成员
```

#### **2. 导入方式**
```javascript
// 📁 main.js（基础导入）
import add, { PI, calculateCircleArea } from './math-all.js';

console.log(calculateCircleArea(5)); // 78.5
console.log(add(3, 4)); // 7
```

```javascript
// 📁 main-dynamic.js（动态导入）
async function loadMathModule() {
  try {
    const mathModule = await import('./math-all.js');
    
    console.log(mathModule.default(3, 4)); // 7
    console.log(mathModule.calculateCircleArea(5)); // 78.5
    
  } catch (error) {
    console.error('加载模块失败:', error);
  }
}
```


### **七、关键区别总结**
| **导出方式**       | **导出语法**                                                 | **基础导入**                    | **重命名导入**                               | **命名空间导入**              | **动态导入**                                       |
| ------------------ | ------------------------------------------------------------ | ------------------------------- | -------------------------------------------- | ----------------------------- | -------------------------------------------------- |
| **命名导出**       | `export const PI = 3.14;`<br>`export function add() {}`      | `import { PI, add } from '...'` | `import { PI as MATH_PI } from '...'`        | `import * as Math from '...'` | `const { PI } = await import('...')`               |
| **默认导出**       | `const utils = { ... }`<br>`export default utils;`           | `import utils from '...'`       | `import { default as MathUtils } from '...'` | `import * as Math from '...'` | `const { default: utils } = await import('...')`   |
| **混合导出**       | `export default add;`<br>`export const PI = 3.14;`           | `import add, { PI } from '...'` | `import sum, { PI as MATH_PI } from '...'`   | `import * as Math from '...'` | `const { default: add, PI } = await import('...')` |
| **命名导出重导出** | `export { PI, add } from './math.js';`                       | `import { PI, add } from '...'` | `import { PI as MATH_PI } from '...'`        | `import * as Math from '...'` | `const { PI } = await import('...')`               |
| **默认导出重导出** | `export { default } from './math.js';`                       | `import utils from '...'`       | `import { default as MathUtils } from '...'` | `import * as Math from '...'` | `const { default: utils } = await import('...')`   |
| **混合导出重导出** | `export { default } from './math.js';`<br>`export { PI } from './math.js';` | `import add, { PI } from '...'` | `import sum, { PI as MATH_PI } from '...'`   | `import * as Math from '...'` | `const { default: add, PI } = await import('...')` |


通过这种对比可以清晰看到：
- **命名导出**适合多成员的工具库，导入时明确引用。
- **默认导出**适合单一功能的模块（如组件、类）。
- **混合导出**兼顾灵活性和主要功能。
- **动态导入**用于性能优化（按需加载）。
- **重导出**用于代码组织和封装。