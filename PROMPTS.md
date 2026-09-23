# AI prompts used during development

I used AI while building this project. The first prompt is a shortened version of the assignment requirements. 

## 1. Initial requirements

> Build a full-stack calculator application with a React frontend and a backend microservice. The frontend should call the backend API for basic arithmetic: addition, subtraction, multiplication, and division. Exponentiation, square root, and percentage are optional advanced operations. Provide intuitive input and result display, validation, error handling, and basic mobile support. The REST API should validate input, handle edge cases such as division by zero, and return JSON. Use clean, readable code and unit tests for both layers. Document setup, API usage, and design decisions. Prefer React with TypeScript and Go. Deliver the repository, README, tests, and a coverage report; Docker support is optional.

This restates the original assignment brief in a compact format.

## 2. Development workflow

> As we go, make a commit and push it for each milestone. Keep the commits small, even for smaller fixes, so I can see what changed and roll something back if I need to.

## 3. Architecture and maintainability

> Can you keep the code clean and use clean architecture? Put the calculator logic, API, and frontend in separate layers, and keep things easy to test.

## 4. Docker and dependencies

> Add Dockerfiles for the frontend and backend, and a Docker Compose file so I can run them together.

> Can you update the Go and npm packages and make sure everything still builds and the tests pass?

## 5. Expression parsing and errors

> Right now it's just two numbers and a dropdown for the operation. Change it so I can type a full expression instead. Tokenize and parse it so I can mix basic and advanced operations and use parentheses.

> Put the errors in their own files so the main code is cleaner. Make sure the API can still return useful error messages.

## 6. Frontend and UI improvements

> Can you make the UI simpler and nicer to use? I want a text box where I can type the operation myself, plus a keypad, and the result or error should be easy to see.

The expression editor and the single evaluation endpoint followed from this change. The UI also explains the supported notation in its “How to use” control.

## 7. Tests and documentation

> Fix the README link, add a bit more test coverage, and check if anything else needs fixing before I submit it.

## 8. CI and run instructions

> Can you add GitHub Actions for the Go tests and the frontend tests and build?

> Make the run instructions simpler. Show `go build` and then `go run` for the backend, the npm steps for the frontend, and explain why the API proxy is there.

The main commit sequence behind this ordering is: initial architecture and layered Go/React code (`e324f53`–`0c3fb4e`), Docker (`829f9bd`), dependency updates (`577994f`), expression design and backend parser with separate error files (`5dca7af`–`52b87e3`), expression UI (`d0aa725`), UI refinements (`cd54c68`–`dea3b91`), additional coverage and documentation (`245b054`–`12d787a`), and CI plus run instructions (`4f9afe3`). Some test and documentation commits overlap the UI work.
