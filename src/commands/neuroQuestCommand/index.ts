import { MyContext } from '../../interfaces'
import { startMenu } from '../../menu'

export async function neuroQuestCommand(ctx: MyContext) {
  console.log('CASE: neuroQuest')
  const isRu = ctx.from?.language_code === 'ru'
  console.log('🎮 Starting Neuro Quest for user:', ctx.from?.id)

  // Приветствие
  await ctx.replyWithPhoto(
    'https://yuukfqcsdhkyxegfwlcb.supabase.co/storage/v1/object/public/landingpage/avatars/playom/gaia_kamskaya.JPG',
    {
      caption: isRu
        ? `🎲 Добро пожаловать в игру самопознания "НейроЛила"!

🔮 Эта игра поможет вам:
• Понять свои внутренние стремления
• Найти ответы на важные вопросы
• Обрести гармонию и баланс

🧘‍♀️ Давайте начнем наше путешествие к самопознанию и откроем новые горизонты вашего сознания.

Готовы начать?`
        : `🎲 Welcome to the self-discovery game "NeuroLeela"!

🔮 This game will help you:
• Understand your inner desires
• Find answers to important questions
• Achieve harmony and balance

🧘‍♀️ Let's begin our journey to self-discovery and open new horizons of your consciousness.

Ready to start?`,
    }
  )
  await startMenu(ctx, isRu)
}
