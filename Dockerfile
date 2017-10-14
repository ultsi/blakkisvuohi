FROM node:8.7.0

WORKDIR /app/blakkisvuohi

COPY package.json .

RUN npm install

COPY . .

CMD ["node", "index.js"]
