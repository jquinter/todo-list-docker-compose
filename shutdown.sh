COMPOSE_COMMAND="docker-compose"

# Detect OS
if [[ "$(uname)" == "Darwin" ]]; then
    COMPOSE_COMMAND="podman-compose"
    echo "Detected macOS, using podman-compose."
else
    echo "Detected Linux/other OS, using docker-compose."
fi

${COMPOSE_COMMAND} \
    -f docker-compose.yaml \
    -f docker-compose.test.yaml \
    down -v
