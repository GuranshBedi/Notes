import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcrypt";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES = process.env.JWT_EXPIRES

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    throw new ApiError(400, "email and password required")

  const user = await User.findOne(
    { 
        email: email.toLowerCase() 
    }).populate("tenant")

  if (!user) 
    throw new ApiError(401, "Invalid credentials")

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) 
    throw new ApiError(401, "Invalid credentials")

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      tenantId: user.tenant._id.toString(),
      role: user.role,
    },
    JWT_SECRET,
    { 
        expiresIn: JWT_EXPIRES 
    }
  )

  const payload = {
    token,
    user: {
      email: user.email,
      role: user.role,
      tenant: {
        id: user.tenant._id,
        name: user.tenant.name,
        plan: user.tenant.plan,
        maxNotes: user.tenant.maxNotes,
      },
    },
  }

  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Login successful"))
})

export { login }
