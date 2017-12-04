# BläkkisVuohi

A telegram bot designed to help monitor current EBAC level. Has group functionality to list all users' EBAC in permilles or standard drinks (10.6 grams). Try it out at [https://t.me/blakkisvuohibot](https://t.me/blakkisvuohibot)!

Thanks Yago for the excellent [Telegram Bot API framework for NodeJS](https://github.com/yagop/node-telegram-bot-api).

## How to run

### VPS

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

Run the vuohi. Remember to set .env variables correctly

```
source .env &&
docker run --name blakkisvuohi \
  --link postgres:postgres \
  -e TOKEN=$TOKEN \
  -e DATABASE_URL=$DATABASE_URL \
  -e NEWRELIC=$NEWRELIC \
  -e NEWRELIC_LICENSE=$NEWRELIC_LICENSE \
  -e BOT_MODE=polling \
  -e NODE_ENV=production \
  --restart always \
  -d blakkisvuohi:latest
```

### Heroku

Set the next env variables:
- `TOKEN` = your bot token
- `APP_URL` = your heroku url (i.e. https://blakkisvuohi.heroku.com)
- `DATABASE_URL` = your database url
- `NODE_ENV` = 'production'
- `BOT_MODE` = 'webhook'

Bot runs automatically when pushed to the Heroku remote.