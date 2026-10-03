# dsh-shell-remote

One-shot remote shell execution over system OpenSSH: `ssh <host> -- bash -c <cmd>`,
forked from the dsh-shell-host type vocabulary. Design: [ADR-0004](https://github.com/ch1bug/dsh-shell-host/blob/main/docs/adr/0004-remote-execution-separate-repo.md).

## Status

- R1 (done): repo scaffold + descriptor/executor type skeleton.
- R2 (this): the ssh transport is live. `execute()` spawns the system ssh
  client, propagates the exit code, streams both output streams under an
  in-memory cap (byte-exact TAIL retained on overflow, never spilled), and
  fuses the deadline and the caller's abort into one first-cause SIGKILL of
  the ssh client (killing the client tears the remote command down with the
  session). The remote payload is `cd -- '<workdir>' && eval '<command>'`,
  POSIX-quoted and carried in one extra single-quote layer — ssh joins its
  argv with bare spaces and the REMOTE shell re-splits them, so the whole
  payload must travel as one remote shell word. The workdir is a REMOTE
  path applied on the remote side; the command re-enters verbatim through
  the quoting layers. A settled
  ssh exit — including the transport's own 255 with a note on stderr (a
  failed remote preparation, e.g. an unreachable host) — resolves as a
  result; only a spawn that never produced a process rejects. The request's
  `stdoutMaxBytes` (default 1 MiB) budgets stdout AND stderr alike; overflow
  truncates with the byte-exact TAIL retained — never a spill file. The D8
  contract conformance test (runtime field-by-field diff against the seam
  types in the dsh-shell-host checkout) and the spill loudly-reject both
  live here.

## Contract (D8, ADR-0004 decision 4)

- `ShellResult` is field-identical to `@deepseek-ai/dsh-bash-local`'s
  `ShellRunResult`, with one recorded deviation: `sandbox` is typed `never`
  (reserved, never populated — remote execution is never confined; the repo
  carries no dsh-sandbox dependency). The R2 conformance test locks this.
- All path semantics are REMOTE paths; the executor never maps paths.
- Spill-class host capabilities loudly reject (R2); their type surface is
  reserved only.

## Verify

```
pnpm install
pnpm typecheck && pnpm test
```
