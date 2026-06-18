import { Budget } from "../models/budget.model.js";
import { Expense } from "../models/expense.model.js";

const createBudget = async (req ,res) => {
    const {
        amount,
        month,
        year
    } = req.body;

    const existingBudget = await Budget.findOne({
        owner:req.user._id,
        month,
        year
    });

    if(existingBudget)
    {
        return res.status(400)
        .json({
            message:"Budget already exists"
        });
    }

    const budget = await Budget.create({
        amount,
        month,
        year,
        owner:req.user._id
    });

    return res.status(201).json({budget});
};

const getBudgetSummary = async (req , res) => {
    const currentDate = new Date();

    const month = currentDate.getMonth()+1;

    const year = currentDate.getFullYear();

    const budget = await Budget.findOne({
        owner:req.user._id,

        month,

        year
    });

    if(!budget){

    return res
      .status(404)
      .json({
        message:
        "Budget not found"
      });

  }

  const startDate = new Date(
    year,
    month-1,
    1
  );

  const lastDate = new Date(
    year,
    month,
    0
  );

  const expenseStats = await Expense.aggregate([
    {
        $match:{
            owner:req.user._id,

            expenseDate: {
                $gte:startDate,
                $lte:lastDate,
            }
        }
    },

    {
        $group:{
            _id:null,
            totalSpent:{
                $sum:"$amount"
            }
        }
    }
  ]);

  const spent = expenseStats[0]?.totalSpent || 0;

  const remaining = budget.amount - spent;

  const percentageUsed = (spent / budget.amount)*100;
  let alert = null;

  if(percentageUsed >= 100)
  {
    alert = "Budget exceeded";
  }

  else if(percentageUsed >=90)
  {
    alert = "Warning: 90% budget used"
  }

  else if (
  percentageUsed >= 80
) {

  alert =
  "Warning: 80% of budget used";

}

   return res
    .status(200)
    .json({

      budget:
      budget.amount,

      spent,

      remaining,

      percentageUsed,

      alert

    });

 
}

export {
    createBudget,
    getBudgetSummary
}