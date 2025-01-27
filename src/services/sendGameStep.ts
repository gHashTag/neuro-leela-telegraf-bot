import { ELESTIO_URL } from '@/config'
import { isDev } from '@/config'
import { GameStep } from '@/core/supabase/getLastStep'
import { MyContext } from '@/interfaces'
import axios, { isAxiosError } from 'axios'

export async function sendGameStep(
  roll: number,
  response: GameStep[],
  ctx: MyContext,
  isRu: boolean
): Promise<GameStep | null> {
  console.log('Starting sendGameStep with:', { roll })
  console.log('response', response)
  try {
    const url = `${
      isDev ? 'http://localhost:3000' : ELESTIO_URL
    }/game/game-step`
    console.log('url', url)
    const { data } = await axios.post(
      url,
      {
        roll,
        result: response,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    console.log('data', data)
    return data
  } catch (error) {
    if (isAxiosError(error)) {
      console.error('API Error:', error.response?.data || error.message)
      await ctx.reply(
        isRu
          ? 'Произошла ошибка при отправке игрового шага. Пожалуйста, попробуйте позже.'
          : 'An error occurred while sending the game step. Please try again later.'
      )
    } else {
      console.error('Error sending game step:', error)
    }
    return null
  }
}
