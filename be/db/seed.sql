--   docker exec -i school-db-1 psql -U <user> -d powerban < be/db/seed.sql

INSERT INTO users (email, password_hash, theme)
SELECT 'system@powerban.local', '!disabled!', 'gruvbox'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'system@powerban.local');

DELETE FROM boards
WHERE user_id = (SELECT id FROM users WHERE email = 'system@powerban.local');

WITH sys AS (
  SELECT id FROM users WHERE email = 'system@powerban.local'
), board AS (
  INSERT INTO boards (user_id, name, is_template)
  SELECT id, 'Simple Kanban', TRUE FROM sys
  RETURNING id
), card AS (
  INSERT INTO cards (board_id, name, position, card_type)
  SELECT board.id, v.name, v.pos, v.type
  FROM board, (VALUES
    ('Todo', 0, 'todo'),
    ('Ongoing', 1, 'ongoing'),
    ('Completed', 2, 'completed')
  ) AS v(name, pos, type)
  RETURNING id, card_type
)
INSERT INTO tasks (card_id, title, position, is_finished)
SELECT card.id, t.title, t.pos, t.type = 'completed'
FROM card, (VALUES
  ('todo', 'Write the project brief', 0),
  ('todo', 'Set up the repository', 1),
  ('ongoing', 'Design the homepage', 0),
  ('completed', 'Kickoff meeting', 0)
) AS t(type, title, pos)
WHERE card.card_type = t.type;

WITH sys AS (
  SELECT id FROM users WHERE email = 'system@powerban.local'
), board AS (
  INSERT INTO boards (user_id, name, is_template)
  SELECT id, 'Sprint Board', TRUE FROM sys
  RETURNING id
), card AS (
  INSERT INTO cards (board_id, name, position, wip_limit, card_type)
  SELECT board.id, v.name, v.pos, v.wip, v.type
  FROM board, (VALUES
    ('Backlog', 0, NULL::int, 'todo'),
    ('Todo', 1, NULL::int, 'todo'),
    ('In Progress', 2, 3, 'ongoing'),
    ('Review', 3, NULL::int, 'todo'),
    ('Done', 4, NULL::int, 'completed')
  ) AS v(name, pos, wip, type)
  RETURNING id, name
)
INSERT INTO tasks (card_id, title, position, is_finished)
SELECT card.id, t.title, t.pos, t.card = 'Done'
FROM card, (VALUES
  ('Backlog', 'Refine backlog items', 0),
  ('Todo', 'Write acceptance criteria', 0),
  ('In Progress', 'Implement login flow', 0),
  ('Review', 'Code review: API layer', 0),
  ('Done', 'Set up CI pipeline', 0)
) AS t(card, title, pos)
WHERE card.name = t.card;

WITH sys AS (
  SELECT id FROM users WHERE email = 'system@powerban.local'
), board AS (
  INSERT INTO boards (user_id, name, is_template)
  SELECT id, 'Personal Goals', TRUE FROM sys
  RETURNING id
), card AS (
  INSERT INTO cards (board_id, name, position, card_type)
  SELECT board.id, v.name, v.pos, v.type
  FROM board, (VALUES
    ('Someday', 0, 'todo'),
    ('This Month', 1, 'ongoing'),
    ('Achieved', 2, 'completed')
  ) AS v(name, pos, type)
  RETURNING id, card_type
)
INSERT INTO tasks (card_id, title, position, is_finished)
SELECT card.id, t.title, t.pos, t.type = 'completed'
FROM card, (VALUES
  ('todo', 'Learn a new skill', 0),
  ('ongoing', 'Exercise 3x a week', 0),
  ('completed', 'Set up a budget', 0)
) AS t(type, title, pos)
WHERE card.card_type = t.type;
