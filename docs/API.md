# Powerban API Reference

Base URL: `/qibar/powerban/api`  
Content-Type: `application/json` (for all request bodies and responses)

---

## 1. Authentication & Security

Powerban uses server-side PHP session authentication:
- **Session Cookie**: `powerban_session`
- **Cookie Attributes**: `Path=/qibar/powerban; HttpOnly; SameSite=Lax; Secure` (when on HTTPS)
- **Data Isolation**: Every endpoint touching user data enforces user ownership. Attempting to access resources belonging to another user returns `404 Not Found`.
- **Prepared Statements**: All database operations use prepared parameterized queries.
- **Rate Limiting**: `POST /api/auth/login` tracks failed attempts. Exceeding 5 failed attempts in 15 minutes returns `429 Too Many Requests`.

---

## 2. Common Error Response Format

Errors are always returned as JSON objects with an `error` key:

```json
{
  "error": "Error message description"
}
```

### Standard HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| `200 OK` | Request succeeded; response payload returned. |
| `201 Created` | Resource created successfully. |
| `204 No Content` | Action succeeded with no response body (e.g., deletions, logout). |
| `400 Bad Request` | Malformed JSON body or invalid request payload. |
| `401 Unauthorized` | Missing or invalid session cookie. |
| `404 Not Found` | Resource not found or owned by another user. |
| `409 Conflict` | Conflict with existing data (e.g. duplicate email, non-empty card deletion without force, WIP limit reached on move). |
| `422 Unprocessable Entity` | Validation failure (e.g. password < 8 chars, invalid WIP limit on non-ongoing card, circular board link). |
| `429 Too Many Requests` | Rate limit exceeded for failed login attempts. |

---

## 3. Endpoints

### 3.1 Authentication

#### `POST /api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "minimum8characters"
}
```

**Responses:**
- `201 Created`: User created and session started.
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "theme": "stone-light"
  }
  ```
- `409 Conflict`: Email is already registered.
- `422 Unprocessable Entity`: Invalid email format or password shorter than 8 characters.

---

#### `POST /api/auth/login`
Authenticate with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Responses:**
- `200 OK`: Successful login; session cookie set. Prior failed attempts cleared.
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "theme": "stone-light"
  }
  ```
- `401 Unauthorized`: Invalid email or password.
- `429 Too Many Requests`: Exceeded 5 failed login attempts in 15 minutes.

---

#### `POST /api/auth/logout`
Terminate the current user session and destroy session cookie.

**Responses:**
- `204 No Content`: Successfully logged out.

---

#### `GET /api/me`
Retrieve authenticated user profile and saved theme.

**Responses:**
- `200 OK`:
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "theme": "stone-light"
  }
  ```
- `401 Unauthorized`: Not logged in.

---

#### `PATCH /api/me`
Update user preferences (such as appearance theme).

**Request Body:**
```json
{
  "theme": "forest-dark"
}
```

**Responses:**
- `200 OK`:
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "theme": "forest-dark"
  }
  ```
- `422 Unprocessable Entity`: Invalid theme identifier (must be `stone-light` or `forest-dark`).

---

### 3.2 Groups

#### `GET /api/groups`
List all groups owned by the authenticated user, ordered by ID.

**Responses:**
- `200 OK`:
  ```json
  [
    {
      "id": 1,
      "name": "Engineering",
      "user_id": 1,
      "created_at": "2026-10-19 12:00:00"
    }
  ]
  ```

---

#### `POST /api/groups`
Create a new board group.

**Request Body:**
```json
{
  "name": "Product Squad"
}
```

**Responses:**
- `201 Created`:
  ```json
  {
    "id": 2,
    "name": "Product Squad",
    "user_id": 1,
    "created_at": "2026-10-19 12:05:00"
  }
  ```
- `422 Unprocessable Entity`: Group name is missing or empty.

---

#### `PATCH /api/groups/{id}`
Update group details.

**Request Body:**
```json
{
  "name": "Platform Team"
}
```

**Responses:**
- `200 OK`: Updated group object.
- `404 Not Found`: Group not found or not owned by user.

---

#### `DELETE /api/groups/{id}`
Delete a group. Boards previously belonging to this group become standalone (`group_id = null`).

**Responses:**
- `204 No Content`: Group deleted successfully.
- `404 Not Found`: Group not found or not owned by user.

---

### 3.3 Boards

#### `GET /api/boards`
List all non-template boards owned by the user, including computed flat progress.

**Responses:**
- `200 OK`:
  ```json
  [
    {
      "id": 10,
      "name": "Sprint 42",
      "group_id": 1,
      "is_template": false,
      "progress": {
        "done": 3,
        "total": 5,
        "percent": 60
      }
    }
  ]
  ```

---

#### `POST /api/boards`
Create a new board. New boards automatically initialize with three cards: **Todo** (`todo`), **Ongoing** (`ongoing`), and **Completed** (`completed`).

**Request Body:**
```json
{
  "name": "Sprint 42",
  "group_id": 1
}
```

**Responses:**
- `201 Created`:
  ```json
  {
    "id": 10,
    "name": "Sprint 42",
    "group_id": 1,
    "is_template": false,
    "user_id": 1,
    "created_at": "2026-10-19 12:10:00"
  }
  ```
- `404 Not Found`: Specified `group_id` does not exist or belongs to another user.
- `422 Unprocessable Entity`: Board name is missing or empty.

---

#### `GET /api/boards/{id}`
Get full board details with embedded cards and tasks ordered by position.

**Responses:**
- `200 OK`:
  ```json
  {
    "id": 10,
    "name": "Sprint 42",
    "group_id": 1,
    "is_template": false,
    "progress": { "done": 1, "total": 2, "percent": 50 },
    "cards": [
      {
        "id": 21,
        "name": "Todo",
        "card_type": "todo",
        "position": 0,
        "wip_limit": null,
        "tasks": [
          {
            "id": 101,
            "title": "Design Mockups",
            "description": "Create Figma components",
            "position": 0,
            "is_finished": false,
            "linked_board_id": null
          }
        ]
      },
      {
        "id": 22,
        "name": "Ongoing",
        "card_type": "ongoing",
        "position": 1,
        "wip_limit": 3,
        "tasks": []
      },
      {
        "id": 23,
        "name": "Completed",
        "card_type": "completed",
        "position": 2,
        "wip_limit": null,
        "tasks": [
          {
            "id": 102,
            "title": "Setup Dev Container",
            "description": null,
            "position": 0,
            "is_finished": true,
            "linked_board_id": 5,
            "linked_board": {
              "id": 5,
              "name": "Infra Roadmap",
              "progress": { "done": 4, "total": 4, "percent": 100 }
            }
          }
        ]
      }
    ]
  }
  ```

---

#### `PATCH /api/boards/{id}`
Update board title or group assignment.

**Request Body:**
```json
{
  "name": "Sprint 43",
  "group_id": null
}
```

**Responses:**
- `200 OK`: Updated board object.
- `404 Not Found`: Board or target group not found/owned.

---

#### `DELETE /api/boards/{id}`
Delete a board and cascade delete its cards and tasks. Clears any links pointing to this board from tasks on other boards.

**Responses:**
- `204 No Content`: Board deleted.

---

#### `GET /api/boards/{id}/progress`
Get flat progress metrics for a specific board.

**Responses:**
- `200 OK`:
  ```json
  {
    "done": 3,
    "total": 6,
    "percent": 50
  }
  ```

---

### 3.4 Templates

#### `GET /api/templates`
List all templates available to the user (built-in system templates owned by `system@powerban.local` plus user's private templates).

**Responses:**
- `200 OK`: Array of template board objects.

---

#### `POST /api/boards/{id}/save-as-template`
Save an existing board as a template. Clones the board, cards, and tasks with `is_template = true`.

**Request Body:**
```json
{
  "name": "Sprint Template (2-week)"
}
```

**Responses:**
- `201 Created`: Created template object.

---

#### `POST /api/boards/from-template/{id}`
Instantiate a new working board from a template.

**Request Body:**
```json
{
  "name": "Q4 Execution Board",
  "group_id": null
}
```

**Responses:**
- `201 Created`: Newly created working board.
- `422 Unprocessable Entity`: Target ID is not a template.

---

### 3.5 Cards (Columns)

#### `POST /api/boards/{id}/cards`
Add a new column to a board.

**Request Body:**
```json
{
  "name": "In Review",
  "card_type": "todo",
  "position": 2
}
```

**Responses:**
- `201 Created`: Created card object.
- `422 Unprocessable Entity`: Missing name, invalid card_type, or WIP limit provided for non-ongoing card.

---

#### `PATCH /api/cards/{id}`
Update card name, card_type, position, or wip_limit.
- Setting `card_type = "completed"` automatically marks all tasks in this card as `is_finished = true`.
- Changing `card_type` away from `"completed"` unfinishes all tasks (`is_finished = false`).
- Changing `card_type` away from `"ongoing"` automatically clears `wip_limit`.
- `wip_limit` can only be set on `ongoing` cards.

**Request Body:**
```json
{
  "name": "Active Work",
  "wip_limit": 5
}
```

**Responses:**
- `200 OK`: Updated card object.
- `422 Unprocessable Entity`: Invalid WIP limit or attempting to set WIP limit on non-ongoing card.

---

#### `DELETE /api/cards/{id}`
Delete a card.
- If the card contains tasks, deletion is rejected with `409 Conflict`.
- Passing query parameter `?force=1` cascades deletion to all tasks within the card.

**Query Parameters:**
- `force` (optional): `1` to force delete card with its tasks.

**Responses:**
- `204 No Content`: Card deleted.
- `409 Conflict`: Card contains tasks and `?force=1` was not provided.

---

### 3.6 Tasks

#### `POST /api/cards/{id}/tasks`
Create a new task inside a card.

**Request Body:**
```json
{
  "title": "Write Unit Tests",
  "description": "Cover all edge cases for parser",
  "linked_board_id": null
}
```

**Responses:**
- `201 Created`:
  ```json
  {
    "id": 105,
    "card_id": 21,
    "title": "Write Unit Tests",
    "description": "Cover all edge cases for parser",
    "position": 1,
    "is_finished": false,
    "linked_board_id": null
  }
  ```
- `409 Conflict`: Target card is `ongoing` and has reached its `wip_limit`.
- `422 Unprocessable Entity`: Missing title or invalid linked board.

---

#### `PATCH /api/tasks/{id}`
Update task title, description, is_finished, or linked_board_id.

**Request Body:**
```json
{
  "title": "Refactor Token Parser",
  "description": "Clean up recursive descent routines",
  "is_finished": true,
  "linked_board_id": 12
}
```

**Responses:**
- `200 OK`: Updated task object.
- `422 Unprocessable Entity`: Attempting to link task to its own board or to a template.

---

#### `POST /api/tasks/{id}/move`
Move a task to another card and/or reposition it.
- Moving into a `completed` card automatically sets `is_finished = true`.
- Moving out of a `completed` card unfinishes the task (`is_finished = false`).
- If target card is `ongoing` and full, request is rejected with `409 Conflict`.

**Request Body:**
```json
{
  "card_id": 22,
  "position": 0
}
```

**Responses:**
- `200 OK`: Moved task object.
- `409 Conflict`: Target card is `ongoing` and has reached its `wip_limit`.
- `404 Not Found`: Target card does not exist or belongs to another user.

---

#### `DELETE /api/tasks/{id}`
Delete a task.

**Responses:**
- `204 No Content`: Task deleted.
- `404 Not Found`: Task does not exist or belongs to another user.
