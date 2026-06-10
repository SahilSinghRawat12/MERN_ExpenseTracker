import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        amount: {
            type: Number,
            required: true
        },
        category: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        expenseDate: {
            type: Date,
            default: Date.now
        },
        //Owner field -> relationship with User collection
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true
        }
    },
    {
        timestamps: true
    }
);


export const Expense = mongoose.model("Expense" , expenseSchema);