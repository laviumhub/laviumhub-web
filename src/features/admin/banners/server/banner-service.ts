import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Banner, BannerUpsertInput } from "@/features/admin/banners/types";
import { deleteBannerImageByUrl, uploadBannerImage } from "@/features/admin/banners/server/banner-storage";

type BannerRow = {
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

function mapRowToBanner(row: BannerRow): Banner {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image_url: row.image_url,
    is_active: row.is_active,
    active_order: row.active_order,
    start_at: row.start_at,
    end_at: row.end_at,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function toIsoString(value: string | null, fieldName: string): string | null {
  if (value === null) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ${fieldName} value.`);
  }
  return parsed.toISOString();
}

function parseBoolean(raw: FormDataEntryValue | null): boolean {
  return String(raw ?? "false") === "true";
}

function parseActiveOrder(raw: FormDataEntryValue | null): number | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error("active_order must be a positive number.");
  }
  return parsed;
}

export function parseBannerInputFromFormData(formData: FormData): BannerUpsertInput {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startAtRaw = String(formData.get("start_at") ?? "").trim();
  const endAtRaw = String(formData.get("end_at") ?? "").trim();
  const isActive = parseBoolean(formData.get("is_active"));
  const activeOrder = parseActiveOrder(formData.get("active_order"));

  if (!title) throw new Error("Title is required.");
  if (!startAtRaw) throw new Error("start_at is required.");

  const startAt = toIsoString(startAtRaw, "start_at");
  const endAt = endAtRaw ? toIsoString(endAtRaw, "end_at") : null;

  if (!startAt) throw new Error("start_at is required.");
  if (endAt && new Date(startAt).getTime() > new Date(endAt).getTime()) {
    throw new Error("end_at must be after start_at.");
  }

  return {
    title,
    description: description || null,
    isActive,
    activeOrder: isActive ? activeOrder : null,
    startAt,
    endAt
  };
}

export function getImageFileFromFormData(formData: FormData): File | null {
  const entry = formData.get("image");
  if (!entry || typeof entry === "string") return null;
  return entry.size > 0 ? entry : null;
}

export async function listAdminBanners(): Promise<Banner[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("banners")
    .select("id,title,description,image_url,is_active,active_order,start_at,end_at,created_at,updated_at")
    .order("is_active", { ascending: false })
    .order("active_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list banners: ${error.message}`);
  return (data ?? []).map((row) => mapRowToBanner(row as BannerRow));
}

async function normalizeActiveBannerOrder(): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.rpc("reindex_active_banner_orders");
  if (error) {
    throw new Error(`Failed to normalize active banner order: ${error.message}`);
  }
}

export async function moveBannerActiveOrder(id: string, direction: "up" | "down"): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.rpc("move_active_banner_order", {
    p_banner_id: id,
    p_direction: direction
  });
  if (error) {
    throw new Error(`Failed to move banner order: ${error.message}`);
  }
}

async function getBannerById(id: string): Promise<Banner> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("banners")
    .select("id,title,description,image_url,is_active,active_order,start_at,end_at,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load banner: ${error.message}`);
  }
  if (!data) {
    throw new Error("Banner not found.");
  }
  return mapRowToBanner(data as BannerRow);
}

export async function createBanner(input: BannerUpsertInput, imageFile: File | null): Promise<Banner> {
  if (!imageFile) throw new Error("Image file is required.");

  const imageUrl = await uploadBannerImage(imageFile);
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("banners")
    .insert({
      title: input.title,
      description: input.description,
      image_url: imageUrl,
      is_active: input.isActive,
      active_order: input.isActive ? input.activeOrder : null,
      start_at: input.startAt,
      end_at: input.endAt
    })
    .select("id,title,description,image_url,is_active,active_order,start_at,end_at,created_at,updated_at")
    .single();

  if (error || !data) {
    await deleteBannerImageByUrl(imageUrl);
    throw new Error(`Failed to create banner: ${error?.message ?? "Unknown error"}`);
  }

  await normalizeActiveBannerOrder();
  return getBannerById(String((data as BannerRow).id));
}

export async function updateBanner(
  id: string,
  input: BannerUpsertInput,
  imageFile: File | null
): Promise<Banner> {
  const supabase = getSupabaseServerClient();
  const { data: current, error: currentError } = await supabase
    .from("banners")
    .select("id,image_url,active_order")
    .eq("id", id)
    .maybeSingle();

  if (currentError) {
    throw new Error(`Failed to read current banner: ${currentError.message}`);
  }

  if (!current) {
    throw new Error("Banner not found.");
  }

  let imageUrl = String(current.image_url);
  if (imageFile) {
    imageUrl = await uploadBannerImage(imageFile);
  }

  const { data, error } = await supabase
    .from("banners")
    .update({
      title: input.title,
      description: input.description,
      image_url: imageUrl,
      is_active: input.isActive,
      active_order: input.isActive ? (input.activeOrder ?? (current.active_order as number | null) ?? null) : null,
      start_at: input.startAt,
      end_at: input.endAt
    })
    .eq("id", id)
    .select("id,title,description,image_url,is_active,active_order,start_at,end_at,created_at,updated_at")
    .single();

  if (error || !data) {
    if (imageFile) {
      await deleteBannerImageByUrl(imageUrl);
    }
    throw new Error(`Failed to update banner: ${error?.message ?? "Unknown error"}`);
  }

  if (imageFile && current.image_url && current.image_url !== imageUrl) {
    await deleteBannerImageByUrl(String(current.image_url));
  }

  await normalizeActiveBannerOrder();
  return getBannerById(id);
}

export async function deleteBanner(id: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { data: current, error: readError } = await supabase
    .from("banners")
    .select("id,image_url")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    throw new Error(`Failed to read banner before delete: ${readError.message}`);
  }

  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) {
    throw new Error(`Failed to delete banner: ${error.message}`);
  }

  await normalizeActiveBannerOrder();

  if (current?.image_url) {
    await deleteBannerImageByUrl(String(current.image_url));
  }
}

export async function getActiveBanner(): Promise<Banner | null> {
  const supabase = getSupabaseServerClient();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("banners")
    .select("id,title,description,image_url,is_active,active_order,start_at,end_at,created_at,updated_at")
    .eq("is_active", true)
    .lte("start_at", nowIso)
    .or(`end_at.is.null,end_at.gte.${nowIso}`)
    .order("active_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch active banner: ${error.message}`);
  }

  return data ? mapRowToBanner(data as BannerRow) : null;
}
