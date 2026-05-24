import { generateResponse } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";

function generateChatTitle(message) {
    const cleanMessage = message.trim().replace(/\s+/g, " ");

    if (cleanMessage.length <= 60) {
        return cleanMessage;
    }

    return `${cleanMessage.slice(0, 57)}...`;
}

export async function sendMessage(req, res) {
    const message = req.body?.message?.trim();
    const chatId = req.body?.chatId || req.body?.chat;
    const attachment = req.body?.attachment; // { name, mimeType, data }

    if (!message && !attachment) {
        return res.status(400).json({
            message: "Message or attachment is required",
            success: false,
        });
    }

    try {
        let chat;

        if (chatId) {
            chat = await chatModel.findOne({
                _id: chatId,
                user: req.user.id,
            });

            if (!chat) {
                return res.status(404).json({
                    message: "Chat not found",
                    success: false,
                });
            }
        } else {
            chat = await chatModel.create({
                user: req.user.id,
                title: generateChatTitle(message || attachment?.name || "Attached File"),
            });
        }

        const userMessage = await messageModel.create({
            chat: chat._id,
            content: message || `Attached: ${attachment.name}`,
            role: "user",
            attachment: attachment ? {
                name: attachment.name,
                mimeType: attachment.mimeType,
                data: attachment.data,
            } : undefined,
        });

        const previousMessages = await messageModel
            .find({ chat: chat._id })
            .sort({ createdAt: 1 })
            .lean();

        const aiReply = await generateResponse(previousMessages);

        const aiMessage = await messageModel.create({
            chat: chat._id,
            content: aiReply,
            role: "ai",
        });

        chat.updatedAt = new Date();
        await chat.save();

        return res.status(200).json({
            message: "AI response generated successfully",
            success: true,
            chat,
            userMessage,
            aiMessage,
        });
    } catch (error) {
        console.error("Failed to generate AI response:", error.message);

        return res.status(500).json({
            message: "Failed to generate AI response",
            success: false,
        });
    }
}

export async function getChats(req, res) {
    try {
        const chats = await chatModel
            .find({ user: req.user.id })
            .sort({ updatedAt: -1 })
            .lean();

        return res.status(200).json({
            message: "Chats retrieved successfully",
            success: true,
            chats,
        });
    } catch (error) {
        console.error("Failed to fetch chats:", error.message);

        return res.status(500).json({
            message: "Failed to fetch chats",
            success: false,
        });
    }
}

export async function getMessages(req, res) {
    try {
        const { chatId } = req.params;

        const chat = await chatModel.findOne({
            _id: chatId,
            user: req.user.id,
        });

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found",
                success: false,
            });
        }

        const messages = await messageModel
            .find({ chat: chatId })
            .sort({ createdAt: 1 })
            .lean();

        return res.status(200).json({
            message: "Messages retrieved successfully",
            success: true,
            messages,
        });
    } catch (error) {
        console.error("Failed to fetch messages:", error.message);

        return res.status(500).json({
            message: "Failed to fetch messages",
            success: false,
        });
    }
}

export async function deleteChat(req, res) {
    try {
        const { chatId } = req.params;

        const chat = await chatModel.findOneAndDelete({
            _id: chatId,
            user: req.user.id,
        });

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found",
                success: false,
            });
        }

        await messageModel.deleteMany({ chat: chatId });

        return res.status(200).json({
            message: "Chat deleted successfully",
            success: true,
        });
    } catch (error) {
        console.error("Failed to delete chat:", error.message);

        return res.status(500).json({
            message: "Failed to delete chat",
            success: false,
        });
    }
}
