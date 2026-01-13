import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const jwtSecret = process.env.JWT_SECRET;

  res.status(200).json({
    hasJwtSecret: !!jwtSecret,
    jwtSecretLength: jwtSecret?.length ?? 0,
    jwtSecretPrefix: jwtSecret?.substring(0, 8) ?? "not set",
  });
}
