type ReqLike = {
  method?: string;
  headers?: Record<string, any>;
};

type ResLike = {
  setHeader: (k: string, v: any) => any;
  status: (code: number) => any;
  end: () => any;
};

// 개발 환경 허용 origin
const DEV_ORIGINS = new Set([
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

// 프로덕션 환경 origin (환경 변수에서 읽기)
const PROD_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

// 모든 허용된 origin
const ALLOWED_ORIGINS = new Set([...DEV_ORIGINS, ...PROD_ORIGINS]);

// 개발 모드인지 확인
const IS_DEV = process.env.NODE_ENV !== "production" || !process.env.GCLOUD_PROJECT;

export async function withCors(
  req: ReqLike,
  res: ResLike,
  handler: () => Promise<void>
) {
  const origin = (req.headers?.origin as string | undefined) ?? "";

  // 개발 모드에서는 모든 origin 허용 (로컬 개발 편의성)
  if (IS_DEV) {
    if (ALLOWED_ORIGINS.has(origin) || origin.startsWith("http://127.0.0.1:") || origin.startsWith("http://localhost:")) {
      res.setHeader("Access-Control-Allow-Origin", origin || "*");
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
  } else {
    // 프로덕션 모드에서는 허용된 origin만
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    } else if (ALLOWED_ORIGINS.size > 0) {
      // 허용된 origin이 있으면 첫 번째 것을 기본값으로
      res.setHeader("Access-Control-Allow-Origin", PROD_ORIGINS[0] || Array.from(ALLOWED_ORIGINS)[0]);
  } else {
      // 허용된 origin이 없으면 요청 origin 사용 (보안상 권장하지 않음)
      res.setHeader("Access-Control-Allow-Origin", origin || "*");
    }
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-API-Key");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if ((req.method ?? "").toUpperCase() === "OPTIONS") {
    res.status(204).end();
    return;
  }

  await handler();
}
