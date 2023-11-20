FROM python:3.11.4-bookworm

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt


COPY . /app/

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80", "--reload"]
