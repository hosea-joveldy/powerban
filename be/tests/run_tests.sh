#!/usr/bin/env bash
# Powerban API test suite runner.
# Validates all backend constraints from AGENTS.md section 3.
# Usage: bash be/tests/run_tests.sh [base_url]

set -u

BASE="${1:-http://localhost/qibar/powerban/api}"
TMP="$(mktemp -d)"
A="$TMP/a.jar"
B="$TMP/b.jar"
PASS=0
FAIL=0
BODY=""
CODE=""

cleanup() {
  rm -rf "$TMP"
}
trap cleanup EXIT

req() { # jar method path [json]
  local jar=$1 method=$2 path=$3 body=${4:-} out
  if [ -n "$body" ]; then
    out=$(curl -s -w '\n%{http_code}' -b "$jar" -c "$jar" -X "$method" \
      -H 'Content-Type: application/json' -d "$body" "$BASE$path" 2>/dev/null || echo -e "\n000")
  else
    out=$(curl -s -w '\n%{http_code}' -b "$jar" -c "$jar" -X "$method" "$BASE$path" 2>/dev/null || echo -e "\n000")
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

echo "=== Powerban Backend API Test Suite ==="
echo "Target API: $BASE"

# Check if target is reachable
req "$A" GET /me
if [ "$CODE" = "000" ]; then
  echo "ERROR: Backend API at $BASE is unreachable (connection failed)."
  echo "Make sure the backend application and PostgreSQL database are running."
  exit 1
fi

STAMP=$(date +%s)_$RANDOM
EMAIL_A="user_a_${STAMP}@test.dev"
EMAIL_B="user_b_${STAMP}@test.dev"

echo "== 1. Authentication & Sessions =="
req "$A" GET /me;                                        expect "me without login is 401" 401
req "$A" POST /auth/register "{\"email\":\"$EMAIL_A\",\"password\":\"password123\"}"; expect "register user A" 201
req "$A" POST /auth/register "{\"email\":\"$EMAIL_A\",\"password\":\"password123\"}"; expect "duplicate email is 409" 409
req "$A" POST /auth/register '{"email":"invalid-email","password":"password123"}';    expect "malformed email is 422" 422
req "$A" POST /auth/login "{\"email\":\"$EMAIL_A\",\"password\":\"wrongpassword\"}"; expect "wrong password is 401" 401
req "$A" POST /auth/login "{\"email\":\"$EMAIL_A\",\"password\":\"password123\"}";    expect "login user A" 200
hasnt "login response never leaks password hash" "password_hash"
req "$A" GET /me;                                        expect "me after login is 200" 200
req "$A" PATCH /me '{"theme":"stone-light"}';            has "theme updated and persisted" "stone-light"
req "$B" POST /auth/register "{\"email\":\"$EMAIL_B\",\"password\":\"password123\"}"; expect "register user B" 201

# Rate limiting verification (T4.3)
EMAIL_RL="rl_${STAMP}@test.dev"
req "$TMP/rl.jar" POST /auth/register "{\"email\":\"$EMAIL_RL\",\"password\":\"password123\"}"; expect "register user for rate limiting" 201
for i in 1 2 3 4; do
  req "$TMP/rl.jar" POST /auth/login "{\"email\":\"$EMAIL_RL\",\"password\":\"badpass$i\"}" >/dev/null 2>&1
done
req "$TMP/rl.jar" POST /auth/login "{\"email\":\"$EMAIL_RL\",\"password\":\"badpass5\"}"; expect "5th failed login is 401" 401
req "$TMP/rl.jar" POST /auth/login "{\"email\":\"$EMAIL_RL\",\"password\":\"badpass6\"}"; expect "6th failed login is 429 rate limited" 429
has "rate limit error message present" "Too many failed login attempts"

echo "== 2. Groups and Boards =="
req "$A" POST /groups '{"name":"Work"}';                 expect "create group" 201
GROUP=$(first_id)
req "$A" POST /boards "{\"name\":\"Sprint\",\"group_id\":$GROUP}"; expect "create board in group" 201
BOARD=$(first_id)
has "board starts with completed card" '"card_type":"completed"'
has "board starts with ongoing card" '"card_type":"ongoing"'
has "board starts with todo card" '"card_type":"todo"'
TODO=$(card_id todo); ONGOING=$(card_id ongoing); DONE=$(card_id completed)
req "$A" POST /boards '{"name":"Standalone"}';           expect "create standalone board" 201
OTHER=$(first_id)
req "$A" POST /boards '{"name":"Invalid","group_id":999999}'; expect "foreign/missing group is 404" 404
req "$A" PATCH /boards/$OTHER "{\"group_id\":$GROUP}";   expect "move board into group" 200
req "$A" PATCH /boards/$OTHER '{"group_id":null}';       expect "make board standalone again" 200

echo "== 3. Cards & WIP Limits =="
req "$A" PATCH /cards/$TODO '{"wip_limit":3}';           expect "wip limit on todo card is 422" 422
req "$A" PATCH /cards/$DONE '{"wip_limit":3}';           expect "wip limit on completed card is 422" 422
req "$A" PATCH /cards/$ONGOING '{"wip_limit":1}';        expect "wip limit on ongoing card is 200" 200

echo "== 4. Tasks & Auto-Completion Rules =="
req "$A" POST /cards/$ONGOING/tasks '{"title":"first"}'; expect "add task into ongoing" 201
T1=$(first_id)
req "$A" POST /cards/$ONGOING/tasks '{"title":"second"}'; expect "WIP limit blocks adding to ongoing" 409
req "$A" POST /cards/$TODO/tasks '{"title":"third"}';    expect "add task into todo" 201
T3=$(first_id)
req "$A" POST /tasks/$T3/move "{\"card_id\":$ONGOING}";  expect "move into full ongoing is 409" 409
req "$A" POST /tasks/$T1/move "{\"card_id\":$DONE}";     expect "move task into completed" 200
has "task moved to completed forces is_finished=true" '"is_finished":true'
req "$A" POST /tasks/$T3/move "{\"card_id\":$ONGOING}";  expect "ongoing has capacity now" 200
req "$A" GET /boards/$BOARD/progress;                    has "flat progress computation is accurate" '"done":1,"total":2,"percent":50'
req "$A" POST /tasks/$T1/move "{\"card_id\":$TODO}";     has "leaving completed card forces is_finished=false" '"is_finished":false'

echo "== 5. Linked Boards =="
req "$A" POST /cards/$TODO/tasks "{\"title\":\"linked task\",\"linked_board_id\":$OTHER}"; expect "task linked to another board" 201
has "linked board details embedded" '"linked_board":{'
req "$A" POST /cards/$TODO/tasks "{\"title\":\"self link\",\"linked_board_id\":$BOARD}"; expect "link to parent board is 422" 422

echo "== 6. Cross-User Access & Ownership =="
req "$B" GET /boards/$BOARD;                             expect "user B cannot read user A board" 404
req "$B" PATCH /tasks/$T1 '{"title":"hax"}';             expect "user B cannot edit user A task" 404
req "$B" DELETE /cards/$TODO;                            expect "user B cannot delete user A card" 404
req "$B" GET /boards;                                    hasnt "user B board list hides user A boards" "Sprint"

echo "== 7. Card Deletion & Constraints =="
req "$A" POST /tasks/$T3/move "{\"card_id\":$DONE}";     expect "put task into completed" 200
req "$A" PATCH /cards/$DONE '{"card_type":"todo"}';      expect "completed card converted to todo" 200
req "$A" GET /boards/$BOARD;                             hasnt "unfinishes all tasks when card type leaves completed" '"is_finished":true'
req "$A" DELETE /cards/$DONE;                            expect "deleting card with tasks without force is 409" 409
req "$A" DELETE "/cards/$DONE?force=1";                  expect "force delete card with tasks succeeds" 204

echo "== 8. Templates =="
req "$A" POST /boards/$BOARD/save-as-template '{"name":"Sprint template"}'; expect "save board as template" 201
TPL=$(first_id)
req "$A" GET /templates;                                 has "template listed in GET /templates" "Sprint template"
req "$A" GET /boards;                                    hasnt "normal board list hides templates" '"is_template":true'
req "$A" POST /boards/from-template/$TPL '{"name":"From template"}'; expect "instantiate board from template" 201
req "$A" POST /boards/from-template/$BOARD '{}';         expect "using a non-template board returns 422" 422

echo "== 9. Cleanup & Group Deletion =="
req "$A" DELETE /groups/$GROUP;                          expect "delete group" 204
req "$A" GET /boards/$BOARD;                             expect "board becomes standalone when group deleted" 200
req "$A" DELETE /boards/$BOARD;                          expect "delete board" 204
req "$A" POST /auth/logout;                              expect "logout" 200
req "$A" GET /me;                                        expect "me after logout is 401" 401

echo
echo "======================================"
echo "Passed: $PASS   Failed: $FAIL"
echo "======================================"

[ "$FAIL" -eq 0 ]
