import { Subscription } from '@/interfaces/supabase.interface'
import { supabase } from '.'

export const getReferalsCount = async (
  telegram_id: string
): Promise<{ count: number; subscription: Subscription }> => {
  try {
    // Сначала получаем UUID пользователя
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_id, subscription')
      .eq('telegram_id', telegram_id.toString())
      .single()

    if (userError) {
      console.error('Ошибка при получении user_id:', userError)
      return { count: 0, subscription: 'stars' }
    }

    // Теперь ищем рефералов по UUID
    const { data, error } = await supabase
      .from('users')
      .select('inviter')
      .eq('inviter', userData.user_id)

    if (error) {
      console.error('Ошибка при получении рефералов:', error)
      return { count: 0, subscription: 'stars' }
    }

    return {
      count: data?.length || 0,
      subscription: userData.subscription,
    }
  } catch (error) {
    console.error('Ошибка в getReferalsCount:', error)
    return {
      count: 0,
      subscription: 'stars',
    }
  }
}
