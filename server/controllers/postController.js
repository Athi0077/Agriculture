import Post from '../models/Post.js';

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { content, scanId } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, message: 'Post content is required' });
    }

    const post = await Post.create({
      author: req.user._id,
      content,
      scanId: scanId || null
    });

    res.status(201).json({ success: true, post });
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating post' });
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name role')
      .populate({
        path: 'scanId',
        select: 'imageUrl cropType diagnosis diseaseType riskLevel'
      })
      .populate({
        path: 'comments.user',
        select: 'name role'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error('Get Posts Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching posts' });
  }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.comments.push({
      user: req.user._id,
      content
    });

    await post.save();
    
    // Return populated post
    const populatedPost = await Post.findById(postId)
      .populate('author', 'name role')
      .populate({
        path: 'scanId',
        select: 'imageUrl cropType diagnosis diseaseType riskLevel'
      })
      .populate({
        path: 'comments.user',
        select: 'name role'
      });

    res.status(201).json({ success: true, post: populatedPost });
  } catch (error) {
    console.error('Add Comment Error:', error);
    res.status(500).json({ success: false, message: 'Server error adding comment' });
  }
};
