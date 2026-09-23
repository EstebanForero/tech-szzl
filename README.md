# Sumly calculator

A responsive expression calculator with a React/TypeScript frontend and a Go REST API. Type a complete expression such as `2 + 3 * (4 - 1)` and the backend evaluates its parts in mathematical order.

## Requirements

- Go 1.27 or newer
- Node.js 26 or newer and npm

## Run locally

Open two terminals from the repository root:

```bash
cd backend
go run ./cmd/calculator
```

```bash
cd frontend
npm ci
npm run dev
```

Open `http://localhost:9000`. Vite proxies `/api` and `/healthz` to the Go service at `http://localhost:8080`. The API listens on port 8080 by default; set `PORT` to change it. If you change the API port, also update the proxy target in `frontend/vite.config.ts`.

To make a frontend production build, run `npm run build` in `frontend`; Vite writes it to `frontend/dist`. The Go API is a separate service and does not serve these static files. Deploy the frontend with a static host that proxies `/api` to the Go service.

## Run with Docker Compose

From the repository root, run:

```bash
docker compose up --build
```

Open `http://localhost:9000`. Compose builds each service from its own Dockerfile. Nginx serves the built React app on port 9000 and forwards `/api/` and `/healthz` to the Go container. The API is available through the same public port, for example `http://localhost:9000/api/v1/evaluate`. Stop the stack with `docker compose down`.

## API

`POST /api/v1/evaluate` accepts one expression string:

```bash
curl -sS http://localhost:9000/api/v1/evaluate \
  -H 'Content-Type: application/json' \
  -d '{"expression":"2 + 3 * (4 - 1)"}'
# {"result":11}
```

```bash
curl -sS http://localhost:9000/api/v1/evaluate \
  -H 'Content-Type: application/json' \
  -d '{"expression":"20% of 50"}'
# {"result":10}
```

In local development, the same endpoint is also available directly from the Go service at `http://localhost:8080`. `GET /healthz` returns `{"status":"ok"}`.

The expression language supports `+`, `-`, `*`, `/`, `^`, parentheses, `sqrt(...)`, and postfix `%`. `of` means multiplication, so `20% of 50` is 10. It accepts `×`, `÷`, `−`, and `√(...)` as alternate symbols. Powers associate from the right (`2^3^2` is 512), and powers take precedence over unary minus (`-2^2` is -4). Write multiplication explicitly: `2 * (3 + 4)`. Text such as “what is two plus three” is not part of the expression language. See [docs/expression-design.md](docs/expression-design.md) for the grammar and limits.

The original `POST /api/v1/calculate` endpoint remains available. It accepts `{"operation":"add","operands":[2,3]}` and returns `{"result":5}`. Supported operation names are `add`, `subtract`, `multiply`, `divide`, `power`, `sqrt`, and `percent`.

Invalid input returns HTTP 400 with a structured error. Division by zero returns:

```json
{"error":{"code":"division_by_zero","message":"cannot divide by zero"}}
```

An invalid expression returns `error.code = "invalid_expression"` with a character position. The domain has distinct error types for invalid operations, operands, division by zero, and non-finite results; the HTTP adapter maps them to public codes. Malformed JSON returns 400, requests without a JSON content type return 415, and unexpected server errors return 500 without exposing internal details.

## Tests and coverage

```bash
cd backend
go test ./... -coverprofile=coverage.out
go tool cover -func=coverage.out
```

```bash
cd frontend
npm ci
npm run test:coverage
npm run build
```

The backend tests cover arithmetic, expression parsing and evaluation, syntax limits, typed errors, and both HTTP endpoints with fakes. The frontend tests use a fake API client for form behavior and a fake `fetch` for response handling. See [COVERAGE.md](COVERAGE.md) for the measured report.

## Design decisions

- Arithmetic lives in `backend/internal/calculator`, independent of HTTP. `backend/internal/expression` tokenizes, parses, and evaluates text, delegating each arithmetic operation through a small interface. The parser never executes user code.
- Domain and syntax failures have distinct Go error types. `backend/internal/httpapi` translates those types to JSON codes and status 400; unknown errors receive a generic 500. The handler depends on `Calculator` and `Evaluator` interfaces for isolated tests.
- The expression endpoint is the UI's primary API. The original operation endpoint remains for compatibility. Strict JSON decoding rejects unknown fields and trailing values; the service validates finite input and output.
- `frontend/src/lib/api.ts` is the network boundary. The expression workspace receives a `CalculatorClient`, making interactions testable without a server. Reusable button, textarea, label, and card components follow the local shadcn component pattern, with Tailwind CSS and accessible Radix labels.
- Both sides use floating-point numbers. The UI formats results to at most 12 significant digits for readability. This is not an exact-decimal financial calculator.
- The Vite proxy keeps local development on one browser origin. A production host should proxy API requests the same way.


