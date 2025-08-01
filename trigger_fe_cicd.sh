SUBSTITUTIONS=$(
cat <<EOL
TAG_NAME=fe-v$(date +%Y%m%d-%H%M%S),
_FRONTEND_SERVICE_NAME=todo-frontend,
_BACKEND_URL=https://todo-backend-p4e5pamr7q-uc.a.run.app,
_SERVICE_ACCOUNT_NAME=cloud-build-custom-sa,
_CLOUD_RUN_REGION=us-central1,
_CLOUD_RUN_PORT=8080
EOL
)

gcloud run services update-traffic todo-frontend \
	--region=us-central1 \
	--to-latest

gcloud builds submit . \
	--config cloudbuild-fe.yaml \
	--substitutions=$(echo $SUBSTITUTIONS|tr -d ' ')
