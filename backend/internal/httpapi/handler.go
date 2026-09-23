package httpapi

import (
	"encoding/json"
	"errors"
	"io"
	"mime"
	"net/http"

	"calculator/backend/internal/calculator"
	"calculator/backend/internal/expression"
)

type Calculator interface {
	Calculate(operation calculator.Operation, operands []float64) (float64, error)
}

type Evaluator interface {
	Evaluate(source string) (float64, error)
}

type Handler struct {
	calculator Calculator
	evaluator  Evaluator
}

func NewHandler(service Calculator, evaluator Evaluator) http.Handler {
	h := &Handler{calculator: service, evaluator: evaluator}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.HandleFunc("POST /api/v1/calculate", h.calculate)
	mux.HandleFunc("POST /api/v1/evaluate", h.evaluate)
	return mux
}

type calculationRequest struct {
	Operation calculator.Operation `json:"operation"`
	Operands  []float64            `json:"operands"`
}

type evaluationRequest struct {
	Expression string `json:"expression"`
}

type apiError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func (h *Handler) calculate(w http.ResponseWriter, r *http.Request) {
	var request calculationRequest
	if !readJSON(w, r, &request) {
		return
	}
	result, err := h.calculator.Calculate(request.Operation, request.Operands)
	writeResult(w, result, err)
}

func (h *Handler) evaluate(w http.ResponseWriter, r *http.Request) {
	var request evaluationRequest
	if !readJSON(w, r, &request) {
		return
	}
	result, err := h.evaluator.Evaluate(request.Expression)
	writeResult(w, result, err)
}

func readJSON(w http.ResponseWriter, r *http.Request, destination any) bool {
	mediaType, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if err != nil || mediaType != "application/json" {
		writeError(w, http.StatusUnsupportedMediaType, "unsupported_media_type", "Content-Type must be application/json")
		return false
	}
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(destination); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "body must be a valid JSON object")
		return false
	}
	if err := decoder.Decode(new(any)); !errors.Is(err, io.EOF) {
		writeError(w, http.StatusBadRequest, "invalid_json", "body must contain exactly one JSON object")
		return false
	}
	return true
}

func writeResult(w http.ResponseWriter, result float64, err error) {
	if err != nil {
		code, message, known := publicError(err)
		if !known {
			writeError(w, http.StatusInternalServerError, "internal_error", "calculation failed")
			return
		}
		writeError(w, http.StatusBadRequest, code, message)
		return
	}
	writeJSON(w, http.StatusOK, map[string]float64{"result": result})
}

func publicError(err error) (code, message string, known bool) {
	var syntax *expression.SyntaxError
	var operation *calculator.InvalidOperationError
	var operands *calculator.InvalidOperandsError
	var zero *calculator.DivisionByZeroError
	var result *calculator.InvalidResultError
	switch {
	case errors.As(err, &syntax):
		return "invalid_expression", syntax.Error(), true
	case errors.As(err, &operation):
		return "invalid_operation", operation.Error(), true
	case errors.As(err, &operands):
		return "invalid_operands", operands.Error(), true
	case errors.As(err, &zero):
		return "division_by_zero", zero.Error(), true
	case errors.As(err, &result):
		return "invalid_result", result.Error(), true
	default:
		return "", "", false
	}
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, map[string]apiError{"error": {Code: code, Message: message}})
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
