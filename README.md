# dsh-shell-remote

One-shot remote shell execution over system OpenSSH: `ssh <host> -- bash -c <cmd>`,
forked from the dsh-shell-host type vocabulary. Design: [ADR-0004](https://github.com/ch1bug/dsh-shell-host/blob/main/docs/adr/0004-remote-execution-separate-repo.md).

## Status

- R1 (this): repo scaffold + descriptor/executor type skeleton. `execute()`
  loudly rejects until R2.
- R2 (ticket #2): the ssh transport — exit code, streamed output, cwd
  semantics — plus the D8 contract conformance test and spill loudly-reject.

## Contract (D8, ADR-0004 decision 4)

- `ShellResult` is field-identical to `@deepseek-ai/dsh-bash-local`'s
  `ShellRunResult`.
- All path semantics are REMOTE paths; the executor never maps paths.
- Spill-class host capabilities loudly reject (R2); their type surface is
  reserved only.

## Verify

```
pnpm install
pnpm typecheck && pnpm test
```
