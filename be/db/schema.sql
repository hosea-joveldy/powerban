--   docker exec -i school-db-1 psql -U <your_pg_user> -d postgres < be/db/schema.sql

CREATE DATABASE powerban;
\c powerban

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    theme TEXT DEFAULT 'gruvbox',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position INT NOT NULL DEFAULT 0
);

CREATE TABLE boards (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id INT REFERENCES groups(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    is_template BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE cards (
    id SERIAL PRIMARY KEY,
    board_id INT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position INT NOT NULL DEFAULT 0,
    wip_limit INT,
    card_type TEXT NOT NULL DEFAULT 'todo' CHECK (card_type IN ('todo', 'ongoing', 'completed')),
    CONSTRAINT wip_limit_only_for_ongoing CHECK (wip_limit IS NULL OR card_type = 'ongoing')
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    card_id INT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    position INT NOT NULL DEFAULT 0,
    is_template BOOLEAN NOT NULL DEFAULT FALSE,
    is_finished BOOLEAN NOT NULL DEFAULT FALSE,
    linked_board_id INT REFERENCES boards(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_groups_user_id ON groups(user_id);
CREATE INDEX idx_boards_user_id ON boards(user_id);
CREATE INDEX idx_boards_group_id ON boards(group_id);
CREATE INDEX idx_cards_board_id ON cards(board_id);
CREATE INDEX idx_tasks_card_id ON tasks(card_id);
CREATE INDEX idx_tasks_linked_board_id ON tasks(linked_board_id);
