import { Expense } from "../models/expense.model.js"

const createExpense = async (req , res) => {
    //Get Data
    const {
        title,
        amount,
        category,
        description,
        expenseDate
    } = req.body;

    // validate the data
    if(!title || !amount || !category)
    {
        return res.status(400)
        .json({
            message: "Title, Amount and Category are required"
        });
    }

    //Get current user using jwt
    const owner = req.user._id;

    //Create expense 
    const expense = await Expense.create({
        title,
        amount,
        category,
        description,
        owner
    });

    //Returning response 
    return res.status(201)
    .json({
        message: "Expense created successfully",
        expense
    });
};

const getUserExpense = async (req , res) => {
    
    //Get user id
    const userId = req.user._id;

    //Find expenses
    // Find all expenses where owner equals current user
    const expenses = await Expense.find({ 
        owner: userId 
    })
    .sort({
        createdAt: -1  // -1 -> means Descending / Newest First
    });

    //Send response 
    return res.status(200)
    .json({
        expenses
    });


}

const getExpenseById = async (req , res) => {
    //Get expense id
    const { expenseId } = req.params;
}


export { 
    createExpense,
    getUserExpense
 };