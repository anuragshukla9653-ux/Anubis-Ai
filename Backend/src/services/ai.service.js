import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import { searchInternet } from "./internet.service.js";

const ChatMessageSchema = z.object({
    role: z.enum([ "user", "ai" ]),
    content: z.string().trim().min(1),
});

const ChatMessagesSchema = z.array(ChatMessageSchema).min(1);

const CURRENT_DATA_PATTERN = /\b(latest|recent|today|yesterday|tomorrow|tonight|this week|this month|current|currently|now|news|update|updates|breaking|live|search|internet|web|online|weather|forecast|price|stock|market|exchange rate|score|scorecard|result|won|winner|schedule|fixture|ipl|cricket|match|election|president|prime minister|ceo|202[5-9])\b/i;
const SPORTS_PATTERN = /\b(ipl|cricket|match|score|scorecard|result|won|winner|schedule|fixture)\b/i;

let mistralModel;

function getMistralModel() {
    if (!process.env.MISTRAL_API_KEY) {
        throw new Error("Missing MISTRAL_API_KEY");
    }

    if (!mistralModel) {
        mistralModel = new ChatMistralAI({
            model: process.env.MISTRAL_MODEL || "mistral-medium-latest",
            apiKey: process.env.MISTRAL_API_KEY,
            temperature: 0.1,
            maxRetries: 2,
        });
    }

    return mistralModel;
}

function extractTextFromResponse(response) {
    if (typeof response?.content === "string") {
        return response.content.trim();
    }

    if (Array.isArray(response?.content)) {
        return response.content
            .map((part) => {
                if (typeof part === "string") {
                    return part;
                }

                return part?.text || "";
            })
            .join("\n")
            .trim();
    }

    if (typeof response?.text === "function") {
        return response.text().trim();
    }

    if (typeof response?.text === "string") {
        return response.text.trim();
    }

    return "";
}

function getLastUserMessage(messages) {
    return [ ...messages ].reverse().find((message) => message.role === "user");
}

function formatDate(date) {
    return new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Kolkata",
    }).format(date);
}

function formatLongDate(date) {
    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "full",
        timeZone: "Asia/Kolkata",
    }).format(date);
}

function addDays(date, days) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
}

function buildSearchQuery(question) {
    const now = new Date();
    const today = formatDate(now);
    const yesterday = formatDate(addDays(now, -1));
    const tomorrow = formatDate(addDays(now, 1));

    let query = question
        .replace(/\byesterday\b/ig, `${yesterday}`)
        .replace(/\btoday\b/ig, `${today}`)
        .replace(/\btomorrow\b/ig, `${tomorrow}`);

    if (SPORTS_PATTERN.test(question)) {
        query = `${query} final score result scorecard`;
    }

    if (/\bipl\b/i.test(question)) {
        query = `${query} IPL 2026 Cricbuzz ESPNcricinfo`;
    }

    return query.trim();
}

function toMistralMessages(messages) {
    const normalizedMessages = [];

    for (const message of messages) {
        if (message.role === "ai" && normalizedMessages.length === 0) {
            continue;
        }

        const previous = normalizedMessages.at(-1);

        if (previous?.role === message.role) {
            previous.content = `${previous.content}\n\n${message.content}`;
        } else {
            normalizedMessages.push({ ...message });
        }
    }

    if (normalizedMessages.at(-1)?.role === "ai") {
        normalizedMessages.pop();
    }

    return normalizedMessages.map((message) => (
        message.role === "user"
            ? new HumanMessage(message.content)
            : new AIMessage(message.content)
    ));
}

async function answerWithSearch(messages) {
    const latestUserMessage = getLastUserMessage(messages);
    const searchQuery = buildSearchQuery(latestUserMessage.content);
    const searchResults = await searchInternet({
        query: searchQuery,
        topic: "news",
        days: 7,
    });
    const today = formatLongDate(new Date());

    const response = await getMistralModel().invoke([
        new SystemMessage(`
You are Anubis AI, a precise assistant.
Today's date is ${today}.
Answer using only the provided internet search results.
Do not use old model memory for scores, news, prices, schedules, or daily events.
If the search results do not clearly confirm the requested score/result/date, say you could not confirm it from the search results.
Mention the exact date you used for relative words like today or yesterday.
Use concise Markdown and include useful source titles or URLs.
        `),
        new HumanMessage(`
User question:
${latestUserMessage.content}

Search query used:
${searchQuery}

Internet search results:
${searchResults}
        `),
    ]);

    return extractTextFromResponse(response);
}

async function answerWithChat(messages) {
    const response = await getMistralModel().invoke([
        new SystemMessage(`
You are Anubis AI, a helpful and concise assistant.
Use Markdown formatting for clear answers.
        `),
        ...toMistralMessages(messages),
    ]);

    return extractTextFromResponse(response);
}

export async function generateResponse(messages) {
    const validatedMessages = ChatMessagesSchema.parse(messages);
    const latestUserMessage = getLastUserMessage(validatedMessages);
    const needsCurrentData = CURRENT_DATA_PATTERN.test(latestUserMessage?.content || "");
    const reply = needsCurrentData
        ? await answerWithSearch(validatedMessages)
        : await answerWithChat(validatedMessages);

    if (!reply) {
        throw new Error("AI returned an empty response");
    }

    return reply;
}

export async function generateChatReply(message) {
    return generateResponse([
        {
            role: "user",
            content: message,
        },
    ]);
}

export async function generateChatTitle(message) {
    const response = await getMistralModel().invoke([
        new SystemMessage(`
Generate a concise chat title in 2-5 words.
Return only the title. No quotes, no punctuation at the end.
        `),
        new HumanMessage(message),
    ]);

    const title = extractTextFromResponse(response);
    return title || "New chat";
}
