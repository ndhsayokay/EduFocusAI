const mongoose = require('mongoose');

// Schema cho công việc con (Subtask)
const SubtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
});


// Schema cho công việc chính (Task)
const TaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    dueDate: {
      type: Date, 
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    subtasks: [SubtaskSchema], 
    status: {
      type: String,
      enum: ['todo', 'completed'],
      default: 'todo',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', TaskSchema);