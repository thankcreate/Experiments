FROM tensorflow/tensorflow:latest-py3-jupyter

WORKDIR /app
RUN pip install flask gunicorn 
RUN pip install --upgrade google-cloud-texttospeech
RUN apt-get -y install nginx tmux supervisor vim
COPY tron_nginx.conf /etc/nginx/conf.d/


EXPOSE 8888
EXPOSE 8000
EXPOSE 9001
CMD ["supervisord", "-c", "supervisor.conf"]