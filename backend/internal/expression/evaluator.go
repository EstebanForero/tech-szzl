package expression

import "calculator/backend/internal/calculator"

type Calculator interface {
	Calculate(operation calculator.Operation, operands []float64) (float64, error)
}

type Evaluator struct{ calculator Calculator }

func NewEvaluator(service Calculator) *Evaluator { return &Evaluator{calculator: service} }

func (e *Evaluator) Evaluate(source string) (float64, error) {
	if len(source) > 1024 {
		return 0, syntaxAt(source, 1024, "expression is too long")
	}
	tokens, err := tokenize(source)
	if err != nil {
		return 0, err
	}
	tree, err := parse(tokens)
	if err != nil {
		return 0, err
	}
	return tree.evaluate(e.calculator)
}

func (n *node) evaluate(service Calculator) (float64, error) {
	if n.kind == tokenNumber {
		return n.value, nil
	}
	var left float64
	if n.left != nil {
		value, err := n.left.evaluate(service)
		if err != nil {
			return 0, err
		}
		left = value
	}
	if n.kind == tokenSquareRoot {
		return service.Calculate(calculator.SquareRoot, []float64{left})
	}
	if n.kind == tokenPercent {
		return service.Calculate(calculator.Percent, []float64{left})
	}
	right, err := n.right.evaluate(service)
	if err != nil {
		return 0, err
	}
	switch n.kind {
	case tokenPlus:
		if n.left == nil {
			return right, nil
		}
		return service.Calculate(calculator.Add, []float64{left, right})
	case tokenMinus:
		return service.Calculate(calculator.Subtract, []float64{left, right})
	case tokenMultiply:
		return service.Calculate(calculator.Multiply, []float64{left, right})
	case tokenDivide:
		return service.Calculate(calculator.Divide, []float64{left, right})
	case tokenPower:
		return service.Calculate(calculator.Power, []float64{left, right})
	default:
		panic("unreachable expression node")
	}
}
