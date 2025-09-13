import mongoose from "mongoose";
import bcyrpt from "bcrypt"
import { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
  },
  { 
    timestamps: true
  }
);

userSchema.pre("save" , () => {
  if(!this.isModified("password"))
    return next()
  this.password = bcyrpt.hash(this.password,10)
  next()
})

userSchema.methods.isPasswordCorrect = async function(password) {
   return await bcyrpt.compare(password, this.password)

}

export const User = mongoose.model("User", userSchema);
