package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestServerWiresCalculatorAndSetsTimeouts(t *testing.T) {
	server := newServer("9090")
	if server.Addr != ":9090" || server.ReadHeaderTimeout != 5*time.Second ||
		server.ReadTimeout != 10*time.Second || server.WriteTimeout != 10*time.Second ||
		server.IdleTimeout != 60*time.Second {
		t.Fatalf("unexpected server configuration: %+v", server)
	}

	for _, tt := range []struct {
		expression string
		status     int
		body       string
	}{
		{"2 + 3 * (4 - 1)", http.StatusOK, `"result":11`},
		{"1 / 0", http.StatusBadRequest, `"code":"division_by_zero"`},
	} {
		request := httptest.NewRequest(http.MethodPost, "/api/v1/evaluate", strings.NewReader(`{"expression":"`+tt.expression+`"}`))
		request.Header.Set("Content-Type", "application/json")
		response := httptest.NewRecorder()
		server.Handler.ServeHTTP(response, request)
		if response.Code != tt.status || !strings.Contains(response.Body.String(), tt.body) {
			t.Fatalf("expression %q: status %d, body %s", tt.expression, response.Code, response.Body.String())
		}
	}
}
