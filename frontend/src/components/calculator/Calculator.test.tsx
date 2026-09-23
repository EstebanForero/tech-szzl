import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Calculator } from './Calculator'

describe('Calculator', () => {
  it('sends a full expression and shows the answer and history', async () => {
    const evaluate = vi.fn().mockResolvedValue(11)
    render(<Calculator client={{ evaluate }} />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Expression'), '2 + 3 * (4 - 1)')
    await user.click(screen.getByRole('button', { name: /evaluate expression/i }))
    expect(evaluate).toHaveBeenCalledWith('2 + 3 * (4 - 1)')
    expect(await screen.findByText('11')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reuse 2 + 3 * (4 - 1)' })).toBeInTheDocument()
  })

  it('rejects an empty expression before calling the API', async () => {
    const evaluate = vi.fn()
    render(<Calculator client={{ evaluate }} />)
    await userEvent.setup().click(screen.getByRole('button', { name: /evaluate expression/i }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter an expression')
    expect(evaluate).not.toHaveBeenCalled()
  })

  it('loads an example and displays typed API errors', async () => {
    const evaluate = vi.fn().mockRejectedValue(new Error('cannot divide by zero'))
    render(<Calculator client={{ evaluate }} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /20% of 50/i }))
    expect(screen.getByLabelText('Expression')).toHaveValue('20% of 50')
    await user.click(screen.getByRole('button', { name: /evaluate expression/i }))
    expect(evaluate).toHaveBeenCalledWith('20% of 50')
    expect(await screen.findByRole('alert')).toHaveTextContent('cannot divide by zero')
    await user.click(screen.getByRole('button', { name: /clear/i }))
    expect(screen.getByLabelText('Expression')).toHaveValue('')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
