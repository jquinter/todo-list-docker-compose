# npm init -y
# npm install cypress --save-dev
# npx cypress open
podman-compose -f docker-compose.yaml -f docker-compose.test.yaml down -v
podman-compose -f docker-compose.yaml -f docker-compose.test.yaml up --build -d
npx cypress open --project .