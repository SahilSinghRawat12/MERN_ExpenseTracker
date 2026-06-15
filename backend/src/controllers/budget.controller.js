import { Budget } from "../models/budget.model.js";

const createBudget = async (req ,res) => {
    const {
        amount,
        month,
        year
    } = req.body;

    const budger = await Budget.create({
        amount,
        month,
        year,
        owner:req.user._id
    });

    return res.status(201).json({budget});
};

export {
    createBudget
}