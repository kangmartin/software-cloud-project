# Software Cloud Project - EFREI
**By Martin KANG, Manal GHARRABOU, Rayan HOUFANI**

Summary of the stack:
- a Node.js/Express backend (REST API)
- a React frontend
- a Kubernetes deployment exposed through NGINX Ingress

## 1) What this project does

The application displays a list of books from a backend API.

Request flow:
1. The browser loads the frontend on host `library.local`.
2. The frontend calls `GET /api/books`.
3. Ingress routes `/api/*` traffic to the backend service.
4. The backend returns in-memory data (no persistent database yet).
5. Non-API paths are routed to the frontend service.

## 2) Architecture overview

- `Backend/`
  - Express API on port 3000
  - health endpoint: `/health`
  - business endpoints: `/books`, `/books/:id`, `POST /books`
- `Frontend/`
  - React app calling the API with a relative path: `/api/books`
  - static build served by Nginx on port 80
- `k8s/`
  - 2 Deployments (backend + frontend)
  - 2 ClusterIP Services (backend + frontend)
  - 1 Ingress entry point (`library.local`)

Service communication summary:
- Browser -> Ingress (`library.local`)
- Ingress -> `front-service` for UI routes (`/`, static content)
- Ingress -> `book-service` for API routes (`/api/*`)
- `front-service` targets frontend pods (`library-front`)
- `book-service` targets backend pods (`book-app`)
- Frontend calls backend only through Ingress using `/api/books`

## 3) Docker images pulled by Kubernetes

From the current Kubernetes manifests:
- Backend image: `kangmartin/book-service:1`
- Frontend image: `kangmartin/library-front:latest`

These images are hosted on Docker Hub (repository namespace: `kangmartin`) and are pulled by Kubernetes when pods start.

How pull works in this project:
- Kubernetes pulls images when pods are created.


## 4) Kubernetes files explained

### `k8s/book-deployment.yaml`
- Backend Deployment
- `replicas: 2`
- image: `kangmartin/book-service:1`
- `imagePullPolicy: Always`
- container port: 3000
- liveness probe on `/health`
- CPU/memory requests and limits configured

### `k8s/book-service.yaml`
- `ClusterIP` service for backend
- service port 80 -> container port 3000

### `k8s/front-deployment.yaml`
- Frontend Deployment
- `replicas: 1`
- image: `kangmartin/library-front:latest`
- container port: 80

### `k8s/front-service.yaml`
- `ClusterIP` service for frontend
- service port 80 -> container port 80

### `k8s/ingress.yaml`
- host: `library.local`
- routing rules:
  - `/api(/|$)(.*)` -> `book-service:80`
  - `/()(.*)` -> `front-service:80`

Why rewrite matters:
- `GET /api/books` becomes `GET /books` at backend level.
- `GET /api/health` becomes `GET /health`.
- UI routes are served by frontend.

## 5) How to test the project

### Prerequisites
- A running Kubernetes cluster (Minikube, kind, or Docker Desktop Kubernetes)
- NGINX Ingress Controller installed in the cluster
- `kubectl` configured on your current context

### Step 1: Deploy everything

```bash
kubectl apply -f k8s/
```

### Step 2: Verify resources

```bash
kubectl get deployments
kubectl get pods -o wide
kubectl get svc
kubectl get ingress
```

Expected:
- backend deployment with 2 pods
- frontend deployment with 1 pod
- both services in `ClusterIP`
- ingress named `library-ingress`


### Step 3: Expose host locally

Add this entry to `/etc/hosts` if needed:

```txt
127.0.0.1 library.local
```

If you use Minikube Ingress, you may need:

```bash
minikube addons enable ingress
minikube tunnel
```

### Step 5: Test from browser and curl

Open:
- `http://library.local`

API checks through Ingress:

```bash
curl http://library.local/api/books
curl http://library.local/api/health
```

Both calls should return HTTP 200 when everything is healthy.

