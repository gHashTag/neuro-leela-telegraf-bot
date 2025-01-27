import { Scenes } from 'telegraf'
import { MyContext } from '../../interfaces'
import { createImagesZip } from '../../helpers/images/createImagesZip'
import { ensureSupabaseAuth } from '../../core/supabase'
import { createModelTraining } from '@/services/createModelTraining'
import { isRussian } from '@/helpers/language'
import { deleteFile } from '@/helpers'
import { sendGenericErrorMessage } from '@/menu'

export const uploadTrainFluxModelScene = new Scenes.BaseScene<MyContext>(
  'uploadTrainFluxModelScene'
)

uploadTrainFluxModelScene.enter(async ctx => {
  const isRu = isRussian(ctx)
  console.log('Scene: ZIP')
  try {
    await ctx.reply(isRu ? '⏳ Создаю архив...' : '⏳ Creating archive...')
    const zipPath = await createImagesZip(ctx.session.images)
    console.log('ZIP created at:', zipPath)

    await ensureSupabaseAuth()

    await ctx.reply(isRu ? '⏳ Загружаю архив...' : '⏳ Uploading archive...')

    const triggerWord = `${ctx.session.username.toLocaleUpperCase()}`
    if (!triggerWord) {
      await ctx.reply(
        isRu ? '❌ Некорректный trigger word' : '❌ Invalid trigger word'
      )
      return ctx.scene.leave()
    }

    await ctx.reply(
      isRu
        ? `⏳ Начинаю обучение модели...\n\nВаша модель будет натренирована через 3-6 часов. После завершения вы сможете проверить её работу, используя раздел "Модели" в Нейрофото.`
        : `⏳ Starting model training...\n\nYour model will be trained in 3-6 hours. Once completed, you can check its performance using the "Models" section in Neurophoto.`
    )

    await createModelTraining({
      filePath: zipPath,
      triggerWord,
      modelName: ctx.session.modelName,
      steps: ctx.session.steps,
      telegram_id: ctx.session.targetUserId.toString(),
      is_ru: isRu,
    })

    await deleteFile(zipPath)
  } catch (error) {
    console.error('Error in uploadTrainFluxModelScene:', error)
    await sendGenericErrorMessage(ctx, isRu, error)
  } finally {
    await ctx.scene.leave()
  }
})

export default uploadTrainFluxModelScene
