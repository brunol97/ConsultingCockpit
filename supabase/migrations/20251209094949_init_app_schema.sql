-- Enable required extensions
create extension if not exists "pgcrypto";

-- Profiles
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  title text,
  created_at timestamptz default now()
);

-- Organizations
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table if not exists public.organization_members (
  org_id uuid references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','consultant','viewer')),
  created_at timestamptz default now(),
  primary key (org_id, user_id)
);

-- Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table if not exists public.project_members (
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','editor','viewer')),
  created_at timestamptz default now(),
  primary key (project_id, user_id)
);

-- AI providers
create table if not exists public.ai_providers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null,
  api_key_encrypted text not null,
  model text,
  created_at timestamptz default now()
);

-- Decks & slides
create table if not exists public.decks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  status text default 'draft',
  presenton_template_id text,
  export_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.slides (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks(id) on delete cascade,
  sort_order int not null,
  content_json jsonb not null default '{}'::jsonb,
  speaker_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (deck_id, sort_order)
);

-- Business cases
create table if not exists public.business_cases (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  univer_workbook_json jsonb default '{}'::jsonb,
  version int default 1,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.business_case_scenarios (
  id uuid primary key default gen_random_uuid(),
  business_case_id uuid not null references public.business_cases(id) on delete cascade,
  name text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  status text not null default 'backlog' check (status in ('backlog','in_progress','review','done')),
  assignee_id uuid references auth.users(id),
  due_date date,
  type text check (type in ('deck','business_case','general')),
  deck_id uuid references public.decks(id),
  business_case_id uuid references public.business_cases(id),
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade,
  author_id uuid references auth.users(id),
  body text not null,
  created_at timestamptz default now()
);

create table if not exists public.task_labels (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz default now(),
  unique (org_id, name)
);

create table if not exists public.task_label_links (
  task_id uuid references public.tasks(id) on delete cascade,
  label_id uuid references public.task_labels(id) on delete cascade,
  primary key (task_id, label_id)
);

-- AI conversations
create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  context_type text not null,
  context_id uuid,
  messages_json jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Attachments
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  deck_id uuid references public.decks(id),
  business_case_id uuid references public.business_cases(id),
  task_id uuid references public.tasks(id),
  storage_path text not null,
  mime_type text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Events / audit
create table if not exists public.events_audit (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id),
  event_type text not null,
  payload jsonb,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_projects_org on public.projects(org_id);
create index if not exists idx_decks_project on public.decks(project_id);
create index if not exists idx_tasks_project on public.tasks(project_id);

-- Helper functions for RLS
create or replace function public.fn_is_org_member(org uuid)
returns boolean language sql stable as $$
  select exists (
    select 1
    from public.organization_members m
    where m.org_id = org and m.user_id = auth.uid()
  );
$$;

create or replace function public.fn_has_org_role(org uuid, roles text[])
returns boolean language sql stable as $$
  select exists (
    select 1
    from public.organization_members m
    where m.org_id = org and m.user_id = auth.uid()
      and m.role = any(roles)
  );
$$;

-- Enable RLS
alter table public.user_profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.ai_providers enable row level security;
alter table public.decks enable row level security;
alter table public.slides enable row level security;
alter table public.business_cases enable row level security;
alter table public.business_case_scenarios enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_labels enable row level security;
alter table public.task_label_links enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.attachments enable row level security;
alter table public.events_audit enable row level security;

-- Basic policies
create policy "profiles self" on public.user_profiles
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "orgs read member" on public.organizations
  using (fn_is_org_member(id));
create policy "orgs insert any" on public.organizations
  for insert with check (auth.uid() is not null);

create policy "org members read member" on public.organization_members
  using (fn_is_org_member(org_id));
create policy "org members write admin" on public.organization_members
  for all using (fn_has_org_role(org_id, array['admin']))
  with check (fn_has_org_role(org_id, array['admin']));

create policy "projects read member" on public.projects
  using (fn_is_org_member(org_id));
create policy "projects write admin" on public.projects
  for all using (fn_has_org_role(org_id, array['admin']))
  with check (fn_has_org_role(org_id, array['admin']));

create policy "project_members read member" on public.project_members
  using (fn_is_org_member((select org_id from public.projects p where p.id = project_id)));
create policy "project_members write admin" on public.project_members
  for all using (fn_has_org_role((select org_id from public.projects p where p.id = project_id), array['admin']))
  with check (fn_has_org_role((select org_id from public.projects p where p.id = project_id), array['admin']));

create policy "ai_providers read member" on public.ai_providers
  using (fn_is_org_member(org_id));
create policy "ai_providers write admin" on public.ai_providers
  for all using (fn_has_org_role(org_id, array['admin']))
  with check (fn_has_org_role(org_id, array['admin']));

create policy "decks read member" on public.decks
  using (fn_is_org_member(org_id));
create policy "decks write editor" on public.decks
  for all using (fn_has_org_role(org_id, array['admin','consultant']))
  with check (fn_has_org_role(org_id, array['admin','consultant']));

create policy "slides read member" on public.slides
  using (fn_is_org_member((select org_id from public.decks d where d.id = deck_id)));
create policy "slides write editor" on public.slides
  for all using (fn_has_org_role((select org_id from public.decks d where d.id = deck_id), array['admin','consultant']))
  with check (fn_has_org_role((select org_id from public.decks d where d.id = deck_id), array['admin','consultant']));

create policy "business_cases read member" on public.business_cases
  using (fn_is_org_member(org_id));
create policy "business_cases write editor" on public.business_cases
  for all using (fn_has_org_role(org_id, array['admin','consultant']))
  with check (fn_has_org_role(org_id, array['admin','consultant']));

create policy "business_case_scenarios read member" on public.business_case_scenarios
  using (fn_is_org_member((select org_id from public.business_cases bc where bc.id = business_case_id)));
create policy "business_case_scenarios write editor" on public.business_case_scenarios
  for all using (fn_has_org_role((select org_id from public.business_cases bc where bc.id = business_case_id), array['admin','consultant']))
  with check (fn_has_org_role((select org_id from public.business_cases bc where bc.id = business_case_id), array['admin','consultant']));

create policy "tasks read member" on public.tasks
  using (fn_is_org_member(org_id));
create policy "tasks write editor" on public.tasks
  for all using (fn_has_org_role(org_id, array['admin','consultant']))
  with check (fn_has_org_role(org_id, array['admin','consultant']));

create policy "task_comments read member" on public.task_comments
  using (fn_is_org_member((select org_id from public.tasks t where t.id = task_id)));
create policy "task_comments write editor" on public.task_comments
  for all using (fn_has_org_role((select org_id from public.tasks t where t.id = task_id), array['admin','consultant']))
  with check (fn_has_org_role((select org_id from public.tasks t where t.id = task_id), array['admin','consultant']));

create policy "task_labels read member" on public.task_labels
  using (fn_is_org_member(org_id));
create policy "task_labels write editor" on public.task_labels
  for all using (fn_has_org_role(org_id, array['admin','consultant']))
  with check (fn_has_org_role(org_id, array['admin','consultant']));

create policy "task_label_links read member" on public.task_label_links
  using (fn_is_org_member((select org_id from public.tasks t where t.id = task_id)));
create policy "task_label_links write editor" on public.task_label_links
  for all using (fn_has_org_role((select org_id from public.tasks t where t.id = task_id), array['admin','consultant']))
  with check (fn_has_org_role((select org_id from public.tasks t where t.id = task_id), array['admin','consultant']));

create policy "ai_conversations read member" on public.ai_conversations
  using (fn_is_org_member(org_id));
create policy "ai_conversations write editor" on public.ai_conversations
  for all using (fn_has_org_role(org_id, array['admin','consultant']))
  with check (fn_has_org_role(org_id, array['admin','consultant']));

create policy "attachments read member" on public.attachments
  using (fn_is_org_member(org_id));
create policy "attachments write editor" on public.attachments
  for all using (fn_has_org_role(org_id, array['admin','consultant']))
  with check (fn_has_org_role(org_id, array['admin','consultant']));

create policy "events read member" on public.events_audit
  using (fn_is_org_member(org_id));
create policy "events insert member" on public.events_audit
  for insert with check (fn_is_org_member(org_id));