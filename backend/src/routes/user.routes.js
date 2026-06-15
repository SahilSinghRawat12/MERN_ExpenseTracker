import { Router } from "express"
import { registerUser , loginUser, logoutUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema } from "../validator/auth.validator.js";
import { loginSchema } from "../validator/auth.validator.js";
import { authLimiter } from "../middleware/ratelimit.middleware.js";

const router = Router();

router.post("/register", validate(registerSchema) , registerUser);

router.post("/login", authLimiter, validate(loginSchema) , loginUser)

router.post("/logout" , verifyJWT , logoutUser)



export default router;