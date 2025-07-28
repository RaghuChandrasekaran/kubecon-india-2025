#!/bin/bash
set +e

export NODE_ENV=development

COLOR_CYAN="\033[0;36m"
COLOR_RESET="\033[0m"

echo -e "${COLOR_CYAN}
🚀 Search Service Development Container Ready!

Dependencies already installed during image creation!

Commands:
- npm run debug     (start the service with remote debugging and hot reloading)
- npm test          (run tests)
- npm start         (start the service normally)

Access: http://localhost:8082/api-docs
${COLOR_RESET}"

bash
