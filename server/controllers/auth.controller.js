import upload from "../middlewares/multer.js";
import User from "../models/auth.model.js";

export const registerUser = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ message: "Request body is required" });
        }
        const { userName, password } = req.body;
        if (!userName || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ userName });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user
        const newUser = new User({ userName, password });
        await newUser.save();

        res.status(201).json({
            message: "User registered successfully",
            user: {
                userName: newUser.userName,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt,
                userId: newUser._id
            }
        });
    } catch (error) {
        console.error("Error during user registration:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const loginUser = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ message: "Request body is required" });
        }
        const { userName, password } = req.body;
        if (!userName || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        // Check if user exists
        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Check password
        const isMatch = await user.isPasswordCorrect(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Generate auth token
        const authToken = user.generateAuthToken();
        user.authToken = authToken;
        await user.save();

        res.status(200).json({
            message: "User logged in successfully",
            authToken
        });

    } catch (error) {
        console.error("Error during user login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
export const logoutUser = async (req, res) => { 
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Clear auth token
        user.authToken = undefined;
        await user.save();
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.error("Error during user logout:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getUser = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        return res.status(200).json({
            message: "User details fetched successfully",
            user
        });
        
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}