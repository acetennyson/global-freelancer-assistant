This documentation is designed to be fed into your AI CLI (like Antigravity or Cursor) to generate a high-quality, production-ready submission for the Notion MCP Challenge.
------------------------------
Project Documentation: Global Freelancer Sync (Notion MCP)1. Project Overview
Title: Global Freelancer Sync
Objective: An AI-powered "Command Center" for freelancers in regions like Cameroon (WAT) to manage global clients across time zones. It uses the Model Context Protocol (MCP) to allow an AI agent to read client data, calculate local times, and draft contextual "Human-in-the-Loop" updates directly into Notion.
2. Core Tech Stack

* Framework: Next.js 14/15 (App Router)
* Database & Auth: Supabase (PostgreSQL for persistent metadata & logging)
* Integration: Notion SDK (@notionhq/client)
* The Key Feature: Model Context Protocol (MCP) via TypeScript SDK
* Time Logic: Native JS Intl.DateTimeFormat for timezone-aware calculations

3. High-Level Architecture

   1. Notion (The Source): Users manage a "Clients" database with columns: Name, Timezone, Status, and AI_Draft.
   2. Supabase (The Memory): Mirrors Notion data for fast querying and stores historical logs of AI interactions (essential for "Stability" and "Optimization").
   3. MCP Server (The Bridge): A custom TypeScript server that exposes tools to an AI Client (like Claude Desktop).
   * Tool 1: get_client_local_times (Returns which clients are currently awake/sleeping).
      * Tool 2: draft_contextual_update (Writes a localized draft back to Notion).
   4. Next.js Dashboard (The UI): A clean, professional interface showing a "Global Clock" for all clients and a preview of pending AI drafts.

------------------------------
4. Technical Requirements & StandardsA. Modularity & Readability

* Service Pattern: Separate logic into /services/notion.ts, /services/supabase.ts, and /services/time.ts.
* Type Safety: Strict TypeScript interfaces for all Notion page properties and Supabase rows.

B. Functionality & Optimization

* Sync Logic: Use Supabase upsert to sync Notion data without duplicates.
* Efficiency: Use the Notion API's filter property to only fetch "Active" clients to save on rate limits.

C. The MCP Requirement (Crucial)
The project must include an mcp-server directory. This server defines Tools that the AI can call.

* Tool Definition:
* name: generate_client_outreach
   * description: "Checks client timezone and drafts a greeting in Notion if they are in business hours."

------------------------------
5. Implementation Roadmap (For AI CLI)Step 1: Database Schema (Supabase)

CREATE TABLE clients (
  notion_page_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  timezone TEXT NOT NULL,
  last_sync TIMESTAMPTZ DEFAULT NOW(),
  preferred_contact_hour INTEGER DEFAULT 9 -- 9 AM local
);

Step 2: The Time Intelligence Utility

// services/time.tsexport const isBusinessHours = (timezone: string): boolean => {
  const hour = parseInt(new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', hour12: false, timeZone: timezone 
  }).format(new Date()));
  return hour >= 9 && hour <= 18; // 9 AM to 6 PM
};

Step 3: The MCP Tool Logic

// mcp-server/index.ts
server.tool("sync_and_draft", {
  client_id: z.string()
}, async ({ client_id }) => {
  // 1. Fetch client from Supabase
  // 2. Check if isBusinessHours(client.timezone)
  // 3. If true, use Notion SDK to update 'AI_Draft' property
  // 4. Return success message to the AI
});

------------------------------
6. Judging Criteria Checklist

* Originality: Solves the real-world "Time Zone Gap" for African freelancers.
* Technical Complexity: Uses Next.js + Supabase + Notion MCP + Intl Time API.
* Practical Implementation: The "Human-in-the-loop" draft system ensures the user stays in control.
* Stability: Comprehensive error handling for Notion API rate limits.

Ready to proceed? Give this prompt to your AI CLI:

"Based on the Global Freelancer Sync documentation provided, generate the folder structure and the @notionhq/client service file to fetch data from a database with ID: [YOUR_ID]."

Note: Since the deadline is March 29 11:59 PM PST, which is March 30 7:59 AM WAT for you, we have roughly 24 hours to polish the code. Shall we generate the MCP Server code next?



