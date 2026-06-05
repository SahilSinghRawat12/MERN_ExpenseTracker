import { User } from "../models/user.model.js"

const registerUser = async ( req , res ) => {

    //Get Data
    const {
        fullname,
        email,
        password
    } = req.body;

    // Validate Data
    if(
        !fullname || 
        !email ||
        !password
    ) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    //Check existing user
    const existedUser = await User.findOne({
        email
    });

    //if user already exists
    if(existedUser)
    {
        return res
                .status(409)
                .json({
                    message: "User already exists"
                });
    }

    // Create user
    const user = await User.create({
        fullname,
        email,
        password
    });

    //verify user creation
    const createdUser = await User.findById(
        user._id
    ).select("-password"); // with this in response we will not get the password

    //send response 
    return res
            .status(200)
            .json({
                message: "User registered successfully",
                user: createdUser
            })
};

export {
    registerUser
};