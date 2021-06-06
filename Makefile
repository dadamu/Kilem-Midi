localnet-up:
	docker-compose --env-file=./.env up -d

localnet-down:
	docker-compose down