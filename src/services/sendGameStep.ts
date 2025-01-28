import { ELESTIO_URL } from '@/config'
import { isDev } from '@/config'

import { MyContext, GameStep } from '@/interfaces'
import axios, { isAxiosError } from 'axios'

export type Plan = {
  short_desc: string
  image: string
  name: string
}

export async function sendGameStep(
  roll: number,
  telegram_id: string,
  ctx: MyContext,
  isRu: boolean
): Promise<{ gameStep: GameStep; plan: Plan; direction: string } | null> {
  try {
    const url = `${
      isDev ? 'http://localhost:3000' : ELESTIO_URL
    }/game/game-step`

    const { data } = await axios.post(
      url,
      {
        roll,
        telegram_id,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    console.log('sendGameStep data', data)
    return {
      gameStep: data.gameStep,
      plan: data.plan,
      direction: data.direction,
    }
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
