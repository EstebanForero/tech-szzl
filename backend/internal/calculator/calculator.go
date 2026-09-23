package calculator

import (
	"math"
)

type Operation string

const (
	Add        Operation = "add"
	Subtract   Operation = "subtract"
	Multiply   Operation = "multiply"
	Divide     Operation = "divide"
	Power      Operation = "power"
	SquareRoot Operation = "sqrt"
	Percent    Operation = "percent"
)

type Service struct{}

func NewService() *Service { return &Service{} }

func (s *Service) Calculate(operation Operation, operands []float64) (float64, error) {
	want := 2
	switch operation {
	case Add, Subtract, Multiply, Divide, Power, Percent:
	case SquareRoot:
		want = 1
	default:
		return 0, &InvalidOperationError{Operation: operation}
	}
	if len(operands) != want {
		return 0, &InvalidOperandsError{Reason: "incorrect number of operands"}
	}
	for _, operand := range operands {
		if math.IsNaN(operand) || math.IsInf(operand, 0) {
			return 0, &InvalidOperandsError{Reason: "operands must be finite numbers"}
		}
	}

	a := operands[0]
	var result float64
	switch operation {
	case Add:
		result = a + operands[1]
	case Subtract:
		result = a - operands[1]
	case Multiply:
		result = a * operands[1]
	case Divide:
		if operands[1] == 0 {
			return 0, &DivisionByZeroError{}
		}
		result = a / operands[1]
	case Power:
		result = math.Pow(a, operands[1])
	case SquareRoot:
		if a < 0 {
			return 0, &InvalidOperandsError{Reason: "square root requires a non-negative operand"}
		}
		result = math.Sqrt(a)
	case Percent:
		result = a / 100 * operands[1]
	}
	if math.IsNaN(result) || math.IsInf(result, 0) {
		return 0, &InvalidResultError{}
	}
	return result, nil
}
