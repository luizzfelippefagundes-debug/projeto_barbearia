async function main() {
  const res = await fetch('https://api.clerk.com/v1/users?order_by=-created_at&limit=20', {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  })
  const users = await res.json() as Array<{
    id: string
    email_addresses: Array<{ email_address: string }>
    created_at: number
  }>
  users.forEach(u => {
    console.log(u.id, '|', u.email_addresses.map(e => e.email_address).join(', '), '|', new Date(u.created_at).toLocaleString('pt-BR'))
  })
}
main().catch(console.error).finally(() => process.exit(0))
