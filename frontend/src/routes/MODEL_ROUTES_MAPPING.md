# Model-Driven Route Architecture

This document outlines the complete alignment between backend models, Redux slices, and frontend routes in our application.

## Architecture Overview

Our routing system follows a **Model-Driven Development** approach where:
1. **Backend Models** define the data structure
2. **Controllers** provide API endpoints
3. **Redux Slices** manage frontend state with async thunks
4. **Frontend Routes** provide CRUD interfaces aligned with slice operations

## Model-to-Route Mapping

### 1. Users Model
- **Backend**: `users.controller.js` (7 functions)
- **Redux Slice**: `users.slice.js` (7 async thunks)
- **Routes**: `/users/*` via `UsersRoutes.jsx`
- **CRUD Operations**:
  - `GET /users` → `fetchUsers` → `/users`
  - `GET /users/:id` → `fetchUserById` → `/users/:userId`
  - `POST /users` → `createUser` → `/users/create`
  - `PUT /users/:id` → `updateUser` → `/users/:userId/edit`
  - `DELETE /users/:id` → `deleteUser` → (handled in list/detail views)
  - `PATCH /users/:id/toggle-status` → `toggleUserStatus` → (handled in detail view)
  - `PATCH /users/:id/change-password` → `changeUserPassword` → (handled in profile view)

### 2. Accounts Model
- **Backend**: `accounts.controller.js` (8 functions)
- **Redux Slice**: `accounts.slice.js` (8 async thunks)
- **Routes**: `/accounts/*` via `AccountsRoutes.jsx`
- **CRUD Operations**:
  - `GET /accounts` → `fetchAccounts` → `/accounts`
  - `GET /accounts/:id` → `fetchAccountById` → `/accounts/:accountId`
  - `POST /accounts` → `createAccount` → `/accounts/create`
  - `PUT /accounts/:id` → `updateAccount` → `/accounts/:accountId/edit`
  - `DELETE /accounts/:id` → `deleteAccount` → (handled in list/detail views)
  - `PATCH /accounts/:id/toggle-status` → `toggleAccountStatus` → (handled in detail view)
  - `PUT /accounts/:id/billing` → `updateAccountBilling` → `/accounts/:accountId/billing`
  - `GET /accounts/:id/stats` → `fetchAccountStats` → `/accounts/:accountId/stats`

### 3. Agencies Model
- **Backend**: `agencies.controller.js` (7 functions)
- **Redux Slice**: `agencies.slice.js` (7 async thunks)
- **Routes**: `/agencies/*` via `AgenciesRoutes.jsx`
- **CRUD Operations**:
  - `GET /agencies` → `fetchAgencies` → `/agencies`
  - `GET /agencies/:id` → `fetchAgencyById` → `/agencies/:agencyId`
  - `POST /agencies` → `createAgency` → `/agencies/create`
  - `PUT /agencies/:id` → `updateAgency` → `/agencies/:agencyId/edit`
  - `DELETE /agencies/:id` → `deleteAgency` → (handled in list/detail views)
  - `PATCH /agencies/:id/toggle-status` → `toggleAgencyStatus` → (handled in detail view)
  - `GET /agencies/:id/stats` → `fetchAgencyStats` → `/agencies/:agencyId/stats`

### 4. Billing Event Histories Model
- **Backend**: `billing-event-histories.controller.js` (15 functions)
- **Redux Slice**: `billing-event-histories.slice.js` (15 async thunks)
- **Routes**: `/billing-event-histories/*` via `BillingEventHistoriesRoutes.jsx`
- **CRUD Operations**:
  - `GET /billing-event-histories` → `fetchBillingEventHistories` → `/billing-event-histories`
  - `GET /billing-event-histories/:id` → `fetchBillingEventHistoryById` → `/billing-event-histories/:id`
  - `POST /billing-event-histories` → `createBillingEventHistory` → `/billing-event-histories/create`
  - `PUT /billing-event-histories/:id` → `updateBillingEventHistory` → `/billing-event-histories/:id/edit`
  - `DELETE /billing-event-histories/:id` → `deleteBillingEventHistory` → (handled in list/detail views)
  - `PATCH /billing-event-histories/:id/approve` → `approveBillingEventHistory` → (handled in detail view)
  - `PATCH /billing-event-histories/:id/retire` → `retireBillingEventHistory` → (handled in detail view)
  - `PATCH /billing-event-histories/:id/replace` → `replaceBillingEventHistory` → (handled in detail view)
  - `PATCH /billing-event-histories/:id/complete` → `completeBillingEventHistory` → (handled in detail view)
  - `PATCH /billing-event-histories/:id/cancel` → `cancelBillingEventHistory` → (handled in detail view)
  - `GET /billing-event-histories/overdue` → `fetchOverdueBillingEventHistories` → `/billing-event-histories/overdue`
  - `GET /billing-event-histories/upcoming` → `fetchUpcomingBillingEventHistories` → `/billing-event-histories/upcoming`
  - `POST /billing-event-histories/generate-transactions` → `generateTransactions` → `/billing-event-histories/generate-transactions`
  - `POST /billing-event-histories/generate-recurring` → `generateRecurringBillingEventHistories` → (handled in list view)
  - `GET /billing-event-histories/stats` → `fetchBillingEventHistoryStats` → `/billing-event-histories/stats`

### 5. Payment Schedules Model
- **Backend**: `payment-schedule-items.controller.js` (15 functions)
- **Redux Slice**: `payment-schedules.slice.js` (15 async thunks)
- **Routes**: `/payment-schedules/*` via `PaymentSchedulesRoutes.jsx`
- **CRUD Operations**:
  - `GET /payment-schedule-items` → `fetchPaymentScheduleItems` → `/payment-schedules`
  - `GET /payment-schedule-items/:id` → `fetchPaymentScheduleItemById` → `/payment-schedules/:id`
  - `POST /payment-schedule-items` → `createPaymentScheduleItem` → `/payment-schedules/create`
  - `PUT /payment-schedule-items/:id` → `updatePaymentScheduleItem` → `/payment-schedules/:id/edit`
  - `DELETE /payment-schedule-items/:id` → `deletePaymentScheduleItem` → (handled in list/detail views)
  - `PATCH /payment-schedule-items/:id/approve` → `approvePaymentScheduleItem` → (handled in detail view)
  - `PATCH /payment-schedule-items/:id/retire` → `retirePaymentScheduleItem` → (handled in detail view)
  - `PATCH /payment-schedule-items/:id/replace` → `replacePaymentScheduleItem` → (handled in detail view)
  - `PATCH /payment-schedule-items/:id/complete` → `completePaymentScheduleItem` → (handled in detail view)
  - `PATCH /payment-schedule-items/:id/cancel` → `cancelPaymentScheduleItem` → (handled in detail view)
  - `GET /payment-schedule-items/overdue` → `fetchOverduePaymentScheduleItems` → `/payment-schedules/overdue`
  - `GET /payment-schedule-items/upcoming` → `fetchUpcomingPaymentScheduleItems` → `/payment-schedules/upcoming`
  - `POST /payment-schedule-items/generate-transactions` → `generateTransactions` → `/payment-schedules/generate-transactions`
  - `POST /payment-schedule-items/generate-recurring` → `generateRecurringPaymentScheduleItems` → (handled in list view)
  - `GET /payment-schedule-items/stats` → `fetchPaymentScheduleItemStats` → `/payment-schedules/stats`

### 6. Billing Transactions Model
- **Backend**: `billing-transactions.controller.js`
- **Redux Slice**: `billing-transactions.slice.js`
- **Routes**: `/billing-transactions/*` via `BillingTransactionsRoutes.jsx`
- **Operations**:
  - Transaction listing and details
  - Commission tracking
  - Transaction reports

### 7. Offer Letters Model
- **Backend**: `offer-letters.controller.js`
- **Redux Slice**: `offer-letters.slice.js`
- **Routes**: `/offer-letters/*` via `OfferLettersRoutes.jsx`
- **CRUD Operations**:
  - List, create, edit, delete offer letters
  - Preview functionality

## Route Access Control

### Permission-Based Access:
- **Superadmin Routes**: `/users/*`, `/accounts/*`, `/agencies/*`
- **Account Portal Routes**: `/billing-event-histories/*`, `/payment-schedules/*`, `/billing-transactions/*`, `/offer-letters/*`
- **Agency Portal Routes**: Limited access through portal-specific views

## Route Structure Benefits

1. **Consistency**: Every model follows the same routing pattern
2. **Predictability**: URLs are intuitive and follow REST conventions
3. **Maintainability**: Easy to add new models or modify existing ones
4. **Scalability**: Clear separation of concerns between models
5. **Type Safety**: Each route file is dedicated to its model's operations
6. **Performance**: Lazy loading for all route components

## Integration with Redux

Each route component can directly use the corresponding slice's:
- **Async Thunks**: For API operations
- **Selectors**: For accessing state data
- **Actions**: For UI state management

This creates a seamless flow from user interaction → route → slice → API → backend model.