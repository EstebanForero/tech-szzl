FROM golang:1.27.1-alpine AS build

WORKDIR /app
COPY go.mod ./
COPY cmd ./cmd
COPY internal ./internal
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /calculator ./cmd/calculator

FROM scratch
COPY --from=build /calculator /calculator
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["/calculator"]
