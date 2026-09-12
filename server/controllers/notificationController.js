import Notification from '../models/Notification.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50); // Get last 50 notifications

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Mark notification as read
// @route   POST /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Mark all notifications as read
// @route   POST /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
