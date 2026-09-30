<?php

spl_autoload_register(function ($class) {
  $prefix = "App\\";
  $base_dir = __DIR__ . "/../src/";

  if (strncmp($prefix, $class, strlen($prefix)) !== 0) {
    return;
  }

  $relative_class = substr($class, strlen($prefix));
  $file = $base_dir . str_replace("\\", "/", $relative_class) . ".php";

  if (file_exists($file)) {
    require $file;
  }
});

use App\HttpException;
use App\Router;

ini_set("display_errors", "0");
ini_set("log_errors", "1");
error_reporting(E_ALL);

set_exception_handler(function (Throwable $e) {
  header("Content-Type: application/json");
  if ($e instanceof HttpException) {
    http_response_code($e->status);
    echo json_encode(["error" => $e->getMessage()] + $e->extra);
    return;
  }
  error_log((string) $e);
  http_response_code(500);
  echo json_encode(["error" => "Internal server error"]);
});

$router = new Router();
require __DIR__ . "/../src/routes.php";
$router->dispatch();
