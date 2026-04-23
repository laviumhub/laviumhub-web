import { randomUUID } from "node:crypto";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";

const BANNERS_BUCKET = "banner-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

let bucketEnsured = false;

async function ensureBucket() {
  if (bucketEnsured) return;

  const supabase = getSupabaseServerClient();
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw new Error(`Failed to check storage bucket: ${error.message}`);

  const exists = (buckets ?? []).some((bucket) => bucket.name === BANNERS_BUCKET);
  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket(BANNERS_BUCKET, {
      public: true,
      fileSizeLimit: `${MAX_IMAGE_BYTES}`
    });

    if (createError) {
      throw new Error(`Failed to create storage bucket: ${createError.message}`);
    }
  }

  bucketEnsured = true;
}

function sanitizeFileName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
}

export async function uploadBannerImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Banner image must be an image file.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Banner image exceeds maximum size (5MB).");
  }

  await ensureBucket();

  const supabase = getSupabaseServerClient();
  const safeName = sanitizeFileName(file.name || "banner-image");
  const filePath = `banners/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from(BANNERS_BUCKET).upload(filePath, bytes, {
    contentType: file.type,
    upsert: false
  });

  if (uploadError) {
    throw new Error(`Failed to upload banner image: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(BANNERS_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function deleteBannerImageByUrl(imageUrl: string | null | undefined): Promise<void> {
  if (!imageUrl) return;

  await ensureBucket();

  try {
    const parsed = new URL(imageUrl);
    const marker = `/storage/v1/object/public/${BANNERS_BUCKET}/`;
    const index = parsed.pathname.indexOf(marker);
    if (index === -1) return;

    const objectPath = parsed.pathname.slice(index + marker.length);
    if (!objectPath) return;

    const supabase = getSupabaseServerClient();
    const { error } = await supabase.storage.from(BANNERS_BUCKET).remove([objectPath]);
    if (error) {
      console.error("Failed to delete banner image from storage", error);
    }
  } catch {
    console.error("Invalid banner image URL, cannot delete from storage", imageUrl);
  }
}

export function getBannersBucketName(): string {
  return BANNERS_BUCKET;
}
