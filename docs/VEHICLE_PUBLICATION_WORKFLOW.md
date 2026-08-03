# Vehicle Publication Workflow

## Separate concepts

Operational status and publication are separate:

- `DRAFT`: unpublished preparation state.
- `AVAILABLE`: may be published and enquired about.
- `RESERVED`: may remain published with a Reserved badge.
- `SOLD`: may remain published as sold history, with enquiry actions removed.
- `ARCHIVED`: always unpublished.

## Allowed transitions

```text
DRAFT -> AVAILABLE | ARCHIVED
AVAILABLE -> RESERVED | SOLD | ARCHIVED
RESERVED -> AVAILABLE | SOLD
SOLD -> ARCHIVED
ARCHIVED -> no transition
```

A reason is required for sold, archived and reserved-to-available transitions. Every change increments the record version and appends `VehicleStatusHistory` plus an audit entry.

## Readiness checklist

Publishing requires all of:

- public slug and stock number
- brand, model, variant and body type
- valid year, positive price and non-negative mileage
- fuel type and transmission
- public description of at least 20 characters
- valid public status (`AVAILABLE`, `RESERVED` or `SOLD`)
- one primary public image
- at least three non-document images

The API returns a scored checklist and `422 NOT_READY` when incomplete.

## Slugs

Initial slugs are generated from year, brand, model and variant and remain editable before publication. Changing a previously published slug creates `VehicleSlugRedirect`; old detail links return a permanent redirect and redirect loops are prevented by uniqueness and target handling.

## Concurrency

Vehicle edits and status operations carry an explicit version. A stale version returns `409 EDIT_CONFLICT`. Publication and bulk operations validate current database state again on the server.
