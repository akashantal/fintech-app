# Stage 1: Build Angular app
FROM node:18 AS build
WORKDIR /app

COPY fintech-ui/package*.json ./
RUN npm install

COPY fintech-ui/ ./
RUN npm run build -- --configuration production

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist/fintech-ui /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]