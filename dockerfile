FROM tensorflow/tensorflow:1.14.0-py3-jupyter


WORKDIR /app
RUN pip install flask gunicorn tensorflow-hub seaborn flask-sqlalchemy flask-migrate flask-bootstrap flask-wtf
RUN pip install --upgrade google-cloud-texttospeech 
RUN pip install requests pillow
RUN apt-get update
RUN apt-get -y install nginx tmux supervisor vim
# COPY tron_nginx.conf /etc/nginx/conf.d/    -- now directly mounted in compose.yml

EXPOSE 80
EXPOSE 8888
EXPOSE 8000
EXPOSE 9001
CMD ["/bin/bash", "docker_startup.sh"]