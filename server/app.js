import express from 'express';
import cors from 'cors';
import upload from './middlewares/multer.js';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json(
    {
        limit: '16kb'
    }
));
app.use(express.urlencoded(
    {
        extended: true
    }
));

// Routes and Services
app.get('/health-check', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

// Routes 

import authRouter from "./routes/auth.routes.js";
import serviceRouter from "./routes/service.routes.js";
app.use('/api/auth', authRouter);
app.use('/api/services', serviceRouter);

export default app;