package httpapi

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"calculator/backend/internal/calculator"
	"calculator/backend/internal/expression"
)

type fakeCalculator struct {
	operation calculator.Operation
	operands  []float64
	result    float64
	err       error
	called    bool
}

type fakeEvaluator struct {
	expression string
	result     float64
	err        error
	called     bool
}

func (f *fakeEvaluator) Evaluate(source string) (float64, error) {
	f.called, f.expression = true, source
	return f.result, f.err
}

func (f *fakeCalculator) Calculate(operation calculator.Operation, operands []float64) (float64, error) {
	f.called, f.operation, f.operands = true, operation, operands
	return f.result, f.err
}

func TestCalculateHandler(t *testing.T) {
	tests := []struct {
		name, body, contentType string
		fake                    fakeCalculator
		status                  int
		contains                string
		called                  bool
	}{
		{"success", `{"operation":"add","operands":[2,3]}`, "application/json", fakeCalculator{result: 5}, 200, `"result":5`, true},
		{"domain error", `{"operation":"divide","operands":[2,0]}`, "application/json", fakeCalculator{err: &calculator.DivisionByZeroError{}}, 400, `"code":"division_by_zero"`, true},
		{"unexpected error", `{"operation":"add","operands":[2,3]}`, "application/json", fakeCalculator{err: errors.New("secret")}, 500, `"code":"internal_error"`, true},
		{"malformed", `{`, "application/json", fakeCalculator{}, 400, `"code":"invalid_json"`, false},
		{"unknown field", `{"operation":"add","operands":[2,3],"extra":1}`, "application/json", fakeCalculator{}, 400, `"code":"invalid_json"`, false},
		{"multiple objects", `{} {}`, "application/json", fakeCalculator{}, 400, `"code":"invalid_json"`, false},
		{"wrong media type", `{}`, "text/plain", fakeCalculator{}, 415, `"code":"unsupported_media_type"`, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodPost, "/api/v1/calculate", strings.NewReader(tt.body))
			request.Header.Set("Content-Type", tt.contentType)
			response := httptest.NewRecorder()
			NewHandler(&tt.fake, &fakeEvaluator{}).ServeHTTP(response, request)
			if response.Code != tt.status || !strings.Contains(response.Body.String(), tt.contains) || tt.fake.called != tt.called {
				t.Fatalf("status %d, body %s, called %v", response.Code, response.Body.String(), tt.fake.called)
			}
		})
	}
}

func TestEvaluateHandler(t *testing.T) {
	tests := []struct {
		name, body string
		fake       fakeEvaluator
		status     int
		contains   string
		called     bool
	}{
		{"success", `{"expression":"2 + 3 * 4"}`, fakeEvaluator{result: 14}, 200, `"result":14`, true},
		{"syntax error", `{"expression":"2 + * 3"}`, fakeEvaluator{err: &expression.SyntaxError{Position: 4, Reason: "expected a number"}}, 400, `"code":"invalid_expression"`, true},
		{"division by zero", `{"expression":"2 / 0"}`, fakeEvaluator{err: &calculator.DivisionByZeroError{}}, 400, `"code":"division_by_zero"`, true},
		{"unknown field", `{"expression":"2 + 3","extra":1}`, fakeEvaluator{}, 400, `"code":"invalid_json"`, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodPost, "/api/v1/evaluate", strings.NewReader(tt.body))
			request.Header.Set("Content-Type", "application/json")
			response := httptest.NewRecorder()
			NewHandler(&fakeCalculator{}, &tt.fake).ServeHTTP(response, request)
			if response.Code != tt.status || !strings.Contains(response.Body.String(), tt.contains) || tt.fake.called != tt.called {
				t.Fatalf("status %d, body %s, called %v", response.Code, response.Body.String(), tt.fake.called)
			}
			if tt.called && tt.fake.expression != "" && tt.name == "success" && tt.fake.expression != "2 + 3 * 4" {
				t.Fatalf("unexpected expression %q", tt.fake.expression)
			}
		})
	}
}
