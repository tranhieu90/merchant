# FROM k8sdev.mbbank.com.vn/cicd-common/node:20.14.0-buster as builder

# WORKDIR /build

# COPY . .
# # RUN rm -rf package_lock.json
# RUN npm install --loglevel verbose

# RUN npm run build -- --base-href=/merchantx/ --deploy-url=/merchantx/

FROM k8sdev.mbbank.com.vn/support/nginx:1.21.4

# COPY --from=builder /build/dist/merchantx/browser /usr/share/nginx/html/merchantx
COPY  /dist/merchantx/browser /usr/share/nginx/html/merchantx

# COPY dist/merchantx/browser /usr/share/nginx/html/merchantx
RUN mv /usr/share/nginx/html/merchantx/index.csr.html /usr/share/nginx/html/merchantx/index.html
COPY cicd/tanzu-uat/L01/configmap-k8s/nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

RUN touch /var/run/nginx.pid && \
        chown -R nginx:nginx /var/run/nginx.pid

USER nginx

CMD ["nginx", "-g", "daemon off;"]


# VOLUME /var/cache/nginx/  
# VOLUME /var/run/  
# VOLUME /var/log/nginx 
