import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'
import * as schema from './schema'

// neon-serverless usa WebSocket; em Node.js (Vercel serverless) precisa do
// construtor explícito — no Edge Runtime o global `WebSocket` já existe.
neonConfig.webSocketConstructor = ws

let _db: ReturnType<typeof drizzle<typeof schema>> | undefined

export function getDb() {
  if (!_db) {
    _db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema })
  }
  return _db
}
