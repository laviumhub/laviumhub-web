create or replace function public.move_active_banner_order(
  p_banner_id uuid,
  p_direction text
)
returns void
language plpgsql
as $$
declare
  v_current_order integer;
  v_swap_id uuid;
  v_swap_order integer;
begin
  if p_direction not in ('up', 'down') then
    raise exception 'Invalid direction. Use up or down.';
  end if;

  select active_order
  into v_current_order
  from public.banners
  where id = p_banner_id
    and is_active = true;

  if v_current_order is null then
    perform public.reindex_active_banner_orders();
    return;
  end if;

  if p_direction = 'up' then
    select id, active_order
    into v_swap_id, v_swap_order
    from public.banners
    where is_active = true
      and active_order < v_current_order
    order by active_order desc
    limit 1;
  else
    select id, active_order
    into v_swap_id, v_swap_order
    from public.banners
    where is_active = true
      and active_order > v_current_order
    order by active_order asc
    limit 1;
  end if;

  if v_swap_id is null then
    return;
  end if;

  update public.banners
  set active_order = v_swap_order
  where id = p_banner_id;

  update public.banners
  set active_order = v_current_order
  where id = v_swap_id;

  perform public.reindex_active_banner_orders();
end;
$$;
