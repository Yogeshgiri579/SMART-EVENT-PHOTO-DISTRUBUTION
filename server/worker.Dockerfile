FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

# Worker-specific command — processes the Bull queue
CMD ["npm", "run", "worker"]
