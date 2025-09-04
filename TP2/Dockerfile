FROM node:20  
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

# node:20 es que mi imagen va a estar basada en la version 20 de node