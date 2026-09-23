package expression

import "fmt"

// SyntaxError identifies invalid expression text before arithmetic is attempted.
type SyntaxError struct {
	Position int // zero-based character offset in the original expression
	Reason   string
}

func (e *SyntaxError) Error() string {
	return fmt.Sprintf("%s at character %d", e.Reason, e.Position+1)
}
