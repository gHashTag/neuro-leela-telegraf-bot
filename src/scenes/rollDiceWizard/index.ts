import { Scenes } from 'telegraf'
import { MyContext } from '../../interfaces'
import { getUserByTelegramId, setLeelaStart } from '@/core/supabase'
import { isRussian } from '@/helpers'

export const rollDiceWizard = new Scenes.WizardScene<MyContext>(
  'rollDiceWizard',
  async ctx => {
    console.log('CASE 0: rollDiceWizard.enter')
    await ctx.telegram.sendChatAction(ctx.from.id, 'typing')
    if (!ctx.from?.id) {
      console.error('Telegram id not found')
      return ctx.scene.leave()
    }

    const roll = Math.floor(Math.random() * 6) + 1
    ctx.session.roll = roll
    const isRu = isRussian(ctx)

    await ctx.reply(isRu ? `🎲 Вы бросили ${roll}` : `🎲 You rolled ${roll}`)

    const user = await getUserByTelegramId(ctx.from.id.toString())
    if (!user) {
      console.error('User not found')
      return ctx.scene.leave()
    } else {
      ctx.session.fullName = `${user.first_name} ${user.last_name}`
    }

    if (!user.is_leela_start && roll !== 6) {
      await ctx.reply(
        isRu
          ? '❌ Чтобы войти в игру, нужно выбросить 6. Попробуйте снова.'
          : '❌ To enter the game, you need to roll a 6. Please try again.',
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: isRu
                    ? '🎲 Бросить кость еще раз'
                    : '🎲 Roll the dice again',
                  callback_data: 'roll_dice',
                },
              ],
            ],
          },
        }
      )
      return ctx.wizard.selectStep(0) // Возвращаемся к первому шагу для повторного броска
    } else {
      await setLeelaStart(ctx)
      return ctx.scene.enter('makeNextMoveWizard')
    }
  }
)

rollDiceWizard.action('roll_dice', ctx => {
  ctx.scene.reenter() // Повторно входим в сцену, чтобы снова выполнить первый шаг
})
