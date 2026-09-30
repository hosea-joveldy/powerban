<?php

namespace App\Models;

use App\Db;
use App\HttpException;
use App\Input;
use App\Positions;

class Group
{
  public static function forUser(int $uid): array
  {
    $stmt = Db::connection()->prepare(
      "SELECT id, name, position FROM groups WHERE user_id = :u ORDER BY position, id",
    );
    $stmt->execute(["u" => $uid]);
    return $stmt->fetchAll();
  }

  public static function findOwned(int $id, int $uid): array
  {
    $stmt = Db::connection()->prepare(
      "SELECT id, name, position FROM groups WHERE id = :id AND user_id = :u",
    );
    $stmt->execute(["id" => $id, "u" => $uid]);
    return $stmt->fetch() ?: throw new HttpException(404, "Group not found");
  }

  public static function create(int $uid, array $in): array
  {
    $name = Input::text($in, "name");
    $stmt = Db::connection()->prepare(
      "INSERT INTO groups (user_id, name, position) VALUES (:u, :n, :p) RETURNING id",
    );
    $stmt->execute([
      "u" => $uid,
      "n" => $name,
      "p" => Positions::next("groups", "user_id", $uid),
    ]);
    return self::findOwned((int) $stmt->fetchColumn(), $uid);
  }

  public static function update(array $group, int $uid, array $in): array
  {
    $fields = [];
    if (array_key_exists("name", $in)) {
      $fields["name"] = Input::text($in, "name");
    }
    $index = array_key_exists("position", $in)
      ? Input::int($in, "position")
      : null;

    Db::transaction(function () use ($group, $uid, $fields, $index) {
      Db::update("groups", $group["id"], $fields);
      if ($index !== null) {
        Positions::place("groups", "user_id", $uid, $group["id"], $index);
      }
    });
    return self::findOwned($group["id"], $uid);
  }

  public static function delete(int $id): void
  {
    $stmt = Db::connection()->prepare("DELETE FROM groups WHERE id = :id");
    $stmt->execute(["id" => $id]);
  }
}
