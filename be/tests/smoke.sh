#!/usr/bin/env bash
# Powerban API smoke test. Needs curl only.
# Usage: bash be/tests/smoke.sh [base_url]
# Creates two throwaway users (random emails) and leaves their data in the db.

BASE="${1:-http://localhost/qibar/powerban/api}"
TMP="$(mktemp -d)"
A="$TMP/a.jar"
B="$TMP/b.jar"
PASS=0
FAIL=0
BODY=""
CODE=""

req() { # jar method path [json]
  local jar=$1 method=$2 path=$3 body=${4:-} out
  if [ -n "$body" ]; then
    out=$(curl -s -w '\n%{http_code}' -b "$jar" -c "$jar" -X "$method" \
      -H 'Content-Type: application/json' -d "$body" "$BASE$path")
  else
    out=$(curl -s -w '\n%{http_code}' -b "$jar" -c "$jar" -X "$method" "$BASE$path")
  fi
  CODE=$(printf '%s' "$out" | tail -n1)
  BODY=$(printf '%s' "$out" | sed '$d')
}

ok()   { PASS=$((PASS + 1)); echo "ok    $1"; }
bad()  { FAIL=$((FAIL + 1)); echo "FAIL  $1  -> $CODE $BODY"; }
expect() { [ "$CODE" = "$2" ] && ok "$1" || bad "$1 (expected $2)"; }
has()  { printf '%s' "$BODY" | grep -q "$2" && ok "$1" || bad "$1 (missing: $2)"; }
hasnt(){ printf '%s' "$BODY" | grep -q "$2" && bad "$1 (unexpected: $2)" || ok "$1"; }
first_id() { printf '%s' "$BODY" | sed -E 's/^\{"id":([0-9]+).*/\1/'; }
card_id() { # type -> id, from the last board detail in $BODY
  printf '%s' "$BODY" \
    | grep -oE "\"id\":[0-9]+,\"name\":\"[^\"]*\",\"position\":[0-9]+,\"wip_limit\":[^,]*,\"card_type\":\"$1\"" \
    | head -n1 | sed -E 's/^"id":([0-9]+).*/\1/'
}

STAMP=$(date +%s)
EMAIL_A="a$STAMP@test.dev"
EMAIL_B="b$STAMP@test.dev"

echo "== auth"
req "$A" GET /me;                                        expect "me without login is 401" 401
req "$A" POST /auth/register "{\"email\":\"$EMAIL_A\",\"password\":\"password123\"}"; expect "register A" 201
req "$A" POST /auth/register "{\"email\":\"$EMAIL_A\",\"password\":\"password123\"}"; expect "duplicate email is 409" 409
req "$A" POST /auth/register '{"email":"nope","password":"password123"}';             expect "bad email is 422" 422
req "$A" POST /auth/login "{\"email\":\"$EMAIL_A\",\"password\":\"wrongwrong\"}";     expect "wrong password is 401" 401
req "$A" POST /auth/login "{\"email\":\"$EMAIL_A\",\"password\":\"password123\"}";    expect "login" 200
hasnt "login never returns the hash" "password_hash"
req "$A" GET /me;                                        expect "me after login" 200
req "$A" PATCH /me '{"theme":"catppuccin-mocha"}';       has "theme saved" "catppuccin-mocha"
req "$B" POST /auth/register "{\"email\":\"$EMAIL_B\",\"password\":\"password123\"}"; expect "register B" 201

echo "== groups and boards"
req "$A" POST /groups '{"name":"Work"}';                 expect "create group" 201
GROUP=$(first_id)
req "$A" POST /boards "{\"name\":\"Sprint\",\"group_id\":$GROUP}"; expect "create board in group" 201
BOARD=$(first_id)
has "board starts with 3 cards" '"card_type":"completed"'
TODO=$(card_id todo); ONGOING=$(card_id ongoing); DONE=$(card_id completed)
req "$A" POST /boards '{"name":"Standalone"}';           expect "create standalone board" 201
OTHER=$(first_id)
req "$A" POST /boards '{"name":"x","group_id":999999}';  expect "foreign/missing group is 404" 404
req "$A" PATCH /boards/$OTHER "{\"group_id\":$GROUP}";   expect "move board into group" 200
req "$A" PATCH /boards/$OTHER '{"group_id":null}';       expect "make board standalone again" 200

echo "== cards and WIP"
req "$A" PATCH /cards/$TODO '{"wip_limit":3}';           expect "wip on todo card is 422" 422
req "$A" PATCH /cards/$ONGOING '{"wip_limit":1}';        expect "wip on ongoing card" 200

echo "== tasks"
req "$A" POST /cards/$ONGOING/tasks '{"title":"first"}'; expect "task into ongoing" 201
T1=$(first_id)
req "$A" POST /cards/$ONGOING/tasks '{"title":"second"}'; expect "WIP limit blocks second task" 409
req "$A" POST /cards/$TODO/tasks '{"title":"third"}';    expect "task into todo" 201
T3=$(first_id)
req "$A" POST /tasks/$T3/move "{\"card_id\":$ONGOING}";  expect "move into full ongoing is 409" 409
req "$A" POST /tasks/$T1/move "{\"card_id\":$DONE}";     expect "move into completed" 200
has "completed forces is_finished" '"is_finished":true'
req "$A" POST /tasks/$T3/move "{\"card_id\":$ONGOING}";  expect "ongoing has room now" 200
req "$A" GET /boards/$BOARD/progress;                    has "progress is 1 of 2" '"done":1,"total":2,"percent":50'
req "$A" POST /tasks/$T1/move "{\"card_id\":$TODO}";     has "leaving completed unfinishes" '"is_finished":false'

echo "== linked boards"
req "$A" POST /cards/$TODO/tasks "{\"title\":\"see other\",\"linked_board_id\":$OTHER}"; expect "task linked to a board" 201
has "linked board is embedded" '"linked_board":{"id"'
req "$A" POST /cards/$TODO/tasks "{\"title\":\"self\",\"linked_board_id\":$BOARD}";     expect "link to own board is 422" 422

echo "== ownership"
req "$B" GET /boards/$BOARD;                             expect "other user cannot read board" 404
req "$B" PATCH /tasks/$T1 '{"title":"hax"}';             expect "other user cannot edit task" 404
req "$B" DELETE /cards/$TODO;                            expect "other user cannot delete card" 404
req "$B" GET /boards;                                    hasnt "other user's list is empty" "Sprint"

echo "== card rules"
req "$A" POST /tasks/$T3/move "{\"card_id\":$DONE}";     expect "put a task in completed" 200
req "$A" PATCH /cards/$DONE '{"card_type":"todo"}';      expect "completed card becomes todo" 200
req "$A" GET /boards/$BOARD;                             hasnt "no finished tasks left" '"is_finished":true'
req "$A" DELETE /cards/$DONE;                            expect "delete card with tasks is 409" 409
req "$A" DELETE "/cards/$DONE?force=1";                  expect "force delete card" 204

echo "== templates"
req "$A" POST /boards/$BOARD/save-as-template '{"name":"Sprint template"}'; expect "save as template" 201
TPL=$(first_id)
req "$A" GET /templates;                                 has "template is listed" "Sprint template"
req "$A" GET /boards;                                    hasnt "boards list hides templates" '"is_template":true'
req "$A" POST /boards/from-template/$TPL '{"name":"From template"}'; expect "board from template" 201
req "$A" POST /boards/from-template/$BOARD '{}';         expect "using a non-template is 422" 422

echo "== built-in templates (skipped if be/db/seed.sql hasn't been run)"
req "$A" GET /templates
if printf '%s' "$BODY" | grep -q "Simple Kanban"; then
  SYS_ID=$(printf '%s' "$BODY" | grep -oE '\{"id":[0-9]+[^}]*"name":"Simple Kanban"' | grep -oE '^\{"id":[0-9]+' | grep -oE '[0-9]+')
  ok "seed detected: system templates listed"
  req "$B" POST /boards/from-template/$SYS_ID '{"name":"My kanban"}'
  expect "a different user can use a system template" 201
  req "$B" GET /boards
  has "the copy belongs to that user, not the system account" "My kanban"
else
  echo "skip  seed not applied, run: docker exec -i school-db-1 psql -U <user> -d powerban < be/db/seed.sql"
fi

echo "== cleanup and logout"
req "$A" DELETE /boards/$BOARD;                          expect "delete board" 204
req "$A" DELETE /groups/$GROUP;                          expect "delete group" 204
req "$A" POST /auth/logout;                              expect "logout" 200
req "$A" GET /me;                                        expect "me after logout is 401" 401

echo
echo "passed: $PASS   failed: $FAIL"
rm -rf "$TMP"
[ "$FAIL" -eq 0 ]
