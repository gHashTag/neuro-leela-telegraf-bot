import { Scenes } from 'telegraf'
import { updateUser, updateHistory } from '@/core/supabase'
import { MyContext } from '@/interfaces'
import { isRussian } from '@/helpers'
import { CallbackQuery } from 'telegraf/typings/core/types/typegram'

export const reportWizard = new Scenes.WizardScene<MyContext>(
  'reportWizard',
  async ctx => {
    console.log('CASE 1: reportWizard.next')
    const isRu = isRussian(ctx)
    const report = ctx.session.report

    const loader = await ctx.reply(isRu ? '🔮 Загрузка...' : '🔮 Loading...')
    await ctx.telegram.sendChatAction(ctx.from.id, 'typing')

    const step_callback = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎲', callback_data: `make_next_move` }],
          [
            {
              text: 'Gameboard',
              web_app: {
                url: `https://leela-chakra-nextjs.vercel.app/gameboard`,
              },
            },
          ],
        ],
      },
    }

    if (!ctx.from?.username) throw new Error('User not found')
    if (!ctx.chat?.id) throw new Error('Chat not found')

    await ctx.telegram.sendChatAction(ctx.from.id, 'typing')

    const response = await updateHistory({
      fullName: ctx.session.fullName,
      telegram_id: ctx.from.id.toString(),
      username: ctx.from.username || '',
      language_code: ctx.from.language_code || 'ru',
      content: report,
    })
    console.log('response', response)

    await updateUser(ctx.from.id.toString(), { is_write: false })

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
        return ctx.scene.enter('makeNextMoveWizard')
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
