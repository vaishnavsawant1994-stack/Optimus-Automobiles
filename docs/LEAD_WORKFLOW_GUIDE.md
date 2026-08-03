# Lead Workflow Guide

## Shared behavior

Enquiries, test drives, sell requests and contact messages support priority, assignment, follow-up, optimistic versioning, internal messages and append-only activity. Focused staff see only unassigned or self-assigned records; administrators can manage all queues.

## Enquiries

Typical flow:

```text
NEW -> ASSIGNED -> CONTACTED -> IN_PROGRESS
IN_PROGRESS <-> WAITING_FOR_CUSTOMER
IN_PROGRESS -> RESOLVED -> CLOSED
```

Cancellation and spam are terminal except that spam can be restored to new. Customer-visible messages are copied into the customer's engagement timeline. Internal notes remain only in `OperationalMessage`.

## Test drives

Requests can be confirmed, rescheduled, completed, cancelled, rejected or marked no-show according to the state machine. Confirmation checks the same vehicle/date/time for an existing confirmed slot. A successful schedule writes an activity, an operational customer message and the customer-account update.

## Sell requests

The operational path is submitted, review/contact, inspection, valuation, offer, negotiation/acceptance, documentation, payment processing and completion. Inspection stores condition scores and document/service-history verification. A final offer creates a customer-visible message and remains valid until the specified date.

## Contact messages

Public contact submissions receive atomic `DW-CON-YYYY-NNNNNN` references, persist in PostgreSQL and notify eligible staff. The allocator recovers if a persisted counter is behind existing records. Duplicate submissions within two minutes return the existing reference.

## Communication rules

- Never place passwords, tokens, payment details or unredacted documents in notes.
- Select customer-visible only for wording intended for the customer account.
- Use assignment and follow-up fields instead of informal ownership in notes.
- Resolve before closing; use spam/duplicate only when the record genuinely qualifies.
