import type { VercelRequest, VercelResponse } from '@vercel/node'
import app from '../artifacts/api-server/src/app'

// Wrap Express app as a Vercel serverless function (catch-all)
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Strip the /api prefix before passing to Express
  // (Vercel routes /api/decisions → Express sees /decisions)
  req.url = req.url?.replace(/^\/api/, '') ?? '/'
  return app(req as any, res as any)
}
