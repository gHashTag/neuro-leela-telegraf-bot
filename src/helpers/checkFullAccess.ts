export const checkFullAccess = (subscription: string): boolean => {
  const fullAccessSubscriptions = [
    'neurotester',
    'game_leela',
    'game_in_group',
    'mentor_game',
  ]
  return fullAccessSubscriptions.includes(subscription)
}
