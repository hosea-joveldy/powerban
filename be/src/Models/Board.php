<?php

namespace App\Models;

use App\Db;
use App\HttpException;
use App\Input;

class Board
{
  private const SYSTEM_EMAIL = "system@powerban.local";
  private static int|false|null $systemUserId = false;

  private static function systemUserId(): ?int
  {
    if (self::$systemUserId === false) {
      $stmt = Db::connection()->prepare(
        "SELECT id FROM users WHERE email = :e",
      );
      $stmt->execute(["e" => self::SYSTEM_EMAIL]);
      $id = $stmt->fetchColumn();
      self::$systemUserId = $id !== false ? (int) $id : null;
    }
    return self::$systemUserId;
  }

  public static function shape(int $total, int $done): array
  {
    return [
      "done" => $done,
      "total" => $total,
      "percent" => $total > 0 ? (int) round(($done * 100) / $total) : 0,
    ];
  }

  private static function summarize(string $where, array $params): array
  {
    $stmt = Db::connection()->prepare(
      "SELECT b.id, b.group_id, b.name, b.is_template, b.created_at, b.updated_at,
              COUNT(t.id) AS total,
              COUNT(t.id) FILTER (WHERE c.card_type = 'completed') AS done
       FROM boards b
       LEFT JOIN cards c ON c.board_id = b.id
       LEFT JOIN tasks t ON t.card_id = c.id
       WHERE $where
       GROUP BY b.id
       ORDER BY b.id",
    );
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
      $r["progress"] = self::shape((int) $r["total"], (int) $r["done"]);
      unset($r["total"], $r["done"]);
    }
    unset($r);
    return $rows;
  }

  public static function listFor(int $uid, bool $templates): array
  {
    if (!$templates) {
      return self::summarize("b.user_id = :uid AND b.is_template = FALSE", [
        "uid" => $uid,
      ]);
    }
    $sysId = self::systemUserId();
    $owners = $sysId !== null ? [$uid, $sysId] : [$uid];
    return self::summarize(
      "b.user_id = ANY(CAST(:owners AS int[])) AND b.is_template = TRUE",
      ["owners" => "{" . implode(",", $owners) . "}"],
    );
  }

  public static function findAccessibleTemplate(int $id, int $uid): array
  {
    $sysId = self::systemUserId();
    $stmt = Db::connection()->prepare(
      "SELECT id, user_id, group_id, name, is_template FROM boards
       WHERE id = :id AND (user_id = :uid OR user_id = :sys)",
    );
    $stmt->execute(["id" => $id, "uid" => $uid, "sys" => $sysId]);
    $board = $stmt->fetch() ?: throw new HttpException(404, "Board not found");
    if (!$board["is_template"]) {
      throw new HttpException(422, "That board is not a template");
    }
    return $board;
  }

  public static function summaries(array $ids): array
  {
    if (!$ids) {
      return [];
    }
    $rows = self::summarize("b.id = ANY(CAST(:ids AS int[]))", [
      "ids" => "{" . implode(",", array_map("intval", $ids)) . "}",
    ]);
    return array_column($rows, null, "id");
  }

  public static function find(int $id, int $uid): ?array
  {
    $stmt = Db::connection()->prepare(
      "SELECT id, user_id, group_id, name, is_template FROM boards WHERE id = :id AND user_id = :u",
    );
    $stmt->execute(["id" => $id, "u" => $uid]);
    return $stmt->fetch() ?: null;
  }

  public static function findOwned(int $id, int $uid): array
  {
    return self::find($id, $uid) ??
      throw new HttpException(404, "Board not found");
  }

  private static function assertGroup(?int $groupId, int $uid): void
  {
    if ($groupId !== null) {
      Group::findOwned($groupId, $uid);
    }
  }

  public static function detail(int $id, int $uid): array
  {
    self::findOwned($id, $uid);
    $board = self::summaries([$id])[$id];

    $stmt = Db::connection()->prepare(
      "SELECT id, name, position, wip_limit, card_type FROM cards WHERE board_id = :b ORDER BY position, id",
    );
    $stmt->execute(["b" => $id]);
    $cards = $stmt->fetchAll();

    $byCard = [];
    foreach (Task::forBoard($id) as $task) {
      $byCard[$task["card_id"]][] = $task;
    }
    foreach ($cards as &$card) {
      $card["tasks"] = $byCard[$card["id"]] ?? [];
    }
    unset($card);

    $board["cards"] = $cards;
    return $board;
  }

  public static function create(int $uid, array $in): array
  {
    $name = Input::text($in, "name");
    $groupId = Input::int($in, "group_id", false, 1);
    self::assertGroup($groupId, $uid);

    $id = Db::transaction(function ($pdo) use ($uid, $name, $groupId) {
      $stmt = $pdo->prepare(
        "INSERT INTO boards (user_id, group_id, name) VALUES (:u, :g, :n) RETURNING id",
      );
      $stmt->execute(["u" => $uid, "g" => $groupId, "n" => $name]);
      $id = (int) $stmt->fetchColumn();

      $ins = $pdo->prepare(
        "INSERT INTO cards (board_id, name, position, card_type) VALUES (:b, :n, :p, :t)",
      );
      $defaults = [
        ["Todo", "todo"],
        ["Ongoing", "ongoing"],
        ["Completed", "completed"],
      ];
      foreach ($defaults as $i => [$cardName, $type]) {
        $ins->execute(["b" => $id, "n" => $cardName, "p" => $i, "t" => $type]);
      }
      return $id;
    });
    return self::detail($id, $uid);
  }

  public static function update(array $board, int $uid, array $in): array
  {
    $fields = [];
    if (array_key_exists("name", $in)) {
      $fields["name"] = Input::text($in, "name");
    }
    if (array_key_exists("group_id", $in)) {
      $groupId = Input::int($in, "group_id", false, 1);
      self::assertGroup($groupId, $uid);
      $fields["group_id"] = $groupId;
    }
    Db::update("boards", $board["id"], $fields, true);
    return self::detail($board["id"], $uid);
  }

  public static function delete(int $id): void
  {
    $stmt = Db::connection()->prepare("DELETE FROM boards WHERE id = :id");
    $stmt->execute(["id" => $id]);
  }

  public static function duplicate(
    array $src,
    int $uid,
    string $name,
    bool $asTemplate,
    ?int $groupId,
  ): int {
    self::assertGroup($groupId, $uid);

    return Db::transaction(function ($pdo) use (
      $src,
      $uid,
      $name,
      $asTemplate,
      $groupId,
    ) {
      $stmt = $pdo->prepare(
        "INSERT INTO boards (user_id, group_id, name, is_template) VALUES (:u, :g, :n, :t) RETURNING id",
      );
      $stmt->execute([
        "u" => $uid,
        "g" => $groupId,
        "n" => $name,
        "t" => Db::bool($asTemplate),
      ]);
      $newId = (int) $stmt->fetchColumn();

      $cards = $pdo->prepare(
        "SELECT id, name, position, wip_limit, card_type FROM cards WHERE board_id = :b ORDER BY position, id",
      );
      $cards->execute(["b" => $src["id"]]);

      $insCard = $pdo->prepare(
        "INSERT INTO cards (board_id, name, position, wip_limit, card_type) VALUES (:b, :n, :p, :w, :t) RETURNING id",
      );
      $map = [];
      foreach ($cards->fetchAll() as $c) {
        $insCard->execute([
          "b" => $newId,
          "n" => $c["name"],
          "p" => $c["position"],
          "w" => $c["wip_limit"],
          "t" => $c["card_type"],
        ]);
        $map[$c["id"]] = (int) $insCard->fetchColumn();
      }

      $tasks = $pdo->prepare(
        "SELECT t.card_id, t.title, t.description, t.position, t.is_finished, t.linked_board_id
         FROM tasks t JOIN cards c ON c.id = t.card_id
         WHERE c.board_id = :b ORDER BY t.card_id, t.position, t.id",
      );
      $tasks->execute(["b" => $src["id"]]);

      $insTask = $pdo->prepare(
        "INSERT INTO tasks (card_id, title, description, position, is_finished, linked_board_id)
         VALUES (:c, :ti, :d, :p, :f, :l)",
      );
      foreach ($tasks->fetchAll() as $t) {
        $insTask->execute([
          "c" => $map[$t["card_id"]],
          "ti" => $t["title"],
          "d" => $t["description"],
          "p" => $t["position"],
          "f" => Db::bool($t["is_finished"]),
          "l" => $t["linked_board_id"],
        ]);
      }
      return $newId;
    });
  }
}
