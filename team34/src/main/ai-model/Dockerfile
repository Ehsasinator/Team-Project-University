FROM python

WORKDIR /app
ADD requirements.txt /app
RUN apt update && apt install libhdf5-dev -y
RUN pip install -r requirements.txt

ADD . /app
CMD ["python3", "app.py"]