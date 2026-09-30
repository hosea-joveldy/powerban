<?php

namespace App;

use Exception;

class HttpException extends Exception
{
  public function __construct(
    public int $status,
    string $message,
    public array $extra = [],
  ) {
    parent::__construct($message);
  }
}
