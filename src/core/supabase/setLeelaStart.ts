import { supabase } from '@/core/supabase'
import { MyContext } from '@/interfaces'

export const setLeelaStart = async (ctx: MyContext) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_leela_start: true })
      .eq('telegram_id', ctx.from.id.toString())
    if (error) {
      console.error('Ошибка при установке is_leela_start:', error)
      return false
    }
    return true
  } catch (error) {
    console.error('Ошибка при установке is_leela_start:', error)
    return false
  }
}
