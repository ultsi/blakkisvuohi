# BläkkisVuohi

## How to run

Build dockerfile

```
docker build -t blakkisvuohi .
```

Run postgresql 9.6

```
mkdir -p /srv/lxc/postgresql/data

docker pull postgres:9.6.5

docker run --name postgres \
  -v /srv/lxc/postgresql/data:/var/lib/postgresql/data \
  -d postgres:9.6.5

```

Run the vuohi

```
docker run --name blakkisvuohi \
  --link postgres:postgres \
  -e TOKEN="284536119:AAFiW5_Ugflkzdx940WMEcjhsKfH-mMe2xk" \
  -e NODE_ENV="production" \
  -e DATABASE_URL="postgres://qqvkgaroocichu:8eed6802759bbee7b1a82bcead06e5268250bbab97d87862bb4f2dc9aa06cd78@ec2-54-75-247-119.eu-west-1.compute.amazonaws.com:5432/d6ea7o2frpi86f" \
  -d blakkisvuohi:latest
```
