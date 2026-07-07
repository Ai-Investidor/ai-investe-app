-- Adiciona parâmetro opcional p_sort_pinned_first à busca de sessões de chat,
-- priorizando sessões fixadas antes do LIMIT ser aplicado.
drop function if exists public.search_chat_sessions(text, integer);

create function public.search_chat_sessions(
  p_term text,
  p_limit integer default 20,
  p_sort_pinned_first boolean default true
)
returns table(session_id text, user_id uuid, title text, created_at timestamptz,
              updated_at timestamptz, metadata jsonb, pinned boolean, relevance real)
language plpgsql
stable
set search_path to 'public', 'extensions'
as $function$
declare
  v_uid  uuid := auth.uid();
  v_term text := immutable_unaccent(lower(trim(coalesce(p_term, ''))));
  v_like text;
begin
  if v_uid is null then
    raise exception 'Usuário não autenticado';
  end if;

  if p_limit < 1 or p_limit > 100 then
    raise exception 'p_limit deve estar entre 1 e 100, recebido: %', p_limit;
  end if;

  if v_term = '' then
    return query
      select s.session_id, s.user_id, s.title, s.created_at, s.updated_at, s.metadata,
             s.pinned, 1.0::real
      from public.chat_sessions s
      where s.user_id = v_uid
      order by (case when p_sort_pinned_first then s.pinned else false end) desc,
               s.updated_at desc
      limit p_limit;
    return;
  end if;

  v_like := '%' || replace(replace(replace(v_term, '\', '\\'), '%', '\%'), '_', '\_') || '%';

  return query
    select s.session_id, s.user_id, s.title, s.created_at, s.updated_at, s.metadata,
           s.pinned,
           word_similarity(v_term, immutable_unaccent(lower(s.title)))::real as relevance
    from public.chat_sessions s
    where s.user_id = v_uid
      and (
        immutable_unaccent(lower(s.title)) like v_like
        or v_term <% immutable_unaccent(lower(s.title))
      )
    order by (case when p_sort_pinned_first then s.pinned else false end) desc,
             relevance desc, s.updated_at desc
    limit p_limit;
end;
$function$;

grant execute on function public.search_chat_sessions(text, integer, boolean)
  to anon, authenticated, service_role;
