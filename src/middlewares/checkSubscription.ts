import bot from '@/core/bot'
import { MyContext } from '@/interfaces'

export async function checkSubscription(
  ctx: MyContext,
  telegram_channel_id: string
): Promise<boolean> {
  try {
    if (!ctx.from?.id) {
      console.error('User ID is undefined')
      throw new Error('User ID is undefined')
    }
    const chatMember = await bot.telegram.getChatMember(
      telegram_channel_id,
      ctx.from?.id
    )

    return ['member', 'administrator', 'creator'].includes(chatMember.status)
  } catch (error) {
    console.error('Error checking subscription:', error)
    throw error
  }
}
