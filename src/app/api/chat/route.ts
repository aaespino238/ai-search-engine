// TODO: Implement the chat API with Groq and web scraping with Cheerio and Puppeteer
// Refer to the Next.js Docs on how to read the Request body: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// Refer to the Groq SDK here on how to use an LLM: https://www.npmjs.com/package/groq-sdk
// Refer to the Cheerio docs here on how to parse HTML: https://cheerio.js.org/docs/basics/loading
// Refer to Puppeteer docs here: https://pptr.dev/guides/what-is-puppeteer

import { formResponseBlocks, identifyPromisingSources, interpretQuery } from "@/app/utils/llm";
import { scrapeQueries, scrapeSERPResults } from "@/app/utils/scraping";
import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { message } = await req.json();

    // Query Interpretation
    const searchQueries = await interpretQuery(message);
    const queries = searchQueries.map(({query}) => { return query});
    console.log("SEARCH QUERIES: ", queries);

    // Search engine queries
    const searchEngineResults = await scrapeQueries(queries);
    console.log("RESULTS FROM scrapeQueries: ", searchEngineResults);
    
    // Identify promising sources
    const promisingSources = await identifyPromisingSources(searchQueries, searchEngineResults)
    console.log("PROMISING SOURCES: ", promisingSources)

    // Scrape promising sources
    const scrapedData = await scrapeSERPResults(promisingSources)
    console.log("SCRAPED DATA: ", scrapedData)

    // Pass scraped information into llm to get relevant insights 
    const responseBlock = await formResponseBlocks(scrapedData, message)
    console.log("RESPONSE BLOCK: ", responseBlock)

    return NextResponse.json(responseBlock)

  } catch (error) {
    console.error("Error in chat API: ", error)
    throw error;
  }
}
