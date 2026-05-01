import {
    disconnectSocketConnection,
    initializeSocketConnection,
} from "../service/chat.socket.js";
import {
    sendChatMessage as sendChatMessageRequest,
    getChats as getChatsRequest,
    getMessages as getMessagesRequest,
    deleteChat as deleteChatRequest,
} from "../service/chat.api.js";
import { useDispatch, useSelector } from "react-redux";
import {
    clearError,
    setChats,
    setCurrentChat,
    setError,
    setLoading,
    addMessages,
    addNewMessage,
    createNewChat,
    removeChat,
} from "../chat.slice.js";
import { useCallback } from "react";

function getErrorMessage(error, fallbackMessage) {
    return error.response?.data?.message || fallbackMessage;
}

function formatMessage(message) {
    return {
        id: message?._id || message?.id || `${message?.role || "message"}-${Date.now()}`,
        content: message?.content || "",
        role: message?.role || "ai",
        timestamp: message?.createdAt || message?.updatedAt || message?.timestamp || new Date().toISOString(),
    };
}

function formatChat(chat) {
    const chatId = chat?._id || chat?.id;

    return {
        id: chatId,
        title: chat?.title || "New chat",
        messages: [],
        lastUpdated: chat?.updatedAt || chat?.createdAt || new Date().toISOString(),
    };
}

export const useChat = () => {

    const dispatch = useDispatch();
    const chat = useSelector((state) => state.chat);

    const sendChatMessage = useCallback(async ({ message, chatId }) => {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());

            const data = await sendChatMessageRequest(message, chatId);
            const savedChat = data?.chat || data?.data?.chat;
            const savedUserMessage = data?.userMessage;
            const savedAiMessage = data?.aiMessage;
            const resolvedChatId = savedChat?._id || savedChat?.id || data?.data?.chatId || chatId;

            if (!resolvedChatId) {
                throw new Error("Chat was not created");
            }

            dispatch(createNewChat({
                chatId: resolvedChatId,
                title: savedChat?.title || data?.data?.chatTitle || data?.chatTitle,
                lastUpdated: savedChat?.updatedAt,
            }));

            dispatch(addNewMessage({
                chatId: resolvedChatId,
                id: savedUserMessage?._id || savedUserMessage?.id,
                content: savedUserMessage?.content || data?.data?.userMessage || message,
                role: savedUserMessage?.role || "user",
                timestamp: savedUserMessage?.createdAt || savedUserMessage?.timestamp,
            }));

            dispatch(addNewMessage({
                chatId: resolvedChatId,
                id: savedAiMessage?._id || savedAiMessage?.id,
                content: savedAiMessage?.content || data?.data?.aiMessage || "I could not generate a response right now.",
                role: savedAiMessage?.role || "ai",
                timestamp: savedAiMessage?.createdAt || savedAiMessage?.timestamp,
            }));

            dispatch(setCurrentChat(resolvedChatId));

            return data;
        } catch (error) {
            dispatch(setError(getErrorMessage(error, "Failed to send message")));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const getChats = useCallback(async () => {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());

            const data = await getChatsRequest();
            const savedChats = data?.chats || data?.data || [];
            const chatsById = savedChats.reduce((acc, savedChat) => {
                const formattedChat = formatChat(savedChat);
                acc[ formattedChat.id ] = formattedChat;
                return acc;
            }, {});

            dispatch(setChats(chatsById));
            return data;
        } catch (error) {
            dispatch(setError(getErrorMessage(error, "Failed to fetch chats")));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const getMessages = useCallback(async (chatId) => {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());

            const data = await getMessagesRequest(chatId);
            const savedMessages = data?.messages || data?.data || [];

            dispatch(addMessages({
                chatId,
                messages: savedMessages.map(formatMessage),
            }));
            dispatch(setCurrentChat(chatId));
            return data;
        } catch (error) {
            dispatch(setError(getErrorMessage(error, "Failed to fetch messages")));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const deleteChat = useCallback(async (chatId) => {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());

            const data = await deleteChatRequest(chatId);
            dispatch(removeChat(chatId));

            return data;
        } catch (error) {
            dispatch(setError(getErrorMessage(error, "Failed to delete chat")));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const startNewChat = useCallback(() => {
        dispatch(setCurrentChat(null));
        dispatch(clearError());
    }, [dispatch]);

    return {
        ...chat,
        disconnectSocketConnection,
        initializeSocketConnection,
        sendChatMessage,
        getChats,
        getMessages,
        deleteChat,
        startNewChat,
    };
};
