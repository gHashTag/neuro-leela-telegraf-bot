import { Markup, Scenes } from 'telegraf'
import { MyContext } from '../../interfaces'
import { isRussian } from '@/helpers'

export const subscriptionScene = new Scenes.WizardScene<MyContext>(
  'subscriptionScene',
  async ctx => {
    console.log('CASE: subscriptionScene')
    const isRu = isRussian(ctx)
    const message = isRu
      ? `<b>💫 Для получения полного доступа ко всем функциям, выберите одну из предложенных месячных подписок:</b>

<b>🎮 Игра Лила - Цена 3333 ⭐️</b>
- Доступ к боту игры Нейро Лила и образовательному курсу
- Введение в основы игры Лила и ведической философии
- Доступ к 9-ти видеоурокам, объясняющим правила и символизм игры
- Практические упражнения для самопознания и духовного роста
- Поддержка в чате с единомышленниками
- Интеллектуальный ИИ помощник


<b>🕉 Игра в группе - Цена 6666 ⭐️</b>
- Встреча длительностью 1,5 часа, где вы погрузитесь в мир Нейро Лила
- Испытайте уникальный игровой опыт, объединяющий ведическую философию и передовые технологии
- Развивайте когнитивные навыки через увлекательные и познавательные задания
- Учитесь через игру, погружаясь в элементы ведической культуры
- Получайте советы и подсказки от ИИ-помощника, чтобы улучшить свои результаты
- Присоединяйтесь к сообществу единомышленников и делитесь опытом

<b>⭐️ Ментор - Цена 66666 ⭐️</b>
- Индивидуальные сессии 1 на 1: четыре персональные встречи с опытным ментором, который поможет вам раскрыть ваш потенциал
- Персонализированное обучение, полностью адаптированное под ваши уникальные цели и потребности
- Интерактивная игра с ментором для практического применения знаний и навыков в реальных ситуациях
- Гибкий график встреч, который легко впишется в ваш распорядок
- Долгосрочные результаты и разработка стратегии для достижения ваших амбициозных целей
- Интерактивная игра с ментором для практического применения знаний и навыков в реальных ситуациях
- Гибкий график встреч, который легко впишется в ваш распорядок
- Долгосрочные результаты и разработка стратегии для достижения ваших амбициозных целей
`
      : `<b>💫 To get full access to all functions, choose one of the proposed monthly subscriptions:</b>

<b>🎮 Game Leela - Price 3333 ⭐️</b>
- Access to the bot and educational course
- Introduction to the basics of the Leela game and Vedantic philosophy
- Access to 9 video lessons explaining the rules and symbolism of the game
- Practical exercises for self-discovery and spiritual growth
- Support in the chat with like-minded people
- Intelligent AI assistant


<b>🕉 Game in group - Price 6666 ⭐️</b>
- Meeting duration of 1.5 hours, where you will immerse yourself in the world of Lilah
- Experience a unique gaming experience that combines Vedantic philosophy and advanced technologies
- Develop cognitive skills through engaging and educational tasks
- Learn through the game, immersing yourself in the elements of Vedantic culture
- Get tips and hints from the AI assistant to improve your results
- Join the community of like-minded people and share your experience


<b>⭐️ Mentor - Price 66666 ⭐️</b>  
- Individual sessions 1 on 1: four personal meetings with an experienced mentor who will help you develop your potential
- Personalized training, fully adapted to your unique goals and needs
- Interactive game with a mentor to apply knowledge and skills in real-life situations
- Flexible meeting schedule, which easily fits into your schedule
- Long-term results and development of a strategy for achieving your ambitious goals
- Interactive game with a mentor to apply knowledge and skills in real-life situations
- Flexible meeting schedule, which easily fits into your schedule
- Long-term results and development of a strategy for achieving your ambitious goals
`

    const keyboard = Markup.keyboard([
      [Markup.button.text(isRu ? '🎮 Игра Лила' : '🎮 Game Leela')],
      [Markup.button.text(isRu ? '🧠 Игра в группе' : '🕉 Game in group')],
      [Markup.button.text(isRu ? '🤖 Ментор' : '🤖 Mentor')],
    ]).resize()

    await ctx.reply(message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'HTML',
    })
    return ctx.wizard.next()
  },
  async ctx => {
    console.log('CASE: subscriptionScene.next')
    if ('message' in ctx.update && 'text' in ctx.update.message) {
      const text = ctx.update.message.text
      console.log('text subscriptionScene.next!!!', text)
      const isRu = isRussian(ctx)
      if (text === (isRu ? '🎮 Игра Лила' : '🎮 Game Leela')) {
        console.log('CASE: 🎮 Игра Лила')
        ctx.session.subscription = 'game_leela'
        return ctx.scene.enter('paymentScene')
      } else if (text === (isRu ? '🧠 Игра в группе' : '🕉 Game in group')) {
        console.log('CASE: 🧠 НейроВстреча')
        ctx.session.subscription = 'game_in_group'
        return ctx.scene.enter('paymentScene')
      } else if (text === (isRu ? '🤖 Ментор' : '🤖 Mentor')) {
        console.log('CASE: 🤖 Ментор')
        ctx.session.subscription = 'mentor_game'
        return ctx.scene.enter('paymentScene')
      }
    } else {
      console.log('CASE: subscriptionScene.next - leave')
      return ctx.scene.leave()
    }
  }
)
