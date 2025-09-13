import { Note } from "../models/note.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createNote = asyncHandler(async (req, res) => {
  const { title, content } = req.body
  const user = req.user
  const tenant = req.tenant

  if (!user) 
    throw new ApiError(404, "User not found")
  if (!tenant) 
    throw new ApiError(400, "Tenant context missing")

  if (tenant.maxNotes && tenant.maxNotes > 0) {
    const count = await Note.countDocuments({ tenant: tenant._id })
    if (count >= tenant.maxNotes) 
        throw new ApiError(403, "Note limit reached. Upgrade to Pro to add more notes.")
  }

  const note = await Note.create({
    title: title,
    content: content,
    tenant: tenant._id,
    author: user._id,
  });

  return res.status(200).json(new ApiResponse(200, note, "Note created successfully"))
});

const listNotes = asyncHandler(async (req, res) => {
  const tenant = req.tenant
  if (!tenant) throw new ApiError(400, "Tenant context missing")

  const notes = await Note.find({ tenant: tenant._id })
  return res.status(200).json(new ApiResponse(200, notes, "Notes fetched successfully"))
});

const getNote = asyncHandler(async (req, res) => {
  const { id } = req.params
  const tenant = req.tenant
  if (!id) throw new ApiError(400, "Note id is required")
  if (!tenant) throw new ApiError(400, "Tenant context missing")

  const note = await Note.findOne(
    { 
        _id: id, 
        tenant: tenant._id 
    })
  if (!note) throw new ApiError(404, "Note not found")

  return res.status(200).json(new ApiResponse(200, note, "Note fetched successfully"))
});

const updateNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body || {};
  const tenant = req.tenant;
  if (!id) 
    throw new ApiError(400, "Note id is required");
  if (!tenant) 
    throw new ApiError(400, "Tenant context missing");

  const note = await Note.findOneAndUpdate(
    { 
        _id: id, 
        tenant: tenant._id 
    },
    { 
        $set: { 
            title: title !== undefined ? title : undefined, 
            content: content !== undefined ? content : undefined 
        } 
        },
    { 
        new: true 
    }
  );

  if (!note) 
    throw new ApiError(404, "Note not found");

  return res.status(200).json(new ApiResponse(200, note, "Note updated successfully"))
})

const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.params
  const tenant = req.tenant
  if (!id) throw new ApiError(400, "Note id is required")
  if (!tenant) throw new ApiError(400, "Tenant context missing")

  const note = await Note.findOneAndDelete({ _id: id, tenant: tenant._id })
  if (!note) throw new ApiError(404, "Note not found")

  return res.status(200).json(new ApiResponse(200, {}, "Note deleted successfully"))
});

export { createNote, listNotes, getNote, updateNote, deleteNote }
