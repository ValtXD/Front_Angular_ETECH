FROM node:20.15.1 as builder

WORKDIR /app

COPY . .
RUN npm install
RUN npm run build -- --configuration production

FROM nginx:alpine

COPY --from=builder /app/dist/energy-manager-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY mime.types /etc/nginx/mime.types

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
