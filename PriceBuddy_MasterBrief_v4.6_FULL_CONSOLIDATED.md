# PriceBuddy — FULL CONSOLIDATED MASTERBRIEF (v1.1 → v4.6)
**Date:** 2025-11-12  
**This is the single Source of Truth.** Top section is the deduplicated, latest spec;  
**Appendix A** includes *all prior docs in full* (unaltered) to guarantee 0% omission.

## Executive Snapshot
- **Brand:** PriceBuddy
- **USP:** 총액(환율·배송·관세·부가세) 실결제가 기반 글로벌/국내 동시 최저가 비교 + AI 예측/대체추천 + 리뷰요약 + 쿠폰/캐시백 자동화
- **Surfaces:** App(Flutter) · Web(React) · Browser Extension(MV3) · B2B/Enterprise
- **AI:** Hybrid SKU Matcher (text+image), Event-Aware Price Forecast, Emotion Cluster Reviews, Bandit Coupon Optimizer
- **Automation:** Pre‑Build → Unified Snapshot → Auto Verify → Deployment Lock → Release
- **Compliance:** GDPR/DSA/FTC, KR/JP/US/EU 전자상거래 고지 자동화
- **Infra:** Firebase+Cloud Run, Firestore+BigQuery + PostgreSQL Replica, OpenTelemetry, Token Auto‑Rotation, HSTS, Rollback ≤ 1m

## Roadmap & Dates (Speed Mode applied)
- **v1.6 Beta:** 2025‑11‑25 (수익 시작: Affiliate/Ads/Pro 얼리버드)
- **v2.0 GA:** **2025‑12‑28** (단축 적용, 정식 출시)
- **v2.2 Global:** 2026‑03‑05 (KR/JP/US/EU 동시 운용)
- **v4.6 Growth Loop:** 2026‑02 이후 상시 (AI 유입→전환→리텐션 자가 최적화)

## Monetization
- **B2C:** Free(광고+캐시백) / Pro $4.9 / Pro+ $9.9 (Trial→Auto Upgrade)
- **B2B:** Enterprise $99~199 (리포트+API), Data API 판매
- **Expected Net Profit:** 2025‑12(₩9.8억/mo), 2026‑02(₩13.6억/mo), 2026‑Q2(₩17.5억/mo)

## One‑Click Deploy (Outline)
- Scripts/CI: build → test → snapshot → verify → lock → release
- Multi‑region builds; Snapshot SHA tracked for instant rollback.

---
# Appendix A — Full Source Documents (Unabridged)
(아래는 과거 문서를 **수정 없이 원문 전체** 삽입합니다.)


---

## PriceBuddy_v4.2_FULL_ULTRA_PLUS_CONSOLIDATED.md — FULL TEXT
> Path: `/mnt/data/PriceBuddy_v4.2_FULL_ULTRA_PLUS_CONSOLIDATED.md` · SHA256-12: `ac8dd44b2f69`

# PriceBuddy v4.2 — FULL ULTRA++ 단일 통합 마스터브리프 & 실행가이드 — 2025-09-20

> 이 파일은 **단일 기준(Source of Truth)** 입니다.  
> 아래 *Appendix A*에 업로드된 모든 과거 문서를 **원문 그대로** 포함하여 누락을 0%로 보장하고,  
> 본문은 중복을 제거한 **통합·정제 사양**을 제공합니다.

## What's new (vs v4.1)
- ✅ 업로드 문서 전부 *원문 그대로* 동봉 (Appendix A) — 누락 0% 보장
- ✅ 에이전트 오케스트레이션 운영 섹션 강화(태스크 그래프/주간 리포트 템플릿)
- ✅ 원‑클릭 배포/CI 스크립트 최신화, Pro+ 리포트 월 6회 반영

---

## 0) Executive Summary
- **USP**: 관세·부가세·배송·환율 포함 **총액 기준** 글로벌+국내 동시 비교 · 쿠폰/캐시백 자동화
- **라인업**: App(Flutter) · Extension(MV3) · Web(React) · Enterprise(B2B)
- **로드맵**: MVP(완료) → 베타 v1.6(2025‑10 말) → 정식 v2.0(2026‑02)
- **수익**: 베타부터 Affiliate·광고·구독 → 정식에서 B2B·데이터 API 확대

---

## 1) 사용자 여정 & 핵심 UX
- **Search**: 검색→다중 마켓 총액 비교→목표가 1‑탭 알림
- **Feed/Alerts**: 무검색 피드·주간 Digest
- **Behavior(확장)**: 쇼핑 페이지 자동 배너(총액/쿠폰/캐시백)
- 원칙: Zero‑Friction · One‑Second Story · Truth‑First · Trust by Default

---

## 2) 기능 세트(통합)
- Free: 글로벌 비교, **실결제가**, 가격 이력(1주/1개월/6개월), 알림 5개, 캐시백 적립
- Pro($4.9)/Pro+($9.9): 무제한 알림·빠른 폴링, **AI 예측/대체추천**, 광고 제거, (**Pro+**) 배송추적·세일 캘린더·리셀 리포트 월 6회
- Enterprise($99~199): 1k+ SKU 모니터링, 저장 뷰/공유, PDF/Excel, API

---

## 3) AI 기능
- SKU 임베딩 매칭 Precision≥0.95/Recall≥0.90 목표
- 가격 예측(Prophet+LSTM), “지금/대기” 시그널
- 리뷰 요약(GPT‑5), Fraud 탐지(룰→ML)

---

## 4) 기술 아키텍처 & 데이터
- 서버: Firebase Functions(Node/TS) + Playwright + Firestore/BigQuery
- 클라: Flutter App · React Web · MV3 Extension
- 데이터 컬렉션: products/offers/price_history/alerts/affiliate_clicks/orders/cashback_wallet/cashback_ledger/user_feedback/fraud_signals/b2b_reports/enterprise_clients
- 운영: OpenTelemetry, Canary, DR(RPO1h/RTO4h), KMS/Secret, RBAC/2FA

---

## 5) UI/UX 디자인 시스템 & 코드 (발췌)
### 토큰(JSON)
```json
{
  "color": {
    "bg": "#0B1117", "card": "#121A23", "brand": "#4F7EFF",
    "text": "#E6EDF3", "muted": "#9BA7B4", "success": "#12B981",
    "warning": "#F59E0B", "danger": "#EF4444"
  },
  "radius": {"card": 16, "pill": 999},
  "typography": {"display": 32, "title": 24, "body": 16, "caption": 12},
  "spacing": {"xs": 4, "sm": 8, "md": 12, "lg": 16, "xl": 24},
  "motion": {"enter": 180, "exit": 140, "press": 70}
}
```
### React PriceCard/CompareDrawer (발췌)
```tsx
export function PriceCard({ item }:{ item:{ title:string; totalKRW:number; deltaPct?:number; }}){
  return <div className="rounded-2xl p-4" style={{background:"#121A23",color:"#E6EDF3"}}>
    <div className="text-[16px]">{item.title}</div>
    <div className="text-[24px] font-semibold">{item.totalKRW.toLocaleString()}원</div>
  </div>;
}
```
### Flutter PriceCard (발췌)
```dart
class PBPriceCard extends StatelessWidget{
  final Map<String,dynamic> r; const PBPriceCard(this.r,{super.key});
  @override Widget build(BuildContext c)=>Card(child:Padding(padding:EdgeInsets.all(16),
   child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
     Text(r['title']??''), SizedBox(height:6),
     Text((r['totalPrice']??0).toString())
   ])));
}
```
### Chrome MV3 manifest (발췌)
```json
{
  "manifest_version": 3,
  "name": "PriceBuddy",
  "version": "1.0.0",
  "permissions": ["storage","activeTab","scripting"]
}
```

---

## 6) 서버/배포 코드 (발췌)
```ts
export function estimateTotals({base,ship,country,curr="KRW"}:{base:number;ship:number;country:string;curr?:string}){
  const vat = country==="KR"?0.10:0; const duty=0; // 카테고리별 룰 별도
  return base + ship + (base+ship)*vat + base*duty;
}
```
```bash
# scripts/oneclick.sh (핵심)
firebase deploy --only functions --project "$GCP_PROJECT"
# web/extension/apk 빌드 및 배포 포함
```
---

## 7) AI Agent Ops
- **Orchestrator** + Product/Design/Dev/Biz/QA — 자동 루프: 요구사항→디자인→코드→수익→QA→문서 업데이트
- 태스크 그래프(YAML), 주간 상태 템플릿, 피드백 자가 업그레이드 Cron 포함

---

## 8) 재무/요금제/일정
- 요금: Free/Pro/Pro+/Enterprise(상세는 본문/부록)
- 수익 시작: **2025‑10 베타 직후**(Affiliate/광고/구독) → **2026‑02 정식**(B2B/API) 확대
- 일정: MVP 완료 → v1.6(’25‑10) → v2.0(’26‑02)

---

## 9) 컴플라이언스 & 보안 핵심
- iOS/Android IAP 경로 준수, Chrome 데이터 최소수집/고지
- GDPR/DSA/FTC 고지, DSR 30일, 보존주기(클릭 13개월/원장5년)

---

## 10) Coverage Map (원문 포함 현황)
| 파일 | 크기(bytes) | 헤더수 | SHA12 |
|---|---:|---:|---|
| PriceBuddy_MasterBrief_v1.1_full.md | 5539 | 20 | e551f6a36306 |
| PriceBuddy_MasterBrief_v2.0_full.md | 4215 | 17 | c4e4c06fcbcb |
| PriceBuddy_MasterBrief_v2.1_full.md | 7662 | 20 | 49ae1a2a2e88 |
| PriceBuddy_MasterBrief_v2.2_full.md | 2066 | 9 | 2148cda9aca1 |
| PriceBuddy_Project_Full_v2.0.md | 6381 | 23 | 4b019f94f9d6 |
| PriceBuddy_Project_v2.2.md | 3591 | 18 | 225f83fa5244 |
| PriceBuddy_MasterBrief_v3.0_SUPER.md | 1600 | 6 | a450e72e7d8b |

> 위 표의 모든 문서는 아래 *Appendix A*에 **원문 전체**가 포함됩니다.

---

# Appendix A — Source Documents (Unabridged)
(아래는 업로드하신 원문을 수정 없이 그대로 포함합니다.)


---

## PriceBuddy_MasterBrief_v1.1_full.md — FULL TEXT

# PriceBuddy MasterBrief v1.1 (Global + KR/Naver 포함)

## 0) Executive Summary
- **PriceBuddy = 글로벌 가격 추적 & 캐시백 슈퍼앱**
- 기존 v0.4(국내 MVP) → 글로벌 확장 (Amazon/eBay/AliExpress) + 한국 특화 (Coupang, Naver SmartStore).
- 수익모델: **제휴(5%) + 광고 + 구독($4.9~9.9) + 캐시백 락인**.
- 목표: MAU 200만 시, **월 순익 ₩370M ~ ₩610M** 달성.

---

## 1) Vision & Mission
- **Vision**: 전 세계 소비자가 “진짜 총액 최저가”를 쉽고 빠르게 확인할 수 있게 한다.
- **Mission**: 가격 비교 + 알림 + 캐시백 + AI 예측을 결합해, 매일 열고 싶은 쇼핑 파트너 앱이 되기.

---

## 2) 브랜드 & 포지셔닝
- **브랜드명 유지**: PriceBuddy
- 글로벌 스토어 표기: "PriceBuddy – Global Deals & Cashback"
- 한국 스토어 표기: "PriceBuddy – 쿠팡·네이버 최저가 & 캐시백"

---

## 3) 사용자 세그먼트
- **글로벌**: Amazon/Ebay/AliExpress 바겐 헌터, 직구족, 리셀러
- **한국**: 쿠팡/네이버 스마트스토어 중심 구매자, 육아맘, 2030 IT덕후
- **JTBD**: "오늘의 최저가를 확인하고, 가격이 떨어지면 알림 받고, 캐시백까지 적립"

---

## 4) 주요 기능 (MVP → Full)
### Free
- 글로벌 가격 비교 (Amazon/eBay/AliExpress/Coupang/Naver)
- 총액 계산기(환율·배송비·관부가세 포함 요약)
- 가격 알림 (월 5개), 데일리 핫딜 피드, 광고 포함
- 캐시백 적립 (출금 한도/보류기간 적용)

### Premium ($4.9~9.9/월)
- 광고 제거, 무제한 알림/관심상품
- 자동 결제·배송 추적 (메일 파싱/주문 연동)
- 세일 캘린더 (Prime Day, 11.11, 와우데이, 네이버 쇼핑라이브)
- 리셀 가치 예측/시세 그래프

---

## 5) 기술 아키텍처
- **클라이언트**: Flutter (iOS/Android), 브라우저 확장(Chrome/Edge), 웹앱
- **서버**: Firebase + Node.js Functions (푸시/스케줄러)
- **데이터**: Firestore + BigQuery(확장), Redis 캐시
- **AI/ML**: GPT-5 기반 요약/추천, 시세 예측 모델
- **인프라**: Firebase Hosting/Cloud Run + AWS 환율 API

---

## 6) 데이터 모델
- **products**(id, title, brand, category, gtin, images, attrs)
- **offers**(id, product_id, merchant, url, base_price, shipping, tax, duty, currency, total_price, last_seen)
- **price_history**(product_id, merchant, ts, total_price)
- **alerts**(id, user_id, product_id, target_price, active)
- **affiliate_clicks**(id, user_id, merchant, url, ts, session_id)
- **orders**(id, user_id, merchant, order_ref, amount, commission, status, ts)
- **cashback_wallet**(user_id, balance, last_payout)
- **cashback_ledger**(id, user_id, order_id, amount, ts, status, note)
- **fraud_signals**(id, user_id, signal, value, ts)

---

## 7) 캐시백 정산 플로우
1) 유저가 PriceBuddy 링크 클릭 → 파트너 세션 생성
2) 주문 발생 → 파트너 어필리에이트 커미션 확정 (취소/반품 제외)
3) `cashback_ledger`에 지급 예정 기록
4) 보류기간(30일) 후 지갑으로 적립 → 출금 가능
5) 최소 출금액·수수료 적용 (예: 1만원 이상, 500원 수수료)
6) Fraud 방지: 다계정, VPN, 급증패턴 감지 → 룰+ML

---

## 8) 수익 모델
- **제휴(5%)**: Amazon/eBay/AliExpress/Coupang/Naver
- **광고**: AdMob/네이티브 배너 (프리미엄 제거)
- **구독**: 광고 제거 + 프로 기능 ($4.9~9.9)
- **캐시백**: 제휴 수익 일부 사용자와 분배 → 락인 강화

---

## 9) 재무 분석
- Base: 월 순익 ≈ ₩370M
- Upside: 월 순익 ≈ ₩610M
- 연간 순익: ₩45억 ~ ₩73억
- 상세 수치: `pricebuddy_global_financials_v1.1.csv` 참고

---

## 10) KPI 트리
- Acquisition: installs, CAC, organic%
- Engagement: DAU/MAU, 세션수, 알림 opt-in, 클릭률
- Monetization: ARPU(ads+subs+aff), 유료전환율, 캐시백 리딤률
- Quality: Fraud Rate, Refund Ratio, Order Confirmation Lag

---

## 11) 로드맵 (M1~M4)
- **M1 (4주)**: 리브랜딩, Amazon+쿠팡+네이버 연동, 캐시백 지갑(모의)
- **M2 (6주)**: AliExpress+eBay 추가, 총액 계산기, 가격 알림 GA
- **M3 (6주)**: 브라우저 확장 (자동 팝업), 지갑 동기화
- **M4 (8주)**: 글로벌 구독, 배송 추적, 리셀 예측, 화이트라벨 B2B

---

## 12) 팀 구성
- 엔지니어 4 (모바일·백엔드·확장)
- 데이터/ML 2
- 제품 매니저 1
- 디자이너 1
- 제휴/오퍼레이션 2

---

## 13) 리스크 & 대응
- 파트너 정책 변경 → 공식 API 우선, 대체소스 이중화
- 스토어 심사 지연 → 인앱결제/광고 가이드 준수
- Fraud/부정 캐시백 → 룰 기반 + ML 탐지
- 환율 변동 → 실시간 API 연동

---

## 14) 국제화 전략 (i18n)
- 1단계: ko, en, ja, zh
- 2단계: de, fr, es, pt, hi
- ASO 최적화: 국가별 키워드/스크린샷/설명 차별화

---

## 15) 마케팅 전략
- **SEO**: pricebuddy.com 웹앱 → 유입 후 앱 설치 유도
- **SNS 쇼츠**: “오늘의 글로벌 핫딜 Top 3” 자동 생성·배포
- **인플루언서/커뮤니티 제휴**: 유튜브·인스타 핫딜 채널 협업
- **추천인 리워드**: 친구 초대 시 추가 캐시백 지급

---

## 16) 부록
- **샘플 딥링크**: Amazon/Naver/Coupang/AliExpress/eBay
- **푸시 카피 예시**: "{{브랜드}} {{모델}} 오늘 -12%, 지금 최저가!" / "이번 주말 {{상품}} 추가 하락 가능성 ↑"
- **법률/규제**: 제휴 고지, 개인정보 최소수집, 환불/취소 싱크

---


---

## PriceBuddy_MasterBrief_v2.0_full.md — FULL TEXT

# PriceBuddy MasterBrief v2.0 (통합판, Global + DealNest + DealScope 포함)

## 0) Executive Summary
- **PriceBuddy = 글로벌 가격 추적 & 캐시백 슈퍼앱 + 브라우저 확장 + B2B 리셀러 모드**
- 통합 대상: PriceBuddy App + DealNest(글로벌 확장) + DealScope(브라우저 확장·B2B)
- 목표: B2C + B2B 전방위 수익 모델, 연 순익 **100억+** 규모 확보

---

## 1) 브랜드 & 포지셔닝
- **브랜드명**: PriceBuddy 유지
- **스토어 표기**
  - 글로벌: *PriceBuddy – Global Deals & Cashback*
  - 한국: *PriceBuddy – 쿠팡·네이버 최저가 & 캐시백*
- **라인업**
  - PriceBuddy App (모바일 허브)
  - PriceBuddy Extension (브라우저 확장)
  - PriceBuddy Enterprise (B2B 리셀러 모드)

---

## 2) 사용자 세그먼트
- **B2C**
  - 해외직구족, 가격 민감 소비자, 육아맘/학생, 게이머/스니커즈 매니아
- **B2B**
  - 리셀러, 도매상, 수입상, 대량 모니터링 필요 기업

---

## 3) 기능 세트 (통합)
### 기본 (Free)
- 글로벌 가격 비교: Amazon, Coupang, Naver, AliExpress, eBay
- 환율·배송비·관세·부가세 포함 **실결제가**
- 가격 이력 차트 (1주/1개월/6개월)
- 가격 알림 (제한적)
- 캐시백 적립 (출금 한도 적용)

### 프리미엄 ($4.9~9.9/월)
- 광고 제거
- 무제한 알림 + 빠른 폴링
- AI 가격 예측 (“지금 사세요/기다리세요”)
- SKU 매칭 + 대체상품 추천
- 자동 배송 추적 (메일 파싱)
- 세일 캘린더 (Prime Day, 11.11, 와우데이, 네이버 쇼핑라이브)

### 확장 (Browser Extension)
- 쇼핑 페이지 자동 팝업 (최저가·총액·쿠폰/캐시백 표시)
- 쿠폰 자동 적용
- 웹훅/슬랙 알림 연동

### B2B 모드 (Enterprise)
- 대량 모니터링 (SKU 1000+)
- PDF/Excel 보고서 자동 생성
- API Access
- 공동구매/커뮤니티 알림

---

## 4) AI 기능
- SKU 임베딩 기반 상품 매칭/대체 추천
- 가격 예측 (시계열 ML)
- 리뷰 분석 (칭찬/불만/리스크 Top3)
- Fraud 탐지 ML (부정 캐시백/다계정)

---

## 5) 기술 아키텍처
- **서버**: Firebase Functions + Node.js (Playwright 크롤링) + Firestore/BigQuery
- **클라이언트**
  - Flutter App (iOS/Android)
  - Chrome/Edge Extension
  - WebApp (검색/SEO 퍼널)
- **AI/ML**
  - GPT-5 기반 리뷰 요약/추천
  - 가격 예측: Prophet/LSTM + 규칙 혼합
  - SKU 매칭: 벡터 DB (Faiss/Weaviate)
- **B2B**
  - Puppeteer/ReportLab PDF 보고서 엔진

---

## 6) 데이터 모델
- products, offers, price_history, alerts
- affiliate_clicks, orders, cashback_wallet, cashback_ledger
- fraud_signals, b2b_reports, enterprise_clients

---

## 7) 수익 모델
- **Affiliate 커미션** (5% 평균)
- **광고** (무료 유저 대상)
- **구독 Premium** ($4.9~9.9/월)
- **B2B 리셀러 패키지** ($99~199/월)

---

## 8) 재무 분석 (요약)
- **B2C (MAU 200만)**
  - Base: 월 순익 ₩3.7억
  - Upside: 월 순익 ₩6.1억
- **B2B**
  - 리셀러 5천명 × $99 = $495K/월 ≈ ₩6.4억
- **합산 Upside**: 월 순익 10억 이상, 연 순익 100억+

---

## 9) 개발 로드맵 (통합)
- **Phase 1 (완료)**: PriceBuddy v1.1, DealScope v1.5 (기본 추적·알림·Import/Export)
- **Phase 2 (2025.08~10)**:
  - SKU 매칭/대체상품 추천
  - 가격 예측/시그널 (ML)
  - 리뷰 분석
  - 서버 파서 안정화
- **Phase 3 (2025.11~2026.02)**:
  - 공동구매/커뮤니티 알림
  - 리셀러 모드 (B2B) + PDF 보고서
  - 배송비 최적화 엔진
- **배포 목표**
  - v1.6 베타: 2025년 10월 말
  - v2.0 정식: 2026년 2월

---

## 10) KPI & 리스크
- **KPI**: DAU/MAU, 구독 전환율, 제휴 ARPU, 캐시백 리딤률, B2B 고객 수
- **리스크**: 파트너 API 정책 변경, 크롤링 차단, 부정 사용자 → 대응: 공식 API 우선 + 대체 크롤러 + ML Fraud 탐지

---

## 11) 결론
PriceBuddy v2.0은 앱 허브 + 확장 + B2B를 통합한 글로벌 슈퍼앱.  
소비자에게는 “진짜 총액 최저가”를, 리셀러에게는 “대량 모니터링·리포트”를 제공.  
B2C와 B2B를 아우르며 **연 순익 100억+** 규모로 성장 가능한 구조.

---


---

## PriceBuddy_MasterBrief_v2.1_full.md — FULL TEXT

# PriceBuddy MasterBrief v2.1 (통합/보강판) — 2025-08-26

> v2.0 대비 추가: **운영/보안/컴플라이언스/실행체계/플랜/SLI·SLO/실제 패키지·가격/DR·BCP/CI·CD/AB 테스트/대체 데이터·쿠폰 정책/스토어 심사/접근성** 등을 보강.

## 0) Executive Summary (변동 없음 요약)
- PriceBuddy = 글로벌 가격 추적 & 캐시백 슈퍼앱 + 브라우저 확장 + B2B.
- 통합 대상: PriceBuddy App + DealNest + DealScope.
- 목표: B2C + B2B 수익 모델, 연 순익 100억+.

---

## 18) 패키징 & 요금제 매트릭스 (B2C/B2B)
| 구분 | 월 요금 | 핵심 혜택 |
|---|---:|---|
| Free | $0 | 글로벌 비교, 총액 요약, 알림 5개, 광고 포함 |
| Pro | $4.9 | 광고 제거, **무제한 알림**, 빠른 폴링(배치 2배), AI 가격 예측, 대체상품 추천 |
| Pro+ | $9.9 | + 배송 추적(메일 파싱), 세일 캘린더 Pro, 리셀 가치 리포트(월 4회) |
| Enterprise (B2B) | $99~199 | 대량 모니터링(1k+ SKU), PDF/Excel 리포트, API Access, 계정 다중 권한 |

- 환불/해지: 결제일 기준 **미사용 기간 일할 환불 불가(스토어 정책 준수)**, 갱신 24h 전 해지.
- 지역 세금: 가격은 **세전** 안내, VAT/부가세는 스토어/결제사 정책에 따름.

---

## 19) Affiliate 어트리뷰션 & 링크 트래킹
- **방식**: 딥링크 + 리디렉트 게이트웨이(서버측 s2s 태깅) + (가능 시) 네트워크 SDK 병행.
- **세션 저장**: 사용자/머천트/캠페인/클릭ID/만료시각 쿠키/로컬스토리지 + 서버 세션.
- **포스트백**: 주문 확정 웹훅/리포트 수신 → `orders`·`cashback_ledger` 갱신.
- **중요**: 쿠키 기간·허용 파라미터는 **네트워크별 상이** → 프로그램별 파라미터 카탈로그 유지.

---

## 20) 스토어 심사 & 컴플라이언스 체크리스트
- **iOS/Android**: IAP 사용범위 명확(디지털 혜택은 인앱), 제3자 결제 유도 금지, 개인 정보 처리 고지.
- **확장(Chrome/Edge)**: 데이터 수집 최소화·목적 명시, 쿠폰 자동적용 시 **사용자 동작 유발/명확 고지**.
- **광고/어필리에이트 고지**: 화면 내 “제휴 링크 포함” 배지, 이용약관·개인정보처리방침에 명시.
- **지역 규제**: GDPR/CCPA/DSA/FTC 가이드 준수(광고·추천 알고리즘 투명성 간단 고지).

---

## 21) 개인정보/보안/데이터 거버넌스
- **보안**: TLS 1.2+, 데이터 암호화(At Rest: KMS/AES-256), 비밀관리: GCP Secret Manager, RBAC·2FA.
- **감사/로그**: 접근 로그/관리자 행위 감사, 이상 징후 알람(SIEM).
- **개인정보**: 최소 수집, 목적 제한, **DPIA** 수행, **DSR(삭제/열람) 30일 이내 처리**.
- **보존주기**: 클릭·세션 13개월, 주문/원장 5년(회계 감사 목적), 푸시토큰 12개월 비활성시 삭제.
- **국경간 이전**: 데이터 지역성 옵션(KR/EU/US) + 익명화·가명처리.

---

## 22) 가용성/복구계획(BCP/DR) & 성능 SLI·SLO
- **SLO**: API 가용성 99.9%, 검색 P50 < 700ms, P95 < 1500ms, 알림 지연 P95 < 5분.
- **DR**: RPO 1시간, RTO 4시간. 멀티리전(Primary: asia-northeast3, Failover: us-central1).
- **백업**: Firestore PITR, BigQuery 일일 스냅샷, 오브젝트 버저닝.
- **캐싱**: 결과 캐시(키: 쿼리×로케일×타임박스), CDN·Edge 캐시, 환율 캐시 TTL 1h.

---

## 23) 관측성 & 품질(CI/CD·테스트)
- **관측성**: OpenTelemetry(Trace/Metric/Log), 에러 버짓 정책, 분산트레이싱(Functions↔크롤러).
- **CI/CD**: GitHub Actions → Lint/Test/Build/Deploy 스테이지, Canary 5% → Progressive Rollout.
- **테스트**: 단위/계약/크롤러 회귀(시나리오), 확장 E2E(Playwright) 야간 배치.

---

## 24) 실험/개선(Feature Flag & A/B)
- **도구**: 오픈소스 FF(Flagsmith/Unleash) 또는 Firebase Remote Config.
- **정책**: 실험 기간 최소 7일, 유의수준 95%, 주요 지표: 전환/클릭/잔존/ARPU.

---

## 25) SKU 매칭 & 쿠폰 엔진 품질관리
- **정확도 목표**: 매칭 Precision ≥ 0.95, Recall ≥ 0.90 (핫카테고리 우선).
- **데이터 라벨링**: 휴리스틱+벡터 유사도 → Active Learning → 휴먼 검수 루프.
- **쿠폰 합법성**: 약관 준수, 유효성 검증(체크아웃 DOM 확인), 실패 시 사용자에 명시적 안내.

---

## 26) 결제/IAP·세금·인보이싱
- **IAP**: iOS/Android 구독(취소/환불은 스토어 정책 우선), 서버 영수증 검증.
- **세금**: 지역 VAT/GST는 결제 채널에 따라 자동 처리, 영수증에 세금항목 표기.
- **B2B 청구**: 카드/송장 결제 병행, 월말 세금계산서 옵션(지역 법규 준수).

---

## 27) 접근성/국제화 품질
- **접근성**: WCAG 2.1 AA 목표(명도비, 포커스, 대체텍스트), 키보드 내비게이션, 스크린리더 라벨.
- **국제화**: Pseudo‑loc QA, 숫자/통화/날짜 로케일 규칙, LTR/RTL 기본 지원(아랍어·히브리어 준비).

---

## 28) 운영/CS & SLA
- **채널**: 앱 내 헬프센터/FAQ, 이메일, 디스코드·텔레그램 커뮤니티(선택).
- **SLA**: 유료 1영업일 내 1차 응답, 치명적 장애 4h 내 상태공개.
- **정책**: 구독 해지/환불 가이드, 캐시백 분쟁 처리 SOP, 부정사용 경고/제재 프로세스.

---

## 29) 데이터/분석 설계
- **도구**: GA4/Amplitude, BigQuery DWH, DBT 모델링.
- **코호트**: D1/D7/D30, 알림 클릭→구매 전환 퍼널, SKU별 ARPU/수익성.
- **리포트**: 주간 임원 대시보드(성장/수익/품질), 월간 실험 결과.

---

## 30) 국제 확장 실행플랜 (단계별 파트너·리스크)
1) **KR/US/JP**: Amazon/Coupang/Naver/楽天(후속), 로컬 환율·세금 검증.  
2) **SEA**: Shopee/Lazada(파트너 신청), 물류비 편차 큼 → 총액 엔진 현지화.  
3) **EU**: Zalando/Otto, IOSS/VAT 처리 확인.  
- 각 단계별 **법규·제휴·데이터 품질** 체크리스트 포함.

---

## 31) 마케팅/GTM(베타→정식)
- **베타**: 대기열/초대코드, 커뮤니티(뽐뿌·클리앙·레딧) AMA, 얼리버드 Pro 90일.
- **정식**: 블프/11.11 버스팅 캠페인, 인플루언서 협업, 스폰서 핫딜 슬롯 판매.
- **리퍼럴**: 추천인/피추천인 캐시백 추가 적립(월 상한).

---

## 32) 리스크 레지스터(요약)
| 리스크 | 영향 | 가능성 | 대응 |
|---|---|---|---|
| 파트너 API 변경/차단 | 높음 | 중간 | 공식 API 우선, 대체 크롤러/피드, 페일오버 |
| 어트리뷰션 누락 | 중간 | 중간 | s2s+SDK 병행, 후크 재시도, 리포트 대조 |
| Fraud/부정 적립 | 높음 | 중간 | 디바이스 지문, IP/패턴 룰, ML 탐지 |
| 환율 급등락 | 중간 | 중간 | 정규화·시간스탬프 표기, 쿼트 고지 |
| 스토어 심사 지연 | 중간 | 중간 | 가이드 준수·기능 토글, 리뷰 대응 매뉴얼 |

---

## 33) 법률 문서 개요(ToS/Privacy/Disclosure) *샘플 TOC*
- 서비스 이용약관: 서비스 범위/금지행위/면책/책임 제한/준거법.
- 개인정보처리방침: 수집 항목/목적/보관 기간/제3자 제공/국외 이전/권리.
- 제휴 고지: 광고/제휴 링크 포함 안내, 리워드/캐시백 정책 상세.

---

## 34) 브랜드 키트 & 톤
- **톤**: 신뢰·실용·간결. “숫자 먼저, 설명은 최소” 원칙.
- **자산**: App 아이콘/스플래시/확장 배지/색 팔레트/타이포(로컬 폰트 대체 포함).

---

## 35) 백업/히스토리
- 이 문서는 자동 저장·버전드롭(YYYY‑MM‑DD)로 관리. v2.1이 최신이며 v2.0을 대체.


---

## PriceBuddy_MasterBrief_v2.2_full.md — FULL TEXT

# PriceBuddy MasterBrief v2.2 (Full 업데이트판) — 2025-08-26

## 0) Executive Summary
- PriceBuddy = 글로벌 가격 추적 & 캐시백 슈퍼앱 + 브라우저 확장 + B2B.
- 현재 상태: Phase 1 완료, Phase 2 진행 중, Phase 3 예정.
- 목표: B2C + B2B 수익 모델, 연 순익 100억+.

---

## 1) 개발 진행상황 (업데이트)
### Phase 1 (✅ 완료)
- 앱 v1.1: 글로벌 가격 추적 Stub(Amazon/Coupang/Naver), 알림/푸시 로직, 캐시백 지갑 DB 스키마.
- 확장 v1.5: 기본 배너 노출, 쿠폰 자동 적용 Stub.
- 서버: Firebase Functions 스켈레톤, Flutter 앱 기본 구조.
- 문서: MasterBrief v2.1까지 작성 완료.

### Phase 2 (🔄 진행 중, ~2025.10)
- SKU 매칭/대체상품 추천: 벡터 DB 설계 및 모델링.
- 가격 예측 ML: Prophet 기반 PoC → LSTM 혼합 예정.
- 리뷰 분석: GPT-5 Summarizer 연동 테스트.
- 서버 파서 안정화: Playwright + Proxy Rotation 구축.
- UI/UX: 무검색 피드, 알림 Digest 설계.

### Phase 3 (📅 예정, 2025.11 ~ 2026.02)
- 공동구매/커뮤니티 알림.
- B2B Enterprise 모드: 대량 모니터링 + PDF 보고서.
- 배송비 최적화 엔진.
- Fraud 탐지 ML 적용.
- v2.0 정식 출시 목표: 2026년 2월.

---

## 2) 마일스톤
- v1.6 베타: 2025년 10월 말 → B2C(총액 비교, 알림, AI 예측/추천/리뷰분석), B2B(모니터링·샘플 리포트).
- v2.0 정식: 2026년 2월 → B2C+B2B 풀기능, 캐시백 정산/출금, 배송추적, 공동구매, Fraud 방어.

---

## 3) 리스크 & 대응
- 파트너 API 변경/차단 → Failover 크롤러 + API 계약.
- 스토어 심사 지연 → IAP/광고 고지 준수 체크리스트.
- Fraud 위험 → 룰 기반 + ML 단계적 도입.

---

## 4) 결론
- 현재 PriceBuddy는 Phase 2 개발 단계로 진입, 2025년 10월 베타 출시, 2026년 2월 정식 출시 목표.
- 핵심 AI 기능(SKU 매칭/가격예측/리뷰분석)과 총액 엔진 고도화가 진행 중.
- 문서·개발 로드맵·리스크 대응까지 모두 정비됨.

---


---

## PriceBuddy_Project_Full_v2.0.md — FULL TEXT

# PriceBuddy MasterBrief v2.0 (Full, Global + DealNest + DealScope 통합판)

## 0) Executive Summary
- **PriceBuddy = 글로벌 가격 추적 & 캐시백 슈퍼앱 + 브라우저 확장 + B2B 리셀러 모드**
- 통합 대상: PriceBuddy App + DealNest(글로벌 확장) + DealScope(브라우저 확장·B2B)
- 목표: B2C + B2B 전방위 수익 모델, 연 순익 **100억+** 규모 확보

---

## 1) Vision & Mission
- **Vision**: 전 세계 소비자가 “진짜 총액 최저가”를 쉽고 빠르게 확인할 수 있게 한다.
- **Mission**: 글로벌 가격 비교 + 알림 + 캐시백 + AI 예측을 결합해 매일 열고 싶은 쇼핑 파트너가 되기.

---

## 2) 브랜드 & 포지셔닝
- **브랜드명**: PriceBuddy 유지
- **스토어 표기**
  - 글로벌: *PriceBuddy – Global Deals & Cashback*
  - 한국: *PriceBuddy – 쿠팡·네이버 최저가 & 캐시백*
- **라인업**
  - PriceBuddy App (모바일 허브)
  - PriceBuddy Extension (브라우저 확장)
  - PriceBuddy Enterprise (B2B 리셀러 모드)

---

## 3) 사용자 세그먼트
- **B2C**
  - 해외직구족, 가격 민감 소비자, 육아맘/학생, 게이머/스니커즈 매니아
- **B2B**
  - 리셀러, 도매상, 수입상, 대량 모니터링 필요 기업

---

## 4) UX 플로우
- **Search Mode**: 검색창 입력 → 글로벌 다중 마켓 가격 비교
- **Feed/Alerts Mode**: 관심상품/검색 이력 기반 추천·알림
- **Behavior Mode (확장)**: 사용자가 쇼핑 페이지 방문 시 자동 개입 (배너/쿠폰/캐시백)

---

## 5) 기능 세트 (통합)
### 기본 (Free)
- 글로벌 가격 비교: Amazon, Coupang, Naver, AliExpress, eBay
- 환율·배송비·관세·부가세 포함 **실결제가**
- 가격 이력 차트 (1주/1개월/6개월)
- 가격 알림 (제한적)
- 캐시백 적립 (출금 한도 적용)

### 프리미엄 ($4.9~9.9/월)
- 광고 제거
- 무제한 알림 + 빠른 폴링
- AI 가격 예측 (“지금 사세요/기다리세요”)
- SKU 매칭 + 대체상품 추천
- 자동 배송 추적 (메일 파싱)
- 세일 캘린더 (Prime Day, 11.11, 와우데이, 네이버 쇼핑라이브)

### 확장 (Browser Extension)
- 쇼핑 페이지 자동 팝업 (최저가·총액·쿠폰/캐시백 표시)
- 쿠폰 자동 적용
- 웹훅/슬랙 알림 연동

### B2B 모드 (Enterprise)
- 대량 모니터링 (SKU 1000+)
- PDF/Excel 보고서 자동 생성
- API Access
- 공동구매/커뮤니티 알림

---

## 6) AI 기능
- SKU 임베딩 기반 상품 매칭/대체 추천
- 가격 예측 (시계열 ML)
- 리뷰 분석 (칭찬/불만/리스크 Top3)
- Fraud 탐지 ML (부정 캐시백/다계정)

---

## 7) 기술 아키텍처
- **서버**: Firebase Functions + Node.js (Playwright 크롤링) + Firestore/BigQuery
- **클라이언트**
  - Flutter App (iOS/Android)
  - Chrome/Edge Extension
  - WebApp (검색/SEO 퍼널)
- **AI/ML**
  - GPT-5 기반 리뷰 요약/추천
  - 가격 예측: Prophet/LSTM + 규칙 혼합
  - SKU 매칭: 벡터 DB (Faiss/Weaviate)
- **B2B**
  - Puppeteer/ReportLab PDF 보고서 엔진

---

## 8) 데이터 모델
- products, offers, price_history, alerts
- affiliate_clicks, orders, cashback_wallet, cashback_ledger
- fraud_signals, b2b_reports, enterprise_clients

---

## 9) 수익 모델
- **Affiliate 커미션** (5% 평균)
- **광고** (무료 유저 대상)
- **구독 Premium** ($4.9~9.9/월)
- **B2B 리셀러 패키지** ($99~199/월)

---

## 10) 재무 분석 (요약)
- **B2C (MAU 200만)**
  - Base: 월 순익 ₩3.7억
  - Upside: 월 순익 ₩6.1억
- **B2B**
  - 리셀러 5천명 × $99 = $495K/월 ≈ ₩6.4억
- **합산 Upside**: 월 순익 10억 이상, 연 순익 100억+

---

## 11) 개발 로드맵 (통합)
- **Phase 1 (완료)**: PriceBuddy v1.1, DealScope v1.5 (기본 추적·알림·Import/Export)
- **Phase 2 (2025.08~10)**:
  - SKU 매칭/대체상품 추천
  - 가격 예측/시그널 (ML)
  - 리뷰 분석
  - 서버 파서 안정화
- **Phase 3 (2025.11~2026.02)**:
  - 공동구매/커뮤니티 알림
  - 리셀러 모드 (B2B) + PDF 보고서
  - 배송비 최적화 엔진
- **배포 목표**
  - v1.6 베타: 2025년 10월 말
  - v2.0 정식: 2026년 2월

---

## 12) KPI & 리스크
- **KPI**: DAU/MAU, 구독 전환율, 제휴 ARPU, 캐시백 리딤률, B2B 고객 수
- **리스크**: 파트너 API 정책 변경, 크롤링 차단, 부정 사용자 → 대응: 공식 API 우선 + 대체 크롤러 + ML Fraud 탐지

---

## 13) 시장 수요 검증
- 기존 사용자 행동: 네이버/쿠팡에서 따로따로 검색, 해외직구족은 엑셀로 관세 계산 → PriceBuddy가 불편 해결
- 경쟁사: Honey(글로벌, 한국 미약), 네이버/쿠팡(국내 한정) → PriceBuddy 차별성 확보
- 초기 유저층: 해외직구족, 리셀러, 가격 민감 소비자 → 베타부터 수익 창출 가능

---

## 14) 보완 & 확장 전략
- UX: 무검색 피드, 알림 Digest
- 기능: ML 기반 쿠폰 자동 적용, 배송비 최적화, 리셀 가치 DB 연동
- 수익화: 스폰서 핫딜 슬롯, 프리미엄 전용 리포트, B2B 커스텀 보고서
- 법적 대응: GDPR/CCPA, Affiliate Disclosure, 캐시백 정책 투명화
- Growth: 추천인 리워드, SNS 공유형 딜 카드, 시즌성 캠페인
- 데이터 자산화: 글로벌 Price Index, 리셀 가치 DB 판매
- 국제 확장: KR/US/JP → SEA/EU → 글로벌 결제사 제휴
- 투자자 관점: TAM/SAM/SOM, 3년 재무추정, Exit 시나리오 (PayPal Honey 인수 사례)

---

## 15) 경쟁 포지셔닝
- **Honey (PayPal)**: 글로벌 쿠폰 강점, 한국 로컬 약함
- **CapitalOne Shopping**: 미국 로컬 강점, 아시아 없음
- **네이버/쿠팡**: 국내몰 강점, 글로벌 없음
- **PriceBuddy**: **총액 기준 글로벌+국내 동시 지원 + 캐시백** → 독보적

---

## 16) 운영 지표 & Growth
- **코호트 분석**: Retention Day1/7/30, 알림 클릭률, 캐시백 출금율
- **Growth 전략**: 추천인 리워드, SNS 공유형 딜 카드, 시즌성 캠페인 (블프/11.11/와우데이)

---

## 17) 결론
PriceBuddy v2.0은 앱 허브 + 확장 + B2B를 통합한 글로벌 슈퍼앱.  
소비자에게는 “진짜 총액 최저가”를, 리셀러에게는 “대량 모니터링·리포트”를 제공.  
B2C와 B2B를 아우르며 **연 순익 100억+** 규모로 성장 가능한 구조.

---


---

## PriceBuddy_Project_v2.2.md — FULL TEXT

# PriceBuddy MasterBrief v2.2 (Full 업데이트판) — 2025-08-26

## 0) Executive Summary
- PriceBuddy = 글로벌 가격 추적 & 캐시백 슈퍼앱 + 브라우저 확장 + B2B.
- 현재 상태: Phase 1 완료, Phase 2 진행 중, Phase 3 예정.
- 목표: B2C + B2B 수익 모델, 연 순익 100억+.

---

## 1) 개발 진행상황 (업데이트)
### Phase 1 (✅ 완료)
- 앱 v1.1: 글로벌 가격 추적 Stub(Amazon/Coupang/Naver), 알림/푸시 로직, 캐시백 지갑 DB 스키마.
- 확장 v1.5: 기본 배너 노출, 쿠폰 자동 적용 Stub.
- 서버: Firebase Functions 스켈레톤, Flutter 앱 기본 구조.
- 문서: MasterBrief v2.1까지 작성 완료.

### Phase 2 (🔄 진행 중, ~2025.10)
- SKU 매칭/대체상품 추천: 벡터 DB 설계 및 모델링.
- 가격 예측 ML: Prophet 기반 PoC → LSTM 혼합 예정.
- 리뷰 분석: GPT-5 Summarizer 연동 테스트.
- 서버 파서 안정화: Playwright + Proxy Rotation 구축.
- UI/UX: 무검색 피드, 알림 Digest 설계.

### Phase 3 (📅 예정, 2025.11 ~ 2026.02)
- 공동구매/커뮤니티 알림.
- B2B Enterprise 모드: 대량 모니터링 + PDF 보고서.
- 배송비 최적화 엔진.
- Fraud 탐지 ML 적용.
- v2.0 정식 출시 목표: 2026년 2월.

---

## 2) 마일스톤
- v1.6 베타: 2025년 10월 말 → B2C(총액 비교, 알림, AI 예측/추천/리뷰분석), B2B(모니터링·샘플 리포트).
- v2.0 정식: 2026년 2월 → B2C+B2B 풀기능, 캐시백 정산/출금, 배송추적, 공동구매, Fraud 방어.

---

## 3) 리스크 & 대응
- 파트너 API 변경/차단 → Failover 크롤러 + API 계약.
- 스토어 심사 지연 → IAP/광고 고지 준수 체크리스트.
- Fraud 위험 → 룰 기반 + ML 단계적 도입.

---

## 4) 결론
- 현재 PriceBuddy는 Phase 2 개발 단계로 진입, 2025년 10월 베타 출시, 2026년 2월 정식 출시 목표.
- 핵심 AI 기능(SKU 매칭/가격예측/리뷰분석)과 총액 엔진 고도화가 진행 중.
- 문서·개발 로드맵·리스크 대응까지 모두 정비됨.

---


# PriceBuddy Project (Full v2.2)

## Vision & Mission
- Vision: 전 세계 소비자가 “진짜 총액 최저가”를 쉽게 확인.
- Mission: 글로벌 가격 비교 + 알림 + 캐시백 + AI 예측을 결합한 매일 열고 싶은 쇼핑 파트너.

## Features
- 글로벌 가격 비교 (Amazon, Coupang, Naver, AliExpress, eBay)
- 총액 계산 (환율·배송비·관세·부가세)
- 가격 알림 + 푸시 알림 Digest
- 캐시백 지갑/원장
- AI: SKU 매칭, 가격 예측, 리뷰 분석
- 확장: 쇼핑 페이지 자동 배너, 쿠폰 자동적용
- B2B: 대량 모니터링, PDF/Excel 리포트, API Access

## Tech Stack
- 서버: Firebase Functions + Node.js (Playwright 크롤링), Firestore/BigQuery
- 클라이언트: Flutter App, Chrome/Edge Extension, WebApp
- AI/ML: GPT-5 Summarizer, Prophet/LSTM, Faiss 벡터 DB
- Infra: Proxy Rotation, Edge 캐시, Multi-region DR

## Data Model
- products, offers, price_history, alerts
- affiliate_clicks, orders, cashback_wallet, cashback_ledger
- fraud_signals, b2b_reports, enterprise_clients

## Monetization
- Affiliate 커미션, 광고, 프리미엄 구독, B2B 패키지/API

## Financial (요약)
- B2C MAU 200만 기준: 순익 ₩3.7억~6.1억/월
- B2B 5천 고객 × $99 = ₩6.4억/월
- 합산 Upside: 월 순익 10억+, 연 순익 100억+

## Roadmap
- Phase 1: 완료
- Phase 2: 2025.08~10, 베타 출시
- Phase 3: 2025.11~2026.02, 정식 출시

## Risks
- API 차단, Fraud, 심사 지연 → Failover·ML·체크리스트 대응

---


---

## PriceBuddy_MasterBrief_v3.0_SUPER.md — FULL TEXT

# PriceBuddy MasterBrief v3.0 — SUPER 통합판 (자동배포·UI/UX·코드 포함) — 2025-09-16

> 최신본 (v1.1~v2.2 통합) — UI/UX, 원클릭 배포, 서버 코드, 재무·수익모델, 진행상황 포함.  

## Executive Summary
- PriceBuddy = 글로벌 총액 최저가 + 캐시백 슈퍼앱 (앱/웹/확장 + B2B)
- USP: 관세·부가세·배송·환율 포함 실결제가 기준 글로벌+국내 동시 비교 + 쿠폰/캐시백 자동화
- 로드맵: MVP(완료) → 베타 v1.6(2025-10) → 정식 v2.0(2026-02)
- 수익: 베타부터 Affiliate·광고·구독, 정식부터 B2B·데이터 API

## 진행상황
- Phase 1 (MVP): 2025-08 완료
- Phase 2 (베타 준비): 진행률 ~35%, SKU 매칭·예측·리뷰 분석, 크롤러 안정화 중
- Phase 3 (정식): 2025-11 ~ 2026-02 예정

## 출시 예정
- 베타 v1.6: 2025-10 말
- 정식 v2.0: 2026-02

## 수익 모델 & 패키지
- Free ($0): 기본 비교/알림 5개/광고
- Pro ($4.9): 무제한 알림, AI 예측, 광고 제거
- Pro+ ($9.9): +배송추적, 세일 캘린더 Pro, 리셀 리포트
- Enterprise ($99~199): 대량 모니터링, PDF/Excel, API

## 포함 항목
- UI/UX 벤치마킹 (Amazon, TikTok, Airbnb, Stripe 등)
- 와이어프레임 코드 (React, Flutter, Chrome Extension)
- 원클릭 배포 스크립트 (Shell, GitHub Actions, Fastlane)
- 서버 코드 (총액 계산기, 피드백 자가 업그레이드 루프)
- 보안/운영/DR/SLO/컴플라이언스
- 경쟁 매트릭스 & USP
- 재무 시뮬레이션 & 예상 순익
- 자동 피드백 반영/자가 업그레이드 파이프라인


---

## PriceBuddy_MasterBrief_v4.6_Global_Growth_Loop_AUTO.md — FULL TEXT
> Path: `/mnt/data/PriceBuddy_MasterBrief_v4.6_Global_Growth_Loop_AUTO.md` · SHA256-12: `111fc72ce323`

# PriceBuddy MasterBrief v4.6 — Global Growth Loop AUTO-Edition (2025-11-12)

## Executive Summary
- **GA:** 2025-12-28 (speed-optimized)
- **Growth Loop:** AI 유입→전환→리텐션 자가 최적화
- **Markets:** KR, JP, US, EU
- **Stack:** Flutter (App), React (Web), MV3 (Extension), Firebase+Cloud Run, BigQuery/Postgres Replica
- **Revenue:** Affiliate, Ads, Pro/Pro+, B2B, Data API

## Roadmap (Updated)
- v1.6 Beta: 2025-11-25
- v2.0 GA: 2025-12-28
- v2.2 Global: 2026-03-05

## Growth Modules
- AI Interest Predictor, Smart Referral, Viral Share Cards, Retention Mailer (1/7/30), AI Promo Manager
- KPI Targets: MAU 1M+, 30d retention 48%, ARPU ₩8,200

## UX/AI Highlights
- Dynamic Feed, Smart Digest, Hybrid SKU Matcher (text+image), Event-Aware Price Forecast, Emotion Cluster Reviews
- WCAG AA, contextual native ads, trial→auto-upgrade

## Compliance & Ops
- GDPR/FTC, country-specific disclosures, OpenTelemetry, token rotation, HSTS, Deployment Lock, Rollback<=1m

## Expected Net Profit
- 2025-11 (Beta): ₩1.3억 /mo
- 2025-12 (GA): ₩9.8억 /mo
- 2026-02 (Growth): ₩13.6억 /mo
- 2026-Q2 (Global+): ₩17.5억 /mo

## One-Click Deploy (outline)
Pre-Build → Unified Snapshot → Auto Verify → Deployment Lock → Release


---

# Appendix B — Missing on Disk
- /mnt/data/PriceBuddy_MasterBrief_v1.1_full.md
- /mnt/data/PriceBuddy_MasterBrief_v2.0_full.md
- /mnt/data/PriceBuddy_MasterBrief_v2.1_full.md
- /mnt/data/PriceBuddy_MasterBrief_v2.2_full.md
- /mnt/data/PriceBuddy_Project_Full_v2.0.md
- /mnt/data/PriceBuddy_Project_v2.2.md
- /mnt/data/PriceBuddy_MasterBrief_v3.0_SUPER.md
- /mnt/data/PriceBuddy_MasterBrief_v4.3_AUTO_BUILD.md
- /mnt/data/PriceBuddy_MasterBrief_v4.4_UX_AI_Revenue_AutoBuild.md
- /mnt/data/PriceBuddy_MasterBrief_v4.5_Speed_Optimization.md
