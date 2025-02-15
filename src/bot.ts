import dotenv from 'dotenv'
dotenv.config()

import { development, production } from './utils/launch'
import { subscriptionMiddleware } from '@/middlewares/subscription'
import { handleModelCallback } from './handlers'
import bot from './core/bot'
import { session, Middleware } from 'telegraf'
import { setBotCommands } from './setCommands'
import { registerCommands, stage } from './registerCommands'
import { handleCallback } from './handlers/handleCallback'
import { MyContext } from './interfaces'
import { myComposer } from './hearsHandlers'
import { NODE_ENV } from './config'
import { handlePaymentPolicyInfo } from './handlers/paymentHandlers/handlePaymentPolicyInfo'
import { handlePreCheckoutQuery } from './handlers/paymentHandlers/handlePreCheckoutQuery'
import { handleTopUp } from './handlers/paymentHandlers/handleTopUp'
import { handleSuccessfulPayment } from './handlers/paymentHandlers'
import { defaultSession } from './store'

if (NODE_ENV === 'development') {
  development(bot).catch(console.error)
} else {
  production(bot).catch(console.error)
}

bot.use(session({ defaultSession }))
bot.use(subscriptionMiddleware as Middleware<MyContext>)

bot.use(stage.middleware())

// Теперь регистрируйте команды и другие middleware
setBotCommands(bot)
registerCommands(bot)

console.log(`Starting bot in ${NODE_ENV} mode`)

bot.use(myComposer.middleware())

bot.action('callback_query', (ctx: MyContext) => {
  console.log('CASE: callback_query', ctx)
  handleCallback(ctx)
})

bot.action(/^select_model_/, async ctx => {
  console.log('CASE: select_model_', ctx.match)

  const model = ctx.match.input.replace('select_model_', '')
  ctx.session.selectedModel = model
  console.log('Selected model:', model)
  await handleModelCallback(ctx, model)
})

bot.action('payment_policy_info', handlePaymentPolicyInfo)
bot.action(/top_up_\d+/, handleTopUp)
bot.on('pre_checkout_query', handlePreCheckoutQuery)
bot.on('successful_payment', handleSuccessfulPayment)

bot.catch(err => {
  const error = err as Error
  console.error('Error:', error.message)
})

// Enable graceful stop
process.once('SIGINT', () => bot.stop())
process.once('SIGTERM', () => bot.stop())
