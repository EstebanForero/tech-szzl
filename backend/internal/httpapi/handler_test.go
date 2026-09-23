package httpapi

import (
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"calculator/backend/internal/calculator"
	"calculator/backend/internal/expression"
)

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

func TestEvaluateHandler(t *testing.T) {
	tests := []struct {
		name, body, contentType string
		fake                    fakeEvaluator
		status                  int
		contains                string
		called                  bool
	}{
		{"success", `{"expression":"2 + 3 * 4"}`, "application/json", fakeEvaluator{result: 14}, 200, `"result":14`, true},
		{"syntax error", `{"expression":"2 + * 3"}`, "application/json", fakeEvaluator{err: &expression.SyntaxError{Position: 4, Reason: "expected a number"}}, 400, `"code":"invalid_expression"`, true},
		{"division by zero", `{"expression":"2 / 0"}`, "application/json", fakeEvaluator{err: &calculator.DivisionByZeroError{}}, 400, `"code":"division_by_zero"`, true},
		{"unexpected error", `{"expression":"2 + 3"}`, "application/json", fakeEvaluator{err: errors.New("secret")}, 500, `"code":"internal_error"`, true},
		{"malformed", `{`, "application/json", fakeEvaluator{}, 400, `"code":"invalid_json"`, false},
		{"unknown field", `{"expression":"2 + 3","extra":1}`, "application/json", fakeEvaluator{}, 400, `"code":"invalid_json"`, false},
		{"multiple objects", `{} {}`, "application/json", fakeEvaluator{}, 400, `"code":"invalid_json"`, false},
		{"wrong media type", `{}`, "text/plain", fakeEvaluator{}, 415, `"code":"unsupported_media_type"`, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodPost, "/api/v1/evaluate", strings.NewReader(tt.body))
			request.Header.Set("Content-Type", tt.contentType)
			response := httptest.NewRecorder()
			NewHandler(&tt.fake).ServeHTTP(response, request)
			if response.Code != tt.status || !strings.Contains(response.Body.String(), tt.contains) || tt.fake.called != tt.called {
				t.Fatalf("status %d, body %s, called %v", response.Code, response.Body.String(), tt.fake.called)
			}
			if tt.called && tt.fake.expression != "" && tt.name == "success" && tt.fake.expression != "2 + 3 * 4" {
				t.Fatalf("unexpected expression %q", tt.fake.expression)
			}
		})
	}
}

func TestOperationEndpointIsNotRegistered(t *testing.T) {
	request := httptest.NewRequest(http.MethodPost, "/api/v1/calculate", strings.NewReader(`{"operation":"add","operands":[2,3]}`))
	response := httptest.NewRecorder()
	NewHandler(&fakeEvaluator{}).ServeHTTP(response, request)
	if response.Code != http.StatusNotFound {
		t.Fatalf("want 404 for removed endpoint, got %d", response.Code)
	}
}

func TestPublicErrorMapping(t *testing.T) {
	tests := []struct {
		name, code string
		err        error
		known      bool
	}{
		{"syntax", "invalid_expression", &expression.SyntaxError{Reason: "bad input"}, true},
		{"operation", "invalid_operation", &calculator.InvalidOperationError{Operation: "unknown"}, true},
		{"operands", "invalid_operands", &calculator.InvalidOperandsError{Reason: "bad operands"}, true},
		{"zero", "division_by_zero", &calculator.DivisionByZeroError{}, true},
		{"result", "invalid_result", &calculator.InvalidResultError{}, true},
		{"wrapped", "division_by_zero", fmt.Errorf("evaluate: %w", &calculator.DivisionByZeroError{}), true},
		{"unexpected", "", errors.New("secret"), false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			code, message, known := publicError(tt.err)
			if code != tt.code || known != tt.known || (tt.known && message == "") {
				t.Fatalf("code %q, message %q, known %v", code, message, known)
			}
		})
	}
}
