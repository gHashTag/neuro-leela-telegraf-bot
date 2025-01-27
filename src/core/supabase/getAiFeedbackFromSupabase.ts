import { openai } from '../openai'

type GetAiSupabaseFeedbackT = {
  assistantId: string
  prompt: string
  language_code: string
  fullName: string
}

export async function getAiFeedbackFromSupabase({
  assistantId,
  prompt,
  language_code,
  fullName,
}: GetAiSupabaseFeedbackT): Promise<{ ai_response: string }> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API key is not set')
  }

  try {
    // Step 1: Create a thread with necessary parameters
    const thread = await openai.beta.threads.create()
    console.log(thread, 'thread')

    const message = await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: `response in language: ${language_code} prompt: ${prompt}`,
    })
    console.log(message, 'message')

    // Step 3: Run the assistant using assistantId
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistantId,
      instructions: `You are the host of the self-realization game Lila Chakra. You must answer the user's questions and help him in the game.
You must address the user by his name: ${fullName}`,
    })

    // Step 4: Periodically retrieve the run to check its status
    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(run.thread_id)
      for (const message of messages.data.reverse()) {
        console.log(message, 'message')
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return { ai_response: messages.data.reverse()[0].content[0].text.value }
      }
    } else {
      console.log(run.status)
    }
  } catch (error) {
    console.error('Error querying OpenAI Assistant:', error)
    throw error
  }
}
