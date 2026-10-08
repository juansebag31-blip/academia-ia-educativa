create unique index if not exists rag_chunks_course_source_chunk_idx
  on public.rag_chunks(course_slug, source_file, chunk_index);

drop function if exists public.match_rag_chunks(
  extensions.vector,
  text,
  text,
  integer
);

create function public.match_rag_chunks(
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
  chunk_index integer,
  word_count integer,
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
    chunks.chunk_index,
    chunks.word_count,
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
