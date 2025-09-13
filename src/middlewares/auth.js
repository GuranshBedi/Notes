import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/User.model.js"

export const verifyJWT = asyncHandler(async (req,_,next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " ,"")
    
        if(!token)
        throw new ApiError(401,"Unauthorized request")

        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password")
    
        if(!user)
            throw new ApiError(401,"Inavlid access token")
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token")
    }
})

export const requireAdmin = (req,_, next) => {
  if (req.user.role !== 'admin') {
    throw new ApiError(403,"Admin access required")
  }
  next();
};

export const requireMember = (req,_, next) => {
  if (req.user.role !== 'member' && req.user.role !== 'admin') {
    throw new ApiError(403,"Admin access required")
  }
  next();
};
