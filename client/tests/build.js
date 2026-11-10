import { execFileSync } from 'node:child_process'
import { execPath } from 'node:process'
import { fileURLToPath } from 'node:url'

export default function build() {
  execFileSync(execPath, ['node_modules/vite/bin/vite.js', 'build'], {
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    stdio: 'inherit',
  })
}
