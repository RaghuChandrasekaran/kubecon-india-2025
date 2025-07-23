#!/bin/bash
set +e

export NODE_ENV=development

echo "Installing dependencies..."
if [ -f "yarn.lock" ]; then
   yarn install --silent
elif [ -f "package.json" ]; then
   npm install --silent
fi

COLOR_YELLOW="\033[0;93m"
COLOR_RESET="\033[0m"

echo -e "${COLOR_YELLOW}
🔍 Search Service Development Container Ready!

Commands:
- npm start     (start the search service)
- npm run build (build for production)
- npm test      (run tests)

Access: http://localhost:4000
${COLOR_RESET}"

bash
