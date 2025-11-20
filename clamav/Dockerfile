FROM clamav/clamav:latest

# Disable NotifyClamd to prevent socket warnings while keeping other defaults
RUN sed -i '/^NotifyClamd /c\\# NotifyClamd disabled to avoid unix socket warnings\n# NotifyClamd /etc/clamav/clamd.conf' /etc/clamav/freshclam.conf

