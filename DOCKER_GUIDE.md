# Docker Setup for HCI VACA App

## Development Mode (with hot reload)

Build and run the development container:
```bash
docker-compose -f docker-compose.dev.yml up --build
```

Access at: http://localhost:5173

Stop the container:
```bash
docker-compose -f docker-compose.dev.yml down
```

## Production Mode

Build and run the production container:
```bash
docker-compose up --build
```

Access at: http://localhost:3000

Stop the container:
```bash
docker-compose down
```

## Other Useful Commands

Build only (without running):
```bash
docker build -t vaca-app .
```

Run production container manually:
```bash
docker run -p 3000:80 vaca-app
```

View running containers:
```bash
docker ps
```

View all containers:
```bash
docker ps -a
```

Remove stopped containers:
```bash
docker container prune
```

Remove images:
```bash
docker image prune -a
```
