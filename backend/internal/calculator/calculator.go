package calculator

import (
	"errors"
	"fmt"
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

type ErrorCode string

const (
	InvalidOperation ErrorCode = "invalid_operation"
	InvalidOperands  ErrorCode = "invalid_operands"
	DivisionByZero   ErrorCode = "division_by_zero"
	InvalidResult    ErrorCode = "invalid_result"
)

type Error struct {
	Code    ErrorCode
	Message string
}

func (e *Error) Error() string { return e.Message }

type Service struct{}

func NewService() *Service { return &Service{} }

func (s *Service) Calculate(operation Operation, operands []float64) (float64, error) {
	want := 2
	switch operation {
	case Add, Subtract, Multiply, Divide, Power, Percent:
	case SquareRoot:
		want = 1
	default:
		return 0, &Error{InvalidOperation, fmt.Sprintf("unsupported operation %q", operation)}
	}
	if len(operands) != want {
		return 0, &Error{InvalidOperands, fmt.Sprintf("%s requires %d operand(s)", operation, want)}
	}
	for _, operand := range operands {
		if math.IsNaN(operand) || math.IsInf(operand, 0) {
			return 0, &Error{InvalidOperands, "operands must be finite numbers"}
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
			return 0, &Error{DivisionByZero, "cannot divide by zero"}
		}
		result = a / operands[1]
	case Power:
		result = math.Pow(a, operands[1])
	case SquareRoot:
		if a < 0 {
			return 0, &Error{InvalidOperands, "square root requires a non-negative operand"}
		}
		result = math.Sqrt(a)
	case Percent:
		result = a * operands[1] / 100
	}
	if math.IsNaN(result) || math.IsInf(result, 0) {
		return 0, &Error{InvalidResult, "calculation has no finite real result"}
	}
	return result, nil
}

func Code(err error) ErrorCode {
	var calculationError *Error
	if errors.As(err, &calculationError) {
		return calculationError.Code
	}
	return "internal_error"
}
