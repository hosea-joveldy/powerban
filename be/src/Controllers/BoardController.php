<?php

namespace App\Controllers;

use App\Auth;
use App\Http;
use App\Input;
use App\Models\Board;

class BoardController
{
  public function index(): void
  {
    Http::json(Board::listFor(Auth::requireUser(), false));
  }

  public function templates(): void
  {
    Http::json(Board::listFor(Auth::requireUser(), true));
  }

  public function show(array $p): void
  {
    Http::json(Board::detail((int) $p["id"], Auth::requireUser()));
  }

  public function store(): void
  {
    $uid = Auth::requireUser();
    Http::json(Board::create($uid, Http::body()), 201);
  }

  public function update(array $p): void
  {
    $uid = Auth::requireUser();
    $board = Board::findOwned((int) $p["id"], $uid);
    Http::json(Board::update($board, $uid, Http::body()));
  }

  public function destroy(array $p): void
  {
    $uid = Auth::requireUser();
    $board = Board::findOwned((int) $p["id"], $uid);
    Board::delete($board["id"]);
    Http::noContent();
  }

  public function progress(array $p): void
  {
    $uid = Auth::requireUser();
    $board = Board::findOwned((int) $p["id"], $uid);
    Http::json(Board::summaries([$board["id"]])[$board["id"]]["progress"]);
  }

  // Copies this board as a template. The original is untouched.
  public function saveAsTemplate(array $p): void
  {
    $uid = Auth::requireUser();
    $src = Board::findOwned((int) $p["id"], $uid);
    $in = Http::body();
    $name =
      Input::text($in, "name", 255, false) ?: $src["name"] . " (template)";
    $newId = Board::duplicate($src, $uid, $name, true, null);
    Http::json(Board::detail($newId, $uid), 201);
  }

  public function fromTemplate(array $p): void
  {
    $uid = Auth::requireUser();
    $src = Board::findAccessibleTemplate((int) $p["id"], $uid);
    $in = Http::body();
    $name = Input::text($in, "name", 255, false) ?: $src["name"];
    $groupId = Input::int($in, "group_id", false, 1);
    $newId = Board::duplicate($src, $uid, $name, false, $groupId);
    Http::json(Board::detail($newId, $uid), 201);
  }
}
