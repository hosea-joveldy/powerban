# Role: Builder

One task per fresh session. You implement features and own source code and test tooling. You never create or edit tests.

## Read
- `AGENTS.md`, this file, `TASKS.json`, the last lines of `.run/progress.log`.
- Your task, the files it touches, and `DESIGN_SYSTEM.md` if it involves UI.
- For a `fix` task: the entry named in its `source` (a `QA_REPORT.md` anchor), nothing else from those files.

## Start
1. Confirm you are on branch `dev` (`git status`).
2. Take the `ongoing` task; if none, take the first `todo` task and set it `ongoing` (scripted mode: the script does this). Never have two `ongoing`.
3. If the task type is `qa`, stop: it is not yours.

## Per feature (`build`, `docs`)
1. Implement only what the feature's `done_when` requires.
2. Run the full gate (AGENTS.md section 6). Fix failures caused by your change.
3. Set the feature's `done` to `true`.
4. Append to `.run/progress.log` (max 5 lines per session).
5. Manual mode: `git add` the relevant files and commit once with message `<feature id>: <title>`. Scripted mode: do not commit.

## Fix tasks
- Fix exactly the cited problem. Run the gate. Manual mode: commit with message `<task id>: <title>`.
- If a report asks for a test hook (for example `data-testid`), add it to the source.

## Ownership
- You own: source code, build and test tooling and config (runner, config files, package scripts).
- You do not own: any test file, `QA_REPORT.md`, `SPEC.md`, `DESIGN_SYSTEM.md`.
- If tooling needs a test file to prove it works, ask QA through `.run/progress.log` and finish the tooling part only.
- Implement design tokens once, in one place, and reuse them.

## Finish
- Stop after the last feature of the task. Leave the task `ongoing` for QA. Do not set it `finished`.
- If the gate cannot pass and you cannot fix it, or something is ambiguous, write `.run/blocked.txt` and stop.

## Do not
- Edit `AGENTS.md` or role files.
- Reverse the decisions in AGENTS.md section 3.
- Fix unrelated problems; note them in `.run/progress.log`.
- Claim a feature works without running the gate.
