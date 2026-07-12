# Car Dealership Inventory System

A full-stack Car Dealership Inventory System built as part of the Incubyte Full Stack Assessment. The application provides inventory management, user authentication, role-based authorization, vehicle purchasing, and inventory restocking through a RESTful API and a modern React frontend.

## Live Demo

Frontend: https://incubyte-car-dealership-inventory-s.vercel.app/

Backend: https://incubyte-car-dealership-inventory-system.onrender.com

## Features

### Authentication

- User registration
- User login with JWT authentication
- BCrypt password hashing
- Role-based authorization (Admin/User)

### Vehicle Management

- View all vehicles
- Search vehicles by make, category, and price range
- Add new vehicles (Admin)
- Update vehicle details (Admin)
- Delete vehicles (Admin)
- Purchase vehicles
- Restock inventory (Admin)

### Technical Features

- RESTful API
- JWT Authentication
- PostgreSQL Database
- Docker support
- CI using GitHub Actions
- Swagger API documentation
- Production deployment using Render and Vercel

---

# Technology Stack

## Backend

- Java 21
- Spring Boot 3
- Spring Security
- Spring Data JPA
- PostgreSQL
- JWT
- Maven
- Docker

## Frontend

- React
- Vite
- JavaScript
- CSS

## DevOps

- Docker
- Docker Compose
- GitHub Actions
- Render
- Vercel

---

# Project Structure

```
.
├── backend
│   ├── src
│   ├── Dockerfile
│   ├── pom.xml
│   └── mvnw
│
├── frontend
│   ├── src
│   ├── Dockerfile
│   ├── package.json
│   └── vercel.json
│
├── docker-compose.yml
├── render.yaml
├── postman_collection.json
└── README.md
```

---

# Backend Setup

## Prerequisites

- Java 21
- Maven
- PostgreSQL

## Clone Repository

```bash
git clone https://github.com/DeepVaishnav17/Incubyte-Car-dealership-inventory-system.git

cd Incubyte-Car-dealership-inventory-system
```

## Configure Environment Variables

Create a `.env` file or configure the following variables:

```env
DB_URL=jdbc:postgresql://localhost:5432/dealership
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=your_secret_key
JWT_EXPIRATION=86400000
```

## Run Backend

```bash
cd backend

./mvnw spring-boot:run
```

or

```bash
mvn spring-boot:run
```

Backend runs at

```
http://localhost:8080
```

---

# Frontend Setup

## Install Dependencies

```bash
cd frontend

npm install
```

## Configure Environment Variable

Create a `.env` file.

```env
VITE_API_URL=http://localhost:8080/api
```

## Run Frontend

```bash
npm run dev
```

Frontend runs at

```
http://localhost:5173
```

---

# Running with Docker

From the project root:

```bash
docker compose up --build
```

# Screenshots

## Registration

![Login Page](assets/register.png)

## Vehicle Dashboard

![Vehicle Dashboard](assets/vehicles_page.png)

## Admin Dashboard

![Admin Dashboard](assets/admindashboard.png)

## Add Vehicle

![Add Vehicle](assets/addnew.png)

## Search Vehicles

![Add Vehicle](assets/search.png)

---

# Running Tests

## Backend

```bash
cd backend

mvn test
```

## Frontend

```bash
cd frontend

npm test
```

---

# Test Report
# Test Cases

## Backend Test Cases

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| TC-01 | Register a new user | User is registered successfully |
| TC-02 | Register with an existing email | Returns **400 Bad Request** |
| TC-03 | Login with valid credentials | Returns **JWT token (200 OK)** |
| TC-04 | Login with invalid credentials | Returns **401 Unauthorized** |
| TC-05 | Get all vehicles | Returns vehicle list successfully |
| TC-06 | Add vehicle without authentication | Returns **401 Unauthorized** |
| TC-07 | Add vehicle with valid token | Vehicle is added successfully |
| TC-08 | Add vehicle with invalid data | Returns **400 Bad Request** |
| TC-09 | Update existing vehicle | Vehicle details are updated |
| TC-10 | Delete vehicle | Vehicle is deleted successfully |
| TC-11 | Search vehicles by make/category/price | Matching vehicles are returned |
| TC-12 | Purchase available vehicle | Vehicle quantity decreases by one |
| TC-13 | Purchase out-of-stock vehicle | Returns **400 Bad Request** |
| TC-14 | Restock vehicle as non-admin | Returns **403 Forbidden** |
| TC-15 | Restock vehicle as admin | Vehicle stock increases |
| TC-16 | Concurrent purchase requests | Optimistic locking prevents inconsistent updates |
| TC-17 | Validate invalid email | Validation error is returned |
| TC-18 | Validate blank password | Validation error is returned |
| TC-19 | Password hashing during registration | Password is stored in BCrypt hashed format |
| TC-20 | Spring Boot context loads | Application starts successfully |

---

## Frontend Test Cases

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| TC-01 | Render login page | Login form is displayed |
| TC-02 | Invalid login | Error message is displayed |
| TC-03 | Successful login | User is redirected to dashboard |
| TC-04 | Render vehicle dashboard | Vehicle list is displayed |
| TC-05 | Display vehicle details | Vehicle information is shown correctly |
| TC-06 | Purchase unavailable vehicle | Purchase button is disabled |
| TC-07 | Dashboard renders correctly for user | Dashboard loads successfully |

---

# Test Summary

## Frontend

| Metric | Result |
|---------|--------|
| Test Files | 2 Passed |
| Tests Run | 7 |
| Passed | 7 |
| Failed | 0 |
| Skipped | 0 |


---

# Deployment

Frontend

https://incubyte-car-dealership-inventory-s.vercel.app/

Backend

https://incubyte-car-dealership-inventory-system.onrender.com


---

# My AI Usage

AI tools were used throughout the development process as productivity assistants. The usage included:

- Generating initial project scaffolding.
- Assisting with Docker configuration.
- Debugging deployment issues on Render and Vercel.
- Improving GitHub Actions workflow configuration.
- Explaining Spring Security and JWT authentication issues.
- Refining API integration and frontend debugging.
- Improving documentation and README formatting.

All architecture decisions, implementation verification, debugging, testing, and final code integration were manually reviewed and validated before submission.

---

# Author

Deep Vaishnav

GitHub

https://github.com/DeepVaishnav17
