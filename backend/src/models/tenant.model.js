import mongoose , { Schema } from "mongoose";

const TenantSchema = new Schema(
  {
    name: { 
        type: String, 
        required: true 
    },
    plan: { 
        type: String, 
        enum: ["free", "pro"], 
        default: "free" 
    },
    maxNotes: { 
        type: Number, 
        default: 3 
    }
  },
  { 
    timestamps: true 
  }
);

export const Tenant = mongoose.model("Tenant", TenantSchema);
