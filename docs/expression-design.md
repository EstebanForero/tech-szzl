# Expression calculator design

The calculator accepts a mathematical expression in one text field. This is an expression language, rather than unrestricted natural language: input such as `2 + 3 * (4 - 1)` has precise, predictable meaning.

## API contract

`POST /api/v1/evaluate` accepts `{"expression":"2 + 3 × (4 - 1)"}` and returns `{"result":11}`. It is the sole calculation endpoint. Invalid syntax returns HTTP 400 with `error.code = "invalid_expression"`; arithmetic errors use distinct codes such as `division_by_zero`.

## Grammar and precedence

From lower to higher precedence: `+` and `−`; multiplication and division (`×`, `÷`, and keyboard `*`, `/`); unary `+` and `−`; right-associative `^`; postfix `%`; numbers, parentheses, and `√` applied to a number or parenthesized expression. Adjacent terms such as `2(3 + 4)`, `(2 + 3)(4 - 1)`, and `2√9` imply multiplication. `20% × 50` evaluates to 10; a standalone `20%` evaluates to 0.2. Word operators and function names are rejected.

The Go `expression` package has a tokenizer, a parser that builds a small syntax tree, and an evaluator. The evaluator delegates arithmetic to the `calculator` service through an interface. Postfix `%` is unary in the arithmetic domain: `20%` is `0.2`, which may then be multiplied by `50`. The HTTP handler depends on an `Evaluator` interface, making endpoint tests independent of the parser.

The UI allows up to 256 characters. The API accepts up to 1024 bytes, 128 tokens, and 64 nested parse levels, covering multibyte Unicode operators within the UI limit. The parser never executes user code. All results must be finite real numbers.
