FROM tensorflow/tensorflow:1.14.0-py3-jupyter

WORKDIR /app
RUN pip install --upgrade pip
RUN pip uninstall -y enum34
RUN pip install flask gunicorn tensorflow-hub seaborn flask-sqlalchemy flask-migrate flask-bootstrap flask-wtf
RUN pip install --upgrade google-cloud-texttospeech 
RUN pip install requests Pillow
RUN apt-get update
RUN apt-get -y install nginx tmux supervisor vim

EXPOSE 80
EXPOSE 8888
EXPOSE 8000
EXPOSE 9001
CMD ["/bin/bash", "docker_startup.sh"]
