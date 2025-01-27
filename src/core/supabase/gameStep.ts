import { supabase } from '.'
import { GameStep as GameStepType } from '@/core/supabase/getLastStep'

export interface GameStepResultT {
  roll: number
  response: GameStepType[]
  telegram_id: string
}

export async function gameStep({
  roll,
  response,
  telegram_id,
}: GameStepResultT): Promise<GameStepType> {
  try {
    // Логирование данных перед обновлением
    console.log('Updating game with stepData:', response)

    const { data: existingGame, error: existingGameError } = await supabase
      .from('game')
      .select('telegram_id')
      .eq('telegram_id', telegram_id)
      .single()

    if (existingGameError) {
      throw new Error(existingGameError.message)
    }

    // Предположим, что response — это массив, и мы берем первый элемент
    const stepData = response[0]
    console.log('stepData', stepData)
    if (existingGame) {
      // Обновите существующую запись
      const { error: updateError } = await supabase
        .from('game')
        .update({
          roll: roll,
          loka: stepData.loka,
          previous_loka: stepData.previous_loka,
          direction: stepData.direction,
          consecutive_sixes: stepData.consecutive_sixes,
          position_before_three_sixes: stepData.position_before_three_sixes,
          is_finished: stepData.is_finished,
        })
        .eq('telegram_id', telegram_id)

      if (updateError) {
        throw new Error(updateError.message)
      }
    } else {
      // Вставьте новую запись
      const { error: insertError } = await supabase.from('game').insert({
        telegram_id: telegram_id,
        roll: roll,
        loka: stepData.loka,
        previous_loka: stepData.previous_loka,
        direction: stepData.direction,
        consecutive_sixes: stepData.consecutive_sixes,
        position_before_three_sixes: stepData.position_before_three_sixes,
        is_finished: stepData.is_finished,
      })

      if (insertError) {
        throw new Error(insertError.message)
      }
    }

    return stepData
  } catch (error) {
    console.error('Error in gameStep:', error)
    throw error
  }
}
