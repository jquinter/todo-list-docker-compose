MVN_TARGETVERSION="maven:3.9.11-ibm-semeru-21-noble"
COMMAND=$(
cat <<EOL
./mvnw test -ntp
EOL
)

podman run -it --rm \
    -p 8081:8080 \
    -v "$(pwd)":/usr/src/mymaven \
    -w /usr/src/mymaven/todo-service ${MVN_TARGETVERSION} \
    ${COMMAND}    

