# Test coverage

Measured with Go 1.27.1 and Vitest 5.0.1.

| Layer | Command | Statement coverage |
| --- | --- | ---: |
| Go calculator domain | `cd backend && go test ./... -coverprofile=coverage.out` | 87.1% |
| Go expression parser and evaluator | same | 91.8% |
| Go HTTP adapter | same | 98.0% |
| Go executable package | same | 25.0% |
| Go overall, including executable entry point | `cd backend && go tool cover -func=coverage.out` | 90.3% |
| React calculator and API client modules | `cd frontend && npm run test:coverage` | 98.8% |

The Go entry point function itself is not unit-tested (0%); its server constructor is covered by an integration test of the real handler. Frontend coverage is limited to the calculator and library modules selected in `frontend/vite.config.ts`, so it is not a whole-app figure. The frontend coverage command writes an HTML report to `frontend/coverage/`. Both coverage outputs are generated locally and excluded from commits.
