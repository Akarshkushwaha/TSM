const express = require('express');
const router = express.Router();
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const Task = require('../models/Task');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

// All task routes are private
router.route('/')
  .post(protect, upload.array('documents', 3), createTask)
  .get(protect, getTasks);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, upload.array('documents', 3), updateTask)
  .delete(protect, deleteTask);

// @desc    Download a specific document attached to a task
// @route   GET /api/tasks/:id/documents/:docIndex
// @access  Private
router.get('/:id/documents/:docIndex', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const docIndex = parseInt(req.params.docIndex);
    if (isNaN(docIndex) || docIndex < 0 || docIndex >= task.attachedDocuments.length) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const doc = task.attachedDocuments[docIndex];
    const filePath = path.resolve(doc.path);
    res.download(filePath, doc.filename);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

