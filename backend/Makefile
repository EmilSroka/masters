setup:
	@ pip3 install virtualenv && virtualenv .venv && source ./.venv/bin/activate && pip install -r requirements.txt

run:
	@ uvicorn main:app --reload

build:
	@ docker build -t srokaemil/mes-backend:1.0.1 . && docker tag srokaemil/mes-backend:1.0.0 srokaemil/mes-backend:latest

publish:
	@ docker push srokaemil/mes-backend:1.0.1 && docker push srokaemil/mes-backend:latest

build-amd:
	@ docker buildx build --platform linux/amd64 -t "srokaemil/mes-backend:0.0.4" . --push && docker buildx build --platform linux/amd64 -t "srokaemil/mes-backend:latest" . --push