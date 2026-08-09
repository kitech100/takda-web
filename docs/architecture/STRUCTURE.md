# Takda coding structure

Takda uses a Laravel-first modular monolith. The admin web app and future React Native app share one source of truth for authentication, booking rules, permissions, queues, and analytics.

## Backend layout

```text
app/
  Actions/             One application command per class
    Appointments/      Booking and appointment mutations
    Shared/            Cross-domain archive and restore operations
  Domain/              Stateful domain services and concurrency controls
    Appointments/      Schedule locking and overlap checks
  Enums/               Stored business states and statuses
  Exceptions/          Domain failures rendered consistently for web/API
  Http/
    Controllers/       Thin request/response adapters
    Middleware/        HTTP concerns only
    Requests/          Validation and authorization for write endpoints
  Jobs/                Retryable asynchronous work
  Models/              Eloquent persistence and relationships
    Concerns/           Reusable model behavior such as public UUIDs
  Policies/            Record-level authorization
  Queries/             Read models shaped for pages and API responses
```

Controllers should validate input, authorize the operation, call an Action or Query, and return a response. Booking rules do not belong in controllers or React components.

## Frontend layout

```text
resources/js/
  actions/              Generated Wayfinder controller bindings
  components/           Reusable product and UI components
  hooks/                Reusable React behavior
  layouts/              Auth, settings, and authenticated app shells
  pages/                Inertia route-level screens
    auth/
    business/
    settings/
  routes/               Generated typed route bindings
  types/                Shared TypeScript contracts
```

When the Figma file is supplied for implementation, build primitives in `components/` first and compose them in `pages/`. Page files should not contain duplicated navigation or domain calculations.

## Data and booking rules

- MySQL stores timestamps in UTC. Each business, location, and appointment keeps its IANA timezone for display and booking calculations.
- Money is stored as integer minor units (`price_minor`), never floating point.
- Public routes and API payloads use UUID `public_id` values; numeric IDs remain internal.
- User-managed records use `SoftDeletes`. Archive and restore are explicit operations. Foreign keys use restrictive deletion rather than destructive cascades.
- Appointments should normally be cancelled, preserving their history and events. Their soft-delete column is a defensive administrative escape hatch.
- A booking transaction locks `staff_booking_days` for every affected local date before checking the blocked time range. This prevents two concurrent requests from assigning the same staff member overlapping appointments.
- Appointment rows snapshot duration, buffers, price, currency, and timezone so future catalog edits do not rewrite booking history.

## Authorization

Spatie roles cover platform access such as `platform-admin`. `business_memberships.role` covers business-specific owner, manager, receptionist, and staff access. Policies combine both layers; hiding a button in React is never considered authorization.

## Read/write separation

- Use an Action for a mutation that changes business state.
- Use a Query when a screen or endpoint needs a shaped read model.
- Use a Job for work that is slow, retryable, scheduled, or external.
- Use an event record/activity log for important transitions that need an audit trail.

The future mobile API should live under versioned `/api/v1` routes and call the same Actions and Queries as the web app rather than duplicating booking logic.

