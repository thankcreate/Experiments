#!/bin/bash

if [ ! -d /app/log ]; then
    mkdir -p /app/log
fi

touch /app/log/gunicorn.log
touch /app/log/gunicorn.err
touch /app/log/jupyter.log
touch /app/log/jupyter.err
touch /app/log/nginx.log
touch /app/log/nginx.err

cd /app
supervisord -c  supervisor.conf
