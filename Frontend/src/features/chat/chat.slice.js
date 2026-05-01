import { createSlice } from "@reduxjs/toolkit";


const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: {},
        currentChat: null,
        isLoading: false,
        error: null,
    },
    reducers:{
        createNewChat: (state, action) => {
            const { chatId, title, lastUpdated } = action.payload
            const existingMessages = state.chats[ chatId ]?.messages || []

            state.chats[ chatId ] = {
                id:chatId,
                title: title || state.chats[ chatId ]?.title || "New chat",
                messages: existingMessages,
                lastUpdated: lastUpdated || state.chats[ chatId ]?.lastUpdated || new Date().toISOString(),
            }
        },

        addNewMessage:(state, action) => {
            const { chatId, content, role, id, timestamp } = action.payload
            if (!state.chats[ chatId ]) {
                state.chats[ chatId ] = {
                    id: chatId,
                    title: "New chat",
                    messages: [],
                    lastUpdated: new Date().toISOString(),
                }
            }

            const messageTimestamp = timestamp || new Date().toISOString()

            state.chats[ chatId ].messages.push({
                id: id || `${role}-${messageTimestamp}`,
                content,
                role,
                timestamp: messageTimestamp,
            })
            state.chats[ chatId ].lastUpdated = messageTimestamp
        },

        addMessages: (state, action) => {
            const { chatId, messages } = action.payload
            if (!state.chats[ chatId ]) {
                state.chats[ chatId ] = {
                    id: chatId,
                    title: "New chat",
                    messages: [],
                    lastUpdated: new Date().toISOString(),
                }
            }
            state.chats[ chatId ].messages = messages
            state.chats[ chatId ].lastUpdated = messages.at(-1)?.timestamp || state.chats[ chatId ].lastUpdated
        },

        setChats: (state, action) => {
            const incomingChats = action.payload || {}

            state.chats = Object.entries(incomingChats).reduce((acc, [ chatId, chat ]) => {
                acc[ chatId ] = {
                    ...chat,
                    messages: state.chats[ chatId ]?.messages || chat.messages || [],
                }
                return acc
            }, {})
        },
        setCurrentChat: (state, action) => {
            state.currentChat = action.payload
            
        },
        removeChat: (state, action) => {
            const chatId = action.payload
            delete state.chats[ chatId ]

            if (state.currentChat === chatId) {
                state.currentChat = null
            }
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        clearError: (state) => {
            state.error = null
        },
    }
})

export const {
    createNewChat,
    addNewMessage,
    addMessages,
    setChats,
    setCurrentChat,
    removeChat,
    setLoading,
    setError,
    clearError
} = chatSlice.actions
export default chatSlice.reducer

// chats = {
//     "docker and AWS": [
//         {
//             role: "user",
//             content: "what is Docker"
//         },
//         {
//             role: "ai",
//             content: "Docker is a platform that allows developers to easily create, deploy and run applications in containers."
//         }
//     ]
// }
