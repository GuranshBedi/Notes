import mongoose from "mongoose";
import bcrypt from "bcrypt"
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

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();

  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function(password) {
   return await bcrypt.compare(password, this.password)

}

export const User = mongoose.model("User", userSchema);
