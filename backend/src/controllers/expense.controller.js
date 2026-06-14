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
    
    //Extract Queries
    const {
        page = 1,
        limit = 10,
        category,
        search
    } = req.query;

    //Build filter object
    const filter = {
        owner: req.user._id
    };

    //Category filter
    if(category)
    {
        filter.category = {
            $regex: `^${category}$`, // ^ = start of the string , $ = end of the string
            $options: "i"
        }
    }

    //search filter
    if(search)
    {
        filter.title = {
            $regex: search, //search matching items -> piz -> pizza , dominos pizza
            $options:"i"    // case Insensitive-> pizza and PIZZA are same
        };
    }

    //convert string to numbers -> req.query returns string so convert to number
    const pageNumber = Number(page);

    const limitNumber = Number(limit);

    //fetch expenses
    const expenses = await Expense.find(filter)
                                .sort({
                                    createdAt: -1
                                })
                                .skip(
                                    (pageNumber - 1) * limitNumber
                                )
                                .limit(limitNumber);

    // Total count -> needed for frontend pagination
    const totalExpenses = await Expense.countDocuments(filter);

    //Total pages
    const totalPages = Math.ceil(totalExpenses / limitNumber );

    //Send response 
    return res  
           .status(200)
           .json({
            expenses,
            page:pageNumber,
            totalPages,
            totalExpenses
           });

}

const getExpenseById = async (req , res) => {
    //Get expense id
    const { expenseId } = req.params;  // or const expenseId = req.params.expenseId;

    // find expense 
    const expense = await Expense.findById( expenseId );

    //check expense exist 
    if(!expense)
    {
        return res.status(404)
        .json({
            message: "Expense not found"
        });
    }

    //Ownership check
    if( expense.owner.toString() !== req.user._id.toString() ) //mongo db stores id as objectId so we convert it to Sting usibg toString()
    {
        return res.status(403)
        .json({
            message:"Access denied"
        });
    }

    //Send expense
    return res.status(200)
            .json({
                expense
            });

}


const updateExpense = async (req , res) => {
    //get expenseId
    const {expenseId} = req.params;

    //find expense 
    const expense = await Expense.findById(expenseId);

    //check exist
    if(!expense)
    {
        return res.status(404)
        .json({
            message:"Expense not found"
        });
    }

    //ownership check
    if( expense.owner.toString() !== req.user._id.toString() )
    {
        return res.status(403)
        .json({
            message:"Access Denied"
        });
    }

    //Get updated fields
    const {
        title,
        amount,
        category,
        description
    } = req.body;

    //update only provided fields
    if(title) {
        expense.title = title;
    }

    if(amount)
    {
        expense.amount = amount;
    }

    if(category)
    {
        expense.category = category;
    }

    if(description)
    {
        expense.description = description;
    }

    //save changes
    //now mongoDB updates
    await expense.save();

    //send response 
    return res.status(200)
    .json({
        message: "Expense updated successfully",
        expense
    });
}


const deleteExpense = async (req , res) => {
    //get expense id
    const {expenseId} = req.params;

    //find expense
    const expense = await Expense.findById(expenseId);

    //check exists
    if(!expense)
    {
        return res.status(404)
        .json({
            message:"Expense not found"
        });
    }

    // ownership check
    if( expense.owner.toString() !== req.user._id.toString() )
    {
        return res.status(403)
        .json({
            message: "Access Denied"
        });
    }

    // Delete expense
    await Expense.findByIdAndDelete( expenseId );

    //send response 
    return res.status(200)
    .json({
        message: "Expense deleted successfully"
    });

}

const getExpenseStats = async (req , res) => {
        //Aggregation pipeline
        const stats = await Expense.aggregate([
            {
                //$match -> like a filter = Only curent user's expenses 
                $match: {
                    owner: req.user._id
                }
            },

            {
                //combine all matched documents into one result
                $group: {
                    _id: null,

                    totalExpenses:{
                        $sum:1          //for every document do +1 ex-> +1 +1 +1 +1 , totalExpenses=4
                    },

                totalAmount: {
                    $sum: "$amount"
                }
            }
        }

    ]);


    const categoryStats = await Expense.aggregate([
        {  
            $match: {
                owner: req.user._id
            }
        },

        {
            $group:{
                _id:"$category",

                total:{
                    $sum:"$amount"
                }
            }
        }
    ]);

    //send response
    return res.status(200)
                .json({

                    totalExpenses: stats[0]?.totalExpenses || 0,

                    totalAmount: stats[0]?.totalAmount || 0,

                    categoryBreakdown: categoryStats
                });
}


const getMonthlyAnalytics = async (req , res) => {
    const monthlyData = await Expense.aggregate([
        {
            $match: {
                owner: req.user._id
            }
        },
        {
            $group: {

                _id: {
                    year: {
                        $year: "$expenseDate"
                    },

                    month: {
                        $month: "$expenseDate"
                    }
                },

                totalAmount: {
                    $sum: "$amount"
                },

                totalExpenses: {
                    $sum: 1
                }
            }
        },

        {
            $sort: {
                "_id.year":1,
                "_id.month":1
            }
        }
    ]);

    //cleaning up aggregation result before sending it to the frontend
    const formattedData = monthlyData.map(item => ({
        year: item._id.year,
        month: item._id.month,
        totalAmount: item._id.totalAmount,
        totalExpenses: item.totalExpenses
    }));

    return res.status(200)
    .json({
        getMonthlyAnalytics: formattedData
    });
}



export { 
    createExpense,
    getUserExpense,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getExpenseStats,
    getMonthlyAnalytics
 };