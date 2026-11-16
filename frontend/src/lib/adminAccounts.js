export function filterAdminAccounts(accounts, role, query = '', status = 'all') {
  const search = query.trim().toLowerCase()
  return accounts.filter(account => account.role === role &&
    `${account.fullName} ${account.email} ${account.plan}`.toLowerCase().includes(search) &&
    (status === 'all' || (status === 'disabled' ? account.disabled : !account.disabled)))
}
