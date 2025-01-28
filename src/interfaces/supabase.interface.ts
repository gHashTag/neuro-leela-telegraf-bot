export interface CreateUserData {
  username: string
  telegram_id: string
  first_name: string
  last_name: string
  is_bot: boolean
  language_code: string
  photo_url: string
  chat_id: number
  mode: string
  model: string
  count: number
  aspect_ratio: string
  balance: number
  inviter: string | null
  token: string | null
}

export interface ModelTraining {
  model_name: string
  trigger_word: string
  model_url: string
}
export type Subscription =
  | 'game_leela'
  | 'game_in_group'
  | 'mentor_game'
  | 'neurotester'
  | 'stars'

export type GameStep = {
  loka: number
  is_finished: boolean
  consecutive_sixes: number
  previous_loka: number
  position_before_three_sixes: number
  direction: string
}
