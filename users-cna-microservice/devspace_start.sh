#!/bin/bash
set +e

echo "Installing Python dependencies..."

# First, ensure pip is up to date
pip install --upgrade pip

# Install pipenv if it doesn't exist
if ! command -v pipenv &> /dev/null; then
    echo "Installing pipenv..."
    pip install pipenv
fi

# Install dependencies using pipenv if Pipfile exists, otherwise use pip
if [ -f "Pipfile" ]; then
    echo "Installing dependencies with pipenv..."
    pipenv install --dev --system
elif [ -f "requirements.txt" ]; then
    echo "Installing dependencies with pip..."
    pip install -r requirements.txt
else
    echo "Installing common FastAPI dependencies..."
    pip install fastapi uvicorn sqlalchemy aiosqlite bcrypt pydantic python-jose python-multipart
fi

COLOR_BLUE="\033[0;94m"
COLOR_RESET="\033[0m"

echo -e "${COLOR_BLUE}
🚀 Users Service Development Container Ready!

Commands:
- uvicorn app:app --host 0.0.0.0 --port 9090 --reload  (start the service)
- python -m pytest                                      (run tests)

Access: http://localhost:9090/docs
${COLOR_RESET}"

# Set environment variables for development
export PYTHONPATH=/app
export ENVIRONMENT=development

bash
