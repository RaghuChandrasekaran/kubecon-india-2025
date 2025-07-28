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
🔧 Debugging Options (Choose Your Preferred Method):
${COLOR_RESET}"

echo -e "${COLOR_PURPLE}
Option 1: Browser DevTools (Easiest - No Setup Required)
1. Open http://localhost:3000 in any browser
2. Press F12 to open DevTools
3. Go to Sources tab → Set breakpoints directly
4. Refresh page to hit breakpoints
${COLOR_RESET}"

echo -e "${COLOR_YELLOW}
Option 2: VS Code with Separate Chrome Profile (No Main Browser Disruption)
1. Launch Chrome with debugging in separate profile:
   google-chrome --remote-debugging-port=9339 --user-data-dir=/tmp/vscode-chrome-debug --new-window

2. Navigate to: http://localhost:3000 in this new Chrome window

3. In VS Code, use debug config: 'Attach to Chrome (Remote Debug)'

4. Set breakpoints in .tsx files and debug in VS Code!
${COLOR_RESET}"

echo -e "${COLOR_BLUE}
Option 3: Browser Extension (React Developer Tools)
1. Install React Developer Tools extension in Chrome/Firefox
2. Open http://localhost:3000
3. Use React DevTools for component debugging
4. Combined with F12 DevTools for complete debugging experience
${COLOR_RESET}"

echo -e "${COLOR_GREEN}
💡 Tip: Most developers prefer Option 1 (Browser DevTools) for quick debugging
    and Option 2 (VS Code) for complex debugging sessions.
${COLOR_RESET}"

bash
