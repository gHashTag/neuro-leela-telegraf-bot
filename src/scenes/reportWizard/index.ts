import { Scenes } from 'telegraf'
import { updateUser, updateHistory } from '@/core/supabase'
import { MyContext } from '@/interfaces'
import { isRussian } from '@/helpers'

export const reportWizard = new Scenes.WizardScene<MyContext>(
  'reportWizard',
  async ctx => {
    console.log('Entering report scene')
    const isRu = isRussian(ctx)

    await ctx.reply(
      isRu
        ? '📝 Пожалуйста, напишите ваш отчёт.'
        : '📝 Please write your report.'
    )

    return ctx.wizard.next()
  },
  async ctx => {
    console.log('report')
    const isRu = isRussian(ctx)

    // Проверка, что сообщение является текстовым
    if (!ctx.message || !('text' in ctx.message)) {
      await ctx.reply(
        isRu
          ? '🔒 Пожалуйста, отправьте текстовый отчёт.'
          : '🔒 Please send a text report.'
      )
      return
    }

    const report = ctx.message.text

    if (report.length < 50) {
      await ctx.reply(
        isRu
          ? '🔒 Отчёт должен быть <b>длиннее 50 символов</b>.'
          : '🔒 Report must be <b>longer than 50 characters</b>.',
        {
          parse_mode: 'HTML',
        }
      )
      return
    }

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

    // После обработки отчета, можно покинуть сцену
    return ctx.wizard.next()
  },
  ctx => {
    console.log('CASE: callback_query')
    if ('callback_query' in ctx.update && 'data' in ctx.update.callback_query) {
      const text = ctx.update.callback_query.data
      console.log('1 text menuScene.next!!!', text)
      if (text === 'make_next_move') {
        console.log('CASE: 🎲 Сделать следующий ход')
        return ctx.scene.enter('makeNextMoveScene')
      }
    } else {
      console.log('CASE: reportScene.leave.else')
      return ctx.scene.leave()
    }
  }
)

reportWizard.on('message', async ctx => {
  console.log('CASE: reportWizard.on.message')
  const isRu = ctx.from?.language_code === 'ru'
  await ctx.reply(
    isRu
      ? '🔒 Пожалуйста, отправьте текстовый отчёт.'
      : '🔒 Please send a text report.'
  )
})
