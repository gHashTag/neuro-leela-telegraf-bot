import bot from '@/core/bot'

export const errorMessage = (
  error: Error,
  telegram_id: string,
  isRu: boolean
) => {
  bot.telegram.sendMessage(
    telegram_id,
    isRu
      ? `❌ Произошла ошибка.\n\nОшибка: ${error.message}`
      : `❌ An error occurred.\n\nError: ${error.message}`
  )
}
