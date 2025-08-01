PROJECT_ID=scotiabank-2025-scl-101-custom
REGION=us-central1
FRONTEND=todo-frontend
BACKEND=todo-backend
SUBNET_NAME=default

echo "Parchando frontend: trafico de egreso solo por la VPC"
gcloud beta run services update $FRONTEND \
    --network=$SUBNET_NAME \
    --subnet=$SUBNET_NAME  \
    --vpc-egress=private-ranges-only \
    --region=$REGION

echo "Validando frontend: trafico de egreso solo por la VPC"
gcloud beta run services describe $FRONTEND \
    --region=$REGION

echo "Habilitando Private Google Access en la subred $SUBNET_NAME"
gcloud compute networks subnets update $SUBNET_NAME \
    --region=$REGION \
    --enable-private-ip-google-access

echo "Validando Private Google Access en la subred $SUBNET_NAME"
gcloud compute networks subnets describe $SUBNET_NAME \
    --region=$REGION \
    --format="get(privateIpGoogleAccess)"

echo "Parchando backend: trafico interno"
gcloud run services update $BACKEND \
    --ingress internal \
    --region $REGION

echo "Configurando DNS para el backend (*.run.app) en la zona privada"

# do not include the https:// in your DNS Name
# for example: backend-<hash>-uc.a.run.app
DNS_NAME=todo-backend-p4e5pamr7q-uc.a.run.app

gcloud dns --project=$PROJECT_ID managed-zones create dns-backend-service \
    --description="" \
    --dns-name="a.run.app." \
    --visibility="private" \
    --networks=$SUBNET_NAME

gcloud dns --project=$PROJECT_ID record-sets create $DNS_NAME. \
    --zone="dns-backend-service" \
    --type="A" \
    --ttl="60" \
    --rrdatas="199.36.153.8,199.36.153.9,199.36.153.10,199.36.153.11"

gcloud beta run services update $FRONTEND \
    --network=$SUBNET_NAME \
    --subnet=$SUBNET_NAME \
    --vpc-egress=private-ranges-only \
    --region=$REGION