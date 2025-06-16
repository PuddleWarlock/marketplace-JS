const fs = require('fs').promises;
const path = require('path');

async function combineFiles(startPath, outputFile) {
    try {
        const outputStream = await fs.open(outputFile, 'w');

        async function processDirectory(currentPath) {
            // Skip folders
            if (path.basename(currentPath) === 'node_modules' ||
                path.basename(currentPath) === 'storybook-static' ||
                path.basename((currentPath)) === "logs") {
                return;
            }

            const entries = await fs.readdir(currentPath, {withFileTypes: true});

            for (const entry of entries) {
                const fullPath = path.join(currentPath, entry.name);
                const ext = path.extname(entry.name).toLowerCase();

                if (entry.isDirectory()) {
                    // Recursively process subdirectories
                    await processDirectory(fullPath);
                } else if (entry.isFile() &&
                    !['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.ico', '.avif', '.svg','.ico'].includes(ext) && !fullPath.includes("package-lock.json")) {
                    try {
                        // Read file content
                        const content = await fs.readFile(fullPath, 'utf8');
                        // Write file path and content to output file
                        await outputStream.write(`\n\n=== ${fullPath} ===\n${content}`);
                    } catch (err) {
                        console.error(`Error reading file ${fullPath}: ${err.message}`);
                    }
                }
            }
        }

        await processDirectory(startPath);
        await outputStream.close();
        console.log(`All files combined into ${outputFile}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
    }
}

// Example usage
const startPath = './backend'; // Specify the starting folder
const outputFile = './output.txt'; // Specify the output file path
combineFiles(startPath, outputFile);