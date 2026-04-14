IMAGE_REPO  := twigleafbird/opensurveillancedb-ui
IMAGE_TAG   := latest

SYSTEMD_DIR := /etc/systemd/system
SERVICE_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))

LOCAL_PORT  := 8080

.PHONY: docker-build docker-push docker-run install-services reload

docker-build:
	docker build -t $(IMAGE_REPO):$(IMAGE_TAG) .

docker-push:
	docker push $(IMAGE_REPO):$(IMAGE_TAG)

docker-run:
	docker run --rm --name opensurveillancedb-ui --publish $(LOCAL_PORT):80 --env-file $(SERVICE_DIR)/.env $(IMAGE_REPO):$(IMAGE_TAG)

install-services:
	sudo ln -sf $(SERVICE_DIR)/opensurveillancedb-ui.service $(SYSTEMD_DIR)/opensurveillancedb-ui.service
	sudo ln -sf $(SERVICE_DIR)/opensurveillancedb-caddy.service $(SYSTEMD_DIR)/opensurveillancedb-caddy.service
	sudo systemctl daemon-reload

reload:
	sudo systemctl daemon-reload
