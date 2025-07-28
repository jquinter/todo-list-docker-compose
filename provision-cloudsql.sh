#!/bin/bash
#
# This script provisions a minimal Google Cloud SQL for PostgreSQL instance
# suitable for a sandbox or development environment. It mirrors the setup
# from the docker-compose.yaml file, including database and user creation,
# and runs the initial schema script.

set -eo pipefail # Exit on error, treat unset variables as an error, and fail on pipe errors.

# --- Configuration ---
# You can override these variables or set them as environment variables.
PROJECT_ID=${GCP_PROJECT_ID:-$(gcloud config get-value project)}
INSTANCE_NAME="todo-db-sandbox-instance"
REGION="us-central1"
ZONE="us-central1-f" # Single zone for cost-effectiveness

# Database settings from docker-compose.yaml
DB_NAME="todo"
DB_USER="admin"

# Instance specifications
DB_VERSION="POSTGRES_17"
TIER="db-g1-small" # Sandbox Edition: 1 shared vCPU, 1.7 GB RAM
EDITION="ENTERPRISE"
STORAGE_SIZE="10GB"
STORAGE_TYPE="SSD"

# --- Pre-flight Checks ---
echo "### Checking for required tools..."
command -v gcloud >/dev/null 2>&1 || { echo >&2 "I require 'gcloud' but it's not installed. Aborting."; exit 1; }
command -v psql >/dev/null 2>&1 || { echo >&2 "I require 'psql' but it's not installed. Aborting."; exit 1; }

if [[ -z "$PROJECT_ID" ]]; then
    echo "GCP Project ID is not set. Please set it using 'gcloud config set project YOUR_PROJECT_ID' or by setting the GCP_PROJECT_ID environment variable."
    exit 1
fi

echo "### Configuration:"
echo "Project ID:      $PROJECT_ID"
echo "Instance Name:   $INSTANCE_NAME"
echo "Region/Zone:     $REGION/$ZONE"
echo "Database:        $DB_NAME"
echo "User:            $DB_USER"
echo
read -p "Is this configuration correct? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1
fi

# --- Main Script ---

echo -e "\n--- Enabling Cloud SQL Admin API ---"
gcloud services enable sqladmin.googleapis.com --project="$PROJECT_ID"

echo -e "\n--- Generating a secure password for user '$DB_USER' ---"
DB_PASSWORD=$(openssl rand -base64 16)
echo "Password has been generated."

echo -e "\n--- Creating Cloud SQL Sandbox Instance: $INSTANCE_NAME ---"
echo "This may take several minutes..."
gcloud sql instances create "$INSTANCE_NAME" \
    --database-version="$DB_VERSION" \
    --edition="$EDITION" \
    --tier="$TIER" \
    --zone="$ZONE" \
    --storage-size="$STORAGE_SIZE" \
    --storage-type="$STORAGE_TYPE" \
    --assign-ip \
    --project="$PROJECT_ID"

echo -e "\n--- Creating database '$DB_NAME' ---"
gcloud sql databases create "$DB_NAME" --instance="$INSTANCE_NAME" --project="$PROJECT_ID"

echo -e "\n--- Creating user '$DB_USER' ---"
gcloud sql users create "$DB_USER" --instance="$INSTANCE_NAME" --password="$DB_PASSWORD" --project="$PROJECT_ID"

echo -e "\n--- Authorizing current IP for connection ---"
CURRENT_IP=$(curl -s ifconfig.me)
gcloud sql instances patch "$INSTANCE_NAME" --authorized-networks="$CURRENT_IP/32" --project="$PROJECT_ID"

echo -e "\n--- Getting instance public IP address ---"
INSTANCE_IP=$(gcloud sql instances describe "$INSTANCE_NAME" --project="$PROJECT_ID" --format='value(ipAddresses.ipAddress.flatten())')

echo -e "\n--- Running initialization script (database/init.sql) ---"
export PGPASSWORD=$DB_PASSWORD
psql -h "$INSTANCE_IP" -U "$DB_USER" -d "$DB_NAME" -f ./database/init.sql
unset PGPASSWORD

echo -e "\n--- Cleaning up: Revoking IP authorization ---"
gcloud sql instances patch "$INSTANCE_NAME" --clear-authorized-networks --project="$PROJECT_ID"

echo -e "\n✅ --- Provisioning Complete! --- ✅"
echo
echo "Your Cloud SQL instance '$INSTANCE_NAME' is ready."
echo "--------------------------------------------------"
echo "Instance Connection Name: $(gcloud sql instances describe "$INSTANCE_NAME" --project="$PROJECT_ID" --format='value(connectionName)')"
echo "Public IP Address:        $INSTANCE_IP"
echo "Database Name:            $DB_NAME"
echo "Database User:            $DB_USER"
echo "Generated Password:       $DB_PASSWORD"
echo "--------------------------------------------------"
echo "NOTE: The generated password is shown for convenience. Store it securely in a secret manager for your application."