import { Scenes } from 'telegraf'
import { MyContext } from '../../interfaces'
import {
  getUserByTelegramId,
  getLastStep,
  getPlan,
  gameStep,
  updateUser,
} from '@/core/supabase'
import { isRussian } from '@/helpers'

export const makeNextMoveScene = new Scenes.BaseScene<MyContext>(
  'makeNextMoveScene'
)

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

makeNextMoveScene.enter(async ctx => {
  if (!ctx.from?.id) {
    console.error('Telegram id not found')
    return
  }

  console.log('step...')
  const roll = Math.floor(Math.random() * 6) + 1
  console.log('roll', roll)
  const isRu = isRussian(ctx)
  ctx.reply(isRu ? `🎲 Вы бросили ${roll}` : `🎲 You rolled ${roll}`)

  const user = await getUserByTelegramId(ctx.from.id.toString())
  if (!user) {
    console.error('User not found')
    return
  }
  const fullName = user.first_name + ' ' + user.last_name

  ctx.session.fullName = fullName

  const subscription = user.subscription || 'stars'
  console.log('subscription', subscription)

  if (subscription === 'stars' && user.first_request) {
    await ctx.reply(
      isRu
        ? '🔒 Вы не подписаны на какой-либо уровень. Подписка неактивна. \n\n/buy - выбери уровень и оформляй подписку'
        : '🔒 You are not subscribed to any level. The subscription is inactive. \n\n/buy - select a level and subscribe'
    )
    return
  }

  if (user.is_write) {
    console.log('user', user)
    const step = await getLastStep(user.telegram_id, isRu)
    console.log('step', step)
    if (!step) {
      console.error('No last step found')
      return
    }

    const plan = await getPlan(step.loka, isRu)
    console.log('plan', plan)
    const stepDirection = directionMap[step.direction.toLowerCase()]
    console.log('1 stepDirection', stepDirection)
    if (!stepDirection) {
      console.error('Invalid direction:', step.direction)
      await ctx.reply(
        isRu
          ? 'Произошла ошибка: неверное направление.'
          : 'An error occurred: invalid direction.'
      )
      return
    }
    const directionText = stepDirection[isRu ? 'ru' : 'en']
    console.log('directionText', directionText)
    if (!directionText) {
      console.error(
        'Direction text is undefined for language:',
        isRu ? 'ru' : 'en'
      )
      return
    }

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

    console.log('wait report')
    await ctx.scene.enter('reportWizard')
    return
  }

  const lastStep = await getLastStep(user.user_id.toString(), isRu)
  console.log('lastStep', lastStep)
  const step = await gameStep({
    roll: roll,
    response: [lastStep],
    telegram_id: ctx.from.id.toString(),
  })
  console.log('step', step)

  const plan = await getPlan(step.loka, isRu)
  const stepDirection = directionMap[step.direction.toLowerCase()]
  console.log('2 stepDirection', stepDirection)
  if (!stepDirection) {
    console.error('Invalid direction:', step.direction)
    await ctx.reply(
      isRu
        ? 'Произошла ошибка: неверное направление.'
        : 'An error occurred: invalid direction.'
    )
    return
  }
  const directionText = stepDirection[isRu ? 'ru' : 'en']
  console.log('directionText', directionText)
  if (!directionText) {
    console.error(
      'Direction text is undefined for language:',
      isRu ? 'ru' : 'en'
    )
    return
  }

  const text = isRu
    ? `<b>🔮 Вы перешли на план ${step.loka}, выбросив на кубике ${roll} - ${plan.name} - ${directionText}</b>
    
    <i>📜 Прочитайте план, напишите отчет, и получите духовную мудрость от гуру ИИ🤖</i>
    
    ${plan.short_desc}
    
    <b>‼️ Для написания отчета обязательно ответьте на это сообщение, иначе игра не продолжится.</b>`
    : `<b>🔮 You have moved to plan ${step.loka}, rolling a ${roll} on the dice - ${plan.name} - ${directionText}</b>
    
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
    await ctx.reply(text, {
      parse_mode: 'HTML',
      reply_markup: { force_reply: true },
    })
  }

  await updateUser(ctx.from.id.toString(), {
    is_write: true,
    first_request: true,
  })

  console.log('wait report')
  await ctx.scene.enter('reportScene')
})

makeNextMoveScene.leave(ctx => {
  console.log('CASE: makeNextMoveScene.leave')
})
