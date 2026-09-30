<?php

namespace App;

class Input
{
  public static function text(
    array $d,
    string $key,
    int $max = 255,
    bool $required = true,
  ): ?string {
    if (!array_key_exists($key, $d) || $d[$key] === null) {
      if ($required) {
        throw new HttpException(422, "$key is required");
      }
      return null;
    }
    if (!is_string($d[$key])) {
      throw new HttpException(422, "$key must be a string");
    }
    $v = trim($d[$key]);
    if ($required && $v === "") {
      throw new HttpException(422, "$key cannot be empty");
    }
    if (mb_strlen($v) > $max) {
      throw new HttpException(422, "$key is too long (max $max characters)");
    }
    return $v;
  }

  public static function int(
    array $d,
    string $key,
    bool $required = true,
    int $min = 0,
  ): ?int {
    if (!array_key_exists($key, $d) || $d[$key] === null) {
      if ($required) {
        throw new HttpException(422, "$key is required");
      }
      return null;
    }
    if (!is_int($d[$key])) {
      throw new HttpException(422, "$key must be an integer");
    }
    if ($d[$key] < $min) {
      throw new HttpException(422, "$key must be at least $min");
    }
    return $d[$key];
  }
}
