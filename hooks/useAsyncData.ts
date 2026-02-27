'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseAsyncDataResult<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * 비동기 데이터 페칭을 위한 통일된 훅.
 * 모든 페이지에서 일관된 loading/error/data 패턴을 강제합니다.
 *
 * @param fetchFn - 데이터를 가져오는 비동기 함수
 * @param deps - fetchFn을 다시 호출할 dependency 배열
 * @param options.enabled - false이면 fetch를 실행하지 않음 (기본: true)
 * @param options.initialData - 초기 데이터 값
 */
export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  deps: React.DependencyList = [],
  options?: { enabled?: boolean; initialData?: T }
): UseAsyncDataResult<T> {
  const enabled = options?.enabled ?? true
  const [data, setData] = useState<T | null>(options?.initialData ?? null)
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.'
      setError(message)
      console.error('[useAsyncData]', err)
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      return
    }
    execute()
  }, [execute, enabled])

  return { data, isLoading, error, refetch: execute }
}

/**
 * fetch API 호출 시 response.ok를 자동 검사하는 헬퍼.
 * JSON 파싱까지 포함합니다.
 */
export async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new Error(`요청 실패 (${response.status})`)
  }
  return response.json()
}
