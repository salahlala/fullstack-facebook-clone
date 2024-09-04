import Chat from "../models/chatModel.js";

export const createChat = async (req, res) => {
  const { firstId, secondId } = req.body;
  try {
    if (!firstId || !secondId) {
      throw new Error("Please provide senderId and receiverId");
    }
    if (firstId === secondId) {
      throw new Error("Can't send message to yourself");
    }
    const existChat = await Chat.findOne({
      members: { $all: [firstId, secondId] },
    });
    if (existChat) {
      return res.status(200).json({ data: existChat });
    }
    const chat = await Chat.create({ members: [firstId, secondId] });
    return res.status(200).json({ data: chat });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getChats = async (req, res) => {
  const userId = req.user._id;
  try {
    const chat = await Chat.find({
      members: { $in: [userId] },
    })
      .populate("members", "profileImg fullName")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    if (!chat.length) {
      throw new Error("Chat not found");
    }
    res.status(200).json({ data: chat });
  } catch (error) {
    console.log(error.message, "getChats");
    res.status(500).json({ message: error.message });
  }
};

// get chat of two users
export const getChatOfTwoUsers = async (req, res) => {
  const { firstId, secondId } = req.body;
  try {
    if (!firstId || !secondId) {
      throw new Error("Please provide firstId and secondId");
    }
    const chat = await Chat.findOne({
      members: { $all: [firstId, secondId] },
    }).populate("lastMessage");
    if (!chat) {
      throw new Error("Chat not found");
    }
    res.status(200).json({ data: chat });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getChatById = async (req, res) => {
  const { chatId } = req.params;
  try {
    const chat = await Chat.findById(chatId)
      .populate("members", "profileImg fullName")
      .populate("lastMessage");
    if (!chat) {
      throw new Error("No chat found with that ID");
    }
    res.status(200).json({ data: chat });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
