const express = require('express');
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const UserModel = require('../Models/user_model');

// Middleware function to authenticate users using JWT token
const authenticate = async (req, res, next) => {
    const authHeader = req.headers["authorization"];

    // Check if Authorization header is present
    if (!authHeader) {
        return res.status(401).json({ message: "You are unauthorized!" });
    }

    // Extract token from Authorization header
    const token = authHeader.replace('Bearer ', "");

    // Check if token is present
    if (!token) {
        return res.status(401).json({ message: "You are unauthorized!" });
    }

    try {
        // Verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN);

        // Find user based on decoded token
        const user = await UserModel.findOne({ email: decodedToken }, { password: 0 });

        // Check if user exists
        if (!user) {
            return res.status(401).json({ message: "You are unauthorized!" });
        }

        // Attach user information to the request object
        req.user = user;
        next(); // Proceed to the next middleware

    } catch (error) {
        return res.status(400).json({ message: "Error Occurred!", error })
    }
}

module.exports = authenticate;