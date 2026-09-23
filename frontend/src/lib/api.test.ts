import { describe, expect, it, vi } from 'vitest'
import { ApiError, createCalculatorClient } from './api'

describe('calculator API client', () => {
  it('posts a typed calculation and returns the result', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ result: 10 }) })
    const client = createCalculatorClient(fetcher)
    await expect(client.calculate('percent', [20, 50])).resolves.toBe(10)
    expect(fetcher).toHaveBeenCalledWith('/api/v1/calculate', expect.objectContaining({ method: 'POST', body: JSON.stringify({ operation: 'percent', operands: [20, 50] }) }))
  })

  it('exposes a backend validation error', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: { code: 'division_by_zero', message: 'cannot divide by zero' } }) })
    await expect(createCalculatorClient(fetcher).calculate('divide', [2, 0])).rejects.toEqual(new ApiError('division_by_zero', 'cannot divide by zero'))
  })

  it('reports network failures and invalid results', async () => {
    await expect(createCalculatorClient(vi.fn().mockRejectedValue(new Error('offline'))).calculate('add', [1, 2])).rejects.toMatchObject({ code: 'network_error' })
    await expect(createCalculatorClient(vi.fn().mockResolvedValue({ ok: true, json: async () => ({ result: '3' }) })).calculate('add', [1, 2])).rejects.toMatchObject({ code: 'invalid_response' })
  })
})
