import { Router }
from "express";

import {
  verifyJWT
}
from "../middleware/auth.middleware.js";

import {
  createBudget
}
from "../controllers/budget.controller.js";

const router =
Router();

router.post(
  "/",
  verifyJWT,
  createBudget
);

export default router;