import auth from "../middleware/auth.js";
import { Router } from "express";
import {
  createNote,
  listNotes,
  getNote,
  updateNote,
  deleteNote,
} from "../controllers/notesController.js";

const router = Router();

router.post("/", auth, createNote);
router.get("/", auth, listNotes);
router.get("/:id", auth, getNote);
router.put("/:id", auth, updateNote);
router.delete("/:id", auth, deleteNote);

export default router;
