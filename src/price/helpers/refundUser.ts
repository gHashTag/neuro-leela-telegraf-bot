import { MyContext } from '@/interfaces'
import {
  getReferalsCount,
  getUserBalance,
  updateUserBalance,
} from '@/core/supabase'
import { mainMenu } from '@/menu'

export async function refundUser(ctx: MyContext, paymentAmount: number) {
  if (!ctx.from) {
    throw new Error('User not found')
  }
  const balance = await getUserBalance(ctx.from.id)
  console.log('balance', balance)
  // Возвращаем средства пользователю
  const newBalance = balance + paymentAmount
  console.log('newBalance', newBalance)
  await updateUserBalance(ctx.from.id, newBalance)

  // Отправляем сообщение пользователю
  const isRu = ctx.from.language_code === 'ru'
  const telegram_id = ctx.from?.id?.toString() || ''
  const { count, subscription } = (await getReferalsCount(telegram_id)) || {
    count: 0,
    subscription: 'stars',
  }
  await ctx.reply(
    isRu
      ? `Возвращено ${paymentAmount.toFixed(
          2
        )} ⭐️ на ваш счет.\nВаш баланс: ${newBalance.toFixed(2)} ⭐️`
      : `${paymentAmount.toFixed(
          2
        )} ⭐️ have been refunded to your account.\nYour balance: ${newBalance.toFixed(
          2
        )} ⭐️`,
    {
      reply_markup: {
        keyboard: (
          await mainMenu(isRu, count, subscription)
        ).reply_markup.keyboard,
      },
    }
  )
}
