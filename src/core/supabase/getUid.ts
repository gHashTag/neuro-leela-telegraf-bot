import { supabase } from '.'

export const getUid = async ({
  telegram_id,
}: {
  telegram_id: string | number
}): Promise<{
  user_id: string | null
  username: string | null
} | null> => {
  try {
    if (!telegram_id) {
      console.warn('No telegram_id provided to getUid')
      return null
    }

    const { data, error } = await supabase
      .from('users')
      .select('user_id, username, telegram_id')
      .eq('telegram_id', telegram_id.toString())

    console.log(data, 'data')

    if (error) {
      console.error('Error getting user_id:', error)
      return null
    }

    return {
      user_id: data?.[0]?.user_id || null,
      username: data?.[0]?.username || null,
    }
  } catch (error) {
    console.error('Error in getUid:', error)
    return null
  }
}
