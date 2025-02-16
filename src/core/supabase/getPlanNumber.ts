import { supabase } from './'
import { startNewGame } from './startNewGame'
import { isRussian } from '@/helpers'
import { MyContext } from '@/interfaces'
export async function getPlanNumber(
  telegram_id: string,
  ctx: MyContext
): Promise<{ loka: number; gameSteps: number } | null> {
  try {
    // Получаем количество записей
    const { count, error: countError } = await supabase
      .from('game')
      .select('*', { count: 'exact', head: true })
      .eq('telegram_id', telegram_id)

    if (countError) {
      console.error('Ошибка при подсчете записей игры:', countError)
      return null
    }

    // Получаем последнюю запись
    const { data, error } = await supabase
      .from('game')
      .select('loka')
      .eq('telegram_id', telegram_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const isRu = isRussian(ctx)

    if (error) {
      console.error('Ошибка при получении последней записи игры:', error)
      await startNewGame(telegram_id, ctx.from?.username || '', isRu)
      return {
        loka: 68,
        gameSteps: 0,
      }
    }

    if (!data) {
      console.error('Данные не найдены для telegram_id:', telegram_id)
      await startNewGame(telegram_id, ctx.from?.username || '', isRu)
      return {
        loka: 68,
        gameSteps: 0,
      }
    }
    return {
      loka: data.loka,
      gameSteps: count || 0,
    }
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error)
    return null
  }
}
