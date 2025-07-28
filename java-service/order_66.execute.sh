MVN_TARGETVERSION="maven:3.9.11-ibm-semeru-21-noble"
COMMAND=$(
cat <<EOL
./mvnw quarkus:dev -ntp
EOL
)

podman run -it --rm \
    -p 8082:8082 \
    -p 8083:8083 \
    -p 9000:9000 \
    --name execute_order_66 \
    --network=todo-app_default \
    -v "$(pwd)":/usr/src/mymaven \
    -w /usr/src/mymaven/todo-service ${MVN_TARGETVERSION} \
    ${COMMAND}    
