import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

const Notes = () => {
  const { user, tenant, logout, upgradeTenant } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notes');
      console.log('Notes response:', response.data); // Debug log
      setNotes(response.data.notes || response.data || []);
    } catch (err) {
      console.error('Fetch notes error:', err);
      setError(err.response?.data?.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (e) => {
    e.preventDefault();
    
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    try {
      await api.post('/notes', noteForm);
      setNoteForm({ title: '', content: '' });
      await fetchNotes();
      setSuccess('Note created successfully!');
      setError('');
    } catch (err) {
      console.error('Create note error:', err);
      setError(err.response?.data?.message || 'Failed to create note');
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (e) => {
    e.preventDefault();
    if (!editingNote) return;

    if (!editingNote.title.trim() || !editingNote.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    try {
      // Use _id for MongoDB or id for other databases
      const noteId = editingNote._id || editingNote.id;
      await api.put(`/notes/${noteId}`, {
        title: editingNote.title,
        content: editingNote.content
      });
      
      setEditingNote(null);
      await fetchNotes();
      setSuccess('Note updated successfully!');
      setError('');
    } catch (err) {
      console.error('Update note error:', err);
      setError(err.response?.data?.message || 'Failed to update note');
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    setLoading(true);
    try {
      await api.delete(`/notes/${noteId}`);
      await fetchNotes();
      setSuccess('Note deleted successfully!');
      setError('');
    } catch (err) {
      console.error('Delete note error:', err);
      setError(err.response?.data?.message || 'Failed to delete note');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    const result = await upgradeTenant();
    if (result.success) {
      setSuccess('Upgraded to Pro plan successfully!');
      setError('');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setError('');
  };

  const startEdit = (note) => {
    setEditingNote({ ...note });
    setError('');
  };

  const hasReachedLimit = tenant && tenant.plan === 'free' && notes.length >= 3;
  const canCreateNote = !hasReachedLimit;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
              <p className="text-sm text-gray-600">
                {tenant?.name} - {user?.role?.toUpperCase()} - {tenant?.plan?.toUpperCase()} Plan
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {user?.role === 'admin' && tenant?.plan === 'free' && (
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50"
                >
                  👑 Upgrade to Pro
                </button>
              )}
              <button
                onClick={logout}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Alerts */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Note Limit Warning */}
        {hasReachedLimit && (
          <div className="mb-4 bg-yellow-50 border border-yellow-300 text-yellow-700 px-4 py-3 rounded">
            <p className="font-medium">Note Limit Reached</p>
            <p>You've reached the maximum of 3 notes on the Free plan. 
            {user?.role === 'admin' ? ' Upgrade to Pro for unlimited notes.' : ' Ask your admin to upgrade to Pro.'}
            </p>
          </div>
        )}

        {/* Create/Edit Note Form */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {editingNote ? 'Edit Note' : 'Create New Note'}
            </h2>
          </div>
          
          <form onSubmit={editingNote ? updateNote : createNote} className="p-6">
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                id="title"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={editingNote ? editingNote.title : noteForm.title}
                onChange={(e) => {
                  if (editingNote) {
                    setEditingNote({ ...editingNote, title: e.target.value });
                  } else {
                    setNoteForm({ ...noteForm, title: e.target.value });
                  }
                }}
                placeholder="Enter note title"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                id="content"
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={editingNote ? editingNote.content : noteForm.content}
                onChange={(e) => {
                  if (editingNote) {
                    setEditingNote({ ...editingNote, content: e.target.value });
                  } else {
                    setNoteForm({ ...noteForm, content: e.target.value });
                  }
                }}
                placeholder="Enter note content"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading || (!editingNote && !canCreateNote)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {editingNote ? 'Update Note' : '+ Create Note'}
              </button>
              
              {editingNote && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Notes List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Your Notes ({notes.length}{tenant?.plan === 'free' ? '/3' : ''})
            </h2>
          </div>
          
          <div className="p-6">
            {loading && notes.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No notes yet. Create your first note above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => {
                  const noteId = note._id || note.id;
                  return (
                    <div key={noteId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{note.title}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(note)}
                            className="text-blue-600 hover:text-blue-800 px-2 py-1 text-sm rounded hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteNote(noteId)}
                            className="text-red-600 hover:text-red-800 px-2 py-1 text-sm rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 whitespace-pre-wrap">{note.content}</p>
                      {note.createdAt && (
                        <p className="text-xs text-gray-400 mt-2">
                          Created: {new Date(note.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notes;