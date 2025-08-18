import jwt from "jsonwebtoken";
import User from "../models/auth.model.js";
import fs from "fs";
export const verifyUser = async (req, res, next) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: "Request body is required" });
        }
        const { authToken } = req.body;
        if (!authToken) {
            // Clean up uploaded file if auth fails
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(401).json({ error: "Unauthorized user request" });
        }

        const decoded_token = jwt.verify(authToken, process.env.AUTH_TOKEN_SECRET);

        if (!decoded_token) {
            // Clean up uploaded file if auth fails
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(403).json({ error: "Invalid access token" });
        }

        const userClient = await User.findById(decoded_token._id);

        if (!userClient) {
            // Clean up uploaded file if auth fails
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({ error: "User not found" });
        }

        req.userId = userClient._id;
        return next();
    } catch (error) {
        console.log("ERROR IN verifyUser.js in catch block", error);
        // Clean up uploaded file if auth fails
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }

}