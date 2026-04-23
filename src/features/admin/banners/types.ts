export type Banner = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  is_active: boolean;
  active_order: number | null;
  start_at: string;
  end_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BannerUpsertInput = {
  title: string;
  description: string | null;
  isActive: boolean;
  activeOrder: number | null;
  startAt: string;
  endAt: string | null;
};
