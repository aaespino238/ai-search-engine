export const QUERY_INTERPRETATION_PROMPT = `
Given a user query, follow these steps to generate a meaningful and accurate response by breaking the query into actionable parts:

---

**Step 1: Analyze Information Needs and Complexity**  
- Identify the key pieces of information required to effectively address the query.  
- Consider the context and possible interpretations of the query to ensure your response aligns with the user’s intent.  

---

**Step 2: Craft Search Queries**  
- For each piece of information identified in Step 1, generate specific and optimized search queries tailored for a search engine.  
- Ensure that the queries comprehensively cover all aspects of the user’s intent, considering alternate interpretations when necessary.  
- The information each query in seeking to find should be unique to that query. In other words, if two queries are likely to return nearly the same results keep only one of them.
- Try to keep the number of queries to 1 unless the complexity of the question requires more
- The queries will be directly input to google without any further editing so make sure they will yield the appropriate google search results.

TODAYS DATE: ${new Date().toLocaleDateString()}
---

**Step 3: Format the Response**  
Compose a JSON object output structured as follows:  

{
  "queries": [
    {
      "query": "the query to be input into the search engine",
      "description": "a concise description of the information that the search query is looking for"
    },
    ...
  ]
}

---

**USER QUERY**
{USER_QUERY}
`

export const PROMISING_LINKS_PROMPT = `
You are an AI agent tasked with identifying the most promising sources from search engine results to answer a user's query. You will be provided with:

1. The original query interpretation object containing the search queries and their purposes
2. Search results containing URLs, titles, and descriptions for each query.

Your task is to analyze each search result and determine its relevance and potential value for answering the query.

Consider the following criteria:
- How well the content matches the information needs identified in the query interpretation
- The credibility and authority of the source
- The comprehensiveness of the information based on the description
- The recency/timeliness of the information (when relevant)

IMPORTANT: It is very important that you select sources that are likely to be scraped successfully.

Return a RAW JSON object structured as follows:

{
  "selectedSources": [
    [url1, url2,...], // for query 1
    [url1, url2,...], // for query 2
    ...
  ]
}

Limit the response to the most promising sources for each query.

---

QUERY INTERPRETATION:
{QUERY_INTERPRETATION}

SEARCH RESULTS:
{SEARCH_RESULTS}
`

/*
- SEARCH_ENGINE_RESULTS

Model needs to use search engine results to best answer user's query
- model should include sources in each response block
*/
export const FORM_RESPONSE_BLOCKS_PROMPT = `
You are an AI agent tasked with generating responses for an ai-search-engine web application. You will be given a json holding data scraped 
from promising sources. You should use both your own knowledge and the scraped data to best answer the user's query. 
If the scraped data is not relevant to the user's query, don't include any mention of it in the response.

Format your response as a raw JSON object with the following structure:

{
  "response": your full response to the user's query,
  "sources": [
    {
      "page_title": "the title of the source",
      "url": "the url of the source",
      "relevant_information": "the content of the source that is relevant to the user's query"
    },
    ...
  ]
}

USER QUERY:
{USER_QUERY}

SCRAPED DATA:
{SCRAPED_DATA}
`