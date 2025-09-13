import { verifyJWT } from "../middlewares/auth.js";
import { Router } from "express";
import {
  createNote,
  listNotes,
  getNote,
  updateNote,
  deleteNote,
} from "../controllers/note.controller.js";

const router = Router();

router.post("/", verifyJWT, createNote);
router.get("/", verifyJWT, listNotes);
router.get("/:id", verifyJWT, getNote);
router.put("/:id", verifyJWT, updateNote);
router.delete("/:id", verifyJWT, deleteNote);

export default router;
