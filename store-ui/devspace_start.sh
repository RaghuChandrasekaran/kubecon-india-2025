#!/bin/bash
set +e

export NODE_ENV=development

echo "Cleaning up any existing node_modules..."
rm -rf node_modules
rm -f package-lock.json

echo "Installing dependencies..."
if [ -f "yarn.lock" ]; then
   echo "Using yarn..."
   yarn install --silent
elif [ -f "package.json" ]; then
   echo "Using npm..."
   npm install --silent --no-package-lock
fi

COLOR_GREEN="\033[0;92m"
COLOR_RESET="\033[0m"

echo -e "${COLOR_GREEN}
🚀 Store UI Development Container Ready!

Commands:
- npm start     (start the React development server)
- npm run build (build for production)
- npm test      (run tests)

Access: http://localhost:3000
${COLOR_RESET}"

bash
