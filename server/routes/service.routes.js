import { Router } from "express";
import { verifyUser } from '../middlewares/verifyUser.js';
import upload from '../middlewares/multer.js';
import { uploadPDF, chat, indexText } from '../controllers/service.controller.js';

const router = Router();

router.route("/upload").post(upload.single('file'), verifyUser, uploadPDF);
router.route("/chat").post(upload.none(), verifyUser, chat);
router.route("/text").post(upload.none(), verifyUser, indexText);

export default router;