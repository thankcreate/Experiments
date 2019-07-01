FROM tensorflow/tensorflow:latest-py3-jupyter

RUN mkdir /app/log \
    touch /app/log/gunicorn.err /app/log/gunicorn.log \
    /app/log/jupyter.log jupyter.err nginx.log nginx.err 
    
WORKDIR /app
RUN pip install flask gunicorn 
RUN pip install --upgrade google-cloud-texttospeech
RUN apt-get -y install nginx tmux supervisor vim
COPY tron_nginx.conf /etc/nginx/conf.d/

EXPOSE 80
EXPOSE 8888
EXPOSE 8000
EXPOSE 9001
CMD ["supervisord", "-c", "supervisor.conf"]