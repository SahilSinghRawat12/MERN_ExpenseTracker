import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        const conncectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${conncectionInstance.connection.host}`);
  console.log("DB Name:", mongoose.connection.db.databaseName); 
    } catch (error) {
        console.log("MONGODB connection error ", error);
        process.exit(1);
    }
}

export default connectDB