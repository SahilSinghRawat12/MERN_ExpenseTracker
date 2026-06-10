import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import expenseRouter from "./routes/expense.routes.js"


const app = express();

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



export {app}