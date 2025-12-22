// 案例 4：结合网络请求（多异步源）
const fs = require('fs').promises;
// const fetch = require('node-fetch');

function readFileContent(filePath) {
    return fs.readFile(filePath, 'utf8')
           .then(data => data)
           .catch(error => {
                throw new Error(`读取失败: ${error.message}`);
            });
}

async function mixedAsyncOperations() {
    try {
        // 并行执行文件读取和网络请求
        const [fileContent, apiData] = await Promise.all([
            readFileContent('./config.json'),
            fetch('https://ydz.chp.org.cn/front-api/book/4').then(res => res.json())
        ]);

        console.log('文件内容:', fileContent);
        console.log('API 数据:', apiData);
    } catch (error) {
        console.error('操作失败:', error.message);
    }
}

mixedAsyncOperations();