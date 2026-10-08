create extension if not exists vector with schema extensions;

create table public.rag_documents (
  id uuid primary key default gen_random_uuid(),
  corpus_version text not null,
  course_slug text not null,
  course_title text not null,
  document_title text not null,
  source_file text not null,
  source_kind text not null
    check (source_kind in ('module_pdf', 'program_overview')),
  source_sha256 text not null
    check (source_sha256 ~ '^[0-9a-f]{64}$'),
  route_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_slug, source_file, source_kind)
);

create table public.rag_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null
    references public.rag_documents(id) on delete cascade,
  corpus_version text not null,
  chunking_version text not null,
  course_slug text not null,
  course_title text not null,
  module_slug text,
  module_number integer check (module_number is null or module_number > 0),
  module_title text,
  section_path text[] not null default '{}',
  section_title text,
  subsection_title text,
  document_title text not null,
  source_file text not null,
  source_kind text not null
    check (source_kind in ('module_pdf', 'program_overview')),
  source_sha256 text not null
    check (source_sha256 ~ '^[0-9a-f]{64}$'),
  page_start integer not null check (page_start > 0),
  page_end integer not null check (page_end >= page_start),
  chunk_index integer not null check (chunk_index >= 0),
  content text not null check (length(trim(content)) > 0),
  content_sha256 text not null
    check (content_sha256 ~ '^[0-9a-f]{64}$'),
  character_count integer not null check (character_count > 0),
  word_count integer not null check (word_count > 0),
  language text not null default 'es' check (language = 'es'),
  route_path text,
  embedding_model text not null,
  embedding_dimensions integer not null check (embedding_dimensions = 768),
  embedding extensions.vector(768) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rag_chunks_module_metadata_consistent check (
    (
      source_kind = 'module_pdf'
      and module_slug is not null
      and module_number is not null
      and module_title is not null
    )
    or (
      source_kind = 'program_overview'
      and module_slug is null
      and module_number is null
      and module_title is null
    )
  ),
  unique (course_slug, corpus_version, chunking_version, content_sha256)
);

create index rag_chunks_document_id_idx
  on public.rag_chunks(document_id);

create index rag_chunks_course_module_idx
  on public.rag_chunks(course_slug, module_slug);

alter table public.rag_documents enable row level security;
alter table public.rag_documents force row level security;
alter table public.rag_chunks enable row level security;
alter table public.rag_chunks force row level security;

revoke all on table public.rag_documents from public, anon, authenticated;
revoke all on table public.rag_chunks from public, anon, authenticated;

grant select, insert, update, delete
  on table public.rag_documents to service_role;
grant select, insert, update, delete
  on table public.rag_chunks to service_role;

create or replace function public.match_rag_chunks(
  p_query_embedding extensions.vector(768),
  p_course_slug text,
  p_module_slug text default null,
  p_match_count integer default 10
)
returns table (
  chunk_id uuid,
  document_id uuid,
  content text,
  course_slug text,
  course_title text,
  module_slug text,
  module_number integer,
  module_title text,
  section_path text[],
  section_title text,
  subsection_title text,
  document_title text,
  source_file text,
  source_kind text,
  source_sha256 text,
  page_start integer,
  page_end integer,
  content_sha256 text,
  route_path text,
  similarity double precision
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    chunks.id as chunk_id,
    chunks.document_id,
    chunks.content,
    chunks.course_slug,
    chunks.course_title,
    chunks.module_slug,
    chunks.module_number,
    chunks.module_title,
    chunks.section_path,
    chunks.section_title,
    chunks.subsection_title,
    chunks.document_title,
    chunks.source_file,
    chunks.source_kind,
    chunks.source_sha256,
    chunks.page_start,
    chunks.page_end,
    chunks.content_sha256,
    chunks.route_path,
    1 - (chunks.embedding OPERATOR(extensions.<=>) p_query_embedding) as similarity
  from public.rag_chunks as chunks
  where chunks.course_slug = p_course_slug
    and (p_module_slug is null or chunks.module_slug = p_module_slug)
  order by chunks.embedding OPERATOR(extensions.<=>) p_query_embedding
  limit least(greatest(coalesce(p_match_count, 10), 1), 50);
$$;

revoke all on function public.match_rag_chunks(
  extensions.vector,
  text,
  text,
  integer
) from public, anon, authenticated;

grant execute on function public.match_rag_chunks(
  extensions.vector,
  text,
  text,
  integer
) to service_role;
