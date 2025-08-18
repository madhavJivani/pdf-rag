import app from "./app.js"
import dotenv from 'dotenv';
import connectDB from './middlewares/database.js';

dotenv.config({quiet: true});
connectDB()
    .then(() => {
        // Finally listen to the server
        const PORT = process.env.PORT || 8000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("[Technically This Code Never Executes] Database connection failed:", err);
        process.exit(1);
    });
