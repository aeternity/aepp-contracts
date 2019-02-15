GIT_DESCR = $(shell git describe --always)
# build output folder
OUTPUTFOLDER = dist
# docker image
DOCKER_REGISTRY = 166568770115.dkr.ecr.eu-central-1.amazonaws.com/aeternity
DOCKER_IMAGE = aepp-contracts
DOCKER_TAG = $(shell git describe --always --tags)
# epoch url used at build time
NODE_URL='//sdk-testnet.aepps.com/'
# k8s
K8S_NAMESPACE=testnet

.PHONY: list
list:
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | xargs

clean:
	@echo remove $(OUTPUTFOLDER) folder
	@rm -rf dist
	@echo done

build:
	@echo build release
	yarn install && VUE_APP_NODE_INTERNAL_URL='$(NODE_URL)' VUE_APP_NODE_URL='$(NODE_URL)' yarn run build
	@echo done

docker-build:
	@echo build image
	docker build --build-arg VUE_APP_NODE_URL='$(NODE_URL)' --build-arg VUE_APP_NODE_INTERNAL_URL='$(NODE_URL)' -t $(DOCKER_IMAGE) -f Dockerfile .
	@echo done

docker-push:
	@echo push image
	docker tag $(DOCKER_IMAGE) $(DOCKER_REGISTRY)/$(DOCKER_IMAGE):$(DOCKER_TAG)
	aws ecr get-login --no-include-email --region eu-central-1 --profile aeternity-sdk | sh
	docker push $(DOCKER_REGISTRY)/$(DOCKER_IMAGE):$(DOCKER_TAG)
	@echo done

deploy-k8s:
	@echo deploy k8s
	kubectl -n $(K8S_NAMESPACE) patch deployment $(DOCKER_IMAGE) --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value":"$(DOCKER_REGISTRY)/$(DOCKER_IMAGE):$(DOCKER_TAG)"}]'
	@echo deploy k8s done

debug-start:
	VUE_APP_NODE_INTERNAL_URL='$(NODE_URL)' VUE_APP_NODE_URL='$(NODE_URL)' yarn start:dev
