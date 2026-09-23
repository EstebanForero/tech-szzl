# Sumly calculator

A responsive calculator with a React/TypeScript frontend and a Go REST API. It supports addition, subtraction, multiplication, division, powers, square roots, and percentages.

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

Open the URL printed by Vite (normally `http://localhost:5173`). Vite proxies `/api` and `/healthz` to the Go service at `http://localhost:8080`. The API listens on port 8080 by default; set `PORT` to change it. If you change the API port, also update the proxy target in `frontend/vite.config.ts`.

To make a frontend production build, run `npm run build` in `frontend`; Vite writes it to `frontend/dist`. The Go API is a separate service and does not serve these static files. Deploy the frontend with a static host that proxies `/api` to the Go service.

## Run with Docker Compose

From the repository root, run:

```bash
docker compose up --build
```

Open `http://localhost:8080`. Compose builds each service from its own Dockerfile. Nginx serves the built React app and forwards `/api/` and `/healthz` to the Go container. The API is available through the same public port, for example `http://localhost:8080/api/v1/calculate`. Stop the stack with `docker compose down`.

## API

`POST /api/v1/calculate` accepts JSON with an `operation` and an `operands` array. Binary operations require exactly two operands; `sqrt` requires exactly one.

```bash
curl -sS http://localhost:8080/api/v1/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation":"add","operands":[2,3]}'
# {"result":5}
```

```bash
curl -sS http://localhost:8080/api/v1/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation":"percent","operands":[20,50]}'
# {"result":10}
```

Supported operation names are `add`, `subtract`, `multiply`, `divide`, `power`, `sqrt`, and `percent`. `percent` computes the first operand as a percentage of the second: `20% of 50 = 10`. `GET /healthz` returns `{"status":"ok"}`.

Invalid input returns HTTP 400 with a structured error. For example, dividing by zero returns:

```json
{"error":{"code":"division_by_zero","message":"cannot divide by zero"}}
```

Malformed JSON also returns 400. Requests without a JSON content type return 415. Unexpected server errors return 500 without exposing internal details.

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

The backend tests cover arithmetic, validation, non-finite results, and the HTTP contract using a fake calculator. The frontend tests use a fake API client for form behavior and a fake `fetch` for response handling. See [COVERAGE.md](COVERAGE.md) for the measured report.

## Design decisions

- Arithmetic lives in `backend/internal/calculator`, independent of HTTP. The handler in `backend/internal/httpapi` depends on a small `Calculator` interface for isolated tests and alternate implementations.
- The API uses one endpoint and a consistent request shape. Strict JSON decoding rejects unknown fields and trailing values. The service validates operation, operand count, and finite input/output.
- `frontend/src/lib/api.ts` is the network boundary. The calculator component receives a `CalculatorClient`, making interactions testable without a server. Reusable button, input, label, and card components follow the local shadcn component pattern, with Tailwind CSS and accessible Radix labels.
- Both sides use floating-point numbers. The UI formats results to at most 12 significant digits for readability. This is not an exact-decimal financial calculator.
- The Vite proxy keeps local development on one browser origin. A production host should proxy API requests the same way.


