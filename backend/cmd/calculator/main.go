package main

import (
	"log"
	"net/http"
	"os"

	"calculator/backend/internal/calculator"
	"calculator/backend/internal/expression"
	"calculator/backend/internal/httpapi"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	service := calculator.NewService()
	server := &http.Server{
		Addr:    ":" + port,
		Handler: httpapi.NewHandler(expression.NewEvaluator(service)),
	}
	log.Printf("calculator API listening on %s", server.Addr)
	log.Fatal(server.ListenAndServe())
}
