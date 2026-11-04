import { readFileSync } from 'fs'

const env = readFileSync('.env.production.local', 'utf8')
const apiKey = env.match(/^ASAAS_API_KEY="?([^"\n]+)"?/m)?.[1]
console.log('API key (primeiros 10 chars):', apiKey?.slice(0, 10), '| tamanho:', apiKey?.length)

const headers = { 'access_token': apiKey, 'Content-Type': 'application/json' }

const res = await fetch('https://api.asaas.com/v3/payments/pay_yizkxobsamk0z905', { headers })
const raw = await res.text()
console.log('Status HTTP:', res.status)
console.log('Resposta raw:', raw.slice(0, 500))
