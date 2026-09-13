# ResourceLoop – Surplus Resource Exchange

ResourceLoop is a cloud-based web application designed to facilitate the sharing and exchange of surplus usable resources. The platform provides a centralized environment where users can list resources they no longer need, browse available resources, and submit requests for resources they require.

Resource owners can manage their resource listings and handle incoming requests by approving or rejecting them. The application demonstrates the practical use of cloud computing, RESTful APIs, cloud-hosted databases, authentication, and cloud deployment.

---

## Project Overview

Many usable resources remain unused or are discarded because there is no simple and centralized platform for connecting people who have surplus resources with people who need them.

ResourceLoop addresses this problem by providing a web-based resource exchange platform where users can:

* Create an account and log in
* Add surplus resources
* View available resources
* Search and filter resources
* Request available resources
* View their submitted requests
* Manage their own resource listings
* View incoming requests for their resources
* Approve or reject incoming requests
* Maintain quantity-based resource availability

The application follows a client-server architecture with a React frontend, Node.js/Express backend, and Supabase PostgreSQL database.

---

##  Objectives

The main objectives of ResourceLoop are:

* To provide a centralized platform for surplus resource sharing.
* To allow users to list and manage surplus resources.
* To allow users to discover and request available resources.
* To provide resource owners with request management functionality.
* To implement complete CRUD operations for resource management.
* To use RESTful APIs for frontend-backend communication.
* To integrate a cloud-hosted PostgreSQL database.
* To implement cloud-based user authentication.
* To deploy the backend application to the cloud.
* To demonstrate practical cloud computing concepts through a real-world application.

---

##  Key Features

###  User Authentication

* User registration and login using Supabase Authentication.
* User profile information is maintained in the database.
* Authenticated users can perform protected operations.

###  Resource Management

Users can:

* Create resources
* View resources
* View individual resource details
* Update their own resources
* Delete their own resources

Each resource contains information such as:

* Title
* Description
* Category
* Quantity
* Condition
* Location
* Availability status
* Owner



### Resource Requests

Users can request resources by specifying the required quantity.

The system validates that:

* The requested quantity is a positive integer.
* The resource exists.
* The resource is available.
* The requested quantity does not exceed the available quantity.
* Users cannot request their own resources.

### Request Approval and Rejection

Resource owners can manage incoming requests.

A request can have one of the following statuses:

* `pending`
* `approved`
* `rejected`

When a request is approved, the available resource quantity is automatically updated.

If the remaining quantity becomes zero, the resource status is changed to `unavailable`.

### Quantity Validation

ResourceLoop includes quantity-based validation to prevent users from requesting more resources than are currently available.

---

##  System Architecture

The application follows a cloud-based client-server architecture.

```text
                    ┌───────────────────────┐
                    │       User            │
                    │    Web Browser        │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   React + Vite        │
                    │      Frontend         │
                    └───────────┬───────────┘
                                │
                         HTTP / REST API
                                │
                                ▼
              ┌────────────────────────────────┐
              │          Render Cloud           │
              │                                │
              │   Node.js + Express.js         │
              │        Backend Server          │
              │                                │
              │   • REST APIs                  │
              │   • Resource CRUD              │
              │   • Request Management         │
              │   • Validation                 │
              │   • Authentication Middleware  │
              └───────────────┬────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
          ┌─────────────────┐   ┌────────────────────┐
          │ Supabase Auth   │   │ Supabase PostgreSQL│
          │                 │   │                    │
          │ Authentication  │   │ • profiles         │
          │                 │   │ • resources        │
          │                 │   │ • requests         │
          └─────────────────┘   └────────────────────┘

                    GitHub
                       │
                 Source Control
                       │
                       ▼
                    Render
                  Deployment
```

### Architecture Flow

```text
User
  ↓
React + Vite Frontend
  ↓
REST API
  ↓
Node.js + Express.js Backend
  ↓
Supabase PostgreSQL Database
```

Supabase Authentication is used for user authentication, while the Express backend handles application logic and database operations.

The frontend does **not** directly communicate with PostgreSQL. Database operations are handled by the backend.

---

## Technology Stack

| Technology    | Purpose                                    |
| ------------- | ------------------------------------------ |
| React         | Frontend user interface                    |
| Vite          | Frontend development and build tool        |
| Node.js       | Backend runtime                            |
| Express.js    | REST API backend framework                 |
| PostgreSQL    | Relational database                        |
| Supabase      | Cloud database and authentication platform |
| Supabase Auth | User authentication                        |
| Render        | Backend cloud deployment                   |
| Git           | Version control                            |
| GitHub        | Source code repository                     |
| VS Code       | Development environment                    |
| HTTP/REST     | Frontend-backend communication             |

---

##  Project Structure

The project is organized into frontend and backend components.

```text
ResourceLoop/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── routes/
│   │   ├── resources.js
│   │   └── requests.js
│   │
│   ├── authMiddleware.js
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── API_DOCUMENTATION.md
├── README.md
└── ...
```

---

##  Database Design

ResourceLoop uses **Supabase PostgreSQL** as its cloud-hosted relational database.

The main tables are:

### `profiles`

Stores user profile information.

| Column       | Description             |
| ------------ | ----------------------- |
| `id`         | User/profile identifier |
| `name`       | User name               |
| `email`      | User email              |
| `created_at` | Profile creation time   |

### `resources`

Stores surplus resource information.

| Column        | Description            |
| ------------- | ---------------------- |
| `id`          | Resource identifier    |
| `title`       | Resource title         |
| `description` | Resource description   |
| `category`    | Resource category      |
| `quantity`    | Available quantity     |
| `condition`   | Condition of resource  |
| `location`    | Resource location      |
| `status`      | Availability status    |
| `created_at`  | Resource creation time |
| `user_id`     | Resource owner         |

### `requests`

Stores resource requests submitted by users.

| Column         | Description                |
| -------------- | -------------------------- |
| `id`           | Request identifier         |
| `resource_id`  | Requested resource         |
| `requester_id` | User who submitted request |
| `quantity`     | Requested quantity         |
| `status`       | Request status             |
| `created_at`   | Request creation time      |

---

##  REST API

ResourceLoop uses RESTful APIs to establish communication between the frontend and backend.

### Base URL

```text
https://resourceloop-ewj8.onrender.com
```

### Resource APIs

| Method | Endpoint             | Purpose                 |
| ------ | -------------------- | ----------------------- |
| POST   | `/api/resources`     | Create a resource       |
| GET    | `/api/resources`     | Get all resources       |
| GET    | `/api/resources/:id` | Get a specific resource |
| PUT    | `/api/resources/:id` | Update a resource       |
| DELETE | `/api/resources/:id` | Delete a resource       |

### Request APIs

| Method | Endpoint                           | Purpose                   |
| ------ | ---------------------------------- | ------------------------- |
| POST   | `/api/requests`                    | Create a resource request |
| GET    | `/api/requests/owner/:userId`      | View incoming requests    |
| GET    | `/api/requests/user/:userId`       | View user's requests      |
| PATCH  | `/api/requests/:requestId/approve` | Approve a request         |
| PATCH  | `/api/requests/:requestId/reject`  | Reject a request          |

### Backend Health APIs

| Method | Endpoint       | Purpose                          |
| ------ | -------------- | -------------------------------- |
| GET    | `/`            | Check whether backend is running |
| GET    | `/api/test-db` | Verify database connectivity     |

For detailed request formats, parameters, authentication requirements, response structures, and status codes, refer to:

```text
API_DOCUMENTATION.md
```

---

##  Authentication and Security

ResourceLoop uses **Supabase Authentication** for managing user authentication.

Protected backend operations require an authenticated user.

The backend also performs authorization checks for resource ownership. For example, users can only update or delete resources that they own.

Additional validation includes:

* Required field validation
* Quantity validation
* Resource availability validation
* Request quantity validation
* Resource ownership verification
* Request status verification
* Prevention of requesting one's own resource

Sensitive configuration values such as database credentials and environment variables are not hard-coded into the source code.

---

##  Cloud Integration

ResourceLoop integrates multiple cloud services.

### Render

The Node.js and Express.js backend is deployed on Render.

Render provides cloud hosting for the backend REST API, making the application backend accessible over the internet.

### Supabase

Supabase provides:

* Cloud-hosted PostgreSQL database
* User authentication
* Persistent application data storage

### GitHub

GitHub is used for:

* Source code management
* Version control
* Project collaboration
* Deployment integration

The application itself is not hosted on GitHub; GitHub stores and manages the source code.

---

## Deployment

The ResourceLoop backend is deployed on **Render**.

### Deployed Backend

```text
https://resourceloop-ewj8.onrender.com
```

### Deployment Verification

The deployment can be verified using:

```text
GET /
```

Expected response:

```json
{
  "message": "ResourceLoop backend is running!"
}
```

Database connectivity can be tested using:

```text
GET /api/test-db
```

Expected response:

```json
{
  "message": "Supabase database connected successfully!",
  "time": "..."
}
```

This confirms that the deployed Express.js backend is running and can communicate with the Supabase PostgreSQL database.

---

## Running the Project Locally

### Prerequisites

Install the following before running the project:

* Node.js
* npm
* Git
* A web browser
* Supabase account/project

---

### 1. Clone the Repository

```bash
git clone https://github.com/Akshara2008-in/ResourceLoop.git
```

Move into the project directory:

```bash
cd ResourceLoop
```

---

### 2. Install Frontend Dependencies

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

---

### 3. Install Backend Dependencies

Open another terminal and navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

---

### 4. Configure Environment Variables

Create a `.env` file in the backend directory.

Example:

```env
PORT=5050
DATABASE_URL=your_database_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not commit actual passwords, secret keys, or other sensitive credentials to GitHub.

---

### 5. Start the Backend

Run:

```bash
node server.js
```

The backend will run at:

```text
http://localhost:5050
```

You can verify the backend using:

```text
http://localhost:5050/
```

---

## 🔄 Application Workflow

### User Registration/Login

```text
User
 ↓
Registration/Login
 ↓
Supabase Authentication
 ↓
Authenticated User
 ↓
ResourceLoop Application
```

### Adding a Resource

```text
User
 ↓
Add Resource
 ↓
React Frontend
 ↓
POST /api/resources
 ↓
Express Backend
 ↓
Supabase PostgreSQL
 ↓
Resource Created
```

### Requesting a Resource

```text
User
 ↓
Browse Resources
 ↓
Select Resource
 ↓
Enter Quantity
 ↓
POST /api/requests
 ↓
Backend Validation
 ↓
Request Created
 ↓
Status = pending
```

### Approving a Request

```text
Resource Owner
 ↓
Incoming Requests
 ↓
Approve Request
 ↓
PATCH /api/requests/:requestId/approve
 ↓
Ownership + Quantity Validation
 ↓
Resource Quantity Updated
 ↓
Request Status = approved
```

### Rejecting a Request

```text
Resource Owner
 ↓
Incoming Requests
 ↓
Reject Request
 ↓
PATCH /api/requests/:requestId/reject
 ↓
Request Status = rejected
```

---

##  Validation and Error Handling

The backend validates user input before performing database operations.

Examples include:

* Resource title cannot be empty.
* Resource category cannot be empty.
* Resource quantity must be valid.
* Requested quantity must be a positive integer.
* Requested quantity cannot exceed available quantity.
* A user cannot request their own resource.
* Only resource owners can update or delete their resources.
* Only resource owners can approve or reject requests.
* A request must be in `pending` status before it can be approved or rejected.

The API returns appropriate HTTP status codes such as:

```text
200 OK
201 Created
400 Bad Request
403 Forbidden
404 Not Found
500 Internal Server Error
```

---

## CRUD Operations

ResourceLoop implements complete CRUD operations for resource management.

| CRUD Operation | HTTP Method | Endpoint             |
| -------------- | ----------- | -------------------- |
| Create         | POST        | `/api/resources`     |
| Read           | GET         | `/api/resources`     |
| Read One       | GET         | `/api/resources/:id` |
| Update         | PUT         | `/api/resources/:id` |
| Delete         | DELETE      | `/api/resources/:id` |

This satisfies the requirement for complete CRUD functionality in the application.

---

##  Cloud Computing Concepts Demonstrated

ResourceLoop demonstrates several practical cloud computing concepts:

* Cloud-hosted application deployment
* Cloud-hosted relational database
* Cloud-based authentication
* RESTful web services
* Client-server architecture
* Remote database access
* Environment-based configuration
* Separation of frontend and backend
* Internet-accessible backend services
* Version control and cloud-based source management

---

## Main Application Modules

### Login / Signup

Provides authentication and access to the application.

### Available Resources

Displays resources currently available for users to browse.

### Add Resource

Allows authenticated users to create new surplus resource listings.


### My Requests

Displays resource requests submitted by the logged-in user.

### Incoming Requests

Allows resource owners to view and manage requests received for their resources.

---



## Documentation

Additional project documentation:

* `README.md` – Project overview and setup instructions
* `API_DOCUMENTATION.md` – Detailed REST API documentation

---

## Future Enhancements

The following features can be considered for future versions:

* AI-based resource matching
* Recommendation system
* Notifications for request updates
* Email notifications
* Location-based resource discovery
* Advanced analytics dashboard
* Resource image uploads
* Real-time request notifications
* Mobile application
* Improved role-based access control

> **Note:** These are proposed future enhancements and are not part of the current implementation.

---

##  Social Impact

ResourceLoop encourages the reuse and redistribution of surplus resources instead of allowing usable items to remain unused or become waste.

The project supports concepts related to:

* Resource reuse
* Waste reduction
* Community sharing
* Sustainable consumption
* Efficient utilization of existing resources

The application can contribute toward sustainability-oriented goals such as **SDG 12 – Responsible Consumption and Production**.

---

##  Project Type

**Academic Cloud Computing Project**

**Project:** ResourceLoop – Surplus Resource Exchange

**Architecture:** Client-Server / Cloud-Based Architecture

**Frontend:** React + Vite

**Backend:** Node.js + Express.js

**Database:** Supabase PostgreSQL

**Authentication:** Supabase Auth

**Deployment:** Render

**Version Control:** Git + GitHub

---

##  Repository

GitHub Repository:

```text
https://github.com/Akshara2008-in/ResourceLoop
```

---

##  License

This project was developed for academic and educational purposes.

---

##  Conclusion

ResourceLoop demonstrates the development and deployment of a complete cloud-based web application for surplus resource exchange. By combining a React and Vite frontend, Node.js and Express.js backend, Supabase PostgreSQL database, Supabase Authentication, RESTful APIs, and Render cloud deployment, the project provides a practical implementation of modern cloud application architecture.

The project demonstrates how cloud technologies can be integrated to solve a real-world resource-sharing problem while providing CRUD operations, authentication, database management, request handling, validation, and remote application deployment.
