import {
  createUser,
  getUserByTelegramId,
  incrementBalance,
  getReferalsCountAndUserData,
} from '@/core/supabase'
import { CreateUserData, MyContext } from '@/interfaces'
import bot from '@/core/bot'

import { isRussian } from '@/helpers/language'
import { getUserPhotoUrl } from './getUserPhotoUrl'
import { verifySubscription } from './verifySubscription'
import { startMenu } from '@/menu/startMenu'

const SUBSCRIBE_CHANNEL_ID = '@leela_chakra_ai'
const BONUS_AMOUNT = 100

export const subscriptionMiddleware = async (
  ctx: MyContext,
  next: () => Promise<void>
): Promise<void> => {
  const isRu = isRussian(ctx)
  try {
    if (
      !ctx.message ||
      !('text' in ctx.message) ||
      !ctx.message.text.startsWith('/start')
    ) {
      return await next()
    }

    if (!ctx.from) {
      console.error('No user data found in context')
      await ctx.reply('Error: No user data found')
      return
    }

    const inviteCode = ctx.message.text.split(' ')[1]
    console.log('inviteCode', inviteCode)
    ctx.session.inviteCode = inviteCode

    const {
      username,
      id: telegram_id,
      first_name,
      last_name,
      is_bot,
      language_code,
    } = ctx.from

    const finalUsername = username || first_name || telegram_id.toString()

    const existingUser = await getUserByTelegramId(telegram_id.toString())
    console.log('existingUser', existingUser)

    if (existingUser) {
      await verifySubscription(ctx, language_code, SUBSCRIBE_CHANNEL_ID)
      await startMenu(ctx, isRu)
      return
    }

    const photo_url = await getUserPhotoUrl(ctx, telegram_id)

    if (ctx.session.inviteCode) {
      const { userData } = await getReferalsCountAndUserData(
        ctx.session.inviteCode.toString()
      )

      ctx.session.inviter = userData.user_id

      await verifySubscription(ctx, language_code, SUBSCRIBE_CHANNEL_ID)

      if (ctx.session.inviteCode) {
        await bot.telegram.sendMessage(
          ctx.session.inviteCode,
          isRu
            ? `🔗 Новый пользователь зарегистрировался по вашей ссылке: @${finalUsername}.\nЗа каждого друга, который зарегистрировался по вашей ссылке, вы получаете бесплатный ход в игре!`
            : `🔗 New user registered through your link: @${finalUsername}.\nFor each friend you invite, you get a free move in the game!`
        )
        await incrementBalance({
          telegram_id: ctx.session.inviteCode,
          amount: BONUS_AMOUNT,
        })
        await bot.telegram.sendMessage(
          SUBSCRIBE_CHANNEL_ID,
          isRu
            ? `🔗 Новый пользователь зарегистрировался в боте: @${finalUsername}. По реферальной ссылке от: @${userData.username}.\nЗа каждого друга, который зарегистрировался по вашей ссылке, вы получаете бесплатный ход в игре!\nСпасибо за участие в нашей программе!`
            : `🔗 New user registered in the bot: @${finalUsername}. By referral link from: @${userData.username}.\nFor each friend who registered through your link, you get a free move in the game!\nThank you for participating in our program!`
        )
      }
    } else {
      await verifySubscription(ctx, language_code, SUBSCRIBE_CHANNEL_ID)
      const { count } = await getReferalsCountAndUserData(inviteCode)
      await bot.telegram.sendMessage(
        SUBSCRIBE_CHANNEL_ID,
        `🔗 Новый пользователь зарегистрировался в боте: @${finalUsername}.\n🆔 Уровень аватара: ${count}.`
      )
    }

    const userData = {
      username: finalUsername,
      telegram_id: telegram_id.toString(),
      first_name: first_name || null,
      last_name: last_name || null,
      is_bot: is_bot || false,
      language_code: language_code || 'en',
      photo_url,
      chat_id: ctx.chat?.id || null,
      mode: 'clean',
      model: 'gpt-4-turbo',
      count: 0,
      aspect_ratio: '9:16',
      balance: 100,
      inviter: ctx.session.inviter || null,
      token: ctx.telegram.token || null,
    }

    await createUser(userData as CreateUserData)

    await next()
  } catch (error) {
    console.error('Critical error in subscriptionMiddleware:', error)
    throw error
  }
}
