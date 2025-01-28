import { Scenes } from 'telegraf'

import { MyContext } from '@/interfaces'
import { isRussian } from '@/helpers'
import { sendAIResponse } from '@/services/sendAIResponse'

export const reportWizard = new Scenes.WizardScene<MyContext>(
  'reportWizard',
  async ctx => {
    console.log('CASE 1: reportWizard.next')
    const isRu = isRussian(ctx)

    const loader = await ctx.reply(isRu ? '🔮 Загрузка...' : '🔮 Loading...')
    await ctx.telegram.sendChatAction(ctx.from.id, 'typing')

    const step_callback = {
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
    }

    if (!ctx.from?.username) throw new Error('User not found')
    if (!ctx.chat?.id) throw new Error('Chat not found')

    await ctx.telegram.sendChatAction(ctx.from.id, 'typing')

    const response = await sendAIResponse(
      ctx.from.id.toString(),
      'asst_PeA6kj3k9LmspxDVRrnPa8ux', // Leela Chakra Assistant ID
      ctx.session.report,
      isRu ? 'ru' : 'en',
      ctx.session.fullName
    )

    await ctx.reply(response, { parse_mode: 'Markdown', ...step_callback })
    await ctx.deleteMessage(loader.message_id)

    return ctx.wizard.next()
  },
  async (ctx: MyContext) => {
    console.log('CASE 3: callback_query')
    const callbackQuery = ctx.callbackQuery
    if (callbackQuery && 'data' in callbackQuery) {
      const data = callbackQuery.data
      if (data === 'make_next_move') {
        console.log('CASE: 🎲 Сделать следующий ход')
        return ctx.scene.enter('rollDiceWizard')
      }
    } else {
      console.log('CASE: reportScene.leave.else')
      return ctx.scene.leave()
    }
  }
)

reportWizard.leave(ctx => {
  console.log('CASE: reportWizard.leave')
})
