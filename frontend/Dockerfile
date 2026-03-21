# Step 1: Build Angular app
FROM node:18 AS build

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json from fintech-ui folder
COPY fintech-ui/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the Angular app
COPY fintech-ui/ ./

# Build Angular app for production
RUN npm run build -- --configuration production

# Step 2: Serve with nginx
FROM nginx:alpine

# Copy built Angular files to nginx html folder
COPY --from=build /app/dist/fintech-ui /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]