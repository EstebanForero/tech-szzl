# Test coverage

Measured with Go 1.27.1 and Vitest 5.0.1.

| Layer | Command | Statement coverage |
| --- | --- | ---: |
| Go calculator domain | `cd backend && go test ./... -coverprofile=coverage.out` | 93.8% |
| Go HTTP adapter | same | 96.9% |
| Go overall, including executable entry point | `cd backend && go tool cover -func=coverage.out` | 83.6% |
| React calculator and API client modules | `cd frontend && npm run test:coverage` | 87.7% |

The Go entry point is not unit-tested (0%); the service and HTTP layers carry the behavior and are tested separately. The frontend coverage command writes an HTML report to `frontend/coverage/`. Both coverage outputs are generated locally and excluded from commits.
