import { ApiError } from "../utils/ApiError.js";

const requireRole = (role) => {
  return (req,_, next) => {
    if (!req.user)
      return next(new ApiError(401, "No user found in request"))

    if (req.user.role !== role)
      return next(new ApiError(403, `Requires ${role} role`))

    next()
  }
}

export { requireRole };
