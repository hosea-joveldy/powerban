<?php

use App\Controllers\AuthController;
use App\Controllers\BoardController;
use App\Controllers\CardController;
use App\Controllers\GroupController;
use App\Controllers\TaskController;

$router->add(
  "POST",
  "/api/auth/register",
  fn() => new AuthController()->register(),
);
$router->add("POST", "/api/auth/login", fn() => new AuthController()->login());
$router->add(
  "POST",
  "/api/auth/logout",
  fn() => new AuthController()->logout(),
);
$router->add("GET", "/api/me", fn() => new AuthController()->me());
$router->add("PATCH", "/api/me", fn() => new AuthController()->updateMe());

$router->add("GET", "/api/groups", fn() => new GroupController()->index());
$router->add("POST", "/api/groups", fn() => new GroupController()->store());
$router->add(
  "PATCH",
  "/api/groups/{id}",
  fn($p) => new GroupController()->update($p),
);
$router->add(
  "DELETE",
  "/api/groups/{id}",
  fn($p) => new GroupController()->destroy($p),
);

$router->add("GET", "/api/boards", fn() => new BoardController()->index());
$router->add("POST", "/api/boards", fn() => new BoardController()->store());
$router->add(
  "GET",
  "/api/boards/{id}",
  fn($p) => new BoardController()->show($p),
);
$router->add(
  "PATCH",
  "/api/boards/{id}",
  fn($p) => new BoardController()->update($p),
);
$router->add(
  "DELETE",
  "/api/boards/{id}",
  fn($p) => new BoardController()->destroy($p),
);
$router->add(
  "GET",
  "/api/boards/{id}/progress",
  fn($p) => new BoardController()->progress($p),
);

$router->add(
  "GET",
  "/api/templates",
  fn() => new BoardController()->templates(),
);
$router->add(
  "POST",
  "/api/boards/{id}/save-as-template",
  fn($p) => new BoardController()->saveAsTemplate($p),
);
$router->add(
  "POST",
  "/api/boards/from-template/{id}",
  fn($p) => new BoardController()->fromTemplate($p),
);

$router->add(
  "POST",
  "/api/boards/{id}/cards",
  fn($p) => new CardController()->store($p),
);
$router->add(
  "PATCH",
  "/api/cards/{id}",
  fn($p) => new CardController()->update($p),
);
$router->add(
  "DELETE",
  "/api/cards/{id}",
  fn($p) => new CardController()->destroy($p),
);

$router->add(
  "POST",
  "/api/cards/{id}/tasks",
  fn($p) => new TaskController()->store($p),
);
$router->add(
  "PATCH",
  "/api/tasks/{id}",
  fn($p) => new TaskController()->update($p),
);
$router->add(
  "POST",
  "/api/tasks/{id}/move",
  fn($p) => new TaskController()->move($p),
);
$router->add(
  "DELETE",
  "/api/tasks/{id}",
  fn($p) => new TaskController()->destroy($p),
);
