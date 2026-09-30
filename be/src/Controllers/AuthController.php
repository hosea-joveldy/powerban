<?php

namespace App\Controllers;

use App\Auth;
use App\Http;
use App\HttpException;
use App\Input;
use App\Models\User;
use PDOException;

class AuthController
{
  public function register(): void
  {
    $in = Http::body();
    $email = strtolower(Input::text($in, "email", 254));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      throw new HttpException(422, "Invalid email");
    }
    $password = $in["password"] ?? null;
    // bcrypt only looks at the first 72 bytes
    if (
      !is_string($password) ||
      strlen($password) < 8 ||
      strlen($password) > 72
    ) {
      throw new HttpException(422, "Password must be 8 to 72 characters");
    }

    try {
      $user = User::create($email, password_hash($password, PASSWORD_DEFAULT));
    } catch (PDOException $e) {
      if ($e->getCode() === "23505") {
        throw new HttpException(409, "Email already registered");
      }
      throw $e;
    }
    Auth::login($user["id"]);
    Http::json($user, 201);
  }

  public function login(): void
  {
    $in = Http::body();
    $email = strtolower(Input::text($in, "email", 254));
    $password = $in["password"] ?? null;
    if (!is_string($password)) {
      throw new HttpException(422, "password is required");
    }

    $row = User::findByEmail($email);
    if (!$row) {
      password_hash($password, PASSWORD_DEFAULT);
      throw new HttpException(401, "Invalid email or password");
    }
    if (!password_verify($password, $row["password_hash"])) {
      throw new HttpException(401, "Invalid email or password");
    }

    Auth::login($row["id"]);
    unset($row["password_hash"]);
    Http::json($row);
  }

  public function logout(): void
  {
    Auth::logout();
    Http::json(["ok" => true]);
  }

  public function me(): void
  {
    $user = User::find(Auth::requireUser());
    if (!$user) {
      throw new HttpException(401, "Not authenticated");
    }
    Http::json($user);
  }

  public function updateMe(): void
  {
    $uid = Auth::requireUser();
    $in = Http::body();
    $theme = Input::text($in, "theme", 32);
    if (!preg_match('/^[a-z0-9-]+$/', $theme)) {
      throw new HttpException(
        422,
        "theme may only contain a-z, 0-9 and dashes",
      );
    }
    User::setTheme($uid, $theme);
    Http::json(User::find($uid));
  }
}
