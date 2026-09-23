# Expression calculator design

The calculator accepts a mathematical expression in one text field. This is an expression language, rather than unrestricted natural language: input such as `2 + 3 * (4 - 1)` has precise, predictable meaning.

## API contract

`POST /api/v1/evaluate` accepts `{"expression":"2 + 3 * (4 - 1)"}` and returns `{"result":11}`. Invalid syntax returns HTTP 400 with `error.code = "invalid_expression"`; arithmetic errors retain their existing codes (for example `division_by_zero`). The existing `/api/v1/calculate` operation endpoint remains available for compatibility.

## Grammar and precedence

From lower to higher precedence: `+` and `-`; `*`, `/`, and `of`; unary `+` and `-`; right-associative `^`; postfix `%`; numbers, parentheses, and `sqrt(...)`. Conventional Unicode `×`, `÷`, `−`, and `√(...)` are accepted as aliases. `20% of 50` evaluates to 10; a standalone `20%` evaluates to 0.2. No implicit multiplication is supported, so write `2 * (3 + 4)`.

The Go `expression` package has a tokenizer, a parser that builds a small syntax tree, and an evaluator. The evaluator delegates arithmetic to the existing `calculator` service through an interface. The HTTP handler depends on an `Evaluator` interface, making endpoint tests independent of the parser.

The UI allows up to 256 characters. The API accepts up to 1024 bytes, 128 tokens, and 64 nested parse levels, covering multibyte Unicode operators within the UI limit. The parser never executes user code. All results must be finite real numbers.
