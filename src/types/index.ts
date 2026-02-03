// Re-export all types
export * from './database'
export * from './strategy-config'
export * from './api'

// User types
export interface User {
  id: string
  email: string
  role: 'owner' | 'admin' | 'user'
  subscriptionTier: 'free' | 'basic' | 'pro' | 'premium'
  createdAt: string
}

// Strategy types
export interface Strategy {
  id: string
  userId: string
  name: string
  description?: string
  config: import('./strategy-config').FullStrategyConfig
  isActive: boolean
  createdAt: string
  updatedAt: string
}
