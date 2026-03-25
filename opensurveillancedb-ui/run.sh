#!/bin/bash
set -ex

IMAGE_NAME=${IMAGE_NAME:-opensurveillancedb-ui}
IMAGE_TAG=${IMAGE_TAG:-latest}
PUBLIC_PORT=${PUBLIC_PORT:-8080}

docker run --rm -p${PUBLIC_PORT}:80 $IMAGE_NAME:$IMAGE_TAG