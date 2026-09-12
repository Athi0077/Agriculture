import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true
    },
    type: {
      type: String,
      required: true, // e.g., 'AI_REPORT'
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIReport',
      required: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
