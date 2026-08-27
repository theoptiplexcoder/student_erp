# Development Instructions & Environment Setup

## Supabase Realtime Configuration

### Calendar Events Synchronization

The Student Calendar (`CalendarView`) uses Supabase Realtime to instantly synchronize events created, updated, or deleted by the Institution Admin.

In order for the WebSocket broadcasts to reach the frontend clients, the `calendar_events` table **must** be added to the Supabase replication publication.

**Required Action:**
Run the following SQL command in your Supabase SQL Editor (or via a database migration) to enable realtime events for the calendar:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_events;
```

**Fallback Behavior:**
If this publication is not enabled, the application will not crash. However, the student calendar will lose its "instant" synchronization and will instead gracefully fall back to React Query's default caching behavior (which refetches the calendar data only upon window refocus or route navigation).
