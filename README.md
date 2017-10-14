# BläkkisVuohi

## How to run

Build dockerfile

```
docker build -t blakkisvuohi .
```

Run postgresql 9.6

```
mkdir -p /srv/lxc/postgresql/data

docker pull postgres:9.6.5-alpine

docker run --name postgres \
  -v /srv/lxc/postgresql/data:/var/lib/postgresql/data \
  -d postgres:9.6.5-alpine

```

Run the vuohi

```
docker run --name blakkisvuohi \
  --link postgres:postgres \
  -e TOKEN="320304045:AAGy_QnrHs77BdeC8hjNn6YC-nFu5m5v6MQ" \
  -e NODE_ENV="production" \
  -e DATABASE_URL="postgres://qqvkgaroocichu:8eed6802759bbee7b1a82bcead06e5268250bbab97d87862bb4f2dc9aa06cd78@172.17.0.2:5432/blakkisvuohi" \
  -d blakkisvuohi:latest
```
