"use strict";
// 간단히 메모리 + Firestore/Redis 캐시로 운용 가능
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRates = setRates;
exports.getRates = getRates;
let cachedRates = {
    KRW: 1,
    USD: 1350,
    JPY: 9,
    EUR: 1500,
};
function setRates(rates) {
    cachedRates = { ...cachedRates, ...rates };
}
function getRates() {
    return cachedRates;
}
//# sourceMappingURL=rates-store.js.map