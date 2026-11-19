const { templateNames, resumeTemplateIds, freeResumeTemplateIds } = require('../../frontend/src/lib/templateCatalog.js')
// Shared catalog for local SQLite and hosted PostgreSQL.
  const resume = [
    ...resumeTemplateIds,
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
  ids.map((id) => [id, kind, templateNames[kind][id] || id[0].toUpperCase() + id.slice(1),
    Number(![...freeResumeTemplateIds,'classic','essential','editorial','strata','miniport','bento'].includes(id))]))

async function seedDatabase(db) {
  await db.prepare("INSERT INTO plans VALUES ('free', 'Free', 1, 1, 1), ('premium', 'Premium', 20, 3, 1) ON CONFLICT DO NOTHING").run()
  await db.prepare("UPDATE plans SET portfolio_limit = 3 WHERE id = 'premium' AND portfolio_limit = 20").run()
  const insert = db.prepare('INSERT INTO templates (id, kind, name, premium) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING')
  for (const values of templateSeeds) await insert.run(...values)
}

module.exports = { templateSeeds, seedDatabase }
