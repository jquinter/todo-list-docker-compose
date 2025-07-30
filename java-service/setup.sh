#!/bin/bash

# Initialize variables with default empty values
BASE=""
EXTENSIONS=""
MISC=""

# Parse command line arguments
# Using getopts for more robust argument parsing, though a simple while loop
# with case is also common for optional arguments without short flags.
# For simplicity and direct mapping to the requested parameters,
# we'll use a while loop with case.

# Loop through arguments
while [[ "$#" -gt 0 ]]; do
    case "$1" in
        --base)
            # Check if the next argument exists and is not another flag
            if [[ -n "$2" && "$2" != --* ]]; then
                BASE="$2"
                shift # Consume the value
            else
                echo "Error: --base requires a value."
                exit 1
            fi
            ;;
        --extensions)
            if [[ -n "$2" && "$2" != --* ]]; then
                EXTENSIONS="$2"
                shift
            else
                echo "Error: --extensions requires a value."
                exit 1
            fi
            ;;
        --misc)
            if [[ -n "$2" && "$2" != --* ]]; then
                MISC="$2"
                shift
            else
                echo "Error: --misc requires a value."
                exit 1
            fi
            ;;
        --clean-install)
            if [[ -n "$2" && "$2" != --* ]]; then
                CLEANINSTALL="$2"
                shift
            else
                echo "Error: --clean-install requires a value."
                exit 1
            fi
            ;;            
        *)
            # Unknown option
            echo "Unknown parameter passed: $1"
            exit 1
            ;;
    esac
    shift # Consume the argument (flag)
done

# --- Script Logic Starts Here ---

echo "--- Script Parameters ---"
echo "Base: ${BASE:-(Not provided)}"        # Display "Not provided" if empty
echo "Extensions: ${EXTENSIONS:-(Not provided)}"
echo "Misc: ${MISC:-(Not provided)}"
echo "-------------------------"

# Example usage of the variables:
if [[ -n "$BASE" ]]; then
    echo "Processing base: $BASE"
    # Add your logic here that uses the $BASE variable
    MVN_TARGETVERSION="maven:3.9.11-ibm-semeru-21-noble"
    COMMAND="mvn -ntp clean install"

    # BASE INSTALL
    COMMAND=$(
    cat <<EOL
mvn -ntp io.quarkus.platform:quarkus-maven-plugin:3.24.5:create \
    -DprojectGroupId=org.acme \
    -DprojectArtifactId=todo-service
EOL
)

    podman run -it --rm \
        -v "$(pwd)":/usr/src/mymaven \
        -w /usr/src/mymaven ${MVN_TARGETVERSION} \
        ${COMMAND}    
fi

if [[ -n "$EXTENSIONS" ]]; then
    echo "Processing extensions: $EXTENSIONS"
    # Add your logic here that uses the $EXTENSIONS variable
    MVN_TARGETVERSION="maven:3.9.11-ibm-semeru-21-noble"    

    COMMAND=$(
    cat <<EOL
./mvnw -ntp quarkus:add-extension -Dextensions=${EXTENSIONS}
EOL
)

    podman run -it --rm \
        -v "$(pwd)":/usr/src/mymaven \
        -w /usr/src/mymaven/todo-service ${MVN_TARGETVERSION} \
        ${COMMAND}      
    
fi

if [[ -n "$CLEANINSTALL" ]]; then
    echo "Processing CLEANINSTALL: $CLEANINSTALL"
    # Add your logic here that uses the $CLEANINSTALL variable
    MVN_TARGETVERSION="maven:3.9.11-ibm-semeru-21-noble"    
    COMMAND="mvn -ntp clean install"

    podman run -it --rm \
        -v "$(pwd)":/usr/src/mymaven \
        -w /usr/src/mymaven/todo-service ${MVN_TARGETVERSION} \
        ${COMMAND}          
fi

if [[ -n "$MISC" ]]; then
    echo "Processing miscellaneous: $MISC"
    # Add your logic here that uses the $MISC variable
    MVN_TARGETVERSION="maven:3.9.11-ibm-semeru-21-noble"    
    COMMAND="mvn -ntp $MISC"

    podman run -it --rm \
        -v "$(pwd)":/usr/src/mymaven \
        -w /usr/src/mymaven/todo-service ${MVN_TARGETVERSION} \
        ${COMMAND}    
fi

echo "Script finished."
