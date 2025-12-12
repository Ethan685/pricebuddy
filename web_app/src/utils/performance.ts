import { onCLS, onINP, onLCP } from 'web-vitals';
import { api } from '../api/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sendToAnalytics(metric: any) {
    // Log non-blocking to GA via our API helper
    api.logEvent('web_vitals', {
        name: metric.name,
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
    });

    // Dev logging
    console.log(`[Web Vitals] ${metric.name}:`, metric.value);
}

export function reportWebVitals() {
    onCLS(sendToAnalytics);
    onINP(sendToAnalytics);
    onLCP(sendToAnalytics);
}
