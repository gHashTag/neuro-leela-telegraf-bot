import { Scenes } from 'telegraf'
import { MyContext, MyTextMessageContext } from '../../interfaces'
import { isRussian } from '@/helpers'
import { sendGameStep } from '@/services/sendGameStep'

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
    console.log('CASE 1: makeNextMoveWizard.next')
    const isRu = isRussian(ctx)
    console.log('isRu', isRu)
    const { gameStep, plan, direction } = await sendGameStep(
      ctx.session.roll,
      ctx.from.id.toString(),
      ctx,
      isRu
    )

    if (!gameStep.loka) {
      throw new Error('No loka found')
    }

    const text =
      gameStep.loka === 68
        ? isRu
          ? `<b>🔮 Игра начинается и заканчивается на этом плане сознания.</b>

        <i>🎲 Чтобы начать игру или вернуться в нее, нужно выбросить на костях цифру 6.</i>

        ${plan.short_desc}`
          : `<b>🔮 The game starts and ends on this plane of consciousness.</b>
        <i>🎲 To start the game or return to it, you need to roll a 6 on the dice 🎲.</i>

        ${plan.short_desc}`
        : isRu
        ? `<b>🔮 Вы стоите на плане ${gameStep.loka} - ${plan.name} - ${direction}</b>

        <i>📜 Прочитайте план, напишите отчет, и получите духовную мудрость от гуру ИИ🤖</i>

        ${plan.short_desc}

        <b>‼️ Для написания отчета обязательно ответьте на это сообщение, иначе игра не продолжится.</b>`
        : `<b>🔮 You are standing on plan ${gameStep.loka} - ${plan.name} - ${direction}</b>

        <i>📜 Read the plan, write a report, and receive spiritual wisdom from the AI guru 🤖</i>

        ${plan.short_desc}

        <b>‼️ To write the report, you must reply to this message, otherwise the game will not continue.</b>`

    if (gameStep.loka) {
      console.log('direction', direction)
      if (direction) {
        const lowerCaseDirection = direction.toLowerCase()
        console.log('lowerCaseDirection', lowerCaseDirection)
        const directionEntry = directionMap[lowerCaseDirection]
        console.log('directionEntry', directionEntry)
        if (directionEntry) {
          await ctx.reply(isRu ? directionEntry.ru : directionEntry.en)
        } else {
          await ctx.reply(
            isRu ? 'Неизвестное направление' : 'Unknown direction'
          )
        }
      } else {
        await ctx.reply(
          isRu ? 'Направление не задано' : 'Direction not provided'
        )
      }
      await ctx.replyWithPhoto(
        `${process.env.SUPABASE_URL}/storage/v1/object/public/leelachakra/plans/${gameStep.loka}.jpg`
      )
      await ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: { force_reply: true },
      })
    } else {
      await ctx.reply(text, { parse_mode: 'HTML' })
    }

    return ctx.wizard.next()
  },
  async (ctx: MyTextMessageContext) => {
    console.log('CASE 2: makeNextMoveWizard.next')
    const isRu = isRussian(ctx)

    const report = ctx.message?.text

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
