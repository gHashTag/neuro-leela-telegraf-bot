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

<b>🎮 Игра Лила</b>
- Доступ к боту игры Нейро Лила и образовательному курсу
- Введение в основы игры Лила и ведической философии
- Доступ к 9-ти видеоурокам, объясняющим правила и символизм игры
- Практические упражнения для самопознания и духовного роста
- Поддержка в чате с единомышленниками
- Интеллектуальный ИИ помощник


<b>🕉 Игра в группе</b>
- Встреча длительностью 1,5 часа, где вы погрузитесь в мир Нейро Лила
- Испытайте уникальный игровой опыт, объединяющий ведическую философию и передовые технологии
- Развивайте когнитивные навыки через увлекательные и познавательные задания
- Учитесь через игру, погружаясь в элементы ведической культуры
- Получайте советы и подсказки от ИИ-помощника, чтобы улучшить свои результаты
- Присоединяйтесь к сообществу единомышленников и делитесь опытом

<b>⭐️ Ментор</b>
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

<b>🎮 Game Leela</b>
- Access to the bot and educational course
- Introduction to the basics of the Leela game and Vedantic philosophy
- Access to 9 video lessons explaining the rules and symbolism of the game
- Practical exercises for self-discovery and spiritual growth
- Support in the chat with like-minded people
- Intelligent AI assistant


<b>🕉 Game in group</b>
- Meeting duration of 1.5 hours, where you will immerse yourself in the world of Lilah
- Experience a unique gaming experience that combines Vedantic philosophy and advanced technologies
- Develop cognitive skills through engaging and educational tasks
- Learn through the game, immersing yourself in the elements of Vedantic culture
- Get tips and hints from the AI assistant to improve your results
- Join the community of like-minded people and share your experience


<b>⭐️ Mentor</b>  
- Individual sessions 1 on 1: four personal meetings with an experienced mentor who will help you develop your potential
- Personalized training, fully adapted to your unique goals and needs
- Interactive game with a mentor to apply knowledge and skills in real-life situations
- Flexible meeting schedule, which easily fits into your schedule
- Long-term results and development of a strategy for achieving your ambitious goals
- Interactive game with a mentor to apply knowledge and skills in real-life situations
- Flexible meeting schedule, which easily fits into your schedule
- Long-term results and development of a strategy for achieving your ambitious goals
`

    const inlineKeyboard = Markup.inlineKeyboard([
      [
        {
          text: isRu ? '🎮 Игра Лила' : '🎮 Game Leela',
          callback_data: 'game_leela',
        },
      ],
      [
        {
          text: isRu ? '🧠 Игра в группе' : '🕉 Game in group',
          callback_data: 'game_in_group',
        },
      ],
      [
        {
          text: isRu ? '🤖 Ментор' : '🤖 Mentor',
          callback_data: 'mentor_game',
        },
      ],
    ])

    await ctx.reply(message, {
      reply_markup: inlineKeyboard.reply_markup,
      parse_mode: 'HTML',
    })

    return ctx.wizard.next()
  },
  async ctx => {
    console.log('CASE: subscriptionScene.next')
    if ('callback_query' in ctx.update && 'data' in ctx.update.callback_query) {
      const text = ctx.update.callback_query.data
      console.log('text subscriptionScene.next!!!', text)
      if (text === 'game_leela') {
        console.log('CASE: 🎮 Игра Лила')
        ctx.session.subscription = 'game_leela'
        return ctx.scene.enter('paymentScene')
      } else if (text === 'game_in_group') {
        console.log('CASE: 🧠 НейроВстреча')
        ctx.session.subscription = 'game_in_group'
        return ctx.scene.enter('paymentScene')
      } else if (text === 'mentor_game') {
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
