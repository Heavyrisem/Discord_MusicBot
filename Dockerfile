FROM node:16

WORKDIR /app
COPY . .

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get install -y ffmpeg

RUN npm install

CMD ["npm", "start"]