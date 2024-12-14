const express = require('express');
const routes = require('./routes');
const connectDB = require('./middlewares/db');
const { logRequest,logError } = require('./utils/logger');
const cors = require('cors');


const server = express();

// Connect to MongoDB
connectDB();

// Middlewares
server.use(express.json());
server.use(logRequest);
server.use(cors({
    origin: 'http://localhost:4000', // Разрешаем запросы с этого домена
    methods: ['GET', 'POST','PUT','DELETE'],
}));

// Routes
server.use('/api', routes);

// Start server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
