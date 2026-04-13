const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  filename: String,
  path: String,
  mimetype: String,
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Todo', 'In Progress', 'Done'],
    default: 'Todo',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  dueDate: {
    type: Date,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  attachedDocuments: [documentSchema],
}, {
  timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
