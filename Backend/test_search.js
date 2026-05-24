import "dotenv/config";

async function run() {
    const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            api_key: process.env.TAVILY_API_KEY,
            query: "IPL match score today",
            topic: "general",
            max_results: 5
        })
    });
    const data = await response.json();
    console.log("=== GENERAL TOPIC RESULTS ===");
    data.results.forEach((r, i) => {
        console.log(`[${i+1}] ${r.title}\nURL: ${r.url}\nContent: ${r.content.slice(0, 150)}...\n`);
    });

    const responseNews = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            api_key: process.env.TAVILY_API_KEY,
            query: "IPL match score today",
            topic: "news",
            days: 7,
            max_results: 5
        })
    });
    const dataNews = await responseNews.json();
    console.log("=== NEWS TOPIC RESULTS ===");
    dataNews.results.forEach((r, i) => {
        console.log(`[${i+1}] ${r.title}\nURL: ${r.url}\nContent: ${r.content.slice(0, 150)}...\n`);
    });
}

run();
