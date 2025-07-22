
SUBSTITUTIONS=$(
cat <<EOL
TAG_NAME=be-v$(date +%Y%m%d-%H%M%S),
_BACKEND_SERVICE_NAME=todo-backend,
_CLOUD_SQL_CONNECTION_NAME=scotiabank-2025-scl-101-custom:us-central1:todo-db-sandbox-instance,
_DB_USER=admin,
_DB_NAME=todo,
_DB_PASSWORD_SECRET=todo-db-admin-password,
_SERVICE_ACCOUNT_NAME=cloud-build-custom-sa,
_CLOUD_RUN_REGION=us-central1
EOL
)

gcloud builds submit . \
	--config cloudbuild-be.yaml \
	--substitutions=$(echo $SUBSTITUTIONS|tr -d ' ')
