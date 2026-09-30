<?php

namespace App\Controllers;

use App\Auth;
use App\Http;
use App\Models\Card;
use App\Models\Task;

class TaskController
{
  public function store(array $p): void
  {
    $uid = Auth::requireUser();
    $card = Card::findOwned((int) $p["id"], $uid);
    Http::json(Task::create($uid, $card, Http::body()), 201);
  }

  public function update(array $p): void
  {
    $uid = Auth::requireUser();
    $task = Task::findOwned((int) $p["id"], $uid);
    Http::json(Task::update($task, $uid, Http::body()));
  }

  public function move(array $p): void
  {
    $uid = Auth::requireUser();
    $task = Task::findOwned((int) $p["id"], $uid);
    Http::json(Task::move($task, $uid, Http::body()));
  }

  public function destroy(array $p): void
  {
    $uid = Auth::requireUser();
    $task = Task::findOwned((int) $p["id"], $uid);
    Task::delete($task["id"]);
    Http::noContent();
  }
}
