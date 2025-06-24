# Install python in the container
FROM python:3.10.5-alpine3.16

# Add necessary dependencies for building Python packages with C extensions
RUN apk add --no-cache gcc musl-dev python3-dev libffi-dev openssl-dev

# Install pipenv
RUN pip install pipenv

WORKDIR /usr/src/app

# Copy the Pipfile and Pipfile.lock (if exists)
COPY Pipfile* ./

# Install packages - using --system flag to install packages globally (avoiding virtualenv issues)
RUN pipenv install --deploy --system

# expose the port that uvicorn will run the app
EXPOSE 9090

# copy the local app/ folder to the /app fodler in the container
COPY . .

# execute the command using python directly since we installed packages system-wide
CMD ["python", "app.py"]