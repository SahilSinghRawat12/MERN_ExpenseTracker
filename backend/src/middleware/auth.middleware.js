import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"


const verifyJWT = async ( req , res , next ) => {

    try {
        // Get token-> token can come from authorization header
        const token = 
             req.header("Authorization")
             ?.replace("Bearer " , "")
    
        // check if token exists 
        if(!token)
        {
            return res
                    .status(401)
                    .json({
                        message: "Unaauthorized requeest"
                    });
        }
    
        //Verify token-> decode JWT
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);
    
        // find user-> Even if token may have been valid but the user may have been deleted so we check the user
        const user = await User.findById(
            decodedToken?._id
        ).select("-password -refreshToken");
    
        // check user exists
        if(!user)
        {
            return res.status(401)
            .json({
                message: "Invalid Access Token"
            });
        }
    
        //Attach User to Request-> now every protected controller gets access to user
        req.user = user;
    
        next();
    }
    catch (error) {
        return res.status(401)
                .json({
                    message:"Invalid Access Token"
                });
    }


};


export { verifyJWT };