import mongoose from "mongoose"

const budgetSchema = new mongoose.Schema({
        amount:{
            type:Number,
            required:true
        },
        month:{
            type:Number,
            required:true
        },
        year:{
             type:Number,
            required:true
        },
        owner:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true
        }
},
{timestamps: true}
);


export const Budget = mongoose.model("Budget" , budgetSchema)