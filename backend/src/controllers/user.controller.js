import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";


//Helper function -> reusable function for generating tokens
const generateAccessAndRefreshToken = 
async (userId) => {   

    try {
        const user = await User.findById(userId);
    
        const accessToken = user.generateAccessToken();
    
        const refreshToken = user.generateRefreshToken();
    
        user.refreshToken = refreshToken;
    
        await user.save({
            validateBeforeSave: false
        });
    
        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        throw error;
    }
};

const registerUser = 
asyncHandler(
async ( req , res ) => {

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
            .status(201)
            .json({
                message: "User registered successfully",
                user: createdUser
            })
});


const loginUser = 
asyncHandler(
async ( req , res ) => {
    //Extract Data
    const {email , password} = req.body;

    //Validate input 
    if(!email ||
        !password
    ) {
        return res  
                .status(400)
                .json({
                    message: "Email and Password are required"
                });
    }

    // find User 
    const user = await User.findOne({
        email
    });

    // handle user not found
    if(!user)
    {
        return res
                .status(404)
                .json({
                    message: "User does not exist"
                });
    }

    //Verify Password
    const isPasswordValid = 
    await user.isPasswordCorrect(
        password
    );

    // handle wrong password
    if(!isPasswordValid) {
        return res  
                .status(401)
                .json({
                    message: "Invalid Credentials"
                });
    }

    //Generate Token
    const { accessToken , refreshToken } = await generateAccessAndRefreshToken(
        user._id
    )

    //save refresh token
    user.refreshToken = refreshToken;

    await user.save({
        validateBeforeSave:false
    });

    // remove sensitive fields 
    const loggedInUser = 
    await User.findById(
        user._id
    ).select("-password -refreshToken");

    //send cookies-> we will store token in cookies
    const options = {
        httpOnly: true, // javascript in the browser cannot access cookies
        secure: true       // cookies is only sent over https not http
    } 

    //send response
    return res
            .status(200)
            .cookie(
                "accessToken",
                accessToken,
                options
            )
            .cookie(
                "refreshToken",
                refreshToken,
                options
            )
            .json({
                user: loggedInUser,
                accessToken,
                refreshToken
            });


});

const logoutUser = 
asyncHandler(
async (req , res) => {
    
    // Remove refresh token when user logout
    await User.findByIdAndUpdate(
        req.user._id,
        {
            //$unset removes the field from mongodb document-> removes refreshToken field
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    // clear cookies
    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .clearCookie( "accessToken" , options)
        .clearCookie( "refreshToken" , options)
        .status(200)
        .json({
            message: "User loggedOut successfully"
        });
});

const refreshAccessToken = 
asyncHandler(
async (req , res) => {
    // Get refresh token from cookies
    const incomingRefreshToken = req.cookies.refreshToken;

    //check exists
    if(!incomingRefreshToken)
    {
        return res.status(401)
                    .json({
                        message: "Unauthorized request"
                    });
    }

    //Verify Token
    const decodedToken = jwt.verify( incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET);

    //find user 
    const user = await User.findById(decodedToken._id);

    //compare refresh token 
    id(incomingRefreshToken !== user.refreshToken)
    {
        return res.status(401)
        .json({
            message:"Refresh token is invalid or expired"
        });
    }

    //Generate new tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    //Send new cookies
    return res
            .cookie(
                "accessToken",
                accessToken,
                options
            )
            .cookie(
                "refreshToken",
                refreshToken,
                options
            )
            .json({
                accessToken,
                refreshToken
            });


});



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
};