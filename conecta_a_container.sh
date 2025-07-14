#!/bin/sh
display_usage() {
    echo "Usage: $0 CONTAINER_ID [REMOTE_COMMAND]"
    echo "Allows to connect INTO a running container, "
    echo "identified by CONTAINER_ID, "
    echo "executing REMOTE_COMMAND"
}

# Check for arguments
if [[ "$#" -lt 2 ]]; then
  display_usage
  exit 1
fi

CONTAINER_ID=$1
COMMAND=${2:-'/bin/bash'}

docker exec -it \
    ${CONTAINER_ID} \
    ${COMMAND}
