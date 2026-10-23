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
    ('Todo', 0, 'normal'),
    ('Ongoing', 1, 'normal'),
    ('Completed', 2, 'completed')
  ) AS v(name, pos, type)
  RETURNING id, name, card_type
)
INSERT INTO tasks (card_id, title, position, is_finished)
SELECT card.id, t.title, t.pos, t.card = 'Completed'
FROM card, (VALUES
  ('Todo', 'Write the project brief', 0),
  ('Todo', 'Set up the repository', 1),
  ('Ongoing', 'Design the homepage', 0),
  ('Completed', 'Kickoff meeting', 0)
) AS t(card, title, pos)
WHERE card.name = t.card;

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
    ('Backlog', 0, NULL::int, 'normal'),
    ('Todo', 1, NULL::int, 'normal'),
    ('In Progress', 2, 3, 'normal'),
    ('Review', 3, NULL::int, 'normal'),
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
    ('Someday', 0, 'normal'),
    ('This Month', 1, 'normal'),
    ('Achieved', 2, 'completed')
  ) AS v(name, pos, type)
  RETURNING id, name, card_type
)
INSERT INTO tasks (card_id, title, position, is_finished)
SELECT card.id, t.title, t.pos, t.card = 'Achieved'
FROM card, (VALUES
  ('Someday', 'Learn a new skill', 0),
  ('This Month', 'Exercise 3x a week', 0),
  ('Achieved', 'Set up a budget', 0)
) AS t(card, title, pos)
WHERE card.name = t.card;
