# CloudTask



A full-stack task management application built with **React, TypeScript, Node.js, Express, PostgreSQL, Docker, and AWS**.



CloudTask allows authenticated users to register, log in, manage their tasks, and perform complete task CRUD operations through a protected REST API.



The application is containerized and deployed on an **AWS EC2 instance**, with Docker images stored in **Amazon ECR**.



---



## Live Application



**CloudTask:**  

http://3.110.37.65



> The application is currently deployed on an AWS EC2 instance. The public IP can change if the EC2 instance is stopped and started.



---



# Table of Contents



- [Features](#features)

- [Technology Stack](#technology-stack)

- [System Architecture](#system-architecture)

- [Application Architecture](#application-architecture)

- [Frontend Architecture](#frontend-architecture)

- [Backend Architecture](#backend-architecture)

- [Database Architecture](#database-architecture)

- [Authentication](#authentication)

- [API](#api)

- [Health API](#health-api)

- [Database Migrations](#database-migrations)

- [Docker Architecture](#docker-architecture)

- [AWS Deployment Architecture](#aws-deployment-architecture)

- [AWS Networking](#aws-networking)

- [Amazon ECR](#amazon-ecr)

- [Local Development](#local-development)

- [Running with Docker](#running-with-docker)

- [Production Deployment](#production-deployment)

- [Environment Variables](#environment-variables)

- [Testing](#testing)

- [Project Structure](#project-structure)

- [Security](#security)

- [Deployment Flow](#deployment-flow)

- [Future Improvements](#future-improvements)

- [Author](#author)



---



# Features



## Authentication



- User registration

- User login

- User logout

- JWT-based authentication

- Protected routes

- Password hashing

- Authentication middleware

- User-specific task access



## Task Management



Authenticated users can:



- Create tasks

- View tasks

- Edit tasks

- Delete tasks

- Manage their own tasks



## Backend



- RESTful API

- Express.js server

- TypeScript

- PostgreSQL integration

- Database connection pooling

- SQL migrations

- Authentication middleware

- Error handling middleware

- Health check endpoint



## Frontend



- React

- TypeScript

- Vite

- Protected dashboard

- Login page

- Registration page

- Task management interface

- Reusable components

- Authentication context

- API client



## Deployment



- Dockerized frontend

- Dockerized backend

- PostgreSQL container

- Amazon ECR

- Amazon EC2

- Nginx

- AWS Security Groups

- IAM-based AWS access



---



# Technology Stack



| Layer | Technology |

|---|---|

| Frontend | React |

| Frontend Language | TypeScript |

| Frontend Build Tool | Vite |

| Backend | Node.js |

| Backend Framework | Express.js |

| Backend Language | TypeScript |

| Database | PostgreSQL 17 |

| Authentication | JWT |

| Password Security | Password hashing |

| Web Server | Nginx |

| Containerization | Docker |

| Container Registry | Amazon ECR |

| Cloud Compute | Amazon EC2 |

| Cloud Access | AWS IAM |

| Networking | Docker Network + AWS Security Groups |

| Package Manager | npm |



---



# System Architecture



The complete production architecture is:



```text

                           INTERNET

                              |

                              |

                              v

                  +-----------------------+

                  |       AWS EC2         |

                  |                       |

                  |   Security Group     |

                  |                       |

                  |   Port 80  -> HTTP    |

                  |   Port 4000 -> API    |

                  |   Port 22 -> SSH      |

                  |                       |

                  +-----------+-----------+

                              |

             +----------------+----------------+

             |                                 |

             v                                 v

   +-------------------+             +-------------------+

   | Frontend Container|             | Backend Container |

   |                   |             |                   |

   | React Application  |             | Node.js +        |

   |        +           |             | Express + TS     |

   |      Nginx         |             |                   |

   |                   |             | Port 4000        |

   | Port 80            |             +---------+---------+

   +-------------------+                       |

                                               |

                                               v

                                    +----------------------+

                                    | PostgreSQL Container |

                                    |                      |

                                    | PostgreSQL 17        |

                                    | Port 5432            |

                                    +----------------------+

```



The frontend and backend run as separate Docker containers.



The backend communicates with PostgreSQL through a Docker network.



PostgreSQL is not directly exposed to the public internet.



---



# Application Architecture



CloudTask follows a layered application structure.



```text

                    React Frontend

                          |

                          | HTTP / REST API

                          v

                   Express Backend

                          |

             +------------+-------------+

             |            |             |

             v            v             v

        Middleware    Controllers    Routes

                          |

                          v

                       Services

                          |

                          v

                     Repositories

                          |

                          v

                      PostgreSQL

```



The main backend layers are:



```text

Routes

  |

  v

Controllers

  |

  v

Services

  |

  v

Repositories

  |

  v

Database

```



This separation keeps HTTP handling, business logic, and database operations organized independently.



---



# Frontend Architecture



The frontend is built using React and TypeScript.



The main responsibilities of the frontend are:



- Rendering the user interface

- Managing authentication state

- Calling backend APIs

- Displaying tasks

- Creating tasks

- Editing tasks

- Deleting tasks

- Protecting authenticated pages



## Frontend Flow



```text

User

 |

 v

React UI

 |

 v

API Client

 |

 v

REST API

 |

 v

Node.js Backend

 |

 v

PostgreSQL

```



## Main Frontend Areas



```text

src/

├── api/

├── components/

├── context/

├── features/

├── pages/

└── types/

```



### Components



Reusable UI components include:



- Navbar

- TaskCard

- TaskForm

- Modal

- LoadingSpinner

- ProtectedRoute



### Pages



The application includes:



- Login page

- Registration page

- Dashboard page

- Not Found page



### Authentication Context



The authentication context manages the frontend authentication state and provides authentication information to protected components.



### Protected Routes



The dashboard is protected so that unauthenticated users cannot access task management functionality.



---



# Backend Architecture



The backend is a TypeScript-based Node.js application using Express.



The backend is responsible for:



- Authentication

- User management

- Task management

- Database access

- JWT validation

- Request processing

- Error handling

- Health monitoring



## Backend Structure



```text

cloudtask-backend/

│

├── src/

│   ├── config/

│   │   ├── db.ts

│   │   └── env.ts

│   │

│   ├── db/

│   │   ├── migrate.ts

│   │   └── migrations/

│   │       ├── 001_create_users.sql

│   │       └── 002_create_tasks.sql

│   │

│   ├── middleware/

│   │   ├── auth.middleware.ts

│   │   └── error.middleware.ts

│   │

│   ├── modules/

│   │   ├── auth/

│   │   │   ├── auth.controller.ts

│   │   │   ├── auth.repository.ts

│   │   │   ├── auth.routes.ts

│   │   │   └── auth.service.ts

│   │   │

│   │   └── tasks/

│   │       ├── tasks.controller.ts

│   │       ├── tasks.repository.ts

│   │       ├── tasks.routes.ts

│   │       └── tasks.service.ts

│   │

│   ├── app.ts

│   └── server.ts

│

├── Dockerfile

├── package.json

└── tsconfig.json

```



---



# Backend Request Flow



A typical authenticated task request follows this flow:



```text

Frontend

   |

   | HTTP Request + JWT

   v

Express Router

   |

   v

Authentication Middleware

   |

   | Token valid?

   |

   +---- NO ----> Unauthorized Response

   |

   +---- YES

          |

          v

      Controller

          |

          v

       Service

          |

          v

     Repository

          |

          v

      PostgreSQL

          |

          v

       Response

          |

          v

       Frontend

```



This ensures protected resources are only accessible to authenticated users.



---



# Database Architecture



CloudTask uses **PostgreSQL 17** as its relational database.



The database runs inside its own Docker container in production.



```text

+----------------------+

| Node.js Backend      |

| cloudtask-backend    |

+----------+-----------+

           |

           | PostgreSQL connection

           |

           v

+----------------------+

| PostgreSQL           |

| cloudtask-db         |

|                      |

| Port: 5432           |

+----------------------+

```



The PostgreSQL container is connected to the same Docker network as the backend.



The database is not published directly to the public internet.



---



# Database Schema



CloudTask currently uses tables for:



## Users



The users table stores registered application users.



Conceptually:



```text

users

--------------------------------

id

email

password

created_at

```



## Tasks



The tasks table stores tasks belonging to users.



Conceptually:



```text

tasks

--------------------------------

id

user_id

title

description

completed

created_at

updated_at

```



The task record is associated with its owning user through `user_id`.



This allows the application to enforce user-specific task access.



---



# Database Migrations



CloudTask includes a lightweight custom migration runner.



Migration files are stored in:



```text

cloudtask-backend/src/db/migrations/

```



Current migrations:



```text

001_create_users.sql

002_create_tasks.sql

```



The migration runner is located at:



```text

cloudtask-backend/src/db/migrate.ts

```



## Migration Process



When migrations run:



```text

Migration Runner

       |

       v

Create migrations table

       |

       v

Read migration files

       |

       v

Sort migration filenames

       |

       v

Check already-applied migrations

       |

       v

Run pending migration

       |

       v

Record migration

```



The migration runner tracks applied migrations using a dedicated `migrations` table.



Each migration is executed inside a database transaction.



```text

BEGIN

   |

   v

Execute SQL

   |

   +---- Success ----> Record migration -> COMMIT

   |

   +---- Failure ----> ROLLBACK

```



This prevents a failed migration from being partially applied.



---



# Authentication



CloudTask uses **JWT-based authentication**.



The authentication system consists of:



- Registration

- Login

- Password hashing

- JWT generation

- JWT verification

- Authentication middleware

- Protected task routes



---



# Registration Flow



```text

User

 |

 | Email + Password

 v

POST /api/auth/register

 |

 v

Auth Controller

 |

 v

Auth Service

 |

 | Hash password

 v

Auth Repository

 |

 v

PostgreSQL

 |

 v

User created

```



Passwords are not stored as plain text.



A password hash is stored in the database instead.



---



# Login Flow



```text

User

 |

 | Email + Password

 v

POST /api/auth/login

 |

 v

Auth Controller

 |

 v

Auth Service

 |

 | Find user

 v

PostgreSQL

 |

 | Verify password

 v

Generate JWT

 |

 v

Return authentication response

 |

 v

Frontend

```



---



# Authenticated Request



After login, authenticated API requests include the JWT.



```text

Frontend

   |

   | Authorization: Bearer <JWT>

   v

Express API

   |

   v

Auth Middleware

   |

   | Verify JWT

   |

   +---- Invalid ----> 401 Unauthorized

   |

   +---- Valid

          |

          v

       Controller

          |

          v

       Service

          |

          v

      Repository

          |

          v

      PostgreSQL

```



---



# API



The backend exposes a REST API.



Base URL in production:



```text

http://3.110.37.65:4000

```



The frontend accesses the backend API from the deployed application.



---



# Authentication API



## Register



```http

POST /api/auth/register

```



Used to create a new user account.



---



## Login



```http

POST /api/auth/login

```



Used to authenticate an existing user.



---



# Task API



Task endpoints are protected by JWT authentication.



## Get Tasks



```http

GET /api/tasks

```



Returns the authenticated user's tasks.



---



## Create Task



```http

POST /api/tasks

```



Creates a new task for the authenticated user.



---



## Update Task



```http

PUT /api/tasks/:id

```



Updates an existing task.



---



## Delete Task



```http

DELETE /api/tasks/:id

```



Deletes an existing task.



---



# Health API



CloudTask provides a health endpoint for checking whether the backend API is running.



```http

GET /api/health

```



Example:



```bash

curl http://localhost:4000/api/health

```



Expected response:



```json

{

  "success": true,

  "message": "CloudTask API is running"

}

```



The deployed API was also verified externally using:



```bash

curl http://3.110.37.65:4000/api/health

```



Expected result:



```json

{

  "success": true,

  "message": "CloudTask API is running"

}

```



---



# Docker Architecture



CloudTask uses separate Docker containers for each major service.



```text

Docker Network: cloudtask-network



+-----------------------+

| cloudtask-frontend    |

| Nginx + React         |

| Port 80               |

+-----------+-----------+

            |

            |

+-----------v-----------+

| cloudtask-backend     |

| Node.js + Express     |

| Port 4000             |

+-----------+-----------+

            |

            |

+-----------v-----------+

| cloudtask-db          |

| PostgreSQL 17         |

| Port 5432             |

+-----------------------+

```



The backend connects to PostgreSQL using the Docker service/container name rather than the public IP.



Example:



```text

postgresql://postgres:postgres@cloudtask-db:5432/cloudtask

```



This allows containers to communicate internally through the Docker network.



---



# Docker Images



The production deployment uses:



```text

cloudtask-backend

cloudtask-frontend

postgres:17

```



Application images are stored in Amazon ECR.



---



# AWS Deployment Architecture



CloudTask is deployed to an AWS EC2 instance.



The deployment uses:



```text

Local Machine

      |

      | Docker Build

      v

Docker Images

      |

      | docker push

      v

Amazon ECR

      |

      | docker pull

      v

AWS EC2

      |

      v

Docker Containers

```



---



# Amazon ECR



Two private ECR repositories are used:



```text

cloudtask-backend

cloudtask-frontend

```



The application images are pushed from the development machine to Amazon ECR.



Example backend image:



```text

<account-id>.dkr.ecr.ap-south-1.amazonaws.com/cloudtask-backend:latest

```



Example frontend image:



```text

<account-id>.dkr.ecr.ap-south-1.amazonaws.com/cloudtask-frontend:latest

```



The EC2 instance authenticates with ECR and pulls the required images.



---



# EC2 Deployment



The production application runs on an Amazon EC2 instance.



The deployed containers are:



```text

cloudtask-frontend

cloudtask-backend

cloudtask-db

```



Container status can be checked with:



```bash

docker ps

```



Example deployment:



```text

cloudtask-frontend

    0.0.0.0:80->80/tcp



cloudtask-backend

    0.0.0.0:4000->4000/tcp



cloudtask-db

    5432/tcp

```



---



# Nginx



The frontend production container uses Nginx.



Nginx serves the built React application.



```text

Browser

   |

   | HTTP :80

   v

Nginx

   |

   v

React Static Files

```



The backend runs separately on port `4000`.



---



# AWS Networking



The EC2 instance uses an AWS Security Group to control inbound traffic.



Current application access includes:



```text

HTTP

Port: 80

Source: 0.0.0.0/0

```



Backend API testing:



```text

TCP

Port: 4000

```



SSH access:



```text

TCP

Port: 22

```



SSH access is restricted to the configured development IP.



PostgreSQL is not exposed publicly and is accessible through the Docker network.



---



# AWS IAM



AWS IAM is used to control access to AWS resources.



An IAM developer user was used for AWS CLI operations such as interacting with Amazon ECR.



The EC2 deployment does not require exposing AWS access keys inside the application containers.



AWS credentials are not committed to this repository.



---



# Local Development



## Prerequisites



Install:



- Node.js

- npm

- PostgreSQL

- Docker



---



# Backend Local Setup



Navigate to the backend:



```bash

cd cloudtask-backend

```



Install dependencies:



```bash

npm install

```



Create a local environment file from:



```text

.env.example

```



Example configuration:



```env

PORT=4000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cloudtask

JWT_SECRET=your-secret

JWT_EXPIRES_IN=1h

```



Build the backend:



```bash

npm run build

```



Run the configured backend development/production script from `package.json`.



---



# Frontend Local Setup



Navigate to the frontend:



```bash

cd cloudtask-frontend

```



Install dependencies:



```bash

npm install

```



Create the local environment file using:



```text

.env.example

```



Then run the configured Vite development script.



---



# Running with Docker



## Backend



From:



```text

cloudtask-backend/

```



build the image:



```bash

docker build -t cloudtask-backend:latest .

```



---



## Frontend



From:



```text

cloudtask-frontend/

```



build the image:



```bash

docker build -t cloudtask-frontend:latest .

```



---



# Docker Network



Create a Docker network:



```bash

docker network create cloudtask-network

```



Run PostgreSQL:



```bash

docker run -d \

  --name cloudtask-db \

  --network cloudtask-network \

  -e POSTGRES_PASSWORD=postgres \

  -e POSTGRES_DB=cloudtask \

  postgres:17

```



The backend can then connect to:



```text

cloudtask-db:5432

```



rather than using localhost.



---



# Environment Variables



Backend environment variables:



```env

PORT=4000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cloudtask

JWT_SECRET=replace-this-with-a-long-random-string

JWT_EXPIRES_IN=1h

```



Production environment variables are configured separately from source control.



Sensitive `.env` files are intentionally excluded from Git.



---



# Testing



The deployed application was manually tested after deployment.



## Authentication Tests



- Register new user

- Login

- Logout

- Login again

- Access protected dashboard



## Task Tests



- Create task

- View task

- Edit task

- Delete task

- Refresh dashboard and verify persistence



## API Tests



Health endpoint:



```bash

curl http://3.110.37.65:4000/api/health

```



Expected:



```json

{

  "success": true,

  "message": "CloudTask API is running"

}

```



## Container Tests



Production container status was verified using:



```bash

docker ps

```



Expected services:



```text

cloudtask-frontend

cloudtask-backend

cloudtask-db

```



Backend logs were also verified to confirm:



```text

Connected to PostgreSQL successfully.

CloudTask API listening on 0.0.0.0:4000

```



Frontend Nginx logs were verified to confirm:



```text

Configuration complete; ready for start up

start worker processes

```



---



# Production Verification



The following production checks were performed:



```text

✓ EC2 instance running

✓ Docker installed

✓ AWS CLI configured

✓ ECR authentication successful

✓ Backend image pushed to ECR

✓ Frontend image pushed to ECR

✓ Backend image pulled on EC2

✓ Frontend image pulled on EC2

✓ PostgreSQL container running

✓ Database migrations applied

✓ Backend container running

✓ Backend health endpoint working

✓ Frontend container running

✓ Nginx serving frontend

✓ Public frontend accessible

✓ Registration tested

✓ Login tested

✓ Logout tested

✓ Task creation tested

✓ Task editing tested

✓ Task deletion tested

✓ Refresh persistence tested

```



---



# Project Structure



```text

CloudTask/

│

├── cloudtask-backend/

│   │

│   ├── src/

│   │   ├── config/

│   │   │   ├── db.ts

│   │   │   └── env.ts

│   │   │

│   │   ├── db/

│   │   │   ├── migrate.ts

│   │   │   └── migrations/

│   │   │       ├── 001_create_users.sql

│   │   │       └── 002_create_tasks.sql

│   │   │

│   │   ├── middleware/

│   │   │   ├── auth.middleware.ts

│   │   │   └── error.middleware.ts

│   │   │

│   │   ├── modules/

│   │   │   ├── auth/

│   │   │   │   ├── auth.controller.ts

│   │   │   │   ├── auth.repository.ts

│   │   │   │   ├── auth.routes.ts

│   │   │   │   └── auth.service.ts

│   │   │   │

│   │   │   └── tasks/

│   │   │       ├── tasks.controller.ts

│   │   │       ├── tasks.repository.ts

│   │   │       ├── tasks.routes.ts

│   │   │       └── tasks.service.ts

│   │   │

│   │   ├── app.ts

│   │   └── server.ts

│   │

│   ├── Dockerfile

│   ├── package.json

│   ├── README.md

│   └── tsconfig.json

│

├── cloudtask-frontend/

│   │

│   ├── src/

│   │   ├── api/

│   │   ├── components/

│   │   ├── context/

│   │   ├── features/

│   │   ├── pages/

│   │   ├── types/

│   │   ├── App.tsx

│   │   └── main.tsx

│   │

│   ├── Dockerfile

│   ├── nginx.conf

│   ├── package.json

│   ├── README.md

│   └── vite.config.ts

│

├── .gitignore

└── README.md

```



---



# Security



The project follows several basic security practices.



## Secrets



Sensitive files are excluded from version control:



```text

.env

*.pem

*.csv

```



AWS credentials and private keys are never stored in the repository.



## Authentication



Protected endpoints require JWT authentication.



## Passwords



Passwords are stored using password hashing rather than plain text.



## Database



PostgreSQL is kept inside the private Docker network and is not directly exposed to the public internet.



## AWS Security Group



SSH access is restricted to the configured development IP.



HTTP traffic is publicly accessible for the web application.



---



# Deployment Flow



The complete deployment process is:



```text

                    DEVELOPMENT

                         |

                         v

                React + Node.js

                         |

                         v

                  Docker Build

                    /       \

                   /         \

                  v           v

             Frontend      Backend

                Image        Image

                   \\         /

                    \\       /

                     v     v

                   Amazon ECR

                       |

                       |

                       v

                    AWS EC2

                       |

                       v

                Docker Pull

                       |

          +------------+-------------+

          |            |             |

          v            v             v

      Frontend      Backend      PostgreSQL

       Nginx        Node.js       Database

          |            |

          |            |

          +------------+

                |

                v

             Internet

```



---



# Application Request Flow



A typical user interaction follows:



```text

Browser

   |

   | HTTP

   v

Nginx / React

   |

   | REST API request

   v

Node.js / Express

   |

   v

JWT Middleware

   |

   v

Controller

   |

   v

Service

   |

   v

Repository

   |

   v

PostgreSQL

   |

   v

Response

   |

   v

React UI

```



---



# Error Handling



The backend includes centralized error handling middleware.



The general flow is:



```text

Request

   |

   v

Route

   |

   v

Controller

   |

   v

Service

   |

   +---- Error

          |

          v

    Error Middleware

          |

          v

    HTTP Error Response

```



This prevents application errors from being handled inconsistently across individual routes.



---



# Design Decisions



## Separate Frontend and Backend



The frontend and backend are maintained as separate applications.



Benefits:



- Independent deployment

- Clear separation of responsibilities

- Easier containerization

- Independent scaling possibilities



## Layered Backend



The backend separates:



```text

Routes

Controllers

Services

Repositories

```



This keeps API handling separate from business logic and database operations.



## PostgreSQL



A relational database was selected because tasks belong to users and require structured relationships and persistent storage.



## Docker



Docker provides consistent environments between development and deployment.



## Amazon ECR



ECR provides private storage for production Docker images.



## Amazon EC2



EC2 provides a straightforward environment for running the containerized application.



---



# Future Improvements



Possible production improvements include:



- HTTPS using a domain name and TLS certificate

- AWS Application Load Balancer

- Automated CI/CD with GitHub Actions

- Automated database backups

- Centralized application logging

- CloudWatch monitoring

- Health checks and automated container restart policies

- Rate limiting

- Refresh tokens

- Pagination for task lists

- Task filtering and search

- Task due dates and priorities

- Automated unit and integration testing

- Infrastructure as Code using Terraform or AWS CDK



---



# Repository



GitHub:



https://github.com/Aditya0254-singh/CloudTask



---



# Author



**Aditya Singh**



CloudTask was built as a full-stack project demonstrating:



- React development

- TypeScript

- REST API development

- Node.js and Express

- PostgreSQL

- JWT authentication

- Docker containerization

- Nginx

- Amazon ECR

- Amazon EC2

- AWS IAM

- AWS Security Groups

- Production deployment

