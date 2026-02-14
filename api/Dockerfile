# base image
FROM python:3.11-slim

# set work directory
WORKDIR /app

# install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy project
COPY . .

# expose port
EXPOSE 5000

# default command
CMD ["gunicorn", "app:create_app()", "-b", "0.0.0.0:5000"]
