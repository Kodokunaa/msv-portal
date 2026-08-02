# MSV Database Structure

The application separates identity, access history, profiles, reference values, organizational transactions, notifications, and auditing.

## Identity and access

- `users` — login identity, password hash, email verification, and account-status foreign key.
- `account_statuses` — Pending, Active, Rejected, Suspended, and Deactivated.
- `account_status_histories` — immutable history of status changes, actor, reason, and timestamp.
- `roles` — Member, Admin, and Manager.
- `user_roles` — role assignment and ending history.
- `member_profiles` — membership and optional personal information.
- `provincial_councils` — council reference data.
- `admin_council_assignments` — active and historical Provincial Admin scope.

## Payments

- `payment_types` — reusable payment categories.
- `payment_statuses` — Paid, Unpaid, Pending, and Partially Paid.
- `payments` — member payments with due and paid amounts.
- Voiding fields retain corrections without erasing the original transaction.

## Financial transparency

- `financial_record_types` — Income or Expense.
- `financial_categories` — reusable categories linked to a type.
- `financial_records` — organization-wide or council-scoped transactions.
- `publication_status` and `published_at` control member visibility.
- Voiding fields preserve historical records.

## Disciplinary records

- `violation_types` — reusable violation categories.
- `disciplinary_statuses` — case statuses.
- `disciplinary_records` — case number, member, violation, status, incident, description, action, visibility, and publication state.
- Voiding fields preserve historical cases.

## Accountability

- `audit_logs` — append-only history of authentication and important record actions.
- `notifications` — database copies of application decisions and account-status notifications.

## Normalization notes

- Repeated labels are stored in reference tables.
- Authentication data is separated from optional member-profile data.
- Provincial Admin is represented by an assignment rather than a duplicate role.
- Calculated financial totals are derived from current published transactions.
- Historical role, council, status, and void information is retained rather than overwritten or deleted.
