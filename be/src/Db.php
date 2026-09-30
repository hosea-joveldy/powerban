<?php

namespace App;

use PDO;

class Db
{
  private static ?PDO $instance = null;
  private static ?array $config = null;

  private static function loadConfig(): array
  {
    if (self::$config === null) {
      $envPath = __DIR__ . "/../../.env";
      $config = [];
      foreach (file($envPath) as $line) {
        $line = trim($line);
        if ($line === "" || str_starts_with($line, "#")) {
          continue;
        }
        [$key, $value] = explode("=", $line, 2);
        $config[trim($key)] = trim($value);
      }
      self::$config = $config;
    }
    return self::$config;
  }

  public static function connection(): PDO
  {
    if (self::$instance === null) {
      $config = self::loadConfig();

      $dsn = "pgsql:host={$config["DB_HOST"]};port={$config["DB_PORT"]};dbname={$config["DB_NAME"]}";
      self::$instance = new PDO($dsn, $config["DB_USER"], $config["DB_PASS"], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      ]);
    }
    return self::$instance;
  }

  public static function transaction(callable $fn): mixed
  {
    $pdo = self::connection();
    if ($pdo->inTransaction()) {
      return $fn($pdo);
    }
    $pdo->beginTransaction();
    try {
      $result = $fn($pdo);
      $pdo->commit();
      return $result;
    } catch (\Throwable $e) {
      $pdo->rollBack();
      throw $e;
    }
  }

  public static function update(
    string $table,
    int $id,
    array $fields,
    bool $touch = false,
  ): void {
    $sets = [];
    foreach (array_keys($fields) as $col) {
      $sets[] = "$col = :$col";
    }
    if ($touch) {
      $sets[] = "updated_at = now()";
    }
    if (!$sets) {
      return;
    }
    $fields["id"] = $id;
    $stmt = self::connection()->prepare(
      "UPDATE $table SET " . implode(", ", $sets) . " WHERE id = :id",
    );
    $stmt->execute($fields);
  }

  public static function bool(bool $v): string
  {
    return $v ? "true" : "false";
  }
}
