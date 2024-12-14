import OpenAI from "openai";
import { PROMISING_LINKS_PROMPT, QUERY_INTERPRETATION_PROMPT, FORM_RESPONSE_BLOCKS_PROMPT } from "./prompts";
import { OrganicResult, ResponseBlock, SearchQuery } from "./constants";

const OPENAI_MODEL = "gpt-4o-mini"

// Configure OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to send messages to OpenAI
async function sendToOpenAI(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message?.content;

    if (!content) throw new Error("No response from OpenAI.");

    return content;
  } catch (error) {
    console.error("Error communicating with OpenAI:", error);
    throw error;
  }
}

// SERP Query Interpretation
export async function interpretQuery(query: string): Promise<SearchQuery[]> {
  const prompt = QUERY_INTERPRETATION_PROMPT.replace("{USER_QUERY}", query);
  try{
    const model_output = await sendToOpenAI(prompt);
    console.log("Model output: ", model_output)

    const queries = JSON.parse(model_output).queries;

    return queries;

  } catch (error) {
    console.error("Error in query interpretation: ", error);
    throw error;
  }
}

// Identify Promising Sources from SERP Results
export async function identifyPromisingSources(queries: SearchQuery[], searchEngineResults: OrganicResult[][]): Promise<string[][]> {
    const filteredResults = searchEngineResults.map((results) => {
      return results.map(({url, desc, title}) => ({url, desc, title}))
    })
    const prompt = PROMISING_LINKS_PROMPT.replace("{QUERY_INTERPRETATION}", JSON.stringify(queries)).replace("{SEARCH_RESULTS}", JSON.stringify(filteredResults))
    try {
        const model_output = await sendToOpenAI(prompt)
        console.log("Model output: ", model_output)
        return cleanAndParseModelOutput(model_output).selectedSources 
    } catch (error) {
        console.error("Error in identifying promising sources: ", error);
        throw error;
    }
}

// Form Response Blocks from Scraped Data
export async function formResponseBlocks(scrapedData: string[][], userQuery: string): Promise<ResponseBlock> {
  const prompt = FORM_RESPONSE_BLOCKS_PROMPT.replace("{SCRAPED_DATA}", JSON.stringify(scrapedData[0])).replace("{USER_QUERY}", userQuery)
  try {
    const model_output = await sendToOpenAI(prompt)
    console.log("Model output: ", model_output)
    return cleanAndParseModelOutput(model_output) as ResponseBlock
  } catch (error) {
    console.error("Error in formResponseBlocks: ", error);
    throw error;
  }
}

function cleanAndParseModelOutput(modelOutput: string): any {
    try {
        return JSON.parse(modelOutput);
    } catch (e) {
        console.log('Direct parsing failed, attempting to clean output');
        try {
            let cleaned = modelOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            console.log('After removing markdown:', cleaned);
            
            const startIndex = cleaned.indexOf('{');
            const endIndex = cleaned.lastIndexOf('}');
            
            if (startIndex === -1 || endIndex === -1) {
                throw new Error('No valid JSON object found in the response');
            }
            
            cleaned = cleaned.slice(startIndex, endIndex + 1);
            console.log('After extracting JSON:', cleaned);
            
            cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
            console.log('After removing trailing commas:', cleaned);
            
            return JSON.parse(cleaned);
        } catch (cleanError) {
            console.error('Error parsing cleaned output:', cleanError);
            console.error('Original output:', modelOutput);
            throw new Error('Failed to parse model output as JSON');
        }
    }
}
