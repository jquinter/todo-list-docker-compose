SUBSTITUTIONS=$(
cat <<EOL
TAG_NAME=fe-v$(date +%Y%m%d-%H%M%S),
_FRONTEND_SERVICE_NAME=todo-frontend,
_VUE_APP_API_URL=https://todo-backend-243173482136.us-central1.run.app,
_SERVICE_ACCOUNT_NAME=cloud-build-custom-sa,
_CLOUD_RUN_REGION=us-central1,
_CLOUD_RUN_PORT=8080
EOL
)

gcloud builds submit . \
	--config cloudbuild-fe.yaml \
	--substitutions=$(echo $SUBSTITUTIONS|tr -d ' ')
