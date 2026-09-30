<?php

namespace App\Models;

use App\Db;
use App\HttpException;
use App\Input;
use App\Positions;

class Task
{
  private const SELECT = "SELECT t.id, t.card_id, c.board_id, c.card_type, t.title, t.description,
      t.position, t.is_finished, t.linked_board_id, t.created_at, t.updated_at
    FROM tasks t JOIN cards c ON c.id = t.card_id";

  private static function present(array $rows): array
  {
    $ids = [];
    foreach ($rows as $r) {
      if ($r["linked_board_id"] !== null) {
        $ids[] = $r["linked_board_id"];
      }
    }
    $linked = Board::summaries(array_unique($ids));

    foreach ($rows as &$r) {
      unset($r["card_type"]);
      $l =
        $r["linked_board_id"] !== null
          ? $linked[$r["linked_board_id"]] ?? null
          : null;
      $r["linked_board"] = $l
        ? ["id" => $l["id"], "name" => $l["name"], "progress" => $l["progress"]]
        : null;
    }
    unset($r);
    return $rows;
  }

  public static function forBoard(int $boardId): array
  {
    $stmt = Db::connection()->prepare(
      self::SELECT . " WHERE c.board_id = :b ORDER BY t.position, t.id",
    );
    $stmt->execute(["b" => $boardId]);
    return self::present($stmt->fetchAll());
  }

  public static function fetch(int $id): array
  {
    $stmt = Db::connection()->prepare(self::SELECT . " WHERE t.id = :id");
    $stmt->execute(["id" => $id]);
    $row = $stmt->fetch() ?: throw new HttpException(404, "Task not found");
    return self::present([$row])[0];
  }

  public static function findOwned(int $id, int $uid): array
  {
    $stmt = Db::connection()->prepare(
      self::SELECT .
        " JOIN boards b ON b.id = c.board_id WHERE t.id = :id AND b.user_id = :u",
    );
    $stmt->execute(["id" => $id, "u" => $uid]);
    return $stmt->fetch() ?: throw new HttpException(404, "Task not found");
  }

  private static function assertLink(
    ?int $linkedId,
    int $uid,
    int $ownBoardId,
  ): void {
    if ($linkedId === null) {
      return;
    }
    $board = Board::find($linkedId, $uid);
    if (!$board) {
      throw new HttpException(
        422,
        "linked_board_id does not match one of your boards",
      );
    }
    if ($board["is_template"]) {
      throw new HttpException(422, "A task cannot link to a template");
    }
    if ($linkedId === $ownBoardId) {
      throw new HttpException(422, "A task cannot link to its own board");
    }
  }

  private static function lockCard(int $cardId): array
  {
    $stmt = Db::connection()->prepare(
      "SELECT id, board_id, card_type, wip_limit FROM cards WHERE id = :id FOR UPDATE",
    );
    $stmt->execute(["id" => $cardId]);
    return $stmt->fetch() ?: throw new HttpException(404, "Card not found");
  }

  private static function assertRoom(array $card): void
  {
    if ($card["card_type"] !== "ongoing" || $card["wip_limit"] === null) {
      return;
    }
    if (Card::taskCount($card["id"]) >= $card["wip_limit"]) {
      throw new HttpException(409, "WIP limit reached for this card", [
        "wip_limit" => $card["wip_limit"],
      ]);
    }
  }

  public static function create(int $uid, array $card, array $in): array
  {
    $title = Input::text($in, "title");
    $description = Input::text($in, "description", 10000, false);
    $linked = Input::int($in, "linked_board_id", false, 1);
    $index = array_key_exists("position", $in)
      ? Input::int($in, "position")
      : null;
    self::assertLink($linked, $uid, $card["board_id"]);

    $id = Db::transaction(function ($pdo) use (
      $card,
      $title,
      $description,
      $linked,
      $index,
    ) {
      $locked = self::lockCard($card["id"]);
      self::assertRoom($locked);

      $stmt = $pdo->prepare(
        "INSERT INTO tasks (card_id, title, description, position, is_finished, linked_board_id)
         VALUES (:c, :t, :d, :p, :f, :l) RETURNING id",
      );
      $stmt->execute([
        "c" => $card["id"],
        "t" => $title,
        "d" => $description,
        "p" => Positions::next("tasks", "card_id", $card["id"]),
        "f" => Db::bool($locked["card_type"] === "completed"),
        "l" => $linked,
      ]);
      $id = (int) $stmt->fetchColumn();
      if ($index !== null) {
        Positions::place("tasks", "card_id", $card["id"], $id, $index);
      }
      return $id;
    });
    return self::fetch($id);
  }

  public static function update(array $task, int $uid, array $in): array
  {
    $fields = [];
    if (array_key_exists("title", $in)) {
      $fields["title"] = Input::text($in, "title");
    }
    if (array_key_exists("description", $in)) {
      $fields["description"] = Input::text($in, "description", 10000, false);
    }
    if (array_key_exists("linked_board_id", $in)) {
      $linked = Input::int($in, "linked_board_id", false, 1);
      self::assertLink($linked, $uid, $task["board_id"]);
      $fields["linked_board_id"] = $linked;
    }
    if (array_key_exists("is_finished", $in)) {
      if (!is_bool($in["is_finished"])) {
        throw new HttpException(422, "is_finished must be true or false");
      }
      $fields["is_finished"] = Db::bool(
        $task["card_type"] === "completed" ? true : $in["is_finished"],
      );
    }
    Db::update("tasks", $task["id"], $fields, true);
    return self::fetch($task["id"]);
  }

  public static function move(array $task, int $uid, array $in): array
  {
    $targetId = Input::int($in, "card_id", true, 1);
    $index = array_key_exists("position", $in)
      ? Input::int($in, "position")
      : PHP_INT_MAX;

    $target = Card::findOwned($targetId, $uid);
    if (
      $task["linked_board_id"] !== null &&
      $task["linked_board_id"] === $target["board_id"]
    ) {
      throw new HttpException(
        422,
        "This task links to the board you are moving it onto",
      );
    }

    Db::transaction(function () use ($task, $targetId, $index) {
      $locked = self::lockCard($targetId);
      if ($targetId !== $task["card_id"]) {
        self::assertRoom($locked);
      }

      $finished = $task["is_finished"];
      if ($locked["card_type"] === "completed") {
        $finished = true;
      } elseif ($task["card_type"] === "completed") {
        $finished = false;
      }

      Db::update(
        "tasks",
        $task["id"],
        ["card_id" => $targetId, "is_finished" => Db::bool($finished)],
        true,
      );
      Positions::place("tasks", "card_id", $targetId, $task["id"], $index);
    });
    return self::fetch($task["id"]);
  }

  public static function delete(int $id): void
  {
    $stmt = Db::connection()->prepare("DELETE FROM tasks WHERE id = :id");
    $stmt->execute(["id" => $id]);
  }
}
