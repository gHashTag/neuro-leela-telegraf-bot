import { Markup, Scenes } from 'telegraf'
import md5 from 'md5'
import { MyContext, Subscription } from '../../interfaces'
import { saveUserEmail, setPayments } from '../../core/supabase'
import { isRussian } from '@/helpers'
import { MERCHANT_LOGIN, PASSWORD1, RESULT_URL2 } from '@/config'
import { handleHelpCancel } from '@/handlers'
import { updateUserSubscription } from '@/core/supabase/updateUserSubscription'

const merchantLogin = MERCHANT_LOGIN
const password1 = PASSWORD1

const description = 'Покупка звезд'

const paymentOptions: {
  amount: number
  stars: string
  subscription: Subscription
}[] = [
  { amount: 3333, stars: '3333', subscription: 'game_leela' },
  { amount: 6666, stars: '6666', subscription: 'game_in_group' },
  { amount: 66666, stars: '66666', subscription: 'mentor_game' },
]

const resultUrl2 = RESULT_URL2

function generateRobokassaUrl(
  merchantLogin: string,
  outSum: number,
  invId: number,
  description: string,
  password1: string
): string {
  const signatureValue = md5(
    `${merchantLogin}:${outSum}:${invId}:${encodeURIComponent(
      resultUrl2
    )}:${password1}`
  ).toUpperCase()
  const url = `https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=${merchantLogin}&OutSum=${outSum}&InvId=${invId}&Description=${encodeURIComponent(
    description
  )}&SignatureValue=${signatureValue}&ResultUrl2=${encodeURIComponent(
    resultUrl2
  )}`

  return url
}

async function getInvoiceId(
  merchantLogin: string,
  outSum: number,
  invId: number,
  description: string,
  password1: string
): Promise<string> {
  console.log('Start getInvoiceId rubGetWizard', {
    merchantLogin,
    outSum,
    invId,
    description,
    password1,
  })
  try {
    const signatureValue = md5(
      `${merchantLogin}:${outSum}:${invId}:${password1}`
    )
    console.log('signatureValue', signatureValue)

    const response = generateRobokassaUrl(
      merchantLogin,
      outSum,
      invId,
      description,
      password1
    )
    console.log('response', response)

    return response
  } catch (error) {
    console.error('Error in getInvoiceId:', error)
    throw error
  }
}

export const rubGetWizard = new Scenes.BaseScene<MyContext>('rubGetWizard')

rubGetWizard.enter(async ctx => {
  const isRu = isRussian(ctx)
  const email = ctx.session.email
  if (!email) {
    await ctx.reply(
      isRu
        ? '👉 Для формирования счета напишите ваш E-mail.'
        : '👉 To generate an invoice, please provide your E-mail.',
      Markup.keyboard([Markup.button.text(isRu ? 'Отмена' : 'Cancel')]).resize()
    )
  } else {
    return ctx.wizard.next()
  }
})

const subscriptionTitles = (isRu: boolean) => ({
  game_leela: isRu ? '📚 Игра Лила' : '📚 Game Leela',
  game_in_group: isRu ? '🧠 Игра в группе' : '🧠 Game in group',
  mentor_game: isRu ? '🤖 Ментор' : '🤖 Mentor',
})

rubGetWizard.hears(/@/, async ctx => {
  const isRu = isRussian(ctx)
  const email = ctx.message.text

  try {
    if (!ctx.from) {
      throw new Error('User not found')
    }
    ctx.session.email = email
    await saveUserEmail(ctx.from.id.toString(), email)
    await ctx.reply(
      isRu
        ? 'Ваш e-mail успешно сохранен'
        : 'Your e-mail has been successfully saved',
      Markup.removeKeyboard()
    )

    const buttons = paymentOptions.map(option => [
      isRu
        ? `Купить ${subscriptionTitles(isRu)[option.subscription]}⭐️ за ${
            option.amount
          } р`
        : `Buy ${subscriptionTitles(isRu)[option.subscription]}⭐️ for ${
            option.amount
          } RUB`,
    ])

    const keyboard = Markup.keyboard(buttons).resize()

    await ctx.reply(
      isRu ? 'Выберите сумму для оплаты:' : 'Choose the amount for payment:',
      {
        reply_markup: keyboard.reply_markup,
      }
    )
  } catch (error) {
    await ctx.reply(
      isRu
        ? 'Ошибка при сохранении e-mail. Пожалуйста, попробуйте снова.'
        : 'Error saving e-mail. Please try again.'
    )
  }
})

rubGetWizard.on('text', async ctx => {
  const isRu = isRussian(ctx)
  const msg = ctx.message

  if (msg && 'text' in msg) {
    const selectedOption = msg.text
    const isCancel = await handleHelpCancel(ctx)
    if (isCancel) {
      return ctx.scene.leave()
    }
    const selectedPayment = paymentOptions.find(option =>
      selectedOption.includes(option.amount.toString())
    )

    if (selectedPayment) {
      const email = ctx.session.email
      const stars = selectedPayment.amount

      const subscription = selectedPayment.subscription

      try {
        const userId = ctx.from?.id
        const invId = Math.floor(Math.random() * 1000000)

        // Получение invoiceID
        const invoiceURL = await getInvoiceId(
          merchantLogin,
          stars,
          invId,
          description,
          password1
        )

        // Сохранение платежа со статусом PENDING
        await setPayments({
          user_id: userId.toString(),
          OutSum: stars.toString(),
          InvId: invId.toString(),
          currency: 'STARS',
          stars,
          status: 'PENDING',
          email: email,
          payment_method: 'Telegram',
          subscription: subscription,
        })

        // Обновление подписки пользователя
        await updateUserSubscription(userId.toString(), subscription)

        console.log('invoiceURL', invoiceURL)

        const inlineKeyboard = [
          [
            {
              text: isRu
                ? `Купить ${
                    subscriptionTitles(isRu)[subscription]
                  } за ${stars} р.`
                : `Buy ${
                    subscriptionTitles(isRu)[subscription]
                  } for ${stars} RUB.`,
              web_app: {
                url: invoiceURL,
              },
            },
          ],
          [
            {
              text: isRu ? 'Отмена' : 'Cancel',
              callback_data: 'cancel',
            },
          ],
        ]
        const isCancel = await handleHelpCancel(ctx)
        if (isCancel) {
          return ctx.scene.leave()
        }

        await ctx.reply(
          isRu
            ? `<b>🤑 Подписка ${subscriptionTitles(isRu)[subscription]}</b>
            \nВ случае возникновения проблем с оплатой, пожалуйста, свяжитесь с нами @neuro_sage`
            : `<b>🤑 Subscription ${subscriptionTitles(isRu)[subscription]}</b>
            \nIn case of payment issues, please contact us @neuro_sage`,
          {
            reply_markup: {
              inline_keyboard: inlineKeyboard,
            },
            parse_mode: 'HTML',
          }
        )
      } catch (error) {
        console.error('Error in creating payment:', error)
        await ctx.reply(
          isRu
            ? 'Ошибка при создании чека. Пожалуйста, попробуйте снова.'
            : 'Error creating invoice. Please try again.'
        )
      }
      return ctx.scene.leave()
    } else {
      await ctx.reply(
        isRu
          ? 'Пожалуйста, выберите корректную сумму.'
          : 'Please select a valid amount.'
      )
    }
  }
})

export default rubGetWizard
