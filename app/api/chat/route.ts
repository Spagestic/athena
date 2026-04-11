import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai"
import { mistral } from "@ai-sdk/mistral"
import { scrape, search } from "firecrawl-aisdk"

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: mistral("mistral-large-latest"),
    messages: await convertToModelMessages(messages),
    tools: {
      search: search,
      scrape: scrape,
    },
    stopWhen: stepCountIs(6),
  })

  return result.toUIMessageStreamResponse()
}
