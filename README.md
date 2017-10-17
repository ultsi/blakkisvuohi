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
  --restart always \
  -d postgres:9.6.5-alpine

```

Run the vuohi

```
docker run --name blakkisvuohi \
  --link postgres:postgres \
  -e TOKEN="***REMOVED***" \
  -e NODE_ENV="production" \
  -e DATABASE_URL="***REMOVED***" \
  --restart always \
  -d blakkisvuohi:latest
```
