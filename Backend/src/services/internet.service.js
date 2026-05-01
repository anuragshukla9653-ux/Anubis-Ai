import { tavily as Tavily } from "@tavily/core"
import { z } from "zod"

const SearchInputSchema = z.object({
    query: z.string().trim().min(1, "Search query is required"),
    topic: z.enum([ "general", "news", "finance" ]).optional(),
    days: z.number().int().positive().max(30).optional(),
})

export const searchInternet = async (input) => {
    const { query, topic = "general", days } = SearchInputSchema.parse(input)

    if (!process.env.TAVILY_API_KEY) {
        throw new Error("Missing TAVILY_API_KEY")
    }
 
    const tavily = Tavily({
        apiKey: process.env.TAVILY_API_KEY,
    })

    const results = await tavily.search(query, {
        searchDepth: "advanced",
        topic,
        days,
        maxResults: 8,
        includeAnswer: "advanced",
        includeRawContent: "text",
    })

    return JSON.stringify({
        query: results.query || query,
        answer: results.answer,
        results: results.results?.map((result) => ({
            title: result.title,
            url: result.url,
            content: result.content,
            publishedDate: result.publishedDate,
            rawContent: result.rawContent,
        })) || [],
    }, null, 2)
}
