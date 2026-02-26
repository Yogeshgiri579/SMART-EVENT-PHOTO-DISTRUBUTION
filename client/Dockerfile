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

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from the first stage to replace the default Nginx contents
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to the outside
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
