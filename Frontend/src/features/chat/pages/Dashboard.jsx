import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useNavigate } from 'react-router'
import { useAuth } from '../../auth/hook/useAuth.js'
import { useChat } from '../../chat/hooks/useChat.js'

const initialMessages = [
    {
        id: 'assistant-welcome',
        role: 'ai',
        content: 'Hello. Ask me anything and I will reply here.',
        timestamp: new Date().toISOString(),
    },
]

function formatTimestamp(value) {
    if (!value) return ''
    const date = new Date(value)
    const now = new Date()

    const isToday = date.toDateString() === now.toDateString()

    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    const isYesterday = date.toDateString() === yesterday.toDateString()

    const timeStr = new Intl.DateTimeFormat('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(date)

    if (isToday) {
        return `Today, ${timeStr}`
    } else if (isYesterday) {
        return `Yesterday, ${timeStr}`
    } else {
        const dateStr = new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'short',
        }).format(date)
        return `${dateStr}, ${timeStr}`
    }
}

function getMarkdownProps(props) {
    const markdownProps = { ...props }
    delete markdownProps.node
    return markdownProps
}

const markdownComponents = {
    h1: (props) => <h1 className="mb-3 text-2xl font-semibold text-white" {...getMarkdownProps(props)} />,
    h2: (props) => <h2 className="mb-3 text-xl font-semibold text-white" {...getMarkdownProps(props)} />,
    h3: (props) => <h3 className="mb-2 text-lg font-semibold text-white" {...getMarkdownProps(props)} />,
    p: (props) => <p className="mb-3 last:mb-0" {...getMarkdownProps(props)} />,
    ul: (props) => <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0" {...getMarkdownProps(props)} />,
    ol: (props) => <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0" {...getMarkdownProps(props)} />,
    li: (props) => <li className="pl-1" {...getMarkdownProps(props)} />,
    strong: (props) => <strong className="font-semibold text-white" {...getMarkdownProps(props)} />,
    em: (props) => <em className="text-slate-200" {...getMarkdownProps(props)} />,
    a: (props) => (
        <a
            className="font-medium text-[#e38b66] underline decoration-[#e38b66]/50 underline-offset-4"
            target="_blank"
            rel="noreferrer"
            {...getMarkdownProps(props)}
        />
    ),
    blockquote: (props) => (
        <blockquote className="mb-3 border-l-2 border-[#e38b66]/60 pl-4 text-slate-300 last:mb-0" {...getMarkdownProps(props)} />
    ),
    code: (props) => {
        const { inline, ...codeProps } = getMarkdownProps(props)

        return inline
            ? <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-[#f3b08f]" {...codeProps} />
            : <code className="block overflow-x-auto whitespace-pre rounded-xl bg-black/30 p-3 text-sm text-slate-100" {...codeProps} />
    },
    pre: (props) => <pre className="mb-3 overflow-x-auto last:mb-0" {...getMarkdownProps(props)} />,
}

function MarkdownMessage({ content }) {
    return (
        <ReactMarkdown components={markdownComponents}>
            {content}
        </ReactMarkdown>
    )
}

function Dashboard() {
    const navigate = useNavigate()
    const { user, loading, error: authError, loadCurrentUser, handleLogout } = useAuth()
    const hasCheckedSession = useRef(false)
    const messagesEndRef = useRef(null)
    const fileInputRef = useRef(null)
    
    const [prompt, setPrompt] = useState('')
    const [chatError, setChatError] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [attachment, setAttachment] = useState(null)

    const {
        initializeSocketConnection,
        disconnectSocketConnection,
        sendChatMessage,
        getChats,
        getMessages,
        deleteChat,
        startNewChat,
        chats,
        currentChat,
        isLoading: chatIsLoading,
        error: chatStateError,
    } = useChat()

    const chatList = useMemo(() => (
        Object.values(chats).sort((firstChat, secondChat) => (
            new Date(secondChat.lastUpdated || 0) - new Date(firstChat.lastUpdated || 0)
        ))
    ), [chats])
    const activeMessages = useMemo(() => (
        currentChat ? chats[currentChat]?.messages || [] : initialMessages
    ), [chats, currentChat])
    const visibleChatError = chatError || chatStateError

    useEffect(() => { 
        initializeSocketConnection()

        return () => {
            disconnectSocketConnection()
        }
    }, [disconnectSocketConnection, initializeSocketConnection])

    useEffect(() => {
        if (!user) {
            return
        }

        getChats().catch(() => {})
    }, [getChats, user])

    useEffect(() => {
        if (user || hasCheckedSession.current) {
            return
        }

        hasCheckedSession.current = true

        loadCurrentUser().catch(() => {
            navigate('/login', { replace: true })
        })
    }, [loadCurrentUser, navigate, user])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, [activeMessages, isSending])

    const handleOpenChat = async (chatId) => {
        setChatError('')
        await getMessages(chatId)
    }

    const handleDeleteChat = async (chatId) => {
        if (!window.confirm('Delete this chat?')) {
            return
        }

        setChatError('')
        await deleteChat(chatId)
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        if (file.type.startsWith('image/')) {
            reader.readAsDataURL(file)
            reader.onload = () => {
                setAttachment({
                    name: file.name,
                    mimeType: file.type,
                    data: reader.result,
                })
            }
        } else {
            reader.readAsText(file)
            reader.onload = () => {
                setAttachment({
                    name: file.name,
                    mimeType: file.type,
                    data: reader.result,
                })
            }
        }
        e.target.value = ''
    }

    const handleLogoutClick = async () => {
        try {
            await handleLogout()
            navigate('/login', { replace: true })
        } catch (err) {
            console.error("Logout failed:", err)
        }
    }

    const submitPrompt = async (messageText) => {
        const trimmedMessage = messageText.trim()

        if (!trimmedMessage && !attachment || isSending) {
            return
        }

        setPrompt('')
        const currentAttachment = attachment
        setAttachment(null)
        setChatError('')
        setIsSending(true)

        try {
            await sendChatMessage({ message: trimmedMessage, chatId: currentChat, attachment: currentAttachment })
        } catch (requestError) {
            const errorMessage =
                requestError.response?.data?.message || 'Failed to send your message. Please try again.'

            setChatError(errorMessage)
            setAttachment(currentAttachment)
        } finally {
            setIsSending(false)
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmedMessage = prompt.trim();

        if (!trimmedMessage && !attachment || isSending) return;

        await submitPrompt(trimmedMessage);
    };

    if (loading && !user) {
        return (
            <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-6 text-white">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(173,75,38,0.28),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(173,75,38,0.2),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.02),_transparent)]" />
                <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-[#AD4B26]/20 blur-3xl" />
                <div className="absolute bottom-10 right-12 h-52 w-52 rounded-full bg-orange-500/10 blur-3xl" />
                <div className="rounded-[2rem] border border-white/10 bg-white/5 px-8 py-5 text-lg text-slate-200 shadow-2xl shadow-black/40 backdrop-blur-xl">
                    Loading chat...
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="relative isolate h-screen overflow-hidden bg-[#09090b] px-3 py-4 text-white sm:px-5">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(173,75,38,0.28),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(173,75,38,0.2),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.02),_transparent)]" />
            <div className="absolute left-10 top-10 -z-10 h-40 w-40 rounded-full bg-[#AD4B26]/20 blur-3xl" />
            <div className="absolute bottom-10 right-12 -z-10 h-52 w-52 rounded-full bg-orange-500/10 blur-3xl" />

            <div className="mx-auto flex h-[calc(100vh-2rem)] min-h-0 w-full max-w-7xl gap-4 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-5">
                <aside className="relative hidden min-h-0 w-64 shrink-0 overflow-hidden rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-[#AD4B26] via-[#7f341c] to-[#0f0f10] p-4 md:flex md:flex-col">
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%,transparent_65%,rgba(255,255,255,0.06))]" />

                    <div className="relative shrink-0 rounded-[1.3rem] border border-white/15 bg-white/10 px-4 py-4 backdrop-blur">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">Anubis AI</p>
                        <p className="mt-2 text-2xl font-semibold text-white">Chats</p>
                        <p className="mt-2 text-sm leading-6 text-white/75">
                            Your secure workspace now uses the same login color story.
                        </p>
                    </div>

                    <div className="dashboard-scrollbar relative mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                        {chatList.map((chat) => {
                            const isActive = currentChat === chat.id

                            return (
                                <div
                                    key={chat.id}
                                    className={`flex items-center gap-2 rounded-[1rem] border px-2 py-2 backdrop-blur transition ${isActive
                                            ? 'border-white/30 bg-white/20'
                                            : 'border-white/15 bg-white/10 hover:border-white/25 hover:bg-white/15'
                                        }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleOpenChat(chat.id).catch((error) => {
                                            setChatError(error.response?.data?.message || 'Failed to open chat')
                                        })}
                                        className="min-w-0 flex-1 px-2 py-1 text-left"
                                    >
                                        <span className="block truncate text-sm font-medium text-white/90">{chat.title}</span>
                                        <span className="block text-xs text-white/40 mt-0.5">{formatTimestamp(chat.lastUpdated)}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteChat(chat.id).catch((error) => {
                                            setChatError(error.response?.data?.message || 'Failed to delete chat')
                                        })}
                                        className="rounded-lg border border-white/15 px-2 py-1 text-xs font-semibold text-white/80 transition hover:border-rose-300/60 hover:bg-rose-500/20 hover:text-rose-100"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            startNewChat()
                            setPrompt('')
                            setAttachment(null)
                            setChatError('')
                        }}
                        className="relative mt-4 shrink-0 rounded-[1rem] border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/30 backdrop-blur transition duration-200 hover:bg-white/15 active:scale-[0.99]"
                    >
                        New chat
                    </button>
                </aside>

                <main className="flex min-h-0 flex-1 flex-col rounded-[1.6rem] border border-white/10 bg-slate-950/95 p-3 sm:p-4">
                    <div className="flex shrink-0 items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#e38b66]">Chat Section</p>
                            <p className="mt-1 text-sm text-slate-400">Your conversation stays here in one continuous thread.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                                {user.username || user.email}
                            </p>
                            <button
                                type="button"
                                onClick={handleLogoutClick}
                                className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20 active:scale-[0.98] cursor-pointer"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    <div className="dashboard-scrollbar mt-4 min-h-0 flex-1 overflow-y-auto px-1 pb-4 pt-1 sm:px-2">
                        <div className="space-y-4">
                            {activeMessages.map((message, index) => (
                                <div
                                    key={message.id || `${message.role}-${index}`}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[82%] rounded-[1.2rem] border px-4 py-3 text-base leading-7 shadow-lg ${message.role === 'user'
                                                ? 'ml-auto border-[#AD4B26]/40 bg-gradient-to-r from-[#AD4B26]/25 via-[#7f341c]/20 to-orange-500/10 text-white shadow-[#AD4B26]/10'
                                                : 'border-white/10 bg-white/5 text-slate-100 shadow-black/20'
                                            }`}
                                    >
                                        {message.role === 'user' ? (
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                        ) : (
                                            <MarkdownMessage content={message.content} />
                                        )}

                                        {message.attachment && (
                                            <div className="mt-3 p-2 bg-black/30 border border-white/10 rounded-xl max-w-sm flex items-center gap-3">
                                                {message.attachment.mimeType?.startsWith('image/') ? (
                                                    <a href={message.attachment.data} target="_blank" rel="noreferrer" className="shrink-0">
                                                        <img src={message.attachment.data} alt="attachment" className="h-16 w-16 object-cover rounded-lg border border-white/15 hover:opacity-90 transition cursor-pointer" />
                                                    </a>
                                                ) : (
                                                    <div className="h-12 w-12 shrink-0 flex items-center justify-center bg-white/10 rounded-lg text-xl border border-white/15">
                                                        📄
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-white truncate">{message.attachment.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{(message.attachment.mimeType?.split('/')[1] || 'file').toUpperCase()}</p>
                                                    {!message.attachment.mimeType?.startsWith('image/') && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                alert(`Content of ${message.attachment.name}:\n\n${message.attachment.data.slice(0, 1000)}${message.attachment.data.length > 1000 ? '...' : ''}`)
                                                            }}
                                                            className="text-[10px] text-[#e38b66] hover:underline mt-1 block font-medium text-left cursor-pointer"
                                                        >
                                                            View Content
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                            {message.role === 'user' ? 'You' : 'Anubis AI'} | {formatTimestamp(message.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {isSending && (
                                <div className="flex justify-start">
                                    <div className="max-w-[82%] rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-base text-slate-200 shadow-lg shadow-black/20">
                                        Thinking...
                                    </div>
                                </div>
                            )}

                            {visibleChatError && (
                                <div className="rounded-[1rem] border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                                    {visibleChatError}
                                </div>
                            )}

                            {authError && (
                                <div className="rounded-[1rem] border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                                    {authError}
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-4 shrink-0 rounded-[1.2rem] border border-white/10 bg-white/5 p-2 shadow-xl shadow-black/20">
                        {attachment && (
                            <div className="flex items-center gap-3 p-2 bg-slate-900/80 border border-white/10 rounded-[1rem] mb-2 animate-fade-in">
                                {attachment.mimeType?.startsWith('image/') ? (
                                    <img src={attachment.data} alt="preview" className="h-12 w-12 object-cover rounded-lg border border-white/20" />
                                ) : (
                                    <div className="h-12 w-12 flex items-center justify-center bg-white/10 rounded-lg text-lg border border-white/20">
                                        📄
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{attachment.name}</p>
                                    <p className="text-xs text-slate-400">{(attachment.mimeType?.split('/')[1] || 'file').toUpperCase()}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAttachment(null)}
                                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-rose-500/20 hover:text-rose-300 transition text-sm cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*,.txt,.js,.py,.json,.html,.css,.md,.csv,.yaml,.yml"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border border-white/10 bg-slate-950/90 text-slate-400 hover:text-white hover:border-[#AD4B26]/50 transition cursor-pointer"
                                title="Attach image or file"
                            >
                                📎
                            </button>
                            <input
                                type="text"
                                value={prompt}
                                onChange={(event) => setPrompt(event.target.value)}
                                placeholder={attachment ? "Ask about this file/image..." : "Type your message....."}
                                className="min-w-0 flex-1 rounded-[1rem] border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#AD4B26] focus:ring-2 focus:ring-[#AD4B26]/30"
                            />
                            <button
                                type="submit"
                                disabled={isSending || chatIsLoading || (!prompt.trim() && !attachment)}
                                className="rounded-[1rem] bg-gradient-to-r from-[#AD4B26] to-[#d97706] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#AD4B26]/25 transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                            >
                                Send
                            </button>
                        </div>
                    </form>

                </main>
            </div>
        </div>
    )
}

export default Dashboard
