import { Markup, Scenes } from 'telegraf'
import { MyContext } from '@/interfaces'
import { isRussian } from '@/helpers'

import { handleSelectStars } from '@/handlers/handleSelectStars'

import { starAmounts } from '@/price/helpers/starAmounts'

import { handleBuySubscription } from '@/handlers/handleBuySubscription'

export const paymentScene = new Scenes.BaseScene<MyContext>('paymentScene')

paymentScene.enter(async ctx => {
  const isRu = isRussian(ctx)
  try {
    const message = isRu ? 'Как вы хотите оплатить?' : 'How do you want to pay?'

    const keyboard = Markup.keyboard([
      [
        Markup.button.text(isRu ? '⭐️ Звездами' : '⭐️ Stars'),
        {
          text: isRu ? 'Что такое звезды❓' : 'What are stars❓',
          web_app: {
            url: `https://telegram.org/blog/telegram-stars/${
              isRu ? 'ru' : 'en'
            }?ln=a`,
          },
        },
      ],
      [
        Markup.button.text(isRu ? '💳 Рублями' : '💳 In rubles'),
        Markup.button.text(isRu ? '🏠 Главное меню' : '🏠 Main menu'),
      ],
    ]).resize()

    // Отправка сообщения с клавиатурой
    await ctx.reply(message, {
      reply_markup: keyboard.reply_markup,
    })
  } catch (error) {
    console.error('Error in paymentScene.enter:', error)
    await ctx.reply(
      isRu
        ? 'Произошла ошибка. Пожалуйста, попробуйте снова.'
        : 'An error occurred. Please try again.'
    )
  }
})

paymentScene.hears(['⭐️ Звездами', '⭐️ Stars'], async ctx => {
  console.log('CASE: ⭐️ Звездами', ctx.match)
  const isRu = isRussian(ctx)
  const subscription = ctx.session.subscription
  console.log('CASE: subscription', subscription)
  if (subscription) {
    if (subscription === 'game_leela') {
      await handleBuySubscription({ ctx, isRu })
      await ctx.scene.leave()
    } else if (subscription === 'game_in_group') {
      await handleBuySubscription({ ctx, isRu })
      await ctx.scene.leave()
    } else if (subscription === 'mentor_game') {
      await handleBuySubscription({ ctx, isRu })
      await ctx.scene.leave()
    }
  } else {
    await handleSelectStars({ ctx, isRu, starAmounts })
    await ctx.scene.leave()
  }
})

paymentScene.hears(['💳 Рублями', '💳 In rubles'], async ctx => {
  console.log('CASE: 💳 Рублями', ctx.match)

  const subscription = ctx.session.subscription
  console.log('CASE: subscription', subscription)

  if (subscription === 'game_leela') {
    console.log('CASE: 📚 Игра Лила - rubGetWizard')
    return ctx.scene.enter('rubGetWizard')
  } else if (subscription === 'game_in_group') {
    console.log('CASE: 🧠 Игра в группе - rubGetWizard')
    return ctx.scene.enter('rubGetWizard')
  } else if (subscription === 'mentor_game') {
    console.log('CASE: 🤖 Ментор - rubGetWizard')
    return ctx.scene.enter('rubGetWizard')
  } else if (subscription === 'stars') {
    console.log('CASE: 💳 Рублями - emailWizard')
    await ctx.scene.enter('emailWizard')
  }
})
