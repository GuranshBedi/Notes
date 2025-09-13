import mongoose,{ Schema } from "mongoose";

const NoteSchema = new Schema(
  {
    title: { 
      type: String, 
      default: "" 
    },
    content: { 
      type: String, 
      default: "" 
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { 
    timestamps: true
  }
);

export const Note = mongoose.model("Note", NoteSchema);
