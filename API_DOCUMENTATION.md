# ResourceLoop API Documentation

## 1. Overview

ResourceLoop is a cloud-based surplus resource exchange application that uses RESTful APIs for communication between the React frontend and the Node.js/Express.js backend.

The backend provides APIs for:

* Resource management
* Resource requests
* Request approval and rejection
* User-specific request retrieval
* Owner-specific incoming request retrieval
* Database connectivity testing

The backend communicates with a PostgreSQL database hosted through Supabase.

---

## 2. Base URL

### Local Development

```text
http://localhost:5050
```

### API Base Paths

```text
/api/resources
/api/requests
```

When the backend is deployed on Render, the same endpoints are accessed using the deployed backend URL.

---

# 3. Authentication

ResourceLoop uses authentication middleware for operations that require a logged-in user.

The following operations require authentication:

* Creating a resource
* Updating a resource
* Deleting a resource
* Creating a resource request
* Viewing requests related to the logged-in user
* Viewing incoming requests for resources owned by the logged-in user
* Approving a request
* Rejecting a request

Public operations include:

* Retrieving all resources
* Retrieving a single resource
* Checking whether the backend is running
* Testing the database connection

The backend uses the authenticated user's information to identify the logged-in user and verify ownership before performing protected operations.

---

# 4. Resource APIs

## 4.1 Create Resource

### Endpoint

```http
POST /api/resources
```

### Authentication

Required.

### Description

Creates a new resource listing for the authenticated user.

### Request Body

```json
{
  "title": "Old Laptop",
  "description": "Working laptop available for reuse",
  "category": "Electronics",
  "quantity": 2,
  "condition": "Good",
  "location": "Chennai"
}
```

### Parameters

| Field       | Type    | Required | Description                 |
| ----------- | ------- | -------- | --------------------------- |
| title       | String  | Yes      | Name/title of the resource  |
| description | String  | No       | Description of the resource |
| category    | String  | Yes      | Resource category           |
| quantity    | Integer | Yes      | Available quantity          |
| condition   | String  | No       | Condition of the resource   |
| location    | String  | No       | Location of the resource    |

### Validation

* `title` and `category` are required.
* `quantity` must be a positive integer.
* The initial resource status is automatically set to `available`.
* The authenticated user's ID is stored as the resource owner.

### Success Response

**Status Code: `201 Created`**

```json
{
  "message": "Resource created successfully",
  "resource": {
    "id": "...",
    "user_id": "...",
    "title": "Old Laptop",
    "description": "Working laptop available for reuse",
    "category": "Electronics",
    "quantity": 2,
    "condition": "Good",
    "location": "Chennai",
    "status": "available",
    "created_at": "..."
  }
}
```

### Error Responses

**400 Bad Request**

```json
{
  "message": "Title and category are required"
}
```

or:

```json
{
  "message": "Quantity must be a positive integer"
}
```

**500 Internal Server Error**

```json
{
  "message": "Failed to create resource",
  "error": "..."
}
```

---

# 5. Get All Resources

### Endpoint

```http
GET /api/resources
```

### Authentication

Not required.

### Description

Retrieves all resources stored in the database.

Resources are returned in descending order of creation time.

### Success Response

**Status Code: `200 OK`**

```json
{
  "message": "Resources retrieved successfully",
  "resources": [
    {
      "id": "...",
      "user_id": "...",
      "title": "Old Laptop",
      "description": "Working laptop",
      "category": "Electronics",
      "quantity": 2,
      "condition": "Good",
      "location": "Chennai",
      "status": "available",
      "created_at": "..."
    }
  ]
}
```

### Error Response

**500 Internal Server Error**

```json
{
  "message": "Failed to fetch resources",
  "error": "..."
}
```

---

# 6. Get Single Resource

### Endpoint

```http
GET /api/resources/:id
```

### Authentication

Not required.

### Description

Retrieves a specific resource using its resource ID.

### Path Parameter

| Parameter | Type | Description        |
| --------- | ---- | ------------------ |
| id        | UUID | ID of the resource |

### Example

```http
GET /api/resources/RESOURCE_ID
```

### Success Response

**Status Code: `200 OK`**

```json
{
  "message": "Resource retrieved successfully",
  "resource": {
    "id": "...",
    "user_id": "...",
    "title": "Old Laptop",
    "description": "Working laptop",
    "category": "Electronics",
    "quantity": 2,
    "condition": "Good",
    "location": "Chennai",
    "status": "available",
    "created_at": "..."
  }
}
```

### Error Responses

**404 Not Found**

```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error**

```json
{
  "message": "Failed to fetch resource",
  "error": "..."
}
```

---

# 7. Update Resource

### Endpoint

```http
PUT /api/resources/:id
```

### Authentication

Required.

### Description

Updates an existing resource owned by the authenticated user.

### Path Parameter

| Parameter | Type | Description        |
| --------- | ---- | ------------------ |
| id        | UUID | ID of the resource |

### Request Body

```json
{
  "title": "Updated Laptop",
  "description": "Updated description",
  "category": "Electronics",
  "quantity": 3,
  "condition": "Very Good",
  "location": "Chennai"
}
```

### Validation

* The resource must exist.
* Only the resource owner can update it.
* Quantity must be a non-negative integer.
* If quantity becomes `0`, the resource status becomes `unavailable`.
* If quantity is greater than `0`, the resource status becomes `available`.

### Success Response

**Status Code: `200 OK`**

```json
{
  "message": "Resource updated successfully",
  "resource": {
    "id": "...",
    "title": "Updated Laptop",
    "quantity": 3,
    "status": "available"
  }
}
```

### Error Responses

**404 Not Found**

```json
{
  "message": "Resource not found"
}
```

**403 Forbidden**

```json
{
  "message": "You are not authorized to update this resource"
}
```

**400 Bad Request**

```json
{
  "message": "Quantity must be a non-negative integer"
}
```

**500 Internal Server Error**

```json
{
  "message": "Failed to update resource",
  "error": "..."
}
```

---

# 8. Delete Resource

### Endpoint

```http
DELETE /api/resources/:id
```

### Authentication

Required.

### Description

Deletes a resource from the database.

Only the owner of the resource is allowed to delete it.

### Path Parameter

| Parameter | Type | Description        |
| --------- | ---- | ------------------ |
| id        | UUID | ID of the resource |

### Success Response

**Status Code: `200 OK`**

```json
{
  "message": "Resource deleted successfully",
  "resource": {
    "id": "...",
    "title": "Old Laptop"
  }
}
```

### Error Responses

**404 Not Found**

```json
{
  "message": "Resource not found"
}
```

**403 Forbidden**

```json
{
  "message": "You are not authorized to delete this resource"
}
```

**500 Internal Server Error**

```json
{
  "message": "Failed to delete resource",
  "error": "..."
}
```

---

# 9. Resource Request APIs

Resource requests allow users to request available resources from other users.

A request is initially created with the status:

```text
pending
```

The resource owner can then either approve or reject the request.

---

# 10. Create Resource Request

### Endpoint

```http
POST /api/requests
```

### Authentication

Required.

### Description

Creates a request for a resource.

### Request Body

```json
{
  "resource_id": "RESOURCE_ID",
  "quantity": 1
}
```

### Parameters

| Field       | Type    | Required | Description                  |
| ----------- | ------- | -------- | ---------------------------- |
| resource_id | UUID    | Yes      | ID of the requested resource |
| quantity    | Integer | Yes      | Quantity requested           |

### Validation

The API checks:

1. Whether the authenticated user's profile exists.
2. Whether a resource ID was provided.
3. Whether the quantity is a positive integer.
4. Whether the resource exists.
5. Whether the resource is currently available.
6. Whether the requested quantity is within the available quantity.
7. Whether the user is attempting to request their own resource.

### Success Response

**Status Code: `201 Created`**

```json
{
  "message": "Resource request created successfully",
  "request": {
    "id": "...",
    "resource_id": "...",
    "requester_id": "...",
    "quantity": 1,
    "status": "pending",
    "created_at": "..."
  },
  "requester_profile_id": "..."
}
```

### Error Responses

**400 Bad Request**

```json
{
  "message": "Resource ID is required"
}
```

```json
{
  "message": "Quantity must be a positive integer"
}
```

```json
{
  "message": "This resource is currently unavailable"
}
```

```json
{
  "message": "Requested quantity is greater than available quantity"
}
```

```json
{
  "message": "You cannot request your own resource"
}
```

**404 Not Found**

```json
{
  "message": "User profile not found. Please make sure your account exists in the profiles table."
}
```

or:

```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error**

```json
{
  "message": "Failed to create resource request",
  "error": "..."
}
```

---

# 11. Get Incoming Requests for Resource Owner

### Endpoint

```http
GET /api/requests/owner/:userId
```

### Authentication

Required.

### Description

Retrieves requests submitted for resources owned by the authenticated user.

The API joins the `requests` and `resources` tables to provide information about the requested resource.

### Path Parameter

| Parameter | Type       | Description                         |
| --------- | ---------- | ----------------------------------- |
| userId    | Identifier | User identifier included in the URL |

> The backend identifies the actual owner using the authenticated user's email/profile rather than trusting the supplied `userId` value.

### Success Response

**Status Code: `200 OK`**

```json
{
  "message": "Owner requests retrieved successfully",
  "requests": [
    {
      "id": "...",
      "resource_id": "...",
      "requester_id": "...",
      "quantity": 1,
      "status": "pending",
      "created_at": "...",
      "resource_title": "Old Laptop",
      "available_quantity": 2,
      "location": "Chennai",
      "category": "Electronics"
    }
  ]
}
```

### Error Responses

**404 Not Found**

```json
{
  "message": "Owner profile not found"
}
```

**500 Internal Server Error**

```json
{
  "message": "Failed to fetch owner requests",
  "error": "..."
}
```

---

# 12. Get Requests Made by User

### Endpoint

```http
GET /api/requests/user/:userId
```

### Authentication

Required.

### Description

Retrieves resource requests created by the authenticated user.

### Path Parameter

| Parameter | Type       | Description                         |
| --------- | ---------- | ----------------------------------- |
| userId    | Identifier | User identifier included in the URL |

> The backend identifies the actual user using the authenticated user's email/profile.

### Success Response

**Status Code: `200 OK`**

```json
{
  "message": "User requests retrieved successfully",
  "requests": [
    {
      "id": "...",
      "resource_id": "...",
      "requester_id": "...",
      "quantity": 1,
      "status": "pending",
      "created_at": "...",
      "resource_title": "Old Laptop",
      "location": "Chennai",
      "category": "Electronics",
      "condition": "Good"
    }
  ]
}
```

### Error Responses

**404 Not Found**

```json
{
  "message": "User profile not found"
}
```

**500 Internal Server Error**

```json
{
  "message": "Failed to fetch user requests",
  "error": "..."
}
```

---

# 13. Approve Resource Request

### Endpoint

```http
PATCH /api/requests/:requestId/approve
```

### Authentication

Required.

### Description

Approves a pending resource request made by another user.

Before approval, the API:

1. Identifies the authenticated owner's profile.
2. Checks whether the request exists.
3. Verifies that the authenticated user owns the requested resource.
4. Checks whether the request is still pending.
5. Checks whether sufficient quantity is available.
6. Decreases the resource quantity.
7. Changes the resource status to `unavailable` if its quantity reaches zero.
8. Changes the request status to `approved`.

### Path Parameter

| Parameter | Type | Description                |
| --------- | ---- | -------------------------- |
| requestId | UUID | ID of the resource request |

### Request Body

No request body is required.

### Success Response

**Status Code: `200 OK`**

```json
{
  "message": "Resource request approved successfully",
  "request": {
    "id": "...",
    "resource_id": "...",
    "requester_id": "...",
    "quantity": 1,
    "status": "approved",
    "created_at": "..."
  },
  "resource": {
    "id": "...",
    "quantity": 1,
    "status": "available"
  }
}
```

If the approved request consumes the complete available quantity, the resource status becomes:

```text
unavailable
```

### Error Responses

**404 Not Found**

```json
{
  "message": "Owner profile not found"
}
```

or:

```json
{
  "message": "Request not found"
}
```

**403 Forbidden**

```json
{
  "message": "You are not authorized to approve this request"
}
```

**400 Bad Request**

```json
{
  "message": "This request has already been processed"
}
```

or:

```json
{
  "message": "Not enough resources available"
}
```

**500 Internal Server Error**

```json
{
  "message": "Failed to approve request",
  "error": "..."
}
```

---

# 14. Reject Resource Request

### Endpoint

```http
PATCH /api/requests/:requestId/reject
```

### Authentication

Required.

### Description

Rejects a pending resource request.

Only the owner of the requested resource can reject the request.

### Path Parameter

| Parameter | Type | Description                |
| --------- | ---- | -------------------------- |
| requestId | UUID | ID of the resource request |

### Request Body

No request body is required.

### Processing

The API:

1. Identifies the authenticated owner's profile.
2. Checks whether the request exists.
3. Verifies resource ownership.
4. Checks that the request is still pending.
5. Updates the request status to `rejected`.

The resource quantity is not changed when a request is rejected.

### Success Response

**Status Code: `200 OK`**

```json
{
  "message": "Resource request rejected successfully",
  "request": {
    "id": "...",
    "resource_id": "...",
    "requester_id": "...",
    "quantity": 1,
    "status": "rejected",
    "created_at": "..."
  }
}
```

### Error Responses

**404 Not Found**

```json
{
  "message": "Owner profile not found"
}
```

or:

```json
{
  "message": "Request not found"
}
```

**403 Forbidden**

```json
{
  "message": "You are not authorized to reject this request"
}
```

**400 Bad Request**

```json
{
  "message": "This request has already been processed"
}
```

**500 Internal Server Error**

```json
{
  "message": "Failed to reject request",
  "error": "..."
}
```

---

# 15. Backend Health Check

### Endpoint

```http
GET /
```

### Authentication

Not required.

### Description

Checks whether the ResourceLoop backend server is running.

### Success Response

**Status Code: `200 OK`**

```json
{
  "message": "ResourceLoop backend is running!"
}
```

---

# 16. Database Connection Test

### Endpoint

```http
GET /api/test-db
```

### Authentication

Not required.

### Description

Tests the connection between the Node.js backend and the Supabase PostgreSQL database.

The endpoint executes:

```sql
SELECT NOW();
```

### Successful Response

**Status Code: `200 OK`**

```json
{
  "message": "Supabase database connected successfully!",
  "time": "..."
}
```

### Error Response

**Status Code: `500 Internal Server Error`**

```json
{
  "message": "Database connection failed",
  "error": "..."
}
```

---

# 17. Complete API Endpoint Summary

| Method | Endpoint                           | Authentication | Purpose                                     |
| ------ | ---------------------------------- | -------------- | ------------------------------------------- |
| GET    | `/`                                | No             | Check backend status                        |
| GET    | `/api/test-db`                     | No             | Test database connection                    |
| POST   | `/api/resources`                   | Yes            | Create resource                             |
| GET    | `/api/resources`                   | No             | Get all resources                           |
| GET    | `/api/resources/:id`               | No             | Get single resource                         |
| PUT    | `/api/resources/:id`               | Yes            | Update resource                             |
| DELETE | `/api/resources/:id`               | Yes            | Delete resource                             |
| POST   | `/api/requests`                    | Yes            | Create resource request                     |
| GET    | `/api/requests/owner/:userId`      | Yes            | Get incoming requests for owner's resources |
| GET    | `/api/requests/user/:userId`       | Yes            | Get requests made by user                   |
| PATCH  | `/api/requests/:requestId/approve` | Yes            | Approve request                             |
| PATCH  | `/api/requests/:requestId/reject`  | Yes            | Reject request                              |

---

# 18. HTTP Status Codes Used

| Status Code | Meaning               | Usage in ResourceLoop                                               |
| ----------- | --------------------- | ------------------------------------------------------------------- |
| 200         | OK                    | Successful GET, PUT, DELETE and PATCH operations                    |
| 201         | Created               | Successful resource/request creation                                |
| 400         | Bad Request           | Invalid input, quantity, unavailable resource, or processed request |
| 403         | Forbidden             | User does not own the resource/request                              |
| 404         | Not Found             | Resource, request, or profile does not exist                        |
| 500         | Internal Server Error | Unexpected server/database error                                    |

---

# 19. API Communication Flow

The ResourceLoop API follows a client-server architecture.

```text
User
  |
  v
React + Vite Frontend
  |
  | HTTP Request
  v
Node.js + Express.js Backend
  |
  | SQL Query
  v
Supabase PostgreSQL
  |
  | Database Response
  v
Express.js Backend
  |
  | JSON Response
  v
React Frontend
  |
  v
User Interface
```

For authenticated operations, the request is first processed by the authentication middleware.

```text
Frontend
   |
   | Authenticated API Request
   v
Authentication Middleware
   |
   | Verify User
   v
Express Route
   |
   | Validate Request
   v
PostgreSQL Database
   |
   v
JSON Response
```

---

# 20. Resource CRUD Operations

ResourceLoop implements complete CRUD operations for resource management.

| CRUD Operation | HTTP Method | Endpoint             |
| -------------- | ----------- | -------------------- |
| Create         | POST        | `/api/resources`     |
| Read All       | GET         | `/api/resources`     |
| Read One       | GET         | `/api/resources/:id` |
| Update         | PUT         | `/api/resources/:id` |
| Delete         | DELETE      | `/api/resources/:id` |

These operations allow resource owners to create, view, modify, and remove their resource listings.

---

# 21. Request Management Flow

The request management process follows the sequence:

```text
User selects resource
        |
        v
Submit Resource Request
        |
        v
Request stored with "pending" status
        |
        v
Resource Owner views incoming request
        |
       / \
      /   \
 Approve  Reject
    |       |
    v       v
approved  rejected
    |
    v
Available quantity decreases
```

When a request is approved, the requested quantity is deducted from the resource quantity.

If the quantity becomes zero, the resource status is automatically changed to:

```text
unavailable
```

---

# 22. Security and Validation

The API implements several validation and authorization mechanisms:

### Authentication

Protected routes use authentication middleware.

### Ownership Verification

Users cannot update or delete resources owned by another user.

Resource owners are also verified before approving or rejecting requests.

### Quantity Validation

Resource creation requires a positive integer quantity.

Resource updates allow a non-negative integer quantity.

Resource requests require a positive integer quantity.

### Availability Validation

A request cannot exceed the currently available quantity.

### Duplicate Processing Prevention

A request that is already approved or rejected cannot be processed again.

### Environment-Based Configuration

Database configuration is maintained outside the source code through environment variables.

---

# 23. Technologies Used for API Implementation

| Technology                | Purpose                          |
| ------------------------- | -------------------------------- |
| Node.js                   | Backend runtime                  |
| Express.js                | REST API framework               |
| PostgreSQL                | Relational database              |
| Supabase                  | Cloud-hosted PostgreSQL database |
| JavaScript                | Backend implementation language  |
| HTTP/REST                 | Client-server communication      |
| JSON                      | API request and response format  |
| CORS                      | Cross-origin communication       |
| Authentication Middleware | Protected API access             |

---

# 24. Source Code Structure

The main backend API files are organized as follows:

```text
backend/
│
├── server.js
├── db.js
├── authMiddleware.js
│
└── routes/
    ├── resources.js
    └── requests.js
```

### `server.js`

Initializes the Express application, configures middleware, and mounts the resource and request routes.

### `routes/resources.js`

Implements resource CRUD operations.

### `routes/requests.js`

Implements resource request creation, retrieval, approval, and rejection.

### `db.js`

Establishes the PostgreSQL database connection.

### `authMiddleware.js`

Handles authentication for protected API routes.

---

# 25. Conclusion

The ResourceLoop REST API provides a structured communication layer between the React frontend and the Node.js/Express.js backend.

The API supports complete resource CRUD operations and a complete resource request workflow. Authentication, ownership verification, quantity validation, resource availability checks, and request status management help maintain the correctness and security of the application.

The backend is connected to a cloud-hosted PostgreSQL database through Supabase, while the API can be deployed and accessed through the cloud using Render. This architecture demonstrates the use of RESTful APIs, cloud database integration, authentication, and cloud deployment in a real-world web application.
