#!/bin/bash
set +e

COLOR_CYAN="\033[0;36m"
COLOR_RESET="\033[0m"

echo -e "${COLOR_CYAN}
🚀 Cart Service Development Container Ready!

Commands:
- ./setup.sh --run  (start the service)
- ./setup.sh --test (run tests)

Access: http://localhost:8090/swagger-ui.html
${COLOR_RESET}"

bash