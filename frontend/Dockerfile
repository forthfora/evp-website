# --- STAGE 1: Build the Vite App ---
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
# Copy all local files to the container
COPY . . 
RUN npm run build

# --- STAGE 2: Serve with Nginx ---
FROM nginx:alpine
# Copy the Vite build output to Nginx's public directory
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy a custom Nginx config to handle React Router/Vite routing smoothly
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]