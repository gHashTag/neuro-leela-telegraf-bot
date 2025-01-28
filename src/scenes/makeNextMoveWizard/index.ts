import { Scenes } from 'telegraf'
import { MyContext, MyTextMessageContext } from '../../interfaces'
import { isRussian } from '@/helpers'
import { sendGameStep } from '@/services/sendGameStep'

export const makeNextMoveWizard = new Scenes.WizardScene<MyContext>(
  'makeNextMoveWizard',
  async ctx => {
    console.log('CASE 1: makeNextMoveWizard.next')
    const isRu = isRussian(ctx)
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
      await ctx.replyWithPhoto(
        `https://yuukfqcsdhkyxegfwlcb.supabase.co/storage/v1/object/public/leelachakra/plans/${gameStep.loka}.jpg`
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
