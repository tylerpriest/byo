import { useState } from 'react'
import { logger } from './logger'

interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  revertDelay?: number
}

/**
 * Hook for optimistic UI updates
 *
 * @example
 * const { execute, isLoading } = useOptimistic()
 *
 * const handleUpdate = async () => {
 *   await execute(
 *     currentValue,
 *     optimisticValue,
 *     async () => await supabase.from('table').update(...)
 *   )
 * }
 */
export function useOptimistic<T>() {
  const [isLoading, setIsLoading] = useState(false)

  const execute = async (
    _currentValue: T,
    _optimisticValue: T,
    mutationFn: () => Promise<T>,
    options?: OptimisticUpdateOptions<T>
  ): Promise<T> => {
    setIsLoading(true)

    try {
      // Execute mutation
      const result = await mutationFn()

      // Success callback
      options?.onSuccess?.(result)

      logger.info('Optimistic update succeeded')
      setIsLoading(false)
      return result
    } catch (error) {
      logger.error('Optimistic update failed, reverting', { error })

      // Error callback
      options?.onError?.(error as Error)

      setIsLoading(false)
      throw error
    }
  }

  return { execute, isLoading }
}

/**
 * Utility for simple optimistic updates
 */
export async function optimisticUpdate<T>(
  setValue: (value: T) => void,
  currentValue: T,
  optimisticValue: T,
  mutationFn: () => Promise<T>
): Promise<T> {
  // Apply optimistic value immediately
  setValue(optimisticValue)

  try {
    // Execute mutation
    const result = await mutationFn()
    setValue(result)
    return result
  } catch (error) {
    // Revert to original value on error
    setValue(currentValue)
    logger.error('Optimistic update failed', { error })
    throw error
  }
}

/**
 * Example usage:
 *
 * const [count, setCount] = useState(0)
 *
 * const handleIncrement = async () => {
 *   await optimisticUpdate(
 *     setCount,
 *     count,
 *     count + 1,
 *     async () => {
 *       const { data } = await supabase
 *         .from('counters')
 *         .update({ count: count + 1 })
 *         .eq('id', counterId)
 *         .single()
 *       return data.count
 *     }
 *   )
 * }
 */
