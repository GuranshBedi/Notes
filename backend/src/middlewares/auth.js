import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/User.model.js"

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret"

export const verifyJWT = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "")

  if (!token) {
    throw new ApiError(401, "Unauthorized request")
  }

  let decodedToken
  try {
    decodedToken = jwt.verify(token, JWT_SECRET)
  } catch (err) {
    throw new ApiError(401, "Invalid or expired access token")
  }

  const userId = decodedToken?.userId || decodedToken?._id
  if (!userId) {
    throw new ApiError(401, "Malformed token: missing user id")
  }

  const user = await User.findById(userId).populate("tenant").select("-passwordHash")
  if (!user) {
    throw new ApiError(401, "User not found for this token")
  }

  req.user = user
  next()
})

export const requireAdmin = (req, _, next) => {
  if (!req.user) throw new ApiError(401, "Unauthorized")
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Admin access required")
  }
  next()
}

export const requireMember = (req, _, next) => {
  if (!req.user) throw new ApiError(401, "Unauthorized")
  if (req.user.role !== "member" && req.user.role !== "admin") {
    throw new ApiError(403, "Member access required")
  }
  next()
}

