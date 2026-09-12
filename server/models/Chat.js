import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      default: 'New Chat',
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant'],
          required: true,
        },
        content: {
          type: String,
        },
        imageUrl: {
          type: String,
        },
        messageType: {
          type: String,
          enum: ['text', 'image', 'image-analysis'],
          default: 'text',
        },
        analysisResult: {
          type: mongoose.Schema.Types.Mixed, // Stores the structured JSON from Gemini
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
