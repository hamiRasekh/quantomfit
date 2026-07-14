# Quantomfit Project-Scoped Rules

## CLI and Verification Constraints
- Do NOT run frontend builds (`next build`, etc.), lint checks, or typecheck tasks (`tsc --noEmit`). These processes are slow and the user will run them periodically. Avoid long-running terminal commands.

## Implementation Workflow
- When implementing a feature or fixing a bug, implement both backend and frontend changes together in the same step.
- If there are database migrations or seeders required, run them as part of the execution.
