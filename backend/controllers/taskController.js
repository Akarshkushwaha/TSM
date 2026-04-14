const Task = require('../models/Task');

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;
    
    console.log(`[DEBUG] Creating task. Files received: ${req.files ? req.files.length : 0}`);
    
    // Process attached documents from multer
    const attachedDocuments = req.files ? req.files.map(file => ({
      filename: file.filename,
      mimetype: file.mimetype,
    })) : [];

    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo: assignedTo || null,
      creator: req.user._id,
      attachedDocuments,
    });

    const createdTask = await task.save();
    
    // Emit event
    if (req.io) {
      req.io.emit('task:created', createdTask);
    }
    
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks for user (or all if admin)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    // Filters & Sorting
    const query = {};
    if (req.user.role !== 'admin') {
      // Normal users see tasks created by them OR assigned to them
      query.$or = [{ creator: req.user._id }, { assignedTo: req.user._id }];
    }

    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;

    let sortOption = {};
    if (req.query.sortBy) {
        if (req.query.sortBy === 'dueDate') sortOption.dueDate = 1;
        if (req.query.sortBy === 'priority') sortOption.priority = 1; // You might want custom sorting for priority strings
    } else {
        sortOption.createdAt = -1; // Default
    }

    const count = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .populate('assignedTo', 'email')
      .populate('creator', 'email')
      .sort(sortOption)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ tasks, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'email')
      .populate('creator', 'email');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Permissions check
    if (req.user.role !== 'admin' && 
        task.creator._id.toString() !== req.user._id.toString() &&
        (!task.assignedTo || task.assignedTo._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Permissions check
    if (req.user.role !== 'admin' && 
        task.creator.toString() !== req.user._id.toString() &&
        (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.status = req.body.status || task.status;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.assignedTo = req.body.assignedTo || task.assignedTo;

    console.log(`[DEBUG] Updating task ${req.params.id}. Files received: ${req.files ? req.files.length : 0}`);

    if (req.files && req.files.length > 0) {
      const newDocs = req.files.map(file => ({
        filename: file.filename,
        mimetype: file.mimetype,
      }));
      task.attachedDocuments = [...task.attachedDocuments, ...newDocs];
      // Note: A robust system would delete old files or prevent exceeding 3 docs total
      if (task.attachedDocuments.length > 3) {
         return res.status(400).json({ message: 'Cannot attach more than 3 documents.' });
      }
    }

    const updatedTask = await task.save();

    // Emit event
    if (req.io) {
      req.io.emit('task:updated', updatedTask);
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role !== 'admin' && task.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    const deletedTaskId = task._id;
    await task.deleteOne();

    // Emit event
    if (req.io) {
      req.io.emit('task:deleted', deletedTaskId);
    }

    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
