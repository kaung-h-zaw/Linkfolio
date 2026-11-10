import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const serverDirectory = fileURLToPath(new URL('../server/', import.meta.url))
const clientDirectory = fileURLToPath(new URL('../client/', import.meta.url))
const processes = [
  spawn(process.execPath, ['--watch', 'index.js'], { cwd: serverDirectory, stdio: 'inherit' }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', '5173', '--strictPort'], {
    cwd: clientDirectory,
    stdio: 'inherit',
  }),
]
let closing = false
function close(code = 0) {
  if (closing) return
  closing = true
  for (const child of processes) child.kill('SIGTERM')
  process.exitCode = code
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => close())
for (const child of processes) {
  child.on('error', (error) => {
    console.error(error.message)
    close(1)
  })
  child.on('exit', (code) => {
    if (!closing) close(code || 0)
  })
}
