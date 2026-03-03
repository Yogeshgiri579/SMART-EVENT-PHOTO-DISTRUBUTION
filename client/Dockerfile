# Step 1: Build the React Application
FROM node:18-alpine as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the Vite application
RUN npm run build

# Step 2: Serve the application with Nginx
FROM nginx:alpine

# Install gettext for envsubst (to substitute env vars in nginx.conf at startup)
RUN apk add --no-cache gettext

# Copy the nginx config as a *template* — envsubst will fill in ${BACKEND_URL} at startup
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy the entrypoint script that runs envsubst then starts nginx
COPY nginx-entrypoint.sh /docker-entrypoint.sh
# Strip Windows CRLF line endings (\r\n → \n) — critical for Alpine sh to execute the script
RUN sed -i 's/\r//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

# Copy the build output from the first stage to replace the default Nginx contents
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to the outside
EXPOSE 80

# Run entrypoint script: fills in BACKEND_URL → writes /etc/nginx/conf.d/default.conf → starts nginx
CMD ["/docker-entrypoint.sh"]
