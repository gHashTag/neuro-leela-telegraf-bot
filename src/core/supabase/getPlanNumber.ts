import { supabase } from './'

export async function getPlanNumber(
  telegram_id: string
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

    if (error) {
      console.error('Ошибка при получении последней записи игры:', error)
      return null
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
