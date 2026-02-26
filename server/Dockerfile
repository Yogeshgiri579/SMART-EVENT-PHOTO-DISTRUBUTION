FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the server code
COPY . .

# Expose backend port
EXPOSE 5000

# Default command for backend (will be overridden by worker in docker-compose)
CMD ["npm", "start"]
