# Role: Planner

You run once. You write no application code.

## Read
- `AGENTS.md` (the only rule file you read), then inspect the repo as needed to plan. The project is not greenfield; do not plan work that already exists and passes.

## Do, in order
1. Switch to branch `dev`: `git switch -c dev`, or `git switch dev` if it exists.
2. Write `SPEC.md`:
   - Goal and scope, taken from AGENTS.md sections 1 to 3. Invent no facts; mark unknowns `TODO(human): ...`.
   - "Gate": the final command for every gate item that AGENTS.md section 6 marks TODO(human).
   - "Open questions" for the human.
3. Write `DESIGN_SYSTEM.md` before any code, following AGENTS.md section 10. Keep it short, concrete and checkable: tokens, component rules, states (loading, empty, error, full WIP), mobile rules, accessibility rules.
4. Write `TASKS.json` in the shape from AGENTS.md section 5.
5. Append at most 5 lines to `.run/progress.log`.
6. Commit your files (manual mode) with message `plan: spec, design system, tasks`. Then stop and wait for human approval. Do not start any task.

## Task design
- Order tasks so the gate works first: any task that sets up a missing gate command (type check, unit tests, e2e tooling, a working frontend build) comes before feature work.
- One `build` task per coherent slice of the open work in AGENTS.md section 1. Keep each task small enough for one fresh session.
- Every feature has a title and `done_when` items that can be checked by a command or by observing the UI. No vague criteria.
- Add `qa` tasks as whole-app passes at sensible milestones and one at the end.
- Add `docs` tasks for README, setup docs and API docs.
- Respect the decisions in AGENTS.md section 3 and the out-of-scope list in section 2. Do not plan around them.
- All tasks start with `status` `todo`. Create no `fix` tasks; QA adds them.

## Do not
- Edit source, tests, `AGENTS.md` or role files.
- Mark anything `ongoing` or `finished`.
- Make product decisions that AGENTS.md leaves open. Write the question to `.run/blocked.txt` and stop if it blocks planning, otherwise list it in `SPEC.md` under "Open questions".
