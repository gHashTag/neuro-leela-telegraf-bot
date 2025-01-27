import { MyContext } from '@/interfaces'

interface BuyParams {
  ctx: MyContext
  isRu: boolean
}

export async function handleBuySubscription({ ctx, isRu }: BuyParams) {
  try {
    const subscriptionTitles = {
      game_leela: isRu ? '🎮 Игра Лила' : '🎮 Game Leela',
      game_in_group: isRu ? '🧠 Игра в группе' : '🧠 Game in group',
      mentor_game: isRu ? '🤖 Ментор' : '🤖 Mentor',
    }

    const subscriptionDescriptions = {
      game_leela: isRu ? 'Самостоятельное обучение.' : 'Self-study.',
      game_in_group: isRu ? 'Индивидуальная встреча.' : 'Individual meeting.',
      mentor_game: isRu
        ? 'Обучение с ментором.'
        : 'Training with a mentor_game.',
    }

    const subscriptionStarAmounts = {
      game_leela: 3333,
      game_in_group: 6666,
      mentor_game: 66666,
    }

    const subscriptionType = ctx.session.subscription
    const amount = subscriptionStarAmounts[subscriptionType]

    const title = subscriptionTitles[subscriptionType] || `${amount} ⭐️`
    const description =
      subscriptionDescriptions[subscriptionType] ||
      (isRu
        ? `💬 Получите ${amount} звезд.\nИспользуйте звезды для различных функций нашего бота и наслаждайтесь новыми возможностями!`
        : `💬 Get ${amount} stars.\nUse stars for various functions of our bot and enjoy new opportunities!`)

    await ctx.replyWithInvoice({
      title,
      description,
      payload: `${amount}_${Date.now()}`,
      currency: 'XTR', // Pass “XTR” for payments in Telegram Stars.
      prices: [
        {
          label: isRu ? 'Цена' : 'Price',
          amount: amount,
        },
      ],
      provider_token: '',
    })

    return
  } catch (error) {
    console.error('Error in handleBuySubscription:', error)
    throw error
  }
}
