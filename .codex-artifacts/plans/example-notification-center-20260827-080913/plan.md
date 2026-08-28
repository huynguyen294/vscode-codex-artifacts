# Example plan: In-app notification center

## Goal

Add a lightweight notification center that lets signed-in users see recent product notifications, distinguish unread items, mark individual items as read, and clear the unread state for all visible items.

## Scope

The first release covers an in-app notification list, an unread badge in the main navigation, read-state persistence, pagination, and accessible empty, loading, and error states.

Email delivery, push notifications, notification preferences, bulk deletion, and administrator-authored broadcasts are outside this release.

## Product decisions

- Show notifications newest first and retain them for 30 days.
- Count only unread notifications in the navigation badge; display `99+` when the count exceeds 99.
- Mark a notification as read when the user opens it, while also offering an explicit “Mark all as read” action.
- Keep notification links internal to the application for the first release so navigation and authorization remain predictable.

## Implementation approach

### Data model and API

- Add a notification record containing the recipient, type, title, body, destination, creation time, and optional read time.
- Add endpoints to fetch a paginated list, fetch the unread count, mark one notification as read, and mark all current notifications as read.
- Enforce recipient ownership on every read and update operation; never accept a recipient ID from the client as authorization.
- Add indexes for recipient plus creation time and recipient plus read time to keep list and badge queries efficient.

### User interface

- Add a notification bell and unread badge to the authenticated navigation.
- Add a panel or page that renders notification rows with unread styling, timestamps, and destinations.
- Update the row optimistically when it is opened, then reconcile with the server response and restore the unread state if the request fails.
- Include keyboard navigation, visible focus states, semantic labels, and a polite live-region announcement when the unread count changes.

### Integration and rollout

- Introduce one reusable server-side notification creation service instead of writing records directly from feature code.
- Connect a single low-risk event source first, such as completion of a background export, to validate the end-to-end path.
- Protect the UI and event producer with a feature flag so deployment can precede activation.
- Add structured logs for notification creation failures and read-state update failures without logging notification body content.

## Verification

- Unit-test notification creation, recipient authorization, retention filtering, unread counting, and read-state transitions.
- Add API integration tests for pagination, ownership boundaries, idempotent read operations, and “mark all as read.”
- Add UI tests for badge updates, empty and error states, optimistic rollback, keyboard access, and navigation to a notification destination.
- Run a database query-plan check with a production-like notification volume and confirm the intended indexes are used.
- Perform a staged rollout with the feature flag enabled for internal users before general availability.

## Risks and mitigations

- High-volume event sources could create excessive rows. Apply event-specific deduplication keys and monitor creation rate before adding more producers.
- Badge counts can become stale across multiple browser tabs. Refresh on window focus and after local mutations; real-time synchronization can be added later if needed.
- A destination may no longer exist or the user may lose access. Recheck authorization at navigation time and show the normal not-found or access-denied experience.
- Notification content could expose sensitive data in logs or analytics. Treat titles and bodies as user-visible content and exclude them from telemetry.

## Completion criteria

- A signed-in user can view recent notifications and their unread state.
- Opening a notification persists its read state and updates the badge.
- “Mark all as read” is safe to retry and updates both the list and badge.
- Authorization tests prove users cannot read or modify another user’s notifications.
- The feature can be enabled or disabled without a new deployment.
