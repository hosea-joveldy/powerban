<?php

namespace App\Controllers;

use App\Auth;
use App\Db;
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
    $username = isset($in["username"]) && is_string($in["username"]) ? trim($in["username"]) : null;
    if ($username !== null && $username !== "") {
      if (strlen($username) < 3 || strlen($username) > 30 || !preg_match('/^[a-zA-Z0-9_-]+$/', $username)) {
        throw new HttpException(422, "Username must be 3 to 30 characters (letters, numbers, _ or -)");
      }
    }
    $email = strtolower(Input::text($in, "email", 254));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      throw new HttpException(422, "Invalid email");
    }
    $password = $in["password"] ?? null;
    if (
      !is_string($password) ||
      strlen($password) < 8 ||
      strlen($password) > 72
    ) {
      throw new HttpException(422, "Password must be 8 to 72 characters");
    }

    try {
      $user = User::create($username, $email, password_hash($password, PASSWORD_DEFAULT));
    } catch (PDOException $e) {
      if ($e->getCode() === "23505") {
        if (str_contains($e->getMessage(), "username")) {
          throw new HttpException(409, "Username already registered");
        }
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
    $identifier = $in["username"] ?? ($in["email"] ?? ($in["login"] ?? null));
    if (!is_string($identifier) || trim($identifier) === "") {
      throw new HttpException(422, "Username or email is required");
    }
    $identifier = trim($identifier);

    $password = $in["password"] ?? null;
    if (!is_string($password)) {
      throw new HttpException(422, "password is required");
    }

    $ip = $_SERVER["REMOTE_ADDR"] ?? null;
    $db = Db::connection();

    // Check failed login attempts in the last 15 minutes
    $stmt = $db->prepare(
      "SELECT COUNT(*) FROM login_attempts WHERE email = :email AND attempted_at >= now() - interval '15 minutes'"
    );
    $stmt->execute([":email" => strtolower($identifier)]);
    $failedCount = (int)$stmt->fetchColumn();

    if ($failedCount >= 5) {
      throw new HttpException(
        429,
        "Too many failed login attempts. Please try again in 15 minutes."
      );
    }

    $row = User::findByUsernameOrEmail($identifier);
    if (!$row) {
      password_hash($password, PASSWORD_DEFAULT);
      $ins = $db->prepare(
        "INSERT INTO login_attempts (email, ip_address, attempted_at) VALUES (:email, :ip, now())"
      );
      $ins->execute([":email" => strtolower($identifier), ":ip" => $ip]);
      throw new HttpException(401, "Invalid email or password");
    }

    if (!password_verify($password, $row["password_hash"])) {
      $ins = $db->prepare(
        "INSERT INTO login_attempts (email, ip_address, attempted_at) VALUES (:email, :ip, now())"
      );
      $ins->execute([":email" => strtolower($identifier), ":ip" => $ip]);
      throw new HttpException(401, "Invalid email or password");
    }

    // Successful login clears prior failed attempts
    $del = $db->prepare("DELETE FROM login_attempts WHERE email = :email OR email = :username");
    $del->execute([":email" => strtolower($row["email"]), ":username" => strtolower($row["username"] ?? "")]);

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
