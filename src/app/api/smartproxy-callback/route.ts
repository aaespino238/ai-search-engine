// Import necessary libraries
import { OrganicResult, SearchResults } from "@/app/utils/constants";
import { NextRequest, NextResponse } from "next/server";

// Define in-memory storage for task results
const taskResults: Map<string, OrganicResult[]> = new Map();

export async function POST(req: NextRequest) {
    try{
        const { results } = await req.json() as SearchResults;
        
        if(!results){
            return NextResponse.json({ error: "Invalid parload" }, { status: 400 });
        }

        const organicResults: OrganicResult[] = results[0].content.results.organic;
        const task_id = results[0].task_id;
        taskResults.set(task_id, organicResults);

        return NextResponse.json({ message: "Callback processed successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error processing callback:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Export taskResults for use in other parts of the application
export { taskResults };