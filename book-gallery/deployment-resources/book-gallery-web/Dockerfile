FROM nginx:alpine

# Copy Angular build output
COPY dist/book-gallery-web/browser /usr/share/nginx/html

# Nginx config for routing
COPY nginx.conf /etc/nginx/conf.d/default.conf