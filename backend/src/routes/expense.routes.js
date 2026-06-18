import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createExpense, deleteExpense, exportCSV, exportPdf, getExpenseById, getExpenseStats, getMonthlyAnalytics, getUserExpense, updateExpense } from "../controllers/expense.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createExpenseSchema } from "../validator/expense.validator.js";


const router = Router();

//Without verifyJWT anyone can create expenses
//But with verifyJWR only logged in user can create expenses
router.post("/" , verifyJWT, validate(createExpenseSchema) , createExpense);
router.get("/" , verifyJWT , getUserExpense);
router.get("/stats" , verifyJWT, getExpenseStats); // put this before /:expenseId
router.get("/monthly" , verifyJWT , getMonthlyAnalytics);
router.get("/export/csv" , verifyJWT , exportCSV);
router.get("/export/pdf" , verifyJWT , exportPdf);
router.get("/:expenseId" , verifyJWT, getExpenseById);
router.patch("/:expenseId" , verifyJWT, updateExpense);
router.delete("/:expenseId" , verifyJWT, deleteExpense);

export default router;