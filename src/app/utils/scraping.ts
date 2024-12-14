import { taskResults } from "../api/smartproxy-callback/route";
import { OrganicResult, SmartProxyBatchStatusResponse } from "./constants";
import puppeteer from "puppeteer";

const SMART_PROXY_USERNAME = process.env.SMART_PROXY_USERNAME;
const SMART_PROXY_PASSWORD = process.env.SMART_PROXY_PASSWORD;  
const SMART_PROXY_AUTH = process.env.SMART_PROXY_AUTH;
const SMART_PROXY_CALLBACK_URL = process.env.CALLBACK_URL;

// Utility function to wait for a result
const waitForResult = (taskId: string): Promise<OrganicResult[]> => {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error(`Timeout waiting for task result: ${taskId}`));
        }, 60000); // Timeout after 60 seconds

        const interval = setInterval((taskId) => {

            // console.log("TASK RESULTS IN INTERVAL CALL: ", taskResults)
            // console.log(taskResults.get(taskId))

            if (taskResults.has(taskId)) {
                clearInterval(interval);
                clearTimeout(timeout);
                const result = taskResults.get(taskId) as OrganicResult[]
                console.log(`Received result for task ${taskId}`)
                resolve(result);
            }
        }, 1000, taskId); // Check every second
    });
};

export const scrapeQueries = async(searchQueries: string[]): Promise<OrganicResult[][]> => {
    try{
        const options = {
            method: "POST",
            body: JSON.stringify({
                target: "google_search",
                geo: "San Francisco,California,United States", 
                query: searchQueries,
                page_from: "1",
                num_pages: "10",
                google_results_language: "en",
                parse: true,
                callback_url: SMART_PROXY_CALLBACK_URL + "/api/smartproxy-callback"
            }),
            headers: {
                accept: 'application/json',
                "content-type": "application/json",
                authorization: `Basic ${SMART_PROXY_AUTH}`
            },
        };

        const response = await fetch("https://scraper-api.smartproxy.com/v2/task/batch", options)

        if(!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json() as SmartProxyBatchStatusResponse
        const queries = data.queries 

        return Promise.all(
            queries.map(async (query) => {
                const task_id = query.id
                const task_result = await waitForResult(task_id)
                return task_result
            })
        )

    } catch (error) {
        console.log("Error scraping google: ", error);
        throw error;
    }
}

export const scrapeSERPResults = async(allQueryLinks: string[][]): Promise<string[][]> => {
    return Promise.all(allQueryLinks.map(async (queryLinks) => {
        return Promise.all(queryLinks.map(async (link) => {
            return await scrapeURL(link)
        }))
    }))
}

export const scrapeURL = async(url: string): Promise<string> => {
    const proxyUrl = 'http://gate.smartproxy.com:7000'
    
    if (!SMART_PROXY_USERNAME || !SMART_PROXY_PASSWORD) {
        throw new Error('Proxy credentials not found in environment variables');
    }
    
    const browser = await puppeteer.launch({
        headless: true,
        args: [ 
            `--proxy-server=${proxyUrl}`,
            '--disable-web-security',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-features=IsolateOrigins,site-per-process',
        ],
    });

    try {
        const page = await browser.newPage();
        
        // Set a realistic user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        console.log("SMART_PROXY_USERNAME: ", SMART_PROXY_USERNAME)
        console.log("SMART_PROXY_PASSWORD: ", SMART_PROXY_PASSWORD)
        await page.authenticate({ 
            username: SMART_PROXY_USERNAME, 
            password: SMART_PROXY_PASSWORD.trim()
        });

        // Add headers to appear more like a real browser
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        });

        await page.goto(url);

        // Wait a bit for dynamic content
        const text = await page.evaluate(() => {
            const body = document.body.innerText;
            return body.replace(/\s+/g, ' ').trim();
        });

        return text || '';
    } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        throw error;
    }
}
