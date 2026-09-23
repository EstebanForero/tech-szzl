export const operations = [
  { id: 'add', label: 'Add', symbol: '+', description: 'Add two numbers', group: 'basic' },
  { id: 'subtract', label: 'Subtract', symbol: '−', description: 'Find the difference', group: 'basic' },
  { id: 'multiply', label: 'Multiply', symbol: '×', description: 'Multiply two numbers', group: 'basic' },
  { id: 'divide', label: 'Divide', symbol: '÷', description: 'Divide one number by another', group: 'basic' },
  { id: 'power', label: 'Power', symbol: 'xʸ', description: 'Raise a number to a power', group: 'advanced' },
  { id: 'sqrt', label: 'Square root', symbol: '√', description: 'Find a square root', group: 'advanced' },
  { id: 'percent', label: 'Percentage', symbol: '%', description: 'Find a percentage of a number', group: 'advanced' },
] as const

export type Operation = (typeof operations)[number]['id']

export function getOperation(id: Operation) {
  return operations.find((operation) => operation.id === id)!
}
