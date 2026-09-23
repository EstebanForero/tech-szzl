package calculator

import (
	"math"
	"reflect"
	"testing"
)

func TestCalculate(t *testing.T) {
	tests := []struct {
		name      string
		operation Operation
		operands  []float64
		want      float64
		wantError error
	}{
		{"addition", Add, []float64{2, 3}, 5, nil},
		{"subtraction", Subtract, []float64{2, 3}, -1, nil},
		{"multiplication", Multiply, []float64{2, 3}, 6, nil},
		{"division", Divide, []float64{7, 2}, 3.5, nil},
		{"power", Power, []float64{2, 3}, 8, nil},
		{"square root", SquareRoot, []float64{9}, 3, nil},
		{"percent", Percent, []float64{20, 50}, 10, nil},
		{"division by zero", Divide, []float64{2, 0}, 0, &DivisionByZeroError{}},
		{"negative square root", SquareRoot, []float64{-1}, 0, &InvalidOperandsError{}},
		{"unknown operation", Operation("nope"), []float64{2, 3}, 0, &InvalidOperationError{}},
		{"wrong arity", Add, []float64{2}, 0, &InvalidOperandsError{}},
		{"non-finite operand", Add, []float64{math.Inf(1), 2}, 0, &InvalidOperandsError{}},
		{"overflow", Multiply, []float64{math.MaxFloat64, 2}, 0, &InvalidResultError{}},
		{"complex power", Power, []float64{-2, 0.5}, 0, &InvalidResultError{}},
	}
	service := NewService()
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := service.Calculate(tt.operation, tt.operands)
			if tt.wantError != nil {
				if reflect.TypeOf(err) != reflect.TypeOf(tt.wantError) {
					t.Fatalf("want error %T, got %v", tt.wantError, err)
				}
				return
			}
			if err != nil || got != tt.want {
				t.Fatalf("want %v, got %v, error %v", tt.want, got, err)
			}
		})
	}
}
