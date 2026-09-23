export interface CalculatorClient {
  evaluate(expression: string): Promise<number>
}

export class ApiError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export function createCalculatorClient(fetcher: typeof fetch = fetch): CalculatorClient {
  return {
    async evaluate(expression) {
      let response: Response
      try {
        response = await fetcher('/api/v1/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expression }),
        })
      } catch {
        throw new ApiError('network_error', 'Could not reach the calculator service. Check that the backend is running.')
      }

      let body: unknown
      try {
        body = await response.json()
      } catch {
        throw new ApiError('invalid_response', 'The calculator service returned an invalid response.')
      }
      if (!response.ok) {
        const error = isRecord(body) && isRecord(body.error) ? body.error : null
        throw new ApiError(
          typeof error?.code === 'string' ? error.code : 'request_failed',
          typeof error?.message === 'string' ? error.message : 'Calculation failed.',
        )
      }
      if (!isRecord(body) || typeof body.result !== 'number' || !Number.isFinite(body.result)) {
        throw new ApiError('invalid_response', 'The calculator service returned an invalid result.')
      }
      return body.result
    },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
