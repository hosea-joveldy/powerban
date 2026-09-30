<?php

namespace App;

class Http
{
  public static function body(): array
  {
    $raw = file_get_contents("php://input");
    if ($raw === false || trim($raw) === "") {
      return [];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
      throw new HttpException(400, "Request body must be a JSON object");
    }
    return $data;
  }

  public static function json(mixed $data, int $status = 200): void
  {
    http_response_code($status);
    echo json_encode($data);
  }

  public static function noContent(): void
  {
    http_response_code(204);
  }
}
