const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const connectDB = require('./middlewares/db');
const { logRequest } = require('./utils/logger');
const cors = require('cors');


const app = express();

// Connect to MongoDB
connectDB();

// Middlewares
app.use(bodyParser.json());
app.use(logRequest);
app.use(cors({
    origin: 'http://localhost:4000', // Разрешаем запросы с этого домена
    methods: ['GET', 'POST','PUT','DELETE'],
}));

// Routes
app.use('/api', routes);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
