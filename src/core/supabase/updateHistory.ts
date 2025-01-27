import { supabase, getAiFeedbackFromSupabase, getLastStep, getPlan } from './'

export async function updateHistory({
  fullName,
  telegram_id,
  username,
  language_code,
  content,
}: {
  fullName: string
  telegram_id: string
  username: string
  language_code: string
  content: string
}) {
  console.log('CASE: updateHistory')
  const isRu = language_code === 'ru'

  const lastStep = await getLastStep(telegram_id, isRu)
  console.log('lastStep', lastStep)
  const lastPlan = await getPlan(lastStep.loka, isRu)
  console.log('lastPlan', lastPlan)
  const query = `the user must analyze this text: ${lastPlan}
  here is his analysis of the text: ${content}
  you need to respond in his language to his text analysis.`

  const { ai_response } = await getAiFeedbackFromSupabase({
    assistantId: 'asst_PeA6kj3k9LmspxDVRrnPa8ux',
    prompt: query,
    language_code,
    fullName,
  })
  console.log(ai_response, 'ai_response')
  console.log(lastStep, 'lastStep')
  // Внести данные в таблицу history
  const { data, error } = await supabase.from('report').insert({
    telegram_id,
    username,
    language_code,
    content,
    ai_response,
  })
  console.log(data, 'data')
  if (error) {
    throw new Error(error.message)
  }

  return ai_response
}
