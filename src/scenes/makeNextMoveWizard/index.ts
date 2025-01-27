import { Scenes } from 'telegraf'
import { MyContext } from '../../interfaces'
import {
  getUserByTelegramId,
  getLastStep,
  getPlan,
  gameStep,
  updateUser,
  updateHistory,
} from '@/core/supabase'
import { isRussian } from '@/helpers'

const directionMap: { [key: string]: { ru: string; en: string } } = {
  'stop 🛑': { ru: 'Стоп 🛑', en: 'Stop 🛑' },
  'стоп 🛑': { ru: 'Стоп 🛑', en: 'Stop 🛑' },
  'arrow 🏹': { ru: 'Стрела 🏹', en: 'Arrow 🏹' },
  'стрела 🏹': { ru: 'Стрела 🏹', en: 'Arrow 🏹' },
  'snake 🐍': { ru: 'Змея 🐍', en: 'Snake 🐍' },
  'змея 🐍': { ru: 'Змея 🐍', en: 'Snake 🐍' },
  'win 🕉': { ru: 'Победа 🕉', en: 'Win 🕉' },
  'победа 🕉': { ru: 'Победа 🕉', en: 'Win 🕉' },
  'step 🚶🏼': { ru: 'Шаг 🚶🏼', en: 'Step 🚶🏼' },
  'шаг 🚶🏼': { ru: 'Шаг 🚶🏼', en: 'Step 🚶🏼' },
}

export const makeNextMoveWizard = new Scenes.WizardScene<MyContext>(
  'makeNextMoveWizard',
  async ctx => {
    console.log('CASE 0: makeNextMoveWizard.next')
    if (!ctx.from?.id) {
      console.error('Telegram id not found')
      return ctx.scene.leave()
    }

    const roll = Math.floor(Math.random() * 6) + 1
    const isRu = isRussian(ctx)
    await ctx.reply(isRu ? `🎲 Вы бросили ${roll}` : `🎲 You rolled ${roll}`)

    const user = await getUserByTelegramId(ctx.from.id.toString())
    if (!user) {
      console.error('User not found')
      return ctx.scene.leave()
    }

    ctx.session.fullName = `${user.first_name} ${user.last_name}`

    if (user.subscription === 'stars' && user.first_request) {
      await ctx.reply(
        isRu
          ? '🔒 Вы не подписаны на какой-либо уровень. Подписка неактивна. \n\n/buy - выбери уровень и оформляй подписку'
          : '🔒 You are not subscribed to any level. The subscription is inactive. \n\n/buy - select a level and subscribe'
      )
      return ctx.scene.leave()
    }

    const step = await getLastStep(user.telegram_id, isRu)
    if (!step) {
      console.error('No last step found')
      return ctx.scene.leave()
    }

    const plan = await getPlan(step.loka, isRu)
    const stepDirection = directionMap[step.direction.toLowerCase()]
    if (!stepDirection) {
      await ctx.reply(
        isRu
          ? 'Произошла ошибка: неверное направление.'
          : 'An error occurred: invalid direction.'
      )
      return ctx.scene.leave()
    }

    const directionText = stepDirection[isRu ? 'ru' : 'en']
    const text = isRu
      ? `<b>🔮 Вы стоите на плане ${step.loka} - ${plan.name} - ${directionText}</b>
        
        <i>📜 Прочитайте план, напишите отчет, и получите духовную мудрость от гуру ИИ🤖</i>
        
        ${plan.short_desc}
        
        <b>‼️ Для написания отчета обязательно ответьте на это сообщение, иначе игра не продолжится.</b>`
      : `<b>🔮 You are standing on plan ${step.loka} - ${plan.name} - ${directionText}</b>
        
        <i>📜 Read the plan, write a report, and receive spiritual wisdom from the AI guru 🤖</i>
        
        ${plan.short_desc}
        
        <b>‼️ To write the report, you must reply to this message, otherwise the game will not continue.</b>`

    if (plan.image) {
      await ctx.replyWithPhoto(plan.image, {
        caption: text,
        parse_mode: 'HTML',
        reply_markup: { force_reply: true },
      })
    } else {
      await ctx.reply(text, { parse_mode: 'HTML' })
    }

    return ctx.wizard.next()
  },
  async ctx => {
    console.log('CASE 1: makeNextMoveWizard.next')
    const isRu = isRussian(ctx)

    const report = ctx.message?.text
    console.log('report', report)

    if (!report || report.length < 50) {
      await ctx.reply(
        isRu
          ? '🔒 Отчёт должен быть <b>длиннее 50 символов</b>.'
          : '🔒 Report must be <b>longer than 50 characters</b>.',
        { parse_mode: 'HTML' }
      )
      return
    } else {
      console.log('ELSE report', report)
      ctx.session.report = report
      return ctx.scene.enter('reportWizard')
    }
  }
)

makeNextMoveWizard.leave(ctx => {
  console.log('CASE: makeNextMoveWizard.leave')
})
