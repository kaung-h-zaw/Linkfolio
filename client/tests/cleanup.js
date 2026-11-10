import { rmSync } from 'node:fs'
export default async function cleanup(config) {
  for (const suffix of ['', '-wal', '-shm'])
    rmSync(config.metadata.databasePath + suffix, { force: true })
}
