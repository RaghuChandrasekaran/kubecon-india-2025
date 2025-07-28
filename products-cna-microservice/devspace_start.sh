#!/bin/bash
set +e

export NODE_ENV=development

COLOR_BLUE="\033[0;94m"
COLOR_RESET="\033[0m"

echo -e "${COLOR_BLUE}
🚀 Products Service Development Container Ready!

Dependencies already installed during image creation!

Commands:
- npm run debug     (start the service with remote debugging and hot reloading)
- npm test          (run tests)
- npm start         (start the service normally)

Access: http://localhost:8081/api-docs
${COLOR_RESET}"

bash
