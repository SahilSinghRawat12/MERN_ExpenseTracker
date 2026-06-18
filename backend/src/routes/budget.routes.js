import { Router }
from "express";

import {
  verifyJWT
}
from "../middleware/auth.middleware.js";

import {
  createBudget,
  getBudgetSummary
}
from "../controllers/budget.controller.js";

const router =
Router();

router.post(
  "/",
  verifyJWT,
  createBudget
);

router.get("/summary", verifyJWT ,getBudgetSummary)

export default router;