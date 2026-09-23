# Calculator

A full-stack calculator with a Go REST API and a React, TypeScript, and Vite frontend.

## Architecture

- `backend/internal/calculator` contains the arithmetic rules and operation validation. It has no HTTP dependencies.
- `backend/internal/httpapi` translates JSON requests and errors to the domain service. The handler depends on a small `Calculator` interface, which makes it easy to test with a mock.
- `frontend/src/lib/api.ts` is the typed HTTP boundary. UI components depend on its `CalculatorClient` interface, so tests can supply a fake client.
- `frontend/src/components/ui` contains local, shadcn-style primitives. The calculator form composes these primitives without embedding network logic.

The API uses a single endpoint so every operation has the same request and response shape. Unary square root takes one operand; all other operations take two. Division by zero, non-finite numbers, and invalid operations return structured errors. Results use JSON numbers, so this is a floating-point calculator rather than an exact-decimal financial calculator.

## Planned API

`POST /api/v1/calculate`

```json
{"operation":"add","operands":[2,3]}
```

```json
{"result":5}
```

Supported operations: `add`, `subtract`, `multiply`, `divide`, `power`, `sqrt`, and `percent`. `percent` computes the first operand as a percentage of the second (for example, 20% of 50 is 10).

Error responses use `{"error":{"code":"...","message":"..."}}` with HTTP 400 for invalid input. More setup, examples, and testing instructions will be added alongside the implementation.
