<?php

namespace App;

class Router
{
  private string $basePath = "/qibar/powerban";
  private array $routes = [];

  public function add(string $method, string $pattern, callable $handler): void
  {
    $regex =
      "#^" . preg_replace("#\{(\w+)\}#", '(?P<$1>[^/]+)', $pattern) . '$#';
    $this->routes[] = [$method, $regex, $handler];
  }

  public function dispatch(): void
  {
    $method = $_SERVER["REQUEST_METHOD"];
    $path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

    if (str_starts_with($path, $this->basePath)) {
      $path = substr($path, strlen($this->basePath));
    }
    $path = rtrim($path, "/") ?: "/";

    header("Content-Type: application/json");

    foreach ($this->routes as [$routeMethod, $regex, $handler]) {
      if ($routeMethod === $method && preg_match($regex, $path, $matches)) {
        $params = array_filter($matches, "is_string", ARRAY_FILTER_USE_KEY);
        $handler($params);
        return;
      }
    }

    http_response_code(404);
    echo json_encode(["error" => "Not found"]);
  }
}
