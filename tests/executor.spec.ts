import { describe, expect, it } from 'vitest'
import { RemoteShellExecutor } from '../src/executor.ts'
import { sshDescriptor } from '../src/descriptor.ts'

describe('RemoteShellExecutor.resolve', () => {
  it('expands the transport argv and passes the remote workdir through verbatim', () => {
    const exec = new RemoteShellExecutor('buildhost')
    const spec = exec.resolve({ command: 'echo hi', workdir: '/srv/app', timeoutMs: 5_000 })
    expect(spec.argv).toEqual(['ssh', 'buildhost', '--', 'bash', '-c', 'echo hi'])
    expect(spec.workdir).toBe('/srv/app')
    expect(spec.timeoutMs).toBe(5_000)
  })

  it('fails loudly on an unusable descriptor before any spawn could exist', () => {
    const exec = new RemoteShellExecutor('', { id: 'ssh', host: '', executable: [], argv: { oneShot: [] } })
    expect(() => exec.resolve({ command: 'x', workdir: '/', timeoutMs: 1 })).toThrow()
  })

  it('fails loudly on a host/descriptor mismatch instead of silently ignoring one', () => {
    expect(() => new RemoteShellExecutor('otherhost', sshDescriptor('buildhost'))).toThrow(/does not match the supplied descriptor/)
  })
})

describe('RemoteShellExecutor.execute (R1 skeleton)', () => {
  it('loudly rejects — the transport is R2, never a silent no-op', async () => {
    const exec = new RemoteShellExecutor('buildhost')
    const spec = exec.resolve({ command: 'echo hi', workdir: '/srv/app', timeoutMs: 5_000 })
    await expect(exec.execute(spec)).rejects.toThrow(/not implemented yet \(R2/)
  })
})
