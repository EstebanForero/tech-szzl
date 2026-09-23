package calculator

import (
	"math"
	"testing"
)

func TestCalculate(t *testing.T) {
	tests := []struct {
		name      string
		operation Operation
		operands  []float64
		want      float64
		code      ErrorCode
	}{
		{"addition", Add, []float64{2, 3}, 5, ""},
		{"subtraction", Subtract, []float64{2, 3}, -1, ""},
		{"multiplication", Multiply, []float64{2, 3}, 6, ""},
		{"division", Divide, []float64{7, 2}, 3.5, ""},
		{"power", Power, []float64{2, 3}, 8, ""},
		{"square root", SquareRoot, []float64{9}, 3, ""},
		{"percent", Percent, []float64{20, 50}, 10, ""},
		{"division by zero", Divide, []float64{2, 0}, 0, DivisionByZero},
		{"negative square root", SquareRoot, []float64{-1}, 0, InvalidOperands},
		{"unknown operation", Operation("nope"), []float64{2, 3}, 0, InvalidOperation},
		{"wrong arity", Add, []float64{2}, 0, InvalidOperands},
		{"non-finite operand", Add, []float64{math.Inf(1), 2}, 0, InvalidOperands},
		{"overflow", Multiply, []float64{math.MaxFloat64, 2}, 0, InvalidResult},
		{"complex power", Power, []float64{-2, 0.5}, 0, InvalidResult},
	}
	service := NewService()
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := service.Calculate(tt.operation, tt.operands)
			if tt.code != "" {
				if err == nil || Code(err) != tt.code {
					t.Fatalf("want error %s, got %v", tt.code, err)
				}
				return
			}
			if err != nil || got != tt.want {
				t.Fatalf("want %v, got %v, error %v", tt.want, got, err)
			}
		})
	}
}
