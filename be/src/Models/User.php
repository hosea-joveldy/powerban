<?php

namespace App\Models;

use App\Db;

class User
{
  public static function create(string $email, string $hash): array
  {
    $stmt = Db::connection()->prepare(
      "INSERT INTO users (email, password_hash) VALUES (:e, :h) RETURNING id, email, theme",
    );
    $stmt->execute(["e" => $email, "h" => $hash]);
    return $stmt->fetch();
  }

  public static function findByEmail(string $email): ?array
  {
    $stmt = Db::connection()->prepare(
      "SELECT id, email, theme, password_hash FROM users WHERE email = :e",
    );
    $stmt->execute(["e" => $email]);
    return $stmt->fetch() ?: null;
  }

  public static function find(int $id): ?array
  {
    $stmt = Db::connection()->prepare(
      "SELECT id, email, theme FROM users WHERE id = :id",
    );
    $stmt->execute(["id" => $id]);
    return $stmt->fetch() ?: null;
  }

  public static function setTheme(int $id, string $theme): void
  {
    Db::update("users", $id, ["theme" => $theme]);
  }
}
