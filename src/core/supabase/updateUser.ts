import { supabase } from '.'

type User = {
  telegram_id: string
  is_write: boolean
  first_request: boolean
}

export async function updateUser(
  telegram_id: string,
  updates: Partial<User>
): Promise<void> {
  try {
    console.log('CASE: updateUser', updates)
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('telegram_id', telegram_id)
      .select('*')

    if (error) {
      throw new Error('Error updating user: ' + error.message)
    }

    if (!data) {
      throw new Error('No data returned from update')
    }
  } catch (error) {
    throw new Error('Error updateUser: ' + error)
  }
}
