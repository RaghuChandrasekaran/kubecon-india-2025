#!/bin/bash
set +e

export NODE_ENV=development

echo "Installing dependencies..."
if [ -f "yarn.lock" ]; then
   yarn install
elif [ -f "package.json" ]; then
   npm install
fi

COLOR_BLUE="\033[0;94m"
COLOR_RESET="\033[0m"

echo -e "${COLOR_BLUE}
🚀 Products Service Development Container Ready!

Commands:
- npm run debug     (start the service with remote debugging and hot reloading)
- npm test          (run tests)

Access: http://localhost:8081/api-docs
${COLOR_RESET}"

bash
