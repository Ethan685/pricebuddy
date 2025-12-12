# PriceBuddy MasterBrief v4.7 — FULL CONSOLIDATED (2025-12-07 업데이트)

(v1.1 → v4.6 전체 사양 포함, 최신 진행상황 반영판)

---

## 0. Executive Overview
- **프로젝트명**: PriceBuddy
- **USP**: 실결제가(환율·배송·관세·부가세 포함) 기반 글로벌/국내 최저가 비교 + AI 가격예측 + 대체상품 추천 + 리뷰 요약 + 쿠폰/캐시백 자동 적용
- **출시 Surface**: App(Flutter), Web(React), Browser Extension(MV3), B2B Dashboard
- **AI 기반 핵심**: Hybrid SKU Matcher(text+image), Event-Aware Price Forecast, Emotion Cluster Review Analyzer, Bandit Coupon Optimizer
- **수익**: Affiliate / Ads / Pro / Pro+ / B2B API / Data API
- **출시 목표**:
    - **베타 v1.6**: 2025-12-14
    - **정식 v2.0 GA**: 2025-12-28 (Speed Mode 반영)
    - **글로벌 v2.2**: 2026-03-05
    - **Growth Loop v4.6**: 2026-02부터 상시 적용

---

## 1. 개발 진행상황 (2025-12-07 기준)

### 1.1 MVP (완료)
- 가격 추적/이력/알림
- Import/Export
- 기본 파서 구조
- 확장 프로그램(MV3) 스텁
- 파서 안정화의 기초 완료
**진행률: 100%**

---

### 1.2 Phase 2 — v1.6 Beta (현재 진행률: 82%)

**이미 완료된 기능**
- Hybrid SKU Matching (Text+Image Embedding)
- 가격 예측(프로모션·환율 이벤트 반영)
- 리뷰 분석 Emotion-Cluster + Spam Filter
- 쿠폰 자동 적용(성공률 92%)
- Dynamic Feed v1
- Smart Digest (1·7·30일 메시지)
- Cloud Run 안정 파서
- 글로벌 규제 문구 자동 삽입

**남은 작업(12/7 기준)**
- Dynamic Feed 개인화 가중치 조정
- 캐시백 UX 마감
- Telemetry Log 시각화
- 베타 테스터 그룹에 전달 준비

**베타 출시 예상일: 2025-12-14 (안정적)**

---

### 1.3 Phase 3 — v2.0 GA (정식)

**현재 진행률: 약 18%**

**완료된 부분**
- Deployment Lock(D-5 QA)
- Speed Pipeline 적용
- Fraud ML Detector v0.5
- B2B 보고서 자동화 틀 구축

**예정 기능**
- 공동구매/커뮤니티 기능
- B2B 리포트 + API 완성본
- 환율·관세 캐시 고도화
- 4국(KR/JP/US/EU) 규제 검증

**정식 출시일: 2025-12-28 (확정)**

---

### 1.4 Global Expansion (v2.2) — 2026-03-05
- 현지 가격 포맷
- 소비세/부가세 자동 반영
- 현지 배송비 예측
- 글로벌 쿠폰/캠페인 엔진 통합

---

### 1.5 Growth Loop (v4.6) — 2026-02부터 상시
- Viral Share Cards (가격 하락 시 자동 공유 카드 생성)
- Smart Referral Loop (보상 기반 초대)
- Engagement ML (이탈·클릭 예측)
- Retention Mailer (1/7/30일)
- Promo Manager (AI 예산 분배)

---

## 2. AI Engine Summary

| 엔진 | 설명 | 상태 |
|---|---|---|
| Hybrid Matcher | Text + Image SKU 매칭 | 완료 |
| Price Forecast | 시계열 + 이벤트 기반 예측 | 완료 |
| Emotion Review | 감정 군집 기반 리뷰 분석 | 완료 |
| Bandit Optimizer | 쿠폰/프로모션 자동 선택 | 학습 중 |
| Fraud ML | 비정상 트래픽 차단 | 0.5버전 적용 |

---

## 3. UX / UI System
- Dynamic Feed (무검색 개인화 피드)
- 통합 결과 카드 (가격·배송·관세·쿠폰·리뷰·예측)
- Smart Digest (요약형 알림)
- WCAG AA 접근성
- 다크모드
- iOS·Android 네이티브 제스처 대응
- 브랜드 모션 가이드 적용

---

## 4. Monetization (업데이트 반영)

| 카테고리 | 내용 |
|---|---|
| Free | 광고 + 캐시백 미션 |
| Pro(4.9$) | 광고제거 + Fast Tracking + 확장알림 |
| Pro+(9.9$) | 가격예측 강화 + 대체추천 + B2B 소프트 기능 |
| B2B API | 리포트 / 대량 모니터링 / SKU 분석 |
| Data API | 가격·수요·트렌드 메타데이터 판매 |

---

## 5. 일정 & 진척도 요약 (12/7 기준)

| 단계 | 일정 | 진행률 | 비고 |
|---|---|---|---|
| MVP | 8월 완료 | 100% | 완료 |
| v1.6 Beta | 12/14 | 82% | 안정화 중 |
| v2.0 GA | 12/28 | 18% | Speed Mode 적용 |
| v2.2 Global | 2026/03/05 | 5% | 초기 |
| v4.6 Growth | 2026/02~ | 10% | 학습 시스템 운영 |

---

## 6. 예상 순수익 (12/7 업데이트)

| 시점 | 월 순수익 | 근거 |
|---|---|---|
| 2025-12 (베타) | 1.1억 ~ 1.6억 | Affiliate + Ads + Early Pro |
| 2025-12-28 이후 (GA) | 8.8억 ~ 10.5억 | 전면 기능 가동 |
| 2026-02 (Growth) | 13.6억 ~ 17.5억 | Viral + Referral + Promo Manager |
| 2026-Q2 | 17억+ | 글로벌 4국 동시 운용 |

---

## 7. System Architecture
- Cloud Run 기반 컨테이너 오토스케일
- Firebase 인증/데이터
- BigQuery 기반 통계
- PostgreSQL Replica → 고성능 읽기
- OpenTelemetry 기반 실시간 모니터링
- Token Auto-Rotation + HSTS
- Snapshot SHA 기반 롤백(1분 이내)

---

## 8. One-Click Deploy Pipeline
1. Pre-Build
2. Snapshot Merge
3. Auto Verify (AI Self-Validation)
4. Deployment Lock(D-5 QA)
5. Multi-Region Release
6. Telemetry Feedback
7. Auto Optimization Cycle

---

## 9. 다음 단계 (12/7~12/14)
- **Dynamic Feed 개인화 가중치 조정**
- **캐시백 페이지 UX 완성**
- **베타 빌드 QA 및 배포**
- **Pro+ 기능 라우팅**
- **글로벌 규제 검증 준비**

---

## 10. 결론 (12/7 기준)
PriceBuddy는 현재 전체 83% 수준으로 개발이 완료되었고, 정식 출시일까지 3주 남은 상태에서 속도·안정성 모두 양호한 루트를 타고 있습니다.
베타는 12/14, 정식은 12/28 확정이며 2026년 1~3월에 완전한 글로벌+성장 사이클이 가동될 예정입니다.
