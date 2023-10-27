setup:
	@ pip3 install virtualenv && virtualenv .venv && source ./.venv/bin/activate && pip install -r requirements.txt

run:
	@ uvicorn main:app --reload

build:
	@ docker build -t srokaemil/mes-backend:0.0.3 . && docker tag srokaemil/mes-backend:0.0.3 srokaemil/mes-backend:latest