import { Scenes } from 'telegraf'

import { MyContext } from '@/interfaces'
import { isRussian } from '@/helpers'
import { sendAIResponse } from '@/services/sendAIResponse'
import { CallbackQuery } from 'telegraf/typings/core/types/typegram'

const step_callback = (isRu: boolean) => ({
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: isRu ? 'Сделать следующий ход 🎲' : 'Make the next move 🎲',
          callback_data: `make_next_move`,
        },
      ],
      // [
      //   {
      //     text: 'Gameboard',
      //     web_app: {
      //       url: `https://leela-chakra-nextjs.vercel.app/gameboard`,
      //     },
      //   },
      // ],
    ],
  },
})

export const reportWizard = new Scenes.WizardScene<MyContext>(
  'reportWizard',
  async (ctx: MyContext) => {
    console.log('CASE 1: reportWizard.next')
    const isRu = isRussian(ctx)

    const loader = await ctx.reply(isRu ? '🔮 Загрузка...' : '🔮 Loading...')
    await ctx.telegram.sendChatAction(ctx.from.id, 'typing')

    if (!ctx.from?.username) throw new Error('User not found')
    if (!ctx.chat?.id) throw new Error('Chat not found')

    await ctx.telegram.sendChatAction(ctx.from.id, 'typing')

    const { ai_response } = await sendAIResponse(
      ctx.from.id.toString(),
      'asst_PeA6kj3k9LmspxDVRrnPa8ux', // Leela Chakra Assistant ID
      ctx.session.report,
      isRu ? 'ru' : 'en',
      ctx.session.fullName
    )

    await ctx.reply(ai_response, {
      parse_mode: 'Markdown',
      ...step_callback(isRu),
    })
    await ctx.deleteMessage(loader.message_id)

    return ctx.wizard.next()
  },
  async (ctx: MyContext) => {
    console.log('CASE 2: User message')
    if ('text' in ctx.message) {
      const userMessage = ctx.message.text
      const isRu = isRussian(ctx)
      await ctx.telegram.sendChatAction(ctx.from.id, 'typing')
      const { ai_response } = await sendAIResponse(
        ctx.from.id.toString(),
        'asst_PeA6kj3k9LmspxDVRrnPa8ux',
        userMessage,
        isRu ? 'ru' : 'en',
        ctx.session.fullName
      )

      await ctx.reply(ai_response, {
        parse_mode: 'HTML',
        ...step_callback(isRu),
      })
    } else {
      await ctx.reply('Please send a text message.')
    }
  },
  async (ctx: MyContext) => {
    console.log('CASE 3: callback_query')
    if ('callback_query' in ctx.update) {
      const callbackQuery = ctx.update.callback_query as CallbackQuery.DataQuery
      if ('data' in callbackQuery && callbackQuery.data === 'make_next_move') {
        console.log('CASE: 🎲 Сделать следующий ход')
        return ctx.scene.enter('rollDiceWizard')
      }
    } else {
      console.log('CASE: reportScene.leave.else')
      return ctx.scene.leave()
    }
  }
)

reportWizard.action('make_next_move', async ctx => {
  console.log('CASE 3: callback_query')
  console.log('CASE 3: callback_query')
  if ('callback_query' in ctx.update) {
    const callbackQuery = ctx.update.callback_query as CallbackQuery.DataQuery
    if ('data' in callbackQuery && callbackQuery.data === 'make_next_move') {
      console.log('CASE: 🎲 Сделать следующий ход')
      return ctx.scene.enter('rollDiceWizard')
    }
  } else {
    console.log('CASE: reportScene.leave.else')
    return ctx.scene.leave()
  }
})

// reportWizard.leave(async ctx => {
//   console.log('CASE: reportWizard.leave')
//   const isRu = isRussian(ctx)

//   if (ctx.message && 'text' in ctx.message) {
//     const { ai_response } = await sendAIResponse(
//       ctx.from.id.toString(),
//       'asst_PeA6kj3k9LmspxDVRrnPa8ux',
//       ctx.message.text,
//       'ru',
//       ctx.session.fullName
//     )
//     await ctx.telegram.sendChatAction(ctx.from.id, 'typing')
//     await ctx.reply(ai_response, {
//       parse_mode: 'HTML',
//       ...step_callback(isRu),
//     })
//   } else {
//     return ctx.scene.enter('rollDiceWizard')
//   }
//   return ctx.scene.enter('rollDiceWizard')
// })
