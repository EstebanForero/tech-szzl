import { describe, expect, it, vi } from 'vitest'
import { ApiError, createCalculatorClient } from './api'

describe('expression API client', () => {
  it('posts expression text and returns the result', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ result: 11 }) })
    await expect(createCalculatorClient(fetcher).evaluate('2 + 3 * (4 - 1)')).resolves.toBe(11)
    expect(fetcher).toHaveBeenCalledWith('/api/v1/evaluate', expect.objectContaining({ method: 'POST', body: JSON.stringify({ expression: '2 + 3 * (4 - 1)' }) }))
  })

  it('exposes a typed backend syntax error', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: { code: 'invalid_expression', message: 'expected a number at character 5' } }) })
    await expect(createCalculatorClient(fetcher).evaluate('2 + * 3')).rejects.toEqual(new ApiError('invalid_expression', 'expected a number at character 5'))
  })

  it('reports network failures and invalid results', async () => {
    await expect(createCalculatorClient(vi.fn().mockRejectedValue(new Error('offline'))).evaluate('2+3')).rejects.toMatchObject({ code: 'network_error' })
    await expect(createCalculatorClient(vi.fn().mockResolvedValue({ ok: true, json: async () => ({ result: '5' }) })).evaluate('2+3')).rejects.toMatchObject({ code: 'invalid_response' })
  })
})
