import { Router } from 'express';
import { registerUser, loginUser, logoutUser, getUser }  from "../controllers/auth.controller.js";
import { verifyUser } from '../middlewares/verifyUser.js';
import upload from '../middlewares/multer.js';

const router = Router();

router.route("/register").post(upload.none(), registerUser);

router.route("/login").post(upload.none(), loginUser);


// other secure routes : logout 

router.route("/logout").post(
    upload.none(),
    verifyUser,
    logoutUser
);


router.route("/").get(
    upload.none(),
    verifyUser,
    getUser
)
export default router;