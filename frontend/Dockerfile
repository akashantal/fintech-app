# Step 1: Build Angular
FROM node:18 AS build

WORKDIR /app

# Copy package.json & package-lock.json
COPY fintech-ui/package*.json ./
RUN npm install

# Copy all Angular source files
COPY fintech-ui/ ./
RUN npm run build -- --configuration production

# Step 2: Serve with nginx
FROM nginx:alpine

COPY --from=build /app/dist/fintech-ui /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]