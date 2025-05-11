const fs = require('fs').promises;

// 读取文件的 Promise 封装
function readFileContent(filePath) {
    return fs.readFile(filePath, 'utf8')
           .then(data => {
                // 成功读取文件内容
                return data;
            })
           .catch(error => {
                // 文件读取失败
                throw new Error(`读取文件失败: ${error.message}`);
            });
}

// 使用示例
const filePath = './example.txt';
const errorFilePath = './error.txt';

// 尝试读取存在的文件
readFileContent(filePath)
   .then(content => {
        console.log('✅ 文件内容:', content);
    })
   .catch(error => {
        console.error('❌ 错误:', error.message);
    });

// 尝试读取不存在的文件
readFileContent(errorFilePath)
   .then(content => {
        console.log('✅ 文件内容:', content);
    })
   .catch(error => {
        console.error('❌ 错误:', error.message);
    });