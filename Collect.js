const fs = require('fs').promises;
const path = require('path');

async function combineFiles(startPath, outputFile) {
    try {
        const outputStream = await fs.open(outputFile, 'w');

        async function processDirectory(currentPath) {
            // Пропускаем папку logs
            if (path.basename(currentPath) === 'logs' || path.basename(currentPath) === 'node_modules') {
                return;
            }

            const entries = await fs.readdir(currentPath, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(currentPath, entry.name);

                if (entry.isDirectory()) {
                    // Рекурсивно обрабатываем подпапки
                    await processDirectory(fullPath);
                } else if (entry.isFile()) {
                    try {
                        // Читаем содержимое файла
                        const content = await fs.readFile(fullPath, 'utf8');
                        // Записываем путь файла и его содержимое в выходной файл
                        await outputStream.write(`\n\n=== ${fullPath} ===\n${content}`);
                    } catch (err) {
                        console.error(`Ошибка при чтении файла ${fullPath}: ${err.message}`);
                    }
                }
            }
        }

        await processDirectory(startPath);
        await outputStream.close();
        console.log(`Все файлы объединены в ${outputFile}`);
    } catch (err) {
        console.error(`Ошибка: ${err.message}`);
    }
}

// Пример использования
const startPath = './backend'; // Укажите начальную папку
const outputFile = './output.txt'; // Укажите путь к выходному файлу
combineFiles(startPath, outputFile);