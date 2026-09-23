package main

import (
	"log"
	"net/http"
	"os"

	"calculator/backend/internal/calculator"
	"calculator/backend/internal/httpapi"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	server := &http.Server{
		Addr:    ":" + port,
		Handler: httpapi.NewHandler(calculator.NewService()),
	}
	log.Printf("calculator API listening on %s", server.Addr)
	log.Fatal(server.ListenAndServe())
}
