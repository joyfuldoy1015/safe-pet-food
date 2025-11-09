-- Q&A Threads: one or more Q&A threads per review_log
create table if not exists public.qa_threads (
  id uuid primary key default gen_random_uuid(),
  log_id uuid not null references public.review_logs(id) on delete cascade,
  title text not null,
  author_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);

-- Posts: question/answer/comment in a thread (tree via parent_id)
create table if not exists public.qa_posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.qa_threads(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  kind text check (kind in ('question','answer','comment')) not null,
  content text not null,
  parent_id uuid null references public.qa_posts(id) on delete cascade,
  is_accepted boolean default false,
  upvotes int default 0,
  created_at timestamptz default now()
);

alter table public.qa_threads enable row level security;
alter table public.qa_posts enable row level security;

-- RLS (read all; write own)
create policy "qa_threads read all" on public.qa_threads for select using (true);
create policy "qa_threads insert self" on public.qa_threads for insert with check (author_id = auth.uid());
create policy "qa_threads update owner" on public.qa_threads for update using (author_id = auth.uid());
create policy "qa_threads delete owner" on public.qa_threads for delete using (author_id = auth.uid());

create policy "qa_posts read all" on public.qa_posts for select using (true);
create policy "qa_posts insert self" on public.qa_posts for insert with check (author_id = auth.uid());
create policy "qa_posts update self" on public.qa_posts for update using (author_id = auth.uid());
create policy "qa_posts delete self" on public.qa_posts for delete using (author_id = auth.uid());

-- Optional helper view: best (accepted) answer per log
create or replace view public.qa_best_answer_per_log as
select
  t.log_id,
  p.id as post_id,
  left(regexp_replace(p.content, E'[\\n\\r]+', ' ', 'g'), 120) as excerpt
from qa_threads t
join qa_posts p on p.thread_id = t.id
where p.kind = 'answer' and p.is_accepted = true;

