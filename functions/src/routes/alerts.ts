import { Router, Request, Response } from 'express';

const router = Router();

router.post('/alerts', (req: Request, res: Response) => {
  res.json({ ok: true, received: req.body });
});

router.get('/alerts', (_req: Request, res: Response) => {
  res.json({ ok: true, items: [] });
});

export default router;
