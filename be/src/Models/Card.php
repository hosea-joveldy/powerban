<?php

namespace App\Models;

use App\Db;
use App\HttpException;
use App\Input;
use App\Positions;

class Card
{
  public const TYPES = ["todo", "ongoing", "completed"];

  private const COLS = "id, board_id, name, position, wip_limit, card_type";

  public static function fetch(int $id): array
  {
    $stmt = Db::connection()->prepare(
      "SELECT " . self::COLS . " FROM cards WHERE id = :id",
    );
    $stmt->execute(["id" => $id]);
    return $stmt->fetch() ?: throw new HttpException(404, "Card not found");
  }

  public static function findOwned(int $id, int $uid): array
  {
    $stmt = Db::connection()->prepare(
      "SELECT c.id, c.board_id, c.name, c.position, c.wip_limit, c.card_type
       FROM cards c JOIN boards b ON b.id = c.board_id
       WHERE c.id = :id AND b.user_id = :u",
    );
    $stmt->execute(["id" => $id, "u" => $uid]);
    return $stmt->fetch() ?: throw new HttpException(404, "Card not found");
  }

  public static function taskCount(int $id): int
  {
    $stmt = Db::connection()->prepare(
      "SELECT COUNT(*) FROM tasks WHERE card_id = :id",
    );
    $stmt->execute(["id" => $id]);
    return (int) $stmt->fetchColumn();
  }

  private static function assertType(mixed $type): void
  {
    if (!in_array($type, self::TYPES, true)) {
      throw new HttpException(
        422,
        "card_type must be one of: todo, ongoing, completed",
      );
    }
  }

  public static function create(int $boardId, array $in): array
  {
    $name = Input::text($in, "name");
    $type = $in["card_type"] ?? "todo";
    self::assertType($type);
    $wip = Input::int($in, "wip_limit", false, 1);
    if ($wip !== null && $type !== "ongoing") {
      throw new HttpException(
        422,
        "wip_limit is only allowed on ongoing cards",
      );
    }
    $index = array_key_exists("position", $in)
      ? Input::int($in, "position")
      : null;

    $id = Db::transaction(function ($pdo) use (
      $boardId,
      $name,
      $type,
      $wip,
      $index,
    ) {
      $stmt = $pdo->prepare(
        "INSERT INTO cards (board_id, name, position, wip_limit, card_type) VALUES (:b, :n, :p, :w, :t) RETURNING id",
      );
      $stmt->execute([
        "b" => $boardId,
        "n" => $name,
        "p" => Positions::next("cards", "board_id", $boardId),
        "w" => $wip,
        "t" => $type,
      ]);
      $id = (int) $stmt->fetchColumn();
      if ($index !== null) {
        Positions::place("cards", "board_id", $boardId, $id, $index);
      }
      return $id;
    });
    return self::fetch($id);
  }

  public static function update(array $card, array $in): array
  {
    $fields = [];
    if (array_key_exists("name", $in)) {
      $fields["name"] = Input::text($in, "name");
    }

    $type = $card["card_type"];
    if (array_key_exists("card_type", $in)) {
      self::assertType($in["card_type"]);
      $type = $in["card_type"];
    }

    $wip = $card["wip_limit"];
    if (array_key_exists("wip_limit", $in)) {
      $wip = Input::int($in, "wip_limit", false, 1);
    }
    if ($type !== "ongoing") {
      if (array_key_exists("wip_limit", $in) && $wip !== null) {
        throw new HttpException(
          422,
          "wip_limit is only allowed on ongoing cards",
        );
      }
      $wip = null;
    }

    if ($type !== $card["card_type"]) {
      $fields["card_type"] = $type;
    }
    if ($wip !== $card["wip_limit"]) {
      $fields["wip_limit"] = $wip;
    }

    $index = array_key_exists("position", $in)
      ? Input::int($in, "position")
      : null;

    Db::transaction(function ($pdo) use ($card, $fields, $type, $index) {
      Db::update("cards", $card["id"], $fields);

      if (
        $type !== $card["card_type"] &&
        ($type === "completed" || $card["card_type"] === "completed")
      ) {
        $stmt = $pdo->prepare(
          "UPDATE tasks SET is_finished = :f, updated_at = now() WHERE card_id = :id",
        );
        $stmt->execute([
          "f" => Db::bool($type === "completed"),
          "id" => $card["id"],
        ]);
      }
      if ($index !== null) {
        Positions::place(
          "cards",
          "board_id",
          $card["board_id"],
          $card["id"],
          $index,
        );
      }
    });
    return self::fetch($card["id"]);
  }

  public static function delete(array $card, bool $force): void
  {
    if (!$force && self::taskCount($card["id"]) > 0) {
      throw new HttpException(
        409,
        "Card still has tasks. Move them first, or repeat with ?force=1 to delete them too",
      );
    }
    $stmt = Db::connection()->prepare("DELETE FROM cards WHERE id = :id");
    $stmt->execute(["id" => $card["id"]]);
  }
}
