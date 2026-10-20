<?php

namespace App\Models;

use App\Db;

class User
{
  public static function create(?string $username, string $email, string $hash): array
  {
    $uname = ($username !== null && trim($username) !== "")
      ? trim($username)
      : explode("@", $email)[0];

    $stmt = Db::connection()->prepare(
      "INSERT INTO users (username, email, password_hash) VALUES (:u, :e, :h) RETURNING id, username, email, theme",
    );
    $stmt->execute(["u" => $uname, "e" => $email, "h" => $hash]);
    return $stmt->fetch();
  }

  public static function findByEmail(string $email): ?array
  {
    $stmt = Db::connection()->prepare(
      "SELECT id, username, email, theme, password_hash FROM users WHERE email = :e",
    );
    $stmt->execute(["e" => $email]);
    return $stmt->fetch() ?: null;
  }

  public static function findByUsernameOrEmail(string $identifier): ?array
  {
    $stmt = Db::connection()->prepare(
      "SELECT id, username, email, theme, password_hash FROM users WHERE username = :id OR email = :id",
    );
    $stmt->execute(["id" => $identifier]);
    return $stmt->fetch() ?: null;
  }

  public static function find(int $id): ?array
  {
    $stmt = Db::connection()->prepare(
      "SELECT id, username, email, theme FROM users WHERE id = :id",
    );
    $stmt->execute(["id" => $id]);
    return $stmt->fetch() ?: null;
  }

  public static function setTheme(int $id, string $theme): void
  {
    Db::update("users", $id, ["theme" => $theme]);
  }
}
