FROM node:14

WORKDIR /app
COPY . .

RUN apt-get update
RUN apt install ffmpeg -y

RUN npm install

CMD ["npm", "start"]