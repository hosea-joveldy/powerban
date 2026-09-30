<?php

namespace App\Controllers;

use App\Auth;
use App\Http;
use App\Models\Board;
use App\Models\Card;

class CardController
{
  public function store(array $p): void
  {
    $uid = Auth::requireUser();
    $board = Board::findOwned((int) $p["id"], $uid);
    Http::json(Card::create($board["id"], Http::body()), 201);
  }

  public function update(array $p): void
  {
    $uid = Auth::requireUser();
    $card = Card::findOwned((int) $p["id"], $uid);
    Http::json(Card::update($card, Http::body()));
  }

  public function destroy(array $p): void
  {
    $uid = Auth::requireUser();
    $card = Card::findOwned((int) $p["id"], $uid);
    Card::delete($card, ($_GET["force"] ?? "") === "1");
    Http::noContent();
  }
}
