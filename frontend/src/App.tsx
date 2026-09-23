import { Calculator } from './components/calculator/Calculator'
import { createCalculatorClient } from './lib/api'

const client = createCalculatorClient()

export default function App() {
  return <Calculator client={client} />
}
