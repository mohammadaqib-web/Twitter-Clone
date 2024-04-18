const UserModel = require("../Models/user_model");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

// Function to add a new user to the database
const AddUser = async (req, res) => {
    try {
        // Extract user information from request body
        const { name, username, email, password } = req.body;

        // Check if any required field is missing
        if (!name || !username || !email || !password) {
            return res.status(500).json({ message: "All fields are mandatory!" });
        }

        // Check if the email is already registered
        const findEmail = await UserModel.findOne({ email });
        if (findEmail) {
            return res.status(500).json({ message: "Email already registered!" });
        }

        // Check if the username is already registered
        const findUsername = await UserModel.findOne({ username });
        if (findUsername) {
            return res.status(500).json({ message: "Username already registered!" });
        }

        // Hash the user's password
        const hashPassword = await bcrypt.hash(password, 16);

        // Create a new user object with hashed password
        const newUser = new UserModel({ name, username, email, password: hashPassword });

        // Save the new user to the database
        const resp = await newUser.save();

        // Return success message and user data
        return res.status(200).json({ message: "User Registered Successfully!", user: resp });
    } catch (error) {
        // Return error message if an error occurs
        return res.status(500).json({ message: "Error Occurred!", error });
    }
}

// Function to authenticate and login a user
const LoginUser = async (req, res) => {
    try {
        // Extract email and password from request body
        const { email, password } = req.body;

        // Check if any required field is missing
        if (!email || !password) {
            return res.status(500).json({ message: "All fields are mandatory!" });
        }

        // Find user by email in the database
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(500).json({ message: "Email is not registered!" });
        }

        // Compare password with hashed password in the database
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(500).json({ message: "Email or Password is Incorrect!" });
        }

        // Generate JWT token for user authentication
        const token = await jwt.sign(user.email, process.env.JWT_TOKEN);

        // Extract necessary user information to be returned in response
        const userInfo = { "_id": user._id, "name": user.name, "email": user.email }

        // Return success message, JWT token, and user data
        return res.status(200).json({ message: "User Logged In Successfully!", token, user: userInfo });
    } catch (error) {
        // Return error message if an error occurs
        return res.status(500).json({ message: "Error Occurred!", error });
    }
}

module.exports = {
    AddUser,
    LoginUser
}