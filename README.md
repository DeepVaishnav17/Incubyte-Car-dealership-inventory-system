# Car Dealership Inventory System

## Project Overview

A full-stack Modular Monolith application for managing a car dealership's inventory.

- **Backend:** Java 21, Spring Boot 3, Spring Security (JWT), Spring Data JPA, PostgreSQL
- **Frontend:** React 19, Vite, Vanilla CSS (Glassmorphism design)
- **Deployment:** Docker & Docker Compose

## Setup Instructions

### Prerequisites

- Docker & Docker Compose

### Running the Application

To run the entire full-stack application in a production-ready environment:

1. Open a terminal in the root directory.
2. Run: `docker-compose up --build`
3. Access the frontend at `http://localhost`
4. Access the backend API at `http://localhost:8080/api`

## API Docs

Once the backend is running, you can view the fully interactive OpenAPI/Swagger documentation at:

- `http://localhost:8080/swagger-ui.html`

## Live Deployment (Phase 7)

The application is configured for deployment on free-tier platforms.

### Backend (Render)

1. Sign in to [Render](https://render.com/).
2. Connect your GitHub repository. Render will automatically detect the `render.yaml` file.
3. It will spin up the PostgreSQL database and the Spring Boot backend seamlessly.

**Live Backend URL:** _(Replace with your Render URL)_

### Frontend (Vercel)

1. Sign in to [Vercel](https://vercel.com/).
2. Import the `frontend` folder from your repository.
3. In the Vercel project settings, add an Environment Variable:
   - `VITE_API_URL` = _(Your Render Backend URL)_
4. The provided `vercel.json` ensures that React Router works perfectly.

**Live Frontend URL:** _(Replace with your Vercel URL)_

## Test Report

The backend is built using strict Test-Driven Development (TDD) principles.
To run the test suite and generate a Jacoco code coverage report:

1. Navigate to the `backend/` directory: `cd backend`
2. Run tests: `./mvnw clean test`
3. View the HTML report at: `backend/target/site/jacoco/index.html`

## My AI Usage

_(You can describe how you used AI tools to assist in this project here)_

## Screenshots

_(screenshots)_
