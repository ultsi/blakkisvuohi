FROM node:8.7.0-alpine

WORKDIR /app/blakkisvuohi

COPY package.json .

RUN npm install

COPY . .

CMD ["node", "index.js"]
