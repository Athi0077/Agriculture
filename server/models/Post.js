import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  scanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scan',
  },
  content: {
    type: String,
    required: true,
  },
  comments: [commentSchema]
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

export default Post;
