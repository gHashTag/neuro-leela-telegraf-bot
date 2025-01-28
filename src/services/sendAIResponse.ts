import axios, { isAxiosError } from 'axios'
import { isDev, ELESTIO_URL } from '@/config'

export async function sendAIResponse(
  telegram_id: string,
  assistant_id: string,
  report: string,
  language_code: string,
  full_name: string
): Promise<{ ai_response: string } | null> {
  try {
    const url = `${
      isDev ? 'http://localhost:3000' : ELESTIO_URL
    }/ai-assistant/ai-response`

    const { data } = await axios.post(
      url,
      {
        telegram_id,
        assistant_id,
        report,
        language_code,
        full_name,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    console.log('sendAIResponse data', data)
    return {
      ai_response: data.ai_response,
    }
  } catch (error) {
    if (isAxiosError(error)) {
      console.error('API Error:', error.response?.data || error.message)
    } else {
      console.error('Error sending AI response:', error)
    }
    return null
  }
}
