package expression

import (
	"math"
	"reflect"
	"strings"
	"testing"

	"calculator/backend/internal/calculator"
)

func TestEvaluate(t *testing.T) {
	tests := []struct {
		name       string
		expression string
		want       float64
		wantError  error
	}{
		{"precedence and grouping", "2 + 3 * (4 - 1)", 11, nil},
		{"right associative power", "2^3^2", 512, nil},
		{"unary below power", "-2^2", -4, nil},
		{"negative exponent", "2^-2", 0.25, nil},
		{"square roots", "sqrt(9) + √(16)", 7, nil},
		{"percentage of", "20% of 50", 10, nil},
		{"standalone percentage", "20%", 0.2, nil},
		{"decimals", "0.1 + .2", 0.3, nil},
		{"scientific notation", "1e2 / 4", 25, nil},
		{"unicode operators", "2 × 3 − 1", 5, nil},
		{"invalid syntax", "2 + * 3", 0, &SyntaxError{}},
		{"implicit multiplication rejected", "2(3)", 0, &SyntaxError{}},
		{"empty expression", "", 0, &SyntaxError{}},
		{"invalid number", "1e309", 0, &SyntaxError{}},
		{"missing parenthesis", "sqrt(9", 0, &SyntaxError{}},
		{"divide by zero", "1 / (2 - 2)", 0, &calculator.DivisionByZeroError{}},
		{"negative root", "sqrt(-1)", 0, &calculator.InvalidOperandsError{}},
		{"complex result", "(-2)^.5", 0, &calculator.InvalidResultError{}},
		{"too long", strings.Repeat("1", 1025), 0, &SyntaxError{}},
		{"too many parts", strings.Repeat("1+", 65) + "1", 0, &SyntaxError{}},
		{"too deep", strings.Repeat("-", 65) + "1", 0, &SyntaxError{}},
	}
	evaluator := NewEvaluator(calculator.NewService())
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := evaluator.Evaluate(tt.expression)
			if tt.wantError != nil {
				if reflect.TypeOf(err) != reflect.TypeOf(tt.wantError) {
					t.Fatalf("want error %T, got %v", tt.wantError, err)
				}
				return
			}
			if err != nil || math.Abs(got-tt.want) > 1e-12 {
				t.Fatalf("want %v, got %v, error %v", tt.want, got, err)
			}
		})
	}
}

type recordingCalculator struct {
	operations []calculator.Operation
	service    *calculator.Service
}

func (r *recordingCalculator) Calculate(operation calculator.Operation, operands []float64) (float64, error) {
	r.operations = append(r.operations, operation)
	return r.service.Calculate(operation, operands)
}

func TestEvaluatorDelegatesArithmetic(t *testing.T) {
	recorder := &recordingCalculator{service: calculator.NewService()}
	got, err := NewEvaluator(recorder).Evaluate("2 + 3 * 4")
	if err != nil || got != 14 {
		t.Fatalf("want 14, got %v, error %v", got, err)
	}
	if !reflect.DeepEqual(recorder.operations, []calculator.Operation{calculator.Multiply, calculator.Add}) {
		t.Fatalf("unexpected operation order: %v", recorder.operations)
	}
}
