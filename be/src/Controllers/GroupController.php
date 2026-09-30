<?php

namespace App\Controllers;

use App\Auth;
use App\Http;
use App\Models\Group;

class GroupController
{
  public function index(): void
  {
    Http::json(Group::forUser(Auth::requireUser()));
  }

  public function store(): void
  {
    $uid = Auth::requireUser();
    Http::json(Group::create($uid, Http::body()), 201);
  }

  public function update(array $p): void
  {
    $uid = Auth::requireUser();
    $group = Group::findOwned((int) $p["id"], $uid);
    Http::json(Group::update($group, $uid, Http::body()));
  }

  public function destroy(array $p): void
  {
    $uid = Auth::requireUser();
    $group = Group::findOwned((int) $p["id"], $uid);
    Group::delete($group["id"]);
    Http::noContent();
  }
}
