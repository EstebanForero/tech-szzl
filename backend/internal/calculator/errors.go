package calculator

import "fmt"

// These errors describe arithmetic failures without depending on HTTP status or JSON codes.
type InvalidOperationError struct{ Operation Operation }

func (e *InvalidOperationError) Error() string {
	return fmt.Sprintf("unsupported operation %q", e.Operation)
}

type InvalidOperandsError struct{ Reason string }

func (e *InvalidOperandsError) Error() string { return e.Reason }

type DivisionByZeroError struct{}

func (e *DivisionByZeroError) Error() string { return "cannot divide by zero" }

type InvalidResultError struct{}

func (e *InvalidResultError) Error() string { return "calculation has no finite real result" }
