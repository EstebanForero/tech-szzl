package httpapi

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"

	"calculator/backend/internal/calculator"
)

type Calculator interface {
	Calculate(operation calculator.Operation, operands []float64) (float64, error)
}

type Handler struct{ calculator Calculator }

func NewHandler(service Calculator) http.Handler {
	h := &Handler{calculator: service}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.HandleFunc("POST /api/v1/calculate", h.calculate)
	return mux
}

type calculationRequest struct {
	Operation calculator.Operation `json:"operation"`
	Operands  []float64            `json:"operands"`
}

type apiError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func (h *Handler) calculate(w http.ResponseWriter, r *http.Request) {
	if !strings.HasPrefix(r.Header.Get("Content-Type"), "application/json") {
		writeError(w, http.StatusUnsupportedMediaType, "unsupported_media_type", "Content-Type must be application/json")
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	var request calculationRequest
	if err := decoder.Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "body must be a JSON object with operation and operands")
		return
	}
	if err := decoder.Decode(new(any)); !errors.Is(err, io.EOF) {
		writeError(w, http.StatusBadRequest, "invalid_json", "body must contain exactly one JSON object")
		return
	}
	result, err := h.calculator.Calculate(request.Operation, request.Operands)
	if err != nil {
		var domainError *calculator.Error
		if errors.As(err, &domainError) {
			writeError(w, http.StatusBadRequest, string(domainError.Code), domainError.Message)
			return
		}
		writeError(w, http.StatusInternalServerError, "internal_error", "calculation failed")
		return
	}
	writeJSON(w, http.StatusOK, map[string]float64{"result": result})
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, map[string]apiError{"error": {Code: code, Message: message}})
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
