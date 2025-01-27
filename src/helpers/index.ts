console.log('Environment check:', {
  nodeEnv: process.env.NODE_ENV,
})

export const isDev = process.env.NODE_ENV === 'development'
console.log('isDev', isDev)

export * from './pulse'
export * from './deleteFile'
export * from './language'
export * from './images'
export * from './delay'
export * from './ensureDirectoryExistence'
