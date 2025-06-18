#!/bin/sh
# This script generates a runtime config with environment variables

# Default values
PRODUCTS_URL=${REACT_APP_PRODUCTS_URL_BASE:-http://localhost:8081/}
CART_URL=${REACT_APP_CART_URL_BASE:-http://localhost:8080/}

# Create config file with the environment variables
cat <<EOF > /store-ui/config.js
window.ENV = {
  REACT_APP_PRODUCTS_URL_BASE: "${PRODUCTS_URL}",
  REACT_APP_CART_URL_BASE: "${CART_URL}"
};
EOF

# Execute the CMD
exec "$@"