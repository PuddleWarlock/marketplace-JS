const os = require('os');
const fs = require('fs').promises;
const path = require('path');

const getOSInfo = (req, res) => {
    const info = {
        platform: os.platform(),
        release: os.release(),
        uptime: os.uptime(),
        arch: os.arch()
    };
    res.status(200).json(info);
};

const getFileInfo = async (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'data.txt');
        const data = await fs.readFile(filePath, 'utf8');
        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: 'Error reading file' });
    }
};

module.exports = {
    getOSInfo,
    getFileInfo
};
