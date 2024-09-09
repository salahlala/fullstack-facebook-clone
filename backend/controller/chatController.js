import Chat from "../models/chatModel.js";

export const createChat = async (req, res) => {
  const { userId } = req.body;
  const currentUser = req.user._id.toString();

  console.log({ userId, currentUser }, "create chat");
  try {
    if (!userId) {
      throw new Error("Please provide userId");
    }
    if (currentUser === userId) {
      throw new Error("Can't send message to yourself");
    }
    const existingChat = await Chat.findOne({
      members: { $all: [currentUser, userId] },
    })
      .populate("members", "profileImg fullName")
      .populate("lastMessage")
      .lean();
    if (existingChat) {
      return res.status(200).json({ data: existingChat });
    }

    const chat = await Chat.create({ members: [currentUser, userId] });

    await chat.populate("members", "profileImg fullName");

    return res.status(201).json({ data: chat });
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

    // if (!chat.length) {
    //   res.status(200).json({ data: [] });
    // }
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

export const deleteChat = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;
  try {
    // check if use is the owner of the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error("No chat found with that ID");
    }
    if (!chat.members.includes(userId)) {
      throw new Error("You are not authorized to delete this chat");
    }
    await Chat.findByIdAndDelete(chatId);

    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
