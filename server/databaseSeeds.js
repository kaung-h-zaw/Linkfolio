// Shared catalog for local SQLite and hosted PostgreSQL.
  const resume = [
    'classic',
    'essential',
    'editorial',
    'slate',
    'avenue',
    'grid',
    'studio',
    'canvas',
    'folio',
  ]
  const portfolio = [
    'essential',
    'editorial',
    'showcase',
    'studio',
    'canvas',
    'atelier',
    'mono',
    'gridfolio',
    'journal',
    'executive',
    'outline',
    'horizon',
    'strata', 'miniport', 'press', 'massively', 'multiverse', 'freelancer',
    'bento', 'macfolio', 'nocturne',
  ]

const templateSeeds = [['resume', resume], ['portfolio', portfolio]].flatMap(([kind, ids]) =>
  ids.map((id) => [id, kind, id[0].toUpperCase() + id.slice(1),
    Number(!['classic','essential','editorial','strata','miniport','bento'].includes(id))]))

async function seedDatabase(db) {
  await db.prepare("INSERT INTO plans VALUES ('free', 'Free', 1, 1, 1), ('premium', 'Premium', 20, 20, 1) ON CONFLICT DO NOTHING").run()
  const insert = db.prepare('INSERT INTO templates (id, kind, name, premium) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING')
  for (const values of templateSeeds) await insert.run(...values)
}

module.exports = { templateSeeds, seedDatabase }
