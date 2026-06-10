import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createExpense, getUserExpense } from "../controllers/expense.controller.js";


const router = Router();

//Without verifyJWT anyone can create expenses
//But with verifyJWR only logged in user can create expenses
router.post("/" , verifyJWT , createExpense);
router.get("/" , verifyJWT , getUserExpense);

export default router;