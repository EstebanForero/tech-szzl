package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"calculator/backend/internal/calculator"
	"calculator/backend/internal/expression"
	"calculator/backend/internal/httpapi"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	server := newServer(port)
	log.Printf("calculator API listening on %s", server.Addr)
	log.Fatal(server.ListenAndServe())
}

func newServer(port string) *http.Server {
	service := calculator.NewService()
	return &http.Server{
		Addr:              ":" + port,
		Handler:           httpapi.NewHandler(expression.NewEvaluator(service)),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
}
