COMPOSE = docker compose

all: up

install: install-backend install-frontend

# Safe default:
# - rebuild images
# - refresh anonymous volumes (like /usr/src/app/node_modules)
# - keep named volumes (like postgres_data)

build-safe:
	$(COMPOSE) up -d --build --renew-anon-volumes

safe: build-safe generate db-push

sclean:
	$(COMPOSE) down
	
install-frontend:
	cd frontend && npm ci

install-backend:
	cd backend && npm ci

up:
	$(COMPOSE) up -d --build
	$(MAKE) generate
	$(MAKE) db-push
	$(COMPOSE) restart backend
	$(MAKE) logs


# Builds the docker, with the option to use the terminal at the same time
up-d:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

clean:
	$(COMPOSE) down -v --rmi all --remove-orphans

fclean: clean
	docker system prune -f -a --volumes

re: fclean all

# Show the docker logs
logs:
	$(COMPOSE) logs -f

# Allow to update the schema.prisma in data base
migrate:
	docker exec -it chess_backend npx prisma migrate dev

# Updates the TypeScript of prisma code
generate:
	docker exec -it chess_backend npx prisma generate

db-push:
	docker exec -it chess_backend npx prisma db push

# Open a visual data base panel ... like excel
studio:
	docker exec -it chess_backend npx prisma studio

# Deletes all volumes to free some space
atomic-bomb:
	docker volume rm $(docker volume ls -q)

# Restart backend
backend-restart:
	docker restart chess_backend

# Intall prisma client
install-prisma:
	docker exec -it chess_backend sh -c "npm install @prisma/client && npx prisma generate"

.PHONY: all up up-d down clean fclean re logs


# npx prisma generate --name TokenMail --schema=./backend/prisma/schema.prisma