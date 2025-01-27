import { MyContext } from '@/interfaces'
import { getReferalsCount, setAspectRatio } from '@/core/supabase'
import { isRussian } from '@/helpers/language'
import { mainMenu } from '@/menu'

export async function handleSizeSelection(ctx: MyContext, size: string) {
  ctx.session.selectedSize = size
  await setAspectRatio(ctx.from.id, size)
  const isRu = isRussian(ctx)
  await ctx.reply(
    isRu ? `✅ Вы выбрали размер: ${size}` : `✅ You selected size: ${size}`
  )
  const mode = ctx.session.mode
  if (mode === 'neuro_photo') {
    await ctx.scene.enter('neuroPhotoWizard')
  } else if (mode === 'text_to_image') {
    await ctx.scene.enter('textToImageWizard')
  } else {
    console.log('CASE: Неизвестный режим')
    const telegram_id = ctx.from?.id?.toString() || ''
    const { count, subscription } = await getReferalsCount(telegram_id)
    await mainMenu(isRu, count, subscription)
  }
}
