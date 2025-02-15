import { Telegraf, Scenes } from 'telegraf'
import { MyContext } from './interfaces'

import { neuroQuestCommand } from './commands/neuroQuestCommand'

import { balanceCommand } from './commands/balanceCommand'

import {
  avatarWizard,
  textToVideoWizard,
  emailWizard,
  neuroPhotoWizard,
  imageToPromptWizard,
  improvePromptWizard,
  sizeWizard,
  textToImageWizard,
  imageToVideoWizard,
  cancelPredictionsWizard,
  trainFluxModelWizard,
  uploadTrainFluxModelScene,
  digitalAvatarBodyWizard,
  selectModelWizard,
  voiceAvatarWizard,
  textToSpeechWizard,
  paymentScene,
  levelQuestWizard,
  neuroCoderScene,
  lipSyncWizard,
  startScene,
  neuroQuestScene,
  chatWithAvatarWizard,
  helpScene,
  balanceScene,
  menuScene,
  subscriptionScene,
  inviteScene,
  makeNextMoveWizard,
  reportWizard,
  rollDiceWizard,
  getRuBillWizard,
} from './scenes'

import { setupLevelHandlers } from './handlers/setupLevelHandlers'

import { myComposer } from './hearsHandlers'

import { rubGetWizard } from './scenes/rubGetWizard'

import { get100Command } from './commands/get100Command'

export const stage = new Scenes.Stage<MyContext>([
  startScene,
  chatWithAvatarWizard,
  neuroQuestScene,
  menuScene,
  balanceScene,
  avatarWizard,
  imageToPromptWizard,
  emailWizard,
  textToImageWizard,
  improvePromptWizard,
  sizeWizard,
  neuroPhotoWizard,
  textToVideoWizard,
  imageToVideoWizard,
  cancelPredictionsWizard,
  trainFluxModelWizard,
  uploadTrainFluxModelScene,
  digitalAvatarBodyWizard,
  selectModelWizard,
  voiceAvatarWizard,
  textToSpeechWizard,
  paymentScene,
  neuroCoderScene,
  lipSyncWizard,
  helpScene,
  subscriptionScene,
  rubGetWizard,
  inviteScene,
  makeNextMoveWizard,
  reportWizard,
  rollDiceWizard,
  getRuBillWizard,
  ...levelQuestWizard,
])

export function registerCommands(bot: Telegraf<MyContext>) {
  setupLevelHandlers(bot as Telegraf<MyContext>)

  // Регистрация команд
  myComposer.command('start', async ctx => {
    console.log('CASE: start')
    await neuroQuestCommand(ctx)
  })

  myComposer.command('get100', async ctx => {
    console.log('CASE: get100')
    await get100Command(ctx)
  })

  myComposer.command('buy', async ctx => {
    console.log('CASE: buy')
    ctx.session.subscription = 'stars'
    await ctx.scene.enter('paymentScene')
  })

  myComposer.command('menu', async ctx => {
    console.log('CASE: myComposer.command menu')
    await ctx.scene.enter('menuScene')
  })

  myComposer.command('invite', async ctx => {
    console.log('CASE: invite')
    await ctx.scene.enter('inviteScene')
  })

  myComposer.command('balance', ctx => balanceCommand(ctx))

  myComposer.command('help', async ctx => {
    await neuroQuestCommand(ctx)
  })

  myComposer.command('neuro_coder', async ctx => {
    await ctx.scene.enter('neuroCoderScene')
  })

  // myComposer.on('text', (ctx: MyContext) => {
  //   console.log('CASE: text')
  //   handleTextMessage(ctx)
  // })
}
