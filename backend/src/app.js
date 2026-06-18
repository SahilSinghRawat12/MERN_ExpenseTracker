import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import expenseRouter from "./routes/expense.routes.js"
import budgetRouter from "./routes/budget.routes.js"
import { errorHandler } from "./middleware/error.middleware.js"
import helmet from "helmet"
import { apiLimiter } from "./middleware/ratelimit.middleware.js"


const app = express();

// Trust Render proxy
app.set("trust proxy", 1);

//security middleware
app.use(helmet());
app.use("/api" , apiLimiter);

//global middlewares

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
);

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(cookieParser());


// routes

app.use("/api/v1/users" , userRouter);
app.use("/api/v1/expenses" , expenseRouter);
app.use("/api/v1/budgets" ,budgetRouter );

//middleware
app.use(errorHandler);



export {app}