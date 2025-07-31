#!/bin/bash
set +e

export NODE_ENV=development

COLOR_GREEN="\033[0;92m"
COLOR_BLUE="\033[0;94m"
COLOR_YELLOW="\033[0;93m"
COLOR_PURPLE="\033[0;95m"
COLOR_RESET="\033[0m"

echo -e "${COLOR_GREEN}
🚀 Store UI Development Container Ready!

Dependencies and build already completed during image creation!

Commands:
- npm start     (start the React development server)
- npm run build (rebuild if needed)
- npm test      (run tests)

Access: http://localhost:3000
${COLOR_RESET}"

echo -e "${COLOR_BLUE}
🔧 Quick Debug:
${COLOR_RESET}"

echo -e "${COLOR_PURPLE}
• Browser: http://localhost:3000 → F12 → Sources → Set breakpoints
• VS Code: Chrome --remote-debugging-port=9339 → Attach to Chrome
• React DevTools: Install extension for component debugging
${COLOR_RESET}"

bash
