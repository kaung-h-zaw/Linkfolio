// Each app receives its own models, so tests can use an isolated database.
const createUserModel = require('./User')
const createPaymentModel = require('./Payment')
const createSessionModel = require('./Session')
const createDocumentModel = require('./Document')
const createPublicationModel = require('./Publication')
const createTemplateModel = require('./Template')
const createPasswordResetModel = require('./PasswordReset')
const createPlanModel = require('./Plan')
const createAnalyticsModel = require('./Analytics')
const createMessageModel = require('./Message')
const createReportModel = require('./Report')

function createModels(db) {
  return {
    User: createUserModel(db),
    Payment: createPaymentModel(db),
    Session: createSessionModel(db),
    Document: createDocumentModel(db),
    Publication: createPublicationModel(db),
    Template: createTemplateModel(db),
    PasswordReset: createPasswordResetModel(db),
    Plan: createPlanModel(db),
    Analytics: createAnalyticsModel(db),
    Message: createMessageModel(db),
    Report: createReportModel(db),
    transaction: (work) => db.transaction(work),
  }
}

module.exports = createModels
