TV="v2.38.1"
sudo curl -L "https://github.com/docker/compose/releases/download/${TV}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
echo "Docker Compose has been upgraded to ${TV}"

sudo chmod -R 777 datastore

cp .env.template .env