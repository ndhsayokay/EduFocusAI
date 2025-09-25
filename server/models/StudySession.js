const mongoose = require('mongoose');

const StudySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
    },
    startTime: {
      type: Date, 
      required: true,
    },
    endTime: {
      type: Date,
    },
    focusData: [
      {
        timestamp: Date, 
        score: Number, 
      },
    ], 
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StudySession', StudySessionSchema);