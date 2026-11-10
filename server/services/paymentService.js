// Premium is activated only for a verified paid session belonging to its account.
async function fulfill(models, session) {
  const { Payment, User, transaction } = models

  if (session.payment_status !== 'paid') return
  await transaction(async () => {
    await User.lockDocuments(session.client_reference_id)
    const payment = await Payment.findStripeById(session.id)
    if (!payment || payment.user_id !== session.client_reference_id || payment.status !== 'pending') return
    await Payment.markPaid(payment.id)
    await User.upgrade(payment.user_id)
  })
}

module.exports = { fulfill }
