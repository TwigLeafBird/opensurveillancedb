IMAGE_REPO  := twigleafbird/opensurveillancedb-ui
IMAGE_TAG   := latest

SYSTEMD_DIR := /etc/systemd/system
SERVICE_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))

.PHONY: docker-build docker-push install-services reload

docker-build:
	docker build -t $(IMAGE_REPO):$(IMAGE_TAG) .

docker-push:
	docker push $(IMAGE_REPO):$(IMAGE_TAG)

install-services:
	sudo ln -sf $(SERVICE_DIR)/opensurveillancedb-ui.service $(SYSTEMD_DIR)/opensurveillancedb-ui.service
	sudo ln -sf $(SERVICE_DIR)/opensurveillancedb-caddy.service $(SYSTEMD_DIR)/opensurveillancedb-caddy.service
	sudo systemctl daemon-reload

reload:
	sudo systemctl daemon-reload
