import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { User } from "../models/User.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import bcrypt from "bcrypt"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = process.env.JWT_EXPIRY

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    throw new ApiError(400, "email and password required")

  const user = await User.findOne({ email: email.toLowerCase() })
    .select("+passwordHash")
    .populate("tenant")

  if (!user)
    throw new ApiError(401, "Invalid credentials")

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok)
    throw new ApiError(401, "Invalid credentials")

  const tenantId = user.tenant && user.tenant._id ? user.tenant._id.toString() : (user.tenant ? user.tenant.toString() : null)

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      tenantId,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRY,
    }
  )

  const payload = {
    token,
    user: {
      email: user.email,
      role: user.role,
      tenant: {
        id: tenantId,
        name: user.tenant && user.tenant.name ? user.tenant.name : null,
        plan: user.tenant && user.tenant.plan ? user.tenant.plan : null,
        maxNotes: user.tenant && user.tenant.maxNotes ? user.tenant.maxNotes : null,
      },
    },
  }

  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Login successful"))
})

export { login }
