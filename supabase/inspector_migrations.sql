-- VeriShelf Inspector Mode - Supabase schema (additive, safe)

-- Table: inspector_links
create table if not exists inspector_links (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null,
  inspector_user_id uuid null,
  email text not null,
  scope_locations text[] null,
  scope_start timestamptz null,
  scope_end timestamptz null,
  status text not null default 'pending',
  token text null,
  expires_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Table: inspector_events
create table if not exists inspector_events (
  id uuid primary key default gen_random_uuid(),
  inspector_user_id uuid not null,
  owner_user_id uuid not null,
  event_type text not null,
  item_id bigint null,
  location text null,
  metadata jsonb null,
  created_at timestamptz not null default now()
);

-- Notes:
-- - Add foreign keys and RLS policies in your Supabase dashboard to link
--   owner_user_id / inspector_user_id to auth.users.id or users.id as appropriate.
-- - Ensure inspector roles are stored in auth user_metadata:
--     role: 'inspector'
--     linked_owner_id: <uuid of owner>

