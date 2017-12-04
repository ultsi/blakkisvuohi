FROM node:8.7.0

WORKDIR /app/blakkisvuohi

RUN npm install canvas@1.6.7

RUN npm install newrelic@2.4.1

COPY package.json .

RUN npm install

RUN echo "Europe/Helsinki" > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

COPY . .

CMD ["node", "index.js"]
