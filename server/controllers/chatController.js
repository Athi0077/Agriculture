import Chat from '../models/Chat.js';
import { chatWithAssistant } from '../services/openrouterService.js';

// @desc    Get user's chat history
// @route   GET /api/chats
// @access  Private
export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 });
    res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error('Fetch chats error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching chats' });
  }
};

// @desc    Get a single chat by ID
// @route   GET /api/chats/:id
// @access  Private
export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    if (chat.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to view this chat' });
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    console.error('Fetch chat error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching chat' });
  }
};

// @desc    Send a message to the AI assistant
// @route   POST /api/chats
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { message, chatId, weatherContext } = req.body;
    
    // Parse weather context if provided (it might be sent as string in multipart form)
    let parsedWeather = null;
    if (weatherContext) {
      try {
        parsedWeather = typeof weatherContext === 'string' ? JSON.parse(weatherContext) : weatherContext;
      } catch (e) {
        console.warn('Failed to parse weather context', e);
      }
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.path.replace(/\\/g, '/');
    }

    if (!message && !imageUrl) {
      return res.status(400).json({ success: false, message: 'Please provide a message or an image' });
    }

    let chat;
    if (chatId && chatId !== 'new') {
      chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ success: false, message: 'Chat not found' });
      }
      if (chat.userId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }
    } else {
      // Create new chat
      const title = message ? (message.length > 40 ? message.substring(0, 40) + '...' : message) : 'Crop Image Analysis';
      chat = new Chat({
        userId: req.user._id,
        title,
        messages: []
      });
    }

    // Add user message
    const userMsg = {
      role: 'user',
      content: message || '',
      imageUrl: imageUrl || undefined,
      messageType: imageUrl ? 'image' : 'text'
    };
    chat.messages.push(userMsg);

    // Get chat history for AI context (excluding the message we just added)
    const history = chat.messages.slice(0, -1).map(m => ({
      role: m.role,
      content: m.content
    }));

    // Call AI
    const language = req.user.language || 'English';
    const aiResponse = await chatWithAssistant(message, imageUrl, parsedWeather, language, history);

    // Add AI response
    const aiMsg = {
      role: 'assistant',
      content: aiResponse.isJson ? 'Analysis complete.' : aiResponse.data,
      messageType: aiResponse.isJson ? 'image-analysis' : 'text',
      analysisResult: aiResponse.isJson ? aiResponse.data : undefined
    };
    
    chat.messages.push(aiMsg);
    await chat.save();

    res.status(200).json({ success: true, chat });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error processing your request' });
  }
};
