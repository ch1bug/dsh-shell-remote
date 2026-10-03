/**
 * One-shot remote shell executor skeleton (R1, ADR-0004 ticket R1). The
 * execution mechanics over `ssh <host> -- bash -c <cmd>` land in R2 (ticket
 * #2): exit code, streamed output, cwd semantics, the D8 contract conformance
 * test, and the spill loudly-reject. R1 pins the shape only: resolution fills
 * remote-path workdir through verbatim (no mapping), and execution loudly
 * rejects until R2 exists — never a silent no-op.
 * @module dsh-shell-remote/executor
 */

import { assertServiceableDescriptor, expandOneShotArgv, sshDescriptor } from './descriptor.ts'
import type { RemoteBackendDescriptor } from './descriptor.ts'
import type { ShellExecRequest, ShellResult } from './types.ts'

/**
 * Resolved one-shot execution spec: the caller's request with the descriptor
 * expanded. `workdir` stays a REMOTE path — resolution never rewrites it.
 */
export interface ShellExecSpec {
  /** The command string, run remotely as `bash -c <command>`. */
  command: string
  /** REMOTE working directory, passed through verbatim (no path mapping, D8). */
  workdir: string
  /** Foreground timeout in milliseconds. */
  timeoutMs: number
  /** The concrete ssh argv (launcher + transport template + command). */
  argv: readonly string[]
}

/**
 * One-shot remote executor. R1 skeleton: `resolve` is real (descriptor
 * validation + argv expansion + verbatim remote workdir), `execute` loudly
 * rejects until R2 implements the transport.
 */
export class RemoteShellExecutor {
  readonly descriptor: RemoteBackendDescriptor

  constructor(host: string, descriptor?: RemoteBackendDescriptor) {
    this.descriptor = descriptor ?? sshDescriptor(host)
  }

  /**
   * Resolve a request into a fully-specified spec: validate the descriptor
   * loudly (misconfiguration can never reach a spawn) and expand the argv.
   * Unlike the local executor there is NO host-cwd default — the request must
   * carry an explicit remote `workdir`.
   * @throws Error naming the unserviceable descriptor part.
   */
  resolve(request: ShellExecRequest): ShellExecSpec {
    assertServiceableDescriptor(this.descriptor)
    return {
      command: request.command,
      workdir: request.workdir,
      timeoutMs: request.timeoutMs,
      argv: expandOneShotArgv(this.descriptor, request.command),
    }
  }

  /**
   * Execute one resolved spec over the ssh transport. NOT implemented in R1 —
   * the loud rejection is the fork-baseline posture (nothing silently
   * pretends to have run). R2 (ticket #2) replaces this body with the
   * transport: exit code, streamed output, cwd semantics, spill loudly-reject.
   * @throws Error naming the unimplemented transport.
   */
  async execute(_spec: ShellExecSpec): Promise<ShellResult> {
    void _spec
    throw new Error('dsh-shell-remote: remote execution is not implemented yet (R2, ticket #2)')
  }
}
