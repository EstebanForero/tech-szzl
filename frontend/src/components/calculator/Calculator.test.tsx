import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Calculator } from './Calculator'

describe('Calculator', () => {
  it('sends operands to the client and shows the result', async () => {
    const calculate = vi.fn().mockResolvedValue(5)
    render(<Calculator client={{ calculate }} />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('First number'), '2')
    await user.type(screen.getByLabelText('Second number'), '3')
    await user.click(screen.getByRole('button', { name: /calculate/i }))
    expect(calculate).toHaveBeenCalledWith('add', [2, 3])
    expect(await screen.findByText('5')).toBeInTheDocument()
  })

  it('validates locally without calling the API', async () => {
    const calculate = vi.fn()
    render(<Calculator client={{ calculate }} />)
    await userEvent.setup().click(screen.getByRole('button', { name: /calculate/i }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter first number')
    expect(calculate).not.toHaveBeenCalled()
  })

  it('sends one operand for square root and surfaces service errors', async () => {
    const calculate = vi.fn().mockRejectedValue(new Error('Service unavailable'))
    render(<Calculator client={{ calculate }} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /square root/i }))
    expect(screen.queryByLabelText('Second number')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('Number'), '9')
    await user.click(screen.getByRole('button', { name: /calculate/i }))
    expect(calculate).toHaveBeenCalledWith('sqrt', [9])
    expect(await screen.findByRole('alert')).toHaveTextContent('Service unavailable')
  })
})
