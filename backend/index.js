const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const cors = require('cors');

// Parse incoming request bodies in JSON format with a size limit of 50mb
app.use(express.json({ limit: '50mb' }));

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Connect to the database
require('./dbconnect')

// Routes
// Authentication routes
app.use('/api/auth', require('./Routes/auth_route'));
// User routes
app.use('/api/user', require('./Routes/user_route'));
// Tweet routes
app.use('/api/tweet', require('./Routes/tweet_route'));

// Start the server
app.listen(process.env.PORT, () => {
    console.log("Server Started Successfully!");
});