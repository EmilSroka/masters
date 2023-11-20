#!/bin/bash
set -e

VERSION="1.0.0"

docker build -t "srokaemil/mes-store:$VERSION" .
docker tag "srokaemil/mes-store:$VERSION" "srokaemil/mes-store:latest"
docker push "srokaemil/mes-store:latest"
docker push "srokaemil/mes-store:$VERSION"
