FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the server code
COPY . .

# Make the startup script executable (also strip Windows CRLF line endings)
RUN sed -i 's/\r//' start.sh && chmod +x start.sh

# Expose backend port
EXPOSE 5000

# Runs API server + Bull worker together (free-tier workaround — no separate worker service)
CMD ["/bin/sh", "start.sh"]
