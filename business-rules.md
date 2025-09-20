# Business Rules & Workflows

## 1. Multi-Tenancy and Entity Scoping

- Every data record (user, student, agency, offer letter, schedule, transaction, event, etc.) must be linked to exactly one **Account** (Tenant). 
    - This is enforced both in the database and all business logic.
- **Agency** is always a child of an Account, never standalone.
    - Each Account (Tenant) can have multiple Agencies.
    - An Agency may represent a partner, subagency, or external recruiter.
    - All agency-related records (users, offers, transactions) must include both `accountId` and `agencyId` references.
- Wherever it applies, users are also linked to an Account and (if relevant) an Agency.
    - Internal tenant staff (account users) have `agencyId` as null.
    - Agency staff users always have both `accountId` and `agencyId`.

---

## 2. Portal Organization and Access Control

### Superadmin Portal

- **Purpose:** System-level administration.
- **Responsibilities:**
    - Onboard new Accounts (Tenants).
    - Set up, activate, suspend, or delete Accounts.
    - Manage Account-level billing, subscriptions, status (active/trial/suspended).
    - View and manage all users, agencies, settings, and transactional data for support and compliance.
    - Has read-write access to all tenants and agencies for platform management purposes.
- **Restrictions:** 
    - Superadmin does **not** perform client workflow operations: does not create offers, payments, or handle business processes of tenants.

### Account Portal (Tenant Staff)

- **Scope:** Internal staff of an Account/tenant.
- **Role Hierarchy:**
    - **Admin**
        - Full control within the Account.
        - Can manage all users, agencies, students, offer letters, billing schedules, transactions, settings, and tenant-specific configurations.
        - Approves agency invitations, monitors all work within the tenant.
    - **Manager**
        - Inherits all User actions.
        - Can review or approve workflow steps (e.g., approve transactions, resolve disputes, validate offers/payments) for users under their responsibility.
    - **User**
        - Handles daily operational tasks: creating and managing students, offer letters, payments, uploading docs, and viewing data within their scope.
        - Cannot see or edit agencies, users, or data outside their permission level.
- **Data Rules:** 
    - All users and actions must always be inside their `accountId`.
    - Tenant Admins have no access to other tenants; strict isolation is enforced.

### Agency Portal

- **Scope:** Each Agency’s own staff and workflows within a specific tenant.
- **Role Hierarchy:** Same as above — Admin > Manager > User, but roles are scoped by (agency AND account).
    - **Agency Admin**
        - Manages all agency users, data, students, offer letters, payments, and history within that agency.
        - Cannot manage other agencies or parent account settings.
    - **Agency Manager**
        - Reviews, approves, or coordinates agency user work.
    - **Agency User**
        - Daily data entry, offers, transactions, document uploads, based on their permissions.
- **Data Rules:** 
    - Agency users can **only** access data with their specific `agencyId` and parent `accountId`.
    - No data sharing or visibility across agencies, even within the same Account.

---

## 3. Data Visibility & Separation

- **Strict vertical isolation:**  
    - No user or workflow (except superadmin) may see or affect any data outside their Account.
- **Strict agency isolation:**  
    - Agency users may never see, alter, or query another agency’s data—even within the same Account.
    - All data lists, filters, and permissions must always consider both `accountId` and `agencyId` context as applicable.

---

## 4. Core Workflow Rules

### Offer Letter Lifecycle

1. **Creation**:
    - Always linked to one Account and, if created by/for an agency, also to one Agency.
    - Contains all milestone/payment plan details (which are expanded as PaymentScheduleItems).
    - New versions may be created if terms change (deferral, withdrawal, or fee update), with previous versions retired but never deleted.
2. **Amendment/Retirement**:
    - Historical offer letters and their schedules remain for audit/compliance.
    - New offer letters or schedules supersede old, with `replacedBy` links made explicit.

### Payment Schedule Items

- Represent contractual/fee milestones based on the offer letter (e.g., deposit, tuition term, bonuses).
- On change or update (e.g., deferment or schedule revision), previous items are soft-retired (isActive=false, replacedById set) and new items added for new terms/schedules.
- No schedule is ever deleted; all historical data is preserved.

### Billing Transactions

- Only created **in response to real money events**: a claim, a payment received, a dispute initiated, or a partial correction.
- Multiple transactions may be attached to the same PaymentScheduleItem for scenarios like partial payment, dispute, chargeback, or adjustment.
- **Status lifecycle:**  
    - **Pending**: Scheduled, no action yet.
    - **Claimed**: Billing action initiated (claim sent to payer).
    - **Paid**: Payment(s) received (may be full or partial).
    - **Disputed**: Payer objects, discrepancy flagged.
    - **Cancelled**: Transaction removed from further workflow (e.g., written off, agreement ended).

### Billing Event History

- Every status change or important event (payment, claim, dispute, correction, attachment upload) creates an insert-only record.
- Events cannot be deleted or edited after creation; forms the definitive audit trail of all workflow activity.
- Includes: event type, description, timestamp, user, relevant doc/file upload.

### Agency Commission/Bonus

- Each agency’s commission or bonus is calculated per their record (`commissionSplitPercent`, bonus rules).
- Commission and bonus payouts are always attached to and traceable by both Agency and their parent Account.
- Matching PaymentScheduleItem and BillingTransaction entries are generated for bonus/commission events.

---

## 5. Audit, Compliance & Traceability

- All changes and every record must log:
    - `created_at`, `updated_at` timestamps
    - `created_by` user reference
- Never destroy or overwrite critical data; always “retire” or “supersede” via a replacement link.
- The event history must enable complete reconstruction of who did what, when, and why for any record in the system.
- All audit logs are accessible by the record’s owning Account, and by Superadmin.

---

## 6. Security & RBAC

- All endpoints and workflows:
    - Check current user’s portal (superadmin/account/agency), role, and linked `accountId` (and, for agency users, `agencyId`).
    - Explicitly forbid cross-account access at all times.
    - Forbid cross-agency data access for any user not at the superadmin or top-level account admin.
- **Hierarchy:** Admin > Manager > User in both Account and Agency portals; permissions are additive and inherited.
- Any violation or attempt to exceed role/data boundaries MUST be logged and blocked.

---

> **Keep this document visible to the coding team at all times. Any additions, API endpoints, UI features, workflows or background jobs must be checked against these business rules. If ambiguity arises, halt and clarify before proceeding.**
