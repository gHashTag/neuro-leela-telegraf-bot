import { supabase } from '.'

export async function getPlan(loka: number, isRu: boolean) {
  console.log('getPlan', loka, isRu)
  try {
    // Получить строку данных из таблицы по loka
    const language = isRu ? 'ru' : 'en'
    const name = isRu ? 'name_ru' : 'name'
    const { data, error }: any = await supabase
      .from('plans')
      .select(`short_desc_${language}, image, ${name}`)
      .eq('loka', loka)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return {
      short_desc: data[`short_desc_${language}`],
      image: data.image,
      name: data[name],
    }
  } catch (error) {
    console.log(error, 'error')
  }
}
