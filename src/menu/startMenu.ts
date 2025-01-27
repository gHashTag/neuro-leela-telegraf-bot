import { MyContext } from '../interfaces'
import { Markup } from 'telegraf'

export async function startMenu(ctx: MyContext, isRu: boolean) {
  await ctx.reply(
    isRu ? 'Выберите действие в меню:' : 'Choose an action in the menu:',
    Markup.keyboard([
      [Markup.button.text(isRu ? '🏠 Главное меню' : '🏠 Main menu')],
      [
        Markup.button.text(isRu ? '💎 Пополнить баланс' : '💎 Top up balance'),
        Markup.button.text(isRu ? '🤑 Баланс' : '🤑 Balance'),
      ],
    ]).resize()
  )
}
