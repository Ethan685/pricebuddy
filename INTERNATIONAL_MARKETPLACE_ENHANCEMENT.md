# 해외 마켓플레이스 기능 강화 완료 보고서

**작성일**: 2024-12-12  
**작업 내용**: 해외 마켓플레이스 가격 트래킹, 캐시백, 스크래퍼, Chrome Extension 강화

---

## ✅ 완료된 작업

### 1. 해외 마켓플레이스 가격 트래킹 기능 강화

#### 다국가 지원 추가
- **이전**: 모든 가격 계산이 "KR" (한국) 기준으로 하드코딩
- **개선**: 사용자 국가 기반 가격 계산 지원

**업데이트된 파일:**
- `services/api/src/routes/price-tracking.ts`: `country` 파라미터 추가
- `services/api/src/routes/price-scheduler.ts`: offer에 저장된 country 사용
- `services/api/src/routes/product-detail.ts`: 쿼리 파라미터로 country 받기

**사용 예시:**
```typescript
// 가격 추적 시 국가 지정
POST /price-tracking/track
{
  "url": "https://amazon.com/product",
  "marketplace": "amazon_us",
  "country": "US" // 사용자 국가
}

// 상품 상세 조회 시 국가 지정
GET /products/:productId?country=US
```

---

### 2. 해외 마켓플레이스별 캐시백 비율 추가

#### 추가된 캐시백 비율 (50+ 마켓플레이스)

**Amazon 계열**: 2%
- amazon_jp, amazon_us, amazon_uk, amazon_ca
- amazon_de, amazon_fr, amazon_it, amazon_es
- amazon_au, amazon_sg, amazon_mx, amazon_br

**eBay 계열**: 1.5%
- ebay, ebay_us, ebay_uk, ebay_de
- ebay_fr, ebay_it, ebay_es, ebay_au

**미국 소매업체**: 1-1.5%
- walmart: 1%
- target: 1%
- bestbuy: 1%
- costco: 1%
- newegg: 1.5%

**일본**: 1.5-2%
- rakuten: 2%
- mercari: 1.5%
- yahoo_jp: 1.5%

**유럽**: 1.5-2%
- zalando: 2%
- asos: 2%
- mediamarkt, saturn, otto, bol, cdiscount, fnac: 1.5%

**아시아 태평양**: 1.5-2%
- lazada: 2%
- shopee: 2%
- jd: 1.5%
- flipkart: 1.5%

**중국**: 2-3%
- aliexpress: 3%
- taobao: 2%
- tmall: 2%

**라틴 아메리카**: 2%
- mercadolibre: 2%

**기타**: 1.5-2%
- etsy: 2%
- wish: 2%
- wayfair: 1.5%
- overstock: 1.5%
- allegro: 1.5%

---

### 3. 해외 마켓플레이스별 Chrome Extension 감지 강화

#### 추가된 마켓플레이스 감지

**Amazon 지역별 감지:**
- amazon.co.jp → amazon_jp
- amazon.co.uk → amazon_uk
- amazon.ca → amazon_ca
- amazon.de → amazon_de
- amazon.fr → amazon_fr
- amazon.it → amazon_it
- amazon.es → amazon_es
- amazon.com.au → amazon_au
- amazon.sg → amazon_sg
- amazon.com.mx → amazon_mx
- amazon.com.br → amazon_br
- amazon.com → amazon_us (기본값)

**eBay 지역별 감지:**
- ebay.co.uk → ebay_uk
- ebay.de → ebay_de
- ebay.fr → ebay_fr
- ebay.it → ebay_it
- ebay.es → ebay_es
- ebay.com.au → ebay_au
- ebay.com → ebay_us (기본값)

**주요 소매업체:**
- walmart.com → walmart
- target.com → target
- bestbuy.com → bestbuy
- costco.com → costco
- newegg.com → newegg

**중국 마켓플레이스:**
- aliexpress.com → aliexpress
- taobao.com → taobao
- tmall.com → tmall

**동남아시아:**
- lazada.com → lazada
- shopee.com → shopee

**유럽:**
- zalando.com → zalando
- asos.com → asos

---

### 4. 해외 마켓플레이스별 스크래퍼 정확도 향상

#### 추가된 전용 스크래퍼 설정

**새로 추가된 설정 파일:**
- `services/scraper/src/config/costco.ts` - Costco 전용 셀렉터
- `services/scraper/src/config/newegg.ts` - Newegg 전용 셀렉터
- `services/scraper/src/config/zalando.ts` - Zalando 전용 셀렉터
- `services/scraper/src/config/asos.ts` - ASOS 전용 셀렉터

**개선된 파서:**
- 이전: 공용 셀렉터 사용 (walmart, bestbuy 등)
- 개선: 각 마켓플레이스별 전용 셀렉터 사용

---

### 5. 해외 마켓플레이스별 배송비/관세 규칙 최적화

#### Amazon 지역별 배송비 최적화

**한국 배송 기준:**
- Amazon JP: 7,000원 + 1,200원/kg
- Amazon UK: 12,000원 + 1,800원/kg
- Amazon CA: 14,000원 + 1,900원/kg
- Amazon DE/FR/IT/ES: 13,000원 + 1,900원/kg
- Amazon AU: 12,000원 + 1,800원/kg
- Amazon SG: 8,000원 + 1,200원/kg
- Amazon MX: 10,000원 + 1,500원/kg
- Amazon BR: 11,000원 + 1,600원/kg

**관세 규칙 (이미 구현됨):**
- 한국: 15만원 미만 관세 면제
- 각 국가별 관세율 적용 (10-23%)

---

## 📊 개선 전후 비교

### 가격 트래킹
- **이전**: 한국 기준으로만 계산 (하드코딩)
- **개선**: 사용자 국가 기반 계산 지원

### 캐시백 비율
- **이전**: 2개 마켓플레이스만 (amazon_jp, amazon_us)
- **개선**: 50+ 마켓플레이스 지원

### Chrome Extension
- **이전**: Amazon US/JP, eBay 기본만 감지
- **개선**: Amazon 12개 지역, eBay 7개 지역, 주요 소매업체 감지

### 스크래퍼
- **이전**: 공용 셀렉터 사용
- **개선**: 마켓플레이스별 전용 셀렉터 사용

---

## 💡 기대 효과

### 1. 사용자 가치 향상
- **다국가 가격 비교**: 사용자 국가 기준으로 정확한 가격 계산
- **캐시백 확대**: 더 많은 마켓플레이스에서 캐시백 받기
- **자동 감지**: Chrome Extension으로 해외 쇼핑몰 자동 감지

### 2. 비즈니스 가치
- **제휴 수수료 확대**: 50+ 마켓플레이스 제휴
- **글로벌 사용자 확대**: 각 국가별 최적화된 경험 제공
- **경쟁력 강화**: 글로벌 최대 규모 가격 비교 서비스

### 3. 실제 사용 시나리오

#### 시나리오 1: 미국 사용자
```
사용자: "아이폰 15 Pro 찾고 있어" (미국 거주)
→ Amazon US: $999 + 배송비 $15 = $1,014
→ Walmart: $999 + 배송비 $12 = $1,011
→ Best Buy: $999 + 배송비 $13 = $1,012

✅ 최저가: Walmart $1,011
✅ 캐시백: $10.11 (1%)
✅ 국가: US (관세 없음)
```

#### 시나리오 2: 한국 사용자 (해외 직구)
```
사용자: "일본 한정 제품 찾고 있어" (한국 거주)
→ Amazon JP: ¥8,000 (약 72,000원) + 배송비 7,000원 = 79,000원
→ 관세: 0원 (15만원 미만)
→ 총액: 79,000원

✅ 캐시백: 1,580원 (2%)
✅ 국가: KR (관세 면제)
```

---

## 🚀 다음 단계 제안

### 1. 사용자 프로필에 국가 저장
- 사용자 가입 시 국가 선택
- 기본 국가 설정
- 다국가 지원 (여러 국가 비교)

### 2. 환율 실시간 업데이트
- 환율 API 연동
- 실시간 환율 반영
- 환율 변동 알림

### 3. 관세 계산 정확도 향상
- 상품 카테고리별 관세율
- 관세 면제 상품 자동 감지
- 관세 계산기 UI

### 4. 배송비 계산 정확도 향상
- 실제 배송비 API 연동
- 배송 옵션별 가격 비교
- 배송 시간 정보 추가

---

## 📈 통계

### 지원 마켓플레이스
- **한국**: 8개
- **일본**: 4개
- **미국/캐나다**: 9개
- **영국**: 3개
- **유럽**: 15개
- **아시아 태평양**: 7개
- **라틴 아메리카**: 3개
- **중국**: 3개
- **기타**: 5개

**총 57개 마켓플레이스 지원**

### 캐시백 지원
- **캐시백 지원 마켓플레이스**: 50+ 개
- **평균 캐시백 비율**: 1.5-2%
- **최고 캐시백 비율**: 5% (쿠팡)

---

## ✅ 완료 체크리스트

- [x] 가격 트래킹 다국가 지원
- [x] 해외 마켓플레이스 캐시백 비율 추가 (50+)
- [x] Chrome Extension 해외 마켓플레이스 감지 강화
- [x] 스크래퍼 정확도 향상 (전용 셀렉터)
- [x] 배송비/관세 규칙 최적화
- [x] 가격 스케줄러 다국가 지원
- [x] 상품 상세 조회 다국가 지원
- [x] 문서화 완료

---

**작업 완료!** 🎉

이제 사용자는 전 세계 57개 마켓플레이스에서 가격을 비교하고, 각 국가별로 최적화된 가격 계산과 캐시백을 받을 수 있습니다.

