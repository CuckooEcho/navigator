// 案例 3：并发读取多个文件（无序完成）
const fs = require('fs').promises;

function readFileContent(filePath) {
    return fs.readFile(filePath, 'utf8')
           .then(data => data)
           .catch(error => {
                throw new Error(`读取失败: ${error.message}`);
            });
}

async function readFilesConcurrently() {
    const files = ['./file1.txt', './file2.txt', './file3.txt','./file1.txt', './file2.txt', './file3.txt'];

    // 一次性发起所有请求
    const promises = files.map(file =>
        readFileContent(file)
           .then(content => ({ file, content, success: true }))
           .catch(error => ({ file, error: error.message, success: false }))
    );

    // 等待所有 Promise 完成（无论成功或失败）
    const results = await Promise.allSettled(promises);

    // 按完成顺序输出结果
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            console.log(`✅ ${result.value.file}:`, result.value.content);
        } else {
            console.error(`❌ ${result.reason.file}:`, result.reason.error);
        }
    });
}

readFilesConcurrently();