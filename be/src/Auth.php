<?php

namespace App;

class Auth
{
  private const COOKIE_PATH = "/qibar/powerban";

  private static function start(): void
  {
    if (session_status() === PHP_SESSION_ACTIVE) {
      return;
    }
    session_name("powerban_session");
    session_set_cookie_params([
      "path" => self::COOKIE_PATH,
      "httponly" => true,
      "samesite" => "Lax",
      "secure" => !empty($_SERVER["HTTPS"]),
    ]);
    session_start();
  }

  public static function login(int $userId): void
  {
    self::start();
    session_regenerate_id(true);
    $_SESSION["uid"] = $userId;
  }

  public static function logout(): void
  {
    self::start();
    $_SESSION = [];
    session_destroy();
  }

  public static function id(): ?int
  {
    self::start();
    return isset($_SESSION["uid"]) ? (int) $_SESSION["uid"] : null;
  }

  public static function requireUser(): int
  {
    $id = self::id();
    if ($id === null) {
      throw new HttpException(401, "Not authenticated");
    }
    return $id;
  }
}
