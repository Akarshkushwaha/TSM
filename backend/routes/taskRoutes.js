const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
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

module.exports = router;
