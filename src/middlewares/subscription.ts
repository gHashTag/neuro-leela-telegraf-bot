import { Markup } from 'telegraf'
import {
  createUser,
  getUserByTelegramId,
  incrementBalance,
  getUidInviter,
} from '@/core/supabase'
import { CreateUserData, MyContext } from '@/interfaces'
import bot from '@/core/bot'

import { isRussian } from '@/helpers/language'

// Проверка подписки с использованием chat-members
async function checkSubscription(ctx: MyContext): Promise<boolean> {
  try {
    if (!ctx.from?.id) {
      console.error('User ID is undefined')
      throw new Error('User ID is undefined')
    }
    const isRu = isRussian(ctx)
    const chatMember = await bot.telegram.getChatMember(
      isRu ? '@leela_chakra_ai' : '@leela_chakra_ai',
      ctx.from?.id
    )
    console.log('chatMember', chatMember)
    return ['member', 'administrator', 'creator'].includes(chatMember.status)
  } catch (error) {
    console.error('Error checking subscription:', error)
    throw error
  }
}

async function handleSubscriptionMessage(
  ctx: MyContext,
  language_code: string
): Promise<void> {
  const message =
    language_code === 'ru'
      ? '❗️ВНИМАНИЕ\nВы видите это сообщение потому что не подписаны на канал @neuro_blogger_group\n Группа нужна для того чтобы вы могли задать вопросы и получить помощь. Пожалуйста, подпишитесь на наш канал, чтобы продолжить использование бота и после нажатия на кнопку "Подписаться" вернитесь в бот и нажмите команду /start.'
      : '❗️ATTENTION\nYou see this message because you are not subscribed to the channel @neuro_blogger_group\nThe group is needed so that you can ask questions and get help. Please subscribe to our channel to continue using the bot and after clicking the "Subscribe" button, return to the bot and click the /start command.'

  await ctx.reply(message, {
    reply_markup: Markup.inlineKeyboard([
      Markup.button.url(
        language_code === 'ru' ? 'Подписаться' : 'Subscribe',
        'https://t.me/leela_chakra_ai'
      ),
    ]).reply_markup,
  })
}

// Основной middleware
export const subscriptionMiddleware = async (
  ctx: MyContext,
  next: () => Promise<void>
): Promise<void> => {
  const isRu = isRussian(ctx)
  console.log('ctx', ctx)
  try {
    // Проверяем, что команда /start
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

    // Получаем inviter_id из start параметра
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

    // Проверяем, существует ли пользователь
    const existingUser = await getUserByTelegramId(telegram_id.toString())

    if (existingUser) {
      console.log('User already registered:', telegram_id)
      const isSubscribed = await checkSubscription(ctx)
      if (!isSubscribed) {
        await handleSubscriptionMessage(ctx, language_code)
        return
      }
      return await next()
    }
    const photo_url = await getUserPhotoUrl(ctx, telegram_id)
    // Создаем пользователя с inviter из start параметра

    if (ctx.session.inviteCode) {
      const { inviter_id, inviter_username, inviter_telegram_id } =
        await getUidInviter(inviteCode)

      ctx.session.inviter = inviter_id

      const isSubscribed = await checkSubscription(ctx)
      if (!isSubscribed) {
        await handleSubscriptionMessage(ctx, language_code)
        return
      }

      if (inviter_telegram_id) {
        await bot.telegram.sendMessage(
          inviter_telegram_id,
          isRu
            ? `🔗 Новый пользователь зарегистрировался по вашей ссылке: @${finalUsername}.`
            : `🔗 New user registered through your link: @${finalUsername}.`
        )
        await incrementBalance({
          telegram_id: inviter_telegram_id.toString(),
          amount: 100,
        })
        await bot.telegram.sendMessage(
          '@neuro_blogger_group',
          `🔗 Новый пользователь зарегистрировался в боте: @${finalUsername}. По реферальной ссылке от: @${inviter_username}.`
        )
      }
    } else {
      const isSubscribed = await checkSubscription(ctx)
      if (!isSubscribed) {
        await handleSubscriptionMessage(ctx, language_code)
        return
      }

      await bot.telegram.sendMessage(
        '@neuro_blogger_group',
        `🔗 Новый пользователь зарегистрировался в боте: @${finalUsername}.`
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

async function getUserPhotoUrl(
  ctx: MyContext,
  userId: number
): Promise<string | null> {
  try {
    // Получаем массив фотографий профиля
    const userPhotos = await ctx.telegram.getUserProfilePhotos(userId)

    // Проверяем есть ли фотографии
    if (userPhotos.total_count === 0) {
      console.log('No photos found')
      return null
    }

    // Получаем файл самого большого размера фото
    const photoSizes = userPhotos.photos[0]
    const largestPhoto = photoSizes[photoSizes.length - 1]

    const file = await ctx.telegram.getFile(largestPhoto.file_id)

    if (!file.file_path) {
      console.log('No file_path in response')
      return null
    }

    // Формируем URL фотографии
    const photoUrl = `https://api.telegram.org/file/bot${ctx.telegram.token}/${file.file_path}`
    console.log('Generated photo URL:', photoUrl)

    return photoUrl
  } catch (error) {
    console.error('Error getting user profile photo:', error)
    throw error
  }
}
