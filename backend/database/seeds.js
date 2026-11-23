const { templateNames, resumeTemplateIds, freeResumeTemplateIds, portfolioTemplateIds } = require('../../frontend/src/lib/templateCatalog.js')
// Shared catalog for local SQLite and hosted PostgreSQL.
const resume = resumeTemplateIds
const portfolio = portfolioTemplateIds

const templateSeeds = [['resume', resume], ['portfolio', portfolio]].flatMap(([kind, ids]) =>
  ids.map((id) => [id, kind, templateNames[kind][id] || id[0].toUpperCase() + id.slice(1),
    Number(![...freeResumeTemplateIds,'classic','essential','editorial','strata','miniport','bento'].includes(id))]))

async function seedDatabase(db) {
  await db.prepare("INSERT INTO plans VALUES ('free', 'Free', 1, 1, 1), ('premium', 'Premium', 20, 3, 1) ON CONFLICT DO NOTHING").run()
  await db.prepare("UPDATE plans SET portfolio_limit = 3 WHERE id = 'premium' AND portfolio_limit = 20").run()
  await db.prepare(`DELETE FROM templates WHERE kind = 'resume' AND id NOT IN (${resume.map(() => '?').join(',')})`).run(...resume)
  await db.prepare(`DELETE FROM templates WHERE kind = 'portfolio' AND id NOT IN (${portfolio.map(() => '?').join(',')})`).run(...portfolio)
  const insert = db.prepare('INSERT INTO templates (id, kind, name, premium) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING')
  for (const values of templateSeeds) await insert.run(...values)
}

module.exports = { templateSeeds, seedDatabase }
