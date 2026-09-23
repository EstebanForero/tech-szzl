package expression

import (
	"strconv"
	"unicode"
	"unicode/utf8"
)

type tokenKind uint8

const (
	tokenEOF tokenKind = iota
	tokenNumber
	tokenPlus
	tokenMinus
	tokenMultiply
	tokenDivide
	tokenPower
	tokenPercent
	tokenLeftParen
	tokenRightParen
	tokenSquareRoot
)

type token struct {
	kind     tokenKind
	position int
	value    float64
}

const maxTokens = 128

func tokenize(source string) ([]token, error) {
	tokens := make([]token, 0, 16)
	for position := 0; position < len(source); {
		r, size := utf8.DecodeRuneInString(source[position:])
		if r == utf8.RuneError && size == 1 {
			return nil, syntaxAt(source, position, "invalid character")
		}
		if unicode.IsSpace(r) {
			position += size
			continue
		}
		start := position
		var current token
		current.position = utf8.RuneCountInString(source[:start])
		switch {
		case isDigit(source[position]) || (source[position] == '.' && position+1 < len(source) && isDigit(source[position+1])):
			for position < len(source) && isDigit(source[position]) {
				position++
			}
			if position < len(source) && source[position] == '.' {
				position++
				for position < len(source) && isDigit(source[position]) {
					position++
				}
			}
			if position < len(source) && (source[position] == 'e' || source[position] == 'E') {
				position++
				if position < len(source) && (source[position] == '+' || source[position] == '-') {
					position++
				}
				exponentStart := position
				for position < len(source) && isDigit(source[position]) {
					position++
				}
				if position == exponentStart {
					return nil, syntaxAt(source, start, "invalid number")
				}
			}
			value, err := strconv.ParseFloat(source[start:position], 64)
			if err != nil {
				return nil, syntaxAt(source, start, "number is outside the supported range")
			}
			current.kind, current.value = tokenNumber, value
		default:
			position += size
			if unicode.IsLetter(r) {
				return nil, syntaxAt(source, start, "words are not supported; use mathematical symbols")
			}
			switch r {
			case '+':
				current.kind = tokenPlus
			case '-', '−':
				current.kind = tokenMinus
			case '*', '×':
				current.kind = tokenMultiply
			case '/', '÷':
				current.kind = tokenDivide
			case '^':
				current.kind = tokenPower
			case '%':
				current.kind = tokenPercent
			case '(':
				current.kind = tokenLeftParen
			case ')':
				current.kind = tokenRightParen
			case '√':
				current.kind = tokenSquareRoot
			default:
				return nil, syntaxAt(source, start, "invalid character")
			}
		}
		tokens = append(tokens, current)
		if len(tokens) > maxTokens {
			return nil, syntaxAt(source, start, "expression has too many parts")
		}
	}
	return append(tokens, token{kind: tokenEOF, position: utf8.RuneCountInString(source)}), nil
}

func isDigit(value byte) bool { return value >= '0' && value <= '9' }

func syntaxAt(source string, byteOffset int, reason string) *SyntaxError {
	return &SyntaxError{Position: utf8.RuneCountInString(source[:byteOffset]), Reason: reason}
}
