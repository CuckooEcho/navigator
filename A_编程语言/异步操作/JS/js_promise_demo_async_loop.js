// 案例 2：使用 async/await + 循环（顺序执行）
const fs = require('fs').promises;

function readFileContent(filePath) {
    return fs.readFile(filePath, 'utf8')
           .then(data => data)
           .catch(error => {
                throw new Error(`读取失败: ${error.message}`);
            });
}

async function readFilesSequentially() {
    const files = ['./file1.txt', './file2.txt', './file3.txt'];

    for (const file of files) {
        try {
            // 等待每个文件读取完成
            const content = await readFileContent(file);
            console.log(`✅ ${file}:`, content);
        } catch (error) {
            console.error(`❌ ${file}:`, error.message);
        }
    }
}

readFilesSequentially();

/**
 * 输出：
 * ✅ ./file1.txt: 文件内容1
 * ✅ ./file2.txt: 文件内容2
 * ✅ ./file3.txt: 文件内容3
 */