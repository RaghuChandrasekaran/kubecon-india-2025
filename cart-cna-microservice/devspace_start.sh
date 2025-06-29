#!/bin/bash
set +e

echo "Building Cart Service..."
gradle --no-daemon build

COLOR_CYAN="\033[0;36m"
COLOR_RESET="\033[0m"

echo -e "${COLOR_CYAN}
🚀 Cart Service Development Container Ready!

Commands:
- gradle bootRun  (start the service)
- gradle build    (build the project)
- gradle test     (run tests)

Access: http://localhost:8090/swagger-ui.html
${COLOR_RESET}"

bash