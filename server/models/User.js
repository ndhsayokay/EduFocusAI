const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true, 
      unique: true, 
    },
    password: {
      type: String, 
      required: true, 
    },
    gamification: {
      level: { type: Number, default: 1 },
      xp: { type: Number, default: 0 },
      xpToNextLevel: { type: Number, default: 100 },
      badges: [{ type: String }],
  
      virtualPet: {
        name: { type: String, default: 'Bé Tập Trung' },
        status: { 
          type: String, 
          enum: ['happy', 'neutral', 'sad'], 
          default: 'neutral' 
        },
        health: { 
          type: Number, 
          default: 100 
        }
      }
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    friendRequestsSent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    friendRequestsReceived: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', UserSchema);