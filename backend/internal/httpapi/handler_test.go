package httpapi

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"calculator/backend/internal/calculator"
)

type fakeCalculator struct {
	operation calculator.Operation
	operands  []float64
	result    float64
	err       error
	called    bool
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
		{"domain error", `{"operation":"divide","operands":[2,0]}`, "application/json", fakeCalculator{err: &calculator.Error{Code: calculator.DivisionByZero, Message: "cannot divide by zero"}}, 400, `"code":"division_by_zero"`, true},
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
			NewHandler(&tt.fake).ServeHTTP(response, request)
			if response.Code != tt.status || !strings.Contains(response.Body.String(), tt.contains) || tt.fake.called != tt.called {
				t.Fatalf("status %d, body %s, called %v", response.Code, response.Body.String(), tt.fake.called)
			}
		})
	}
}
