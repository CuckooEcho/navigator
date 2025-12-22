const fs = require('fs').promises;

function readFileContent(filePath) {
    return new Promise((resolve, reject) => {
        // 添加随机延迟（500-1500ms）
        const delay = Math.floor(Math.random() * 1000) + 500;
        setTimeout(() => {
            fs.readFile(filePath, 'utf8')
               .then(data => resolve(data))
               .catch(error => reject(new Error(`读取失败: ${error.message}`)));
        }, delay);
    });
}

// 同时读取多个文件
Promise.all([
    readFileContent('./file1.txt'),
    readFileContent('./file2.txt'),
    readFileContent('./file3.txt'),
    readFileContent('./file1.txt'),
    readFileContent('./file2.txt'),
    readFileContent('./file3.txt'),
])
   .then(results => console.log('全部成功:', results))
   .catch(error => console.error('有错误:', error.message));