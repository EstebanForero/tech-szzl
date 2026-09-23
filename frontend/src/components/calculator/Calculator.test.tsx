import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Calculator } from './Calculator'

describe('Calculator', () => {
  it('evaluates a typed mathematical expression', async () => {
    const evaluate = vi.fn().mockResolvedValue(11)
    render(<Calculator client={{ evaluate }} />)
    const user = userEvent.setup()
    const input = screen.getByLabelText('Expression')
    await user.type(input, '2 + 3 * (4 - 1){enter}')
    expect(evaluate).toHaveBeenCalledWith('2 + 3 * (4 - 1)')
    expect(await screen.findByText('11')).toBeInTheDocument()
    expect(input).toHaveFocus()
    await user.type(input, '+4')
    expect(input).toHaveValue('2 + 3 * (4 - 1)+4')
  })

  it('builds an expression with the keypad and evaluates it', async () => {
    const evaluate = vi.fn().mockResolvedValue(14)
    render(<Calculator client={{ evaluate }} />)
    const user = userEvent.setup()
    for (const key of ['2', '(', '3', '+', '4', ')']) {
      await user.click(screen.getByRole('button', { name: key === '+' ? 'Add' : key }))
    }
    expect(screen.getByLabelText('Expression')).toHaveValue('2(3+4)')
    await user.click(screen.getByRole('button', { name: 'Equals' }))
    expect(evaluate).toHaveBeenCalledWith('2(3+4)')
    expect(await screen.findByText('14')).toBeInTheDocument()
  })

  it('supports backspace and clear', async () => {
    render(<Calculator client={{ evaluate: vi.fn() }} />)
    const user = userEvent.setup()
    const input = screen.getByLabelText('Expression')
    await user.type(input, '12+3')
    await user.click(screen.getByRole('button', { name: 'Backspace' }))
    expect(input).toHaveValue('12+')
    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(input).toHaveValue('')
  })

  it('inserts a square root symbol as a single keypad operation', async () => {
    const evaluate = vi.fn().mockResolvedValue(3)
    render(<Calculator client={{ evaluate }} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Square root' }))
    await user.click(screen.getByRole('button', { name: '9' }))
    expect(screen.getByLabelText('Expression')).toHaveValue('√9')
    await user.click(screen.getByRole('button', { name: 'Equals' }))
    expect(evaluate).toHaveBeenCalledWith('√9')
  })

  it('validates empty input and displays API errors', async () => {
    const evaluate = vi.fn().mockRejectedValue(new Error('cannot divide by zero'))
    render(<Calculator client={{ evaluate }} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Equals' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter an expression')
    expect(evaluate).not.toHaveBeenCalled()
    await user.type(screen.getByLabelText('Expression'), '1÷0')
    await user.click(screen.getByRole('button', { name: 'Equals' }))
    expect(evaluate).toHaveBeenCalledWith('1÷0')
    expect(await screen.findByRole('alert')).toHaveTextContent('cannot divide by zero')
  })
})
