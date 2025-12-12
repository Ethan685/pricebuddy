# Cashback UX Implementation Plan

## Goal
Implement the user-facing Cashback interface to allow users to view their accumulated rewards, check transaction history, and request payouts.

## Phase 1: Backend & Seed (Testing Support)
To properly verify the UI, we need a way to generate cashback events.
- **[MODIFY] `functions/src/api/wallet.ts`**: Add `simulateCashbackEarned` (Callable) for testing. This allows the user to "earn" money by clicking a button in the UI (simulating a purchase).

## Phase 2: Web Application
- **[NEW] `web_app/src/pages/CashbackPage.tsx`**:
    - **Header**: "My Rewards".
    - **Balance Card**: Display current `KRW` balance. "Withdraw" button (opens modal/prompt).
    - **History Section**: Real-time list of `cashback_ledger` (Earned vs Withdrawn).
    - **Demo Controls**: "Simulate earning 5,000 KRW" button (visible in dev mode).
- **[MODIFY] `web_app/src/App.tsx`**: Add `/cashback` route and Navigation link.

## Phase 3: Verification
1. Open `/cashback`.
2. Click "Simulate Earn" -> Verify Balance increases & Ledger adds entry.
3. Click "Withdraw" -> Verify Balance decreases & Ledger adds 'pending' withdrawal.

*Flutter implementation will follow in the next task.*
