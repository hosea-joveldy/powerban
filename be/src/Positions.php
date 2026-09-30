<?php

namespace App;

class Positions
{
  public static function next(
    string $table,
    string $scopeCol,
    int $scopeVal,
  ): int {
    $stmt = Db::connection()->prepare(
      "SELECT COALESCE(MAX(position) + 1, 0) FROM $table WHERE $scopeCol = :s",
    );
    $stmt->execute(["s" => $scopeVal]);
    return (int) $stmt->fetchColumn();
  }

  public static function place(
    string $table,
    string $scopeCol,
    int $scopeVal,
    int $id,
    int $index,
  ): void {
    $pdo = Db::connection();
    $stmt = $pdo->prepare(
      "SELECT id FROM $table WHERE $scopeCol = :s AND id <> :id ORDER BY position, id",
    );
    $stmt->execute(["s" => $scopeVal, "id" => $id]);
    $ids = array_map("intval", array_column($stmt->fetchAll(), "id"));

    array_splice($ids, max(0, min($index, count($ids))), 0, [$id]);

    $upd = $pdo->prepare("UPDATE $table SET position = :p WHERE id = :id");
    foreach ($ids as $i => $rowId) {
      $upd->execute(["p" => $i, "id" => $rowId]);
    }
  }
}
