import { Scenes } from 'telegraf'
import { sendGenericErrorMessage } from '@/menu'
import { MyContext, Subscription } from '../../interfaces'
import { levels, mainMenu } from '../../menu/mainMenu'
import { getReferalsCountAndUserData } from '@/core/supabase'
import { isDev, isRussian } from '@/helpers'
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import { getPlanNumber } from '@/core/supabase'

export const menuScene = new Scenes.WizardScene<MyContext>(
  'menuScene',
  async ctx => {
    console.log('CASE: menuCommand')
    const isRu = isRussian(ctx)
    try {
      console.log('CASE: menu')
      const telegram_id = ctx.from?.id?.toString() || ''
      let newCount = 0
      let newSubscription: Subscription = 'stars'

      if (isDev) {
        newCount = 2
        newSubscription = 'stars'
      } else {
        const { count, subscription } = await getReferalsCountAndUserData(
          telegram_id
        )
        newCount = count
        newSubscription = subscription
      }

      const { loka, gameSteps } = await getPlanNumber(telegram_id)

      const inlineKeyboard: InlineKeyboardButton[][] = []

      if (gameSteps < newCount) {
        inlineKeyboard.push([
          {
            text: isRu ? '🎲 Сделать следующий ход' : '🎲 Make the next move',
            callback_data: 'make_next_move',
          },
        ])
      }

      inlineKeyboard.push(
        [
          {
            text: isRu ? '🚀 Открыть квест' : '🚀 Open quest',
            web_app: {
              url: `https://neuro-blogger-web-u14194.vm.elestio.app/leelachakra/${loka}`,
            },
          },
        ],
        [
          {
            text: isRu
              ? '🔓 Разблокировать все функции'
              : '🔓 Unlock all features',
            callback_data: 'unlock_features',
          },
        ]
      )

      const message = isRu
        ? `🚀 Чтобы сделать следующий ход, пригласите друга или разблокируйте все функции! 🌟\n\n🔓 Хотите разблокировать все функции?\n💳 Оформите подписку, чтобы получить полный доступ!`
        : `🚀 To make the next move, invite a friend or unlock all features! 🌟\n\n🆔 Want to unlock all features?\n💳 Subscribe to get full access!`

      const menu = await mainMenu(isRu, newCount, newSubscription)

      await ctx.reply(message, {
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
        parse_mode: 'HTML',
      })

      await ctx.reply(
        isRu
          ? `Ссылка для приглашения друзей 👇🏻`
          : `Invite link for friends 👇🏻`,
        menu
      )
      const botUsername = ctx.botInfo.username

      const linkText = `<a href="https://t.me/${botUsername}?start=${telegram_id}">https://t.me/${botUsername}?start=${telegram_id}</a>`

      await ctx.reply(linkText, { parse_mode: 'HTML' })
      return ctx.wizard.next()
    } catch (error) {
      console.error('Error in menu command:', error)
      await sendGenericErrorMessage(ctx, isRu, error)
      throw error
    }
  },
  async ctx => {
    console.log('CASE 1: menuScene.next')
    if ('callback_query' in ctx.update && 'data' in ctx.update.callback_query) {
      const text = ctx.update.callback_query.data
      console.log('1 text menuScene.next!!!', text)
      if (text === 'unlock_features') {
        console.log('CASE: 🔓 Разблокировать все функции')
        return ctx.scene.enter('subscriptionScene')
      } else if (text === 'make_next_move') {
        console.log('CASE: 🎲 Сделать следующий ход')
        return ctx.scene.enter('rollDiceWizard')
      }
    } else if ('message' in ctx.update && 'text' in ctx.update.message) {
      const text = ctx.update.message.text
      console.log('2 text menuScene.next!!!', text)
      handleMenu(ctx, text)
    } else {
      console.log('CASE: menuScene.next.else', ctx)
      return ctx.scene.leave()
    }
    return ctx.scene.leave()
  }
)

const handleMenu = async (ctx: MyContext, text: string) => {
  console.log('CASE: handleMenu')
  const isRu = isRussian(ctx)
  if (text === (isRu ? levels[103].title_ru : levels[103].title_en)) {
    console.log('CASE: 💵 Оформление подписки')
    await ctx.scene.enter('subscriptionScene')
  } else if (text === (isRu ? levels[100].title_ru : levels[100].title_en)) {
    console.log('CASE: 💎 Пополнить баланс')
    await ctx.scene.enter('paymentScene')
  } else if (text === (isRu ? levels[101].title_ru : levels[101].title_en)) {
    console.log('CASE: 🤑 Баланс')
    await ctx.scene.enter('balanceCommand')
  } else if (text === (isRu ? levels[102].title_ru : levels[102].title_en)) {
    console.log('CASE: 👥 Пригласить друга')
    await ctx.scene.enter('inviteCommand')
  }
}
