#!/bin/bash

set -e

DEBUG_PORT=6000
CMD=$1

function run_app() {
  echo "🔁 Starting Spring Boot app with hot reload and debugger on port $DEBUG_PORT..."

  local gradle_cmd="gradle bootRun"
  echo "📦 Executing: $gradle_cmd"
  eval $gradle_cmd
}

function run_tests() {
  echo "🧪 Running tests..."

  local test_cmd="gradle test --no-daemon"
  echo "📦 Executing: $test_cmd"
  eval $test_cmd
}

case "$CMD" in
  --run)
    run_app
    ;;
  --test)
    run_tests
    ;;
  *)
    echo "❌ Unknown option: $CMD"
    echo "Usage: ./setup.sh --run | --test"
    exit 1
    ;;
esac