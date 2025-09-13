import bcrypt from "bcrypt";
import { Tenant } from "../models/tenant.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const upgradeTenant = asyncHandler(async (req, res) => {
  const { tenantId } = req.params;

  if (!req.user) 
    throw new ApiError(404, "User not found")
  if (!tenantId) 
    throw new ApiError(400, "tenantId is required")

  if (String(req.user.tenant._id) !== String(tenantId))
    throw new ApiError(403, "Cannot upgrade other tenant")

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) throw new ApiError(404, "Tenant not found")

  tenant.plan = "pro"
  tenant.maxNotes = 0
  await tenant.save()

  return res.status(200).json(
    new ApiResponse(200, tenant, "Tenant upgraded to Pro")
  )
})

const inviteUser = asyncHandler(async (req, res) => {
  const { tenantId } = req.params;
  const { email, role } = req.body;

  if (!req.user) 
    throw new ApiError(404, "User not found")
  if (!tenantId) 
    throw new ApiError(400, "tenantId is required")
  if (String(req.user.tenant._id) !== String(tenantId))
    throw new ApiError(403, "Cannot invite another tenant")

  if (!email) 
    throw new ApiError(400, "email required")

  const normalizedRole = (role || "member").toLowerCase()
  if (!["admin", "member"].includes(normalizedRole))
    throw new ApiError(400, "invalid role")

  const tenant = await Tenant.findById(tenantId)
  if (!tenant) 
    throw new ApiError(404, "Tenant not found")

  const existing = await User.findOne(
    { 
        email: email.toLowerCase() 
    })
  if (existing) 
    throw new ApiError(409, "User with that email already exists")

  const password = "password";
  const passwordHash = await bcrypt.hash(password, 10)

  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    role: normalizedRole,
    tenant: tenant._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { email: user.email, initialPassword: password }, "User invited"))
});

export { upgradeTenant, inviteUser }
