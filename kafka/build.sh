#!/bin/bash
set -e

VERSION="1.0.0"

docker build -t "srokaemil/mes-broker:$VERSION" .
docker tag "srokaemil/mes-broker:$VERSION" "srokaemil/mes-broker:latest"
docker push "srokaemil/mes-broker:latest"
docker push "srokaemil/mes-broker:$VERSION"
