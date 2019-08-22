#!/bin/bash

if [ ! -d ./log ]; then
    mkdir -p ./log
fi

touch ./log/gunicorn.log
touch ./log/gunicorn.err
touch ./log/jupyter.log
touch ./log/jupyter.err
touch ./log/nginx.log
touch ./log/nginx.err

export TFHUB_DOWNLOAD_PROGRESS=1
export FLASK_APP=experiments.py

supervisord -c  supervisor.conf