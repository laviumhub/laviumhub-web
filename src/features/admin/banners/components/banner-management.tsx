"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  FileInput,
  Group,
  Loader,
  Modal,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
  Title
} from "@mantine/core";
import {
  IconAlertCircle,
  IconArrowNarrowDown,
  IconArrowNarrowUp,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconTrash
} from "@tabler/icons-react";
import Image from "next/image";

import type { Banner } from "@/features/admin/banners/types";

type BannerResponse = {
  ok: boolean;
  message?: string;
  data?: Banner[] | Banner | null;
};

type BannerForceRefreshResponse = {
  ok: boolean;
  changed?: boolean;
  version?: string;
  message?: string;
};

type BannerFormState = {
  id: string | null;
  title: string;
  description: string;
  isActive: boolean;
  startAt: string;
  endAt: string;
  image: File | null;
  existingImageUrl: string;
};

function toLocalDateTimeInput(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function toIsoFromLocalInput(value: string): string {
  return new Date(value).toISOString();
}

function createDefaultFormState(): BannerFormState {
  const now = new Date();
  const plusOneDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return {
    id: null,
    title: "",
    description: "",
    isActive: false,
    startAt: toLocalDateTimeInput(now.toISOString()),
    endAt: toLocalDateTimeInput(plusOneDay.toISOString()),
    image: null,
    existingImageUrl: ""
  };
}

function getSafeActiveOrder(value: number | null): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : Number.MAX_SAFE_INTEGER;
}

function sortActiveBanners(items: Banner[]): Banner[] {
  return [...items].sort((a, b) => {
    const aOrder = getSafeActiveOrder(a.active_order);
    const bOrder = getSafeActiveOrder(b.active_order);
    if (aOrder !== bOrder) return aOrder - bOrder;

    const createdDiff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (createdDiff !== 0) return createdDiff;

    return a.id.localeCompare(b.id);
  });
}

export function BannerManagement() {
  const machineFetchIntervalMinutes = 5;
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null);
  const [reorderLoading, setReorderLoading] = useState<{ id: string; direction: "up" | "down" } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [activePreviewBanners, setActivePreviewBanners] = useState<Banner[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [imagePreviewModalOpen, setImagePreviewModalOpen] = useState(false);
  const [imagePreviewData, setImagePreviewData] = useState<{ url: string; title: string } | null>(null);
  const [forceRefreshModalOpen, setForceRefreshModalOpen] = useState(false);
  const [forceRefreshSecret, setForceRefreshSecret] = useState("");
  const [forceRefreshResult, setForceRefreshResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isForcingRefresh, setIsForcingRefresh] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [form, setForm] = useState<BannerFormState>(createDefaultFormState());

  const isEditing = useMemo(() => Boolean(form.id), [form.id]);

  const filteredBanners = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return banners;

    return banners.filter((item) => {
      const title = item.title.toLowerCase();
      const description = (item.description ?? "").toLowerCase();
      return title.includes(query) || description.includes(query);
    });
  }, [banners, searchText]);

  const activeBannersNow = useMemo(() => {
    const now = Date.now();
    return sortActiveBanners(
      banners
      .filter((item) => {
        if (!item.is_active) return false;

        const startAt = new Date(item.start_at).getTime();
        if (Number.isNaN(startAt) || startAt > now) return false;

        if (!item.end_at) return true;
        const endAt = new Date(item.end_at).getTime();
        if (Number.isNaN(endAt)) return false;

        return now <= endAt;
      })
    );
  }, [banners]);

  const hasActiveBannerNow = activeBannersNow.length > 0;
  const currentPreviewBanner = activePreviewBanners[previewIndex] ?? null;
  const activeOrderIndexById = useMemo(() => {
    const map = new Map<string, number>();
    activeBannersNow.forEach((item, index) => {
      map.set(item.id, index);
    });
    return map;
  }, [activeBannersNow]);

  async function loadBanners() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/banners", { cache: "no-store" });
      const payload = (await response.json()) as BannerResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Failed to load banners.");
      }

      const list = Array.isArray(payload.data) ? payload.data : [];
      setBanners(list);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load banners.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadBanners();
  }, []);

  function resetForm() {
    setForm(createDefaultFormState());
  }

  function openCreateModal() {
    resetForm();
    setErrorMessage(null);
    setFormModalOpen(true);
  }

  function openEditModal(item: Banner) {
    setForm({
      id: item.id,
      title: item.title,
      description: item.description ?? "",
      isActive: item.is_active,
      startAt: toLocalDateTimeInput(item.start_at),
      endAt: item.end_at ? toLocalDateTimeInput(item.end_at) : "",
      image: null,
      existingImageUrl: item.image_url
    });
    setErrorMessage(null);
    setFormModalOpen(true);
  }

  function openDeleteModal(item: Banner) {
    setBannerToDelete(item);
    setDeleteModalOpen(true);
  }

  function openImagePreview(item: Banner) {
    setImagePreviewData({ url: item.image_url, title: item.title });
    setImagePreviewModalOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsMutating(true);
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.set("title", form.title.trim());
      formData.set("description", form.description.trim());
      formData.set("is_active", String(form.isActive));
      formData.set("active_order", "");
      formData.set("start_at", toIsoFromLocalInput(form.startAt));
      formData.set("end_at", form.endAt ? toIsoFromLocalInput(form.endAt) : "");
      if (form.image) {
        formData.set("image", form.image);
      }

      const target = form.id ? `/api/admin/banners/${form.id}` : "/api/admin/banners";
      const method = form.id ? "PUT" : "POST";

      const response = await fetch(target, {
        method,
        body: formData
      });

      const payload = (await response.json()) as BannerResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Failed to save banner.");
      }

      await loadBanners();
      setFormModalOpen(false);
      resetForm();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save banner.");
    } finally {
      setIsSaving(false);
      setIsMutating(false);
    }
  }

  async function confirmDeleteBanner() {
    if (!bannerToDelete) return;

    setIsMutating(true);
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/admin/banners/${bannerToDelete.id}`, {
        method: "DELETE"
      });

      const payload = (await response.json()) as BannerResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Failed to delete banner.");
      }

      await loadBanners();
      setDeleteModalOpen(false);
      setBannerToDelete(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to delete banner.");
    } finally {
      setIsDeleting(false);
      setIsMutating(false);
    }
  }

  async function handleQuickToggle(item: Banner, nextActive: boolean) {
    setIsMutating(true);
    setToggleLoadingId(item.id);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.set("title", item.title);
      formData.set("description", item.description ?? "");
      formData.set("is_active", String(nextActive));
      formData.set("active_order", nextActive ? String(item.active_order ?? "") : "");
      formData.set("start_at", item.start_at);
      formData.set("end_at", item.end_at ?? "");

      const response = await fetch(`/api/admin/banners/${item.id}`, {
        method: "PUT",
        body: formData
      });

      const payload = (await response.json()) as BannerResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Failed to update banner status.");
      }

      await loadBanners();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update banner status.");
    } finally {
      setToggleLoadingId(null);
      setIsMutating(false);
    }
  }

  async function handleMoveOrder(item: Banner, direction: "up" | "down") {
    if (!item.is_active) return;
    setIsMutating(true);
    setReorderLoading({ id: item.id, direction });
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/banners/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: item.id,
          direction
        })
      });

      const payload = (await response.json()) as BannerResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Failed to reorder active banner.");
      }

      await loadBanners();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to reorder active banner.");
    } finally {
      setReorderLoading(null);
      setIsMutating(false);
    }
  }

  function openPreviewActiveBanner() {
    if (!activeBannersNow.length) return;
    setErrorMessage(null);
    setActivePreviewBanners(activeBannersNow);
    setPreviewIndex(0);
    setPreviewProgress(0);
    setPreviewModalOpen(true);
  }

  async function handleForceRefresh() {
    setIsForcingRefresh(true);
    setForceRefreshResult(null);

    try {
      const response = await fetch("/api/admin/banners/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          secret: forceRefreshSecret.trim()
        })
      });

      const payload = (await response.json()) as BannerForceRefreshResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Failed to force refresh banner cache.");
      }

      const message = payload.message ?? (payload.changed ? "Cache version updated." : "No banner changes detected.");
      setForceRefreshResult({ ok: true, message });
    } catch (error) {
      setForceRefreshResult({
        ok: false,
        message: error instanceof Error ? error.message : "Failed to force refresh banner cache."
      });
    } finally {
      setIsForcingRefresh(false);
    }
  }

  function goToPrevPreview() {
    if (!activePreviewBanners.length) return;
    setPreviewIndex((prev) => (prev === 0 ? activePreviewBanners.length - 1 : prev - 1));
    setPreviewProgress(0);
  }

  function goToNextPreview() {
    if (!activePreviewBanners.length) return;
    setPreviewIndex((prev) => (prev + 1) % activePreviewBanners.length);
    setPreviewProgress(0);
  }

  useEffect(() => {
    if (!previewModalOpen) return;
    if (activeBannersNow.length === 0) {
      setPreviewModalOpen(false);
      setActivePreviewBanners([]);
      setPreviewIndex(0);
      setPreviewProgress(0);
      return;
    }

    setActivePreviewBanners(activeBannersNow);
    setPreviewIndex((prev) => Math.min(prev, activeBannersNow.length - 1));
  }, [activeBannersNow, previewModalOpen]);

  useEffect(() => {
    if (!previewModalOpen || activePreviewBanners.length === 0) return;

    const durationMs = 10000;
    const startedAt = Date.now();
    let frameId: number | null = null;

    const run = () => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(100, (elapsed / durationMs) * 100);
      setPreviewProgress(progress);

      if (elapsed >= durationMs) {
        setPreviewProgress(0);
        if (activePreviewBanners.length > 1) {
          setPreviewIndex((current) => (current + 1) % activePreviewBanners.length);
        }
        return;
      }

      frameId = window.requestAnimationFrame(run);
    };

    frameId = window.requestAnimationFrame(run);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [activePreviewBanners.length, previewModalOpen, previewIndex]);

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title order={2}>Banner Management</Title>
        <Group gap="xs">
          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            onClick={() => {
              setForceRefreshSecret("");
              setForceRefreshResult(null);
              setForceRefreshModalOpen(true);
            }}
            disabled={isLoading}
          >
            Force Refresh Cache
          </Button>
          <Button
            variant="default"
            leftSection={<IconEye size={16} />}
            onClick={openPreviewActiveBanner}
            disabled={isLoading || !hasActiveBannerNow}
          >
            Preview Active Banner
          </Button>
        </Group>
      </Group>

      <Alert color="blue" variant="light" icon={<IconAlertCircle size={16} />}>
        <Stack gap={2}>
          <Text size="sm" fw={600}>
            Update cadence
          </Text>
          <Text size="sm">
            Banner publik dimuat saat page load (tanpa polling berkala).
          </Text>
          <Text size="sm">
            Jika ada perubahan banner dan ingin langsung terapkan, pakai tombol Force Refresh Cache.
          </Text>
          <Text size="sm">
            Info mesin: cron scrape server Senin 14:00-22:30, Selasa-Kamis 06:00-22:30 (setiap 30 menit), fetch status publik setiap {machineFetchIntervalMinutes} menit saat tab aktif.
          </Text>
        </Stack>
      </Alert>

      {errorMessage ? (
        <Alert color="red" icon={<IconAlertCircle size={16} />} variant="light">
          {errorMessage}
        </Alert>
      ) : null}

      <Group justify="space-between" align="end" wrap="wrap">
        <TextInput
          placeholder="Search title or description"
          value={searchText}
          onChange={(event) => setSearchText(event.currentTarget.value)}
          w={{ base: "100%", sm: 360 }}
        />
        <Button leftSection={<IconPlus size={16} />} color="red" onClick={openCreateModal}>
          Add Banner
        </Button>
      </Group>

      {isLoading ? (
        <Card withBorder radius="md" p="lg">
          <Group>
            <Loader size="sm" />
            <Text c="dimmed">Loading banners...</Text>
          </Group>
        </Card>
      ) : filteredBanners.length === 0 ? (
        <Card withBorder radius="md" p="lg">
          <Text c="dimmed">No banners found.</Text>
        </Card>
      ) : (
        <Stack gap="md">
          {filteredBanners.map((item) => (
            <Card key={item.id} withBorder radius="md" p="sm">
              <Stack gap="sm">
                <Group justify="space-between" align="start" wrap="wrap">
                  <Stack gap={2} maw={700}>
                    <Group gap="xs">
                      <Text fw={700} size="sm">
                        {item.title}
                      </Text>
                      {item.is_active ? (
                        <Badge color="green" size="sm">
                          Active
                        </Badge>
                      ) : (
                        <Badge size="sm">Inactive</Badge>
                      )}
                      {item.active_order ? (
                        <Badge variant="light" color="blue" size="sm">
                          #{item.active_order}
                        </Badge>
                      ) : null}
                    </Group>
                    <Text c="dimmed" size="xs">
                      {item.description || "-"}
                    </Text>
                  </Stack>
                  <Group gap="xs">
                    {item.is_active ? (
                      <>
                        <Button
                          size="compact-xs"
                          variant="light"
                          onClick={() => void handleMoveOrder(item, "up")}
                          disabled={(activeOrderIndexById.get(item.id) ?? 0) === 0}
                          loading={reorderLoading?.id === item.id && reorderLoading.direction === "up"}
                          leftSection={<IconArrowNarrowUp size={14} />}
                        >
                          Up
                        </Button>
                        <Button
                          size="compact-xs"
                          variant="light"
                          onClick={() => void handleMoveOrder(item, "down")}
                          disabled={
                            (activeOrderIndexById.get(item.id) ?? activeBannersNow.length) >= activeBannersNow.length - 1
                          }
                          loading={reorderLoading?.id === item.id && reorderLoading.direction === "down"}
                          leftSection={<IconArrowNarrowDown size={14} />}
                        >
                          Down
                        </Button>
                      </>
                    ) : null}
                    <Button
                      size="compact-xs"
                      variant="light"
                      leftSection={<IconPencil size={14} />}
                      onClick={() => openEditModal(item)}
                      disabled={isMutating}
                    >
                      Edit
                    </Button>
                    <Button
                      size="compact-xs"
                      color="red"
                      variant="light"
                      leftSection={<IconTrash size={14} />}
                      onClick={() => openDeleteModal(item)}
                      disabled={isMutating}
                    >
                      Delete
                    </Button>
                  </Group>
                </Group>

                <Group align="start" wrap="wrap" gap="md">
                  <Box
                    style={{
                      position: "relative",
                      width: 160,
                      height: 90,
                      borderRadius: 8,
                      overflow: "hidden",
                      backgroundColor: "#f3f4f6"
                    }}
                  >
                    <Button
                      size="compact-xs"
                      variant="filled"
                      leftSection={<IconEye size={12} />}
                      onClick={() => openImagePreview(item)}
                      style={{
                        position: "absolute",
                        top: 6,
                        left: 6,
                        zIndex: 2,
                        backgroundColor: "rgba(0,0,0,0.65)"
                      }}
                    >
                      View
                    </Button>
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      unoptimized
                      sizes="160px"
                      style={{ objectFit: "cover", objectPosition: "center" }}
                    />
                  </Box>
                  <Stack gap={4}>
                    <Text size="xs">Order: {item.active_order ?? "-"}</Text>
                    <Text size="xs">Start: {new Date(item.start_at).toLocaleString()}</Text>
                    <Text size="xs">End: {item.end_at ? new Date(item.end_at).toLocaleString() : "-"}</Text>
                    <Group gap="xs" align="center">
                      <Switch
                        label="Active"
                        size="sm"
                        checked={item.is_active}
                        disabled={isMutating}
                        onChange={(event) => void handleQuickToggle(item, event.currentTarget.checked)}
                      />
                      {toggleLoadingId === item.id ? <Loader size="xs" /> : null}
                    </Group>
                  </Stack>
                </Group>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      <Modal
        opened={forceRefreshModalOpen}
        onClose={() => {
          if (isForcingRefresh) return;
          setForceRefreshModalOpen(false);
        }}
        title="Force Refresh Banner Cache"
        centered
      >
        <Stack gap="md">
          <Alert color="yellow" variant="light" icon={<IconAlertCircle size={16} />}>
            Melakukan perintah ini akan menimbulkan cost komputasi.
          </Alert>
          <Text size="sm" c="dimmed">
            Cache global akan di-bust hanya jika terdeteksi perubahan banner aktif.
          </Text>
          <TextInput
            label="Token / Password"
            type="password"
            value={forceRefreshSecret}
            onChange={(event) => setForceRefreshSecret(event.currentTarget.value)}
            required
          />
          {forceRefreshResult ? (
            <Alert
              color={forceRefreshResult.ok ? "green" : "red"}
              variant="light"
              icon={<IconAlertCircle size={16} />}
            >
              {forceRefreshResult.message}
            </Alert>
          ) : null}
          <Group justify="flex-end">
            <Button
              variant="default"
              disabled={isForcingRefresh}
              onClick={() => {
                setForceRefreshModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              color="red"
              loading={isForcingRefresh}
              onClick={() => void handleForceRefresh()}
              disabled={!forceRefreshSecret.trim()}
            >
              Verify & Refresh
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          resetForm();
        }}
        title={isEditing ? "Edit Banner" : "Add Banner"}
        centered
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Title"
              value={form.title}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setForm((prev) => ({ ...prev, title: value }));
              }}
              required
            />
            <Textarea
              label="Description (optional)"
              minRows={3}
              value={form.description}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setForm((prev) => ({ ...prev, description: value }));
              }}
            />
            <FileInput
              label={isEditing ? "Replace Image (optional)" : "Image"}
              placeholder="Upload banner image"
              accept="image/*"
              value={form.image}
              onChange={(file) => setForm((prev) => ({ ...prev, image: file }))}
              required={!isEditing}
              clearable
            />
            {form.existingImageUrl ? (
              <Box
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: 420,
                  height: 220,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "1px solid #eee"
                }}
              >
                <Image
                  src={form.existingImageUrl}
                  alt="Current banner"
                  fill
                  unoptimized
                  sizes="420px"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              </Box>
            ) : null}
            <TextInput
              label="Start At"
              type="datetime-local"
              value={form.startAt}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setForm((prev) => ({ ...prev, startAt: value }));
              }}
              required
            />
            <TextInput
              label="End At (optional)"
              type="datetime-local"
              value={form.endAt}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setForm((prev) => ({ ...prev, endAt: value }));
              }}
            />
            <Switch
              label="Active"
              checked={form.isActive}
              onChange={(event) => {
                const checked = event.currentTarget.checked;
                setForm((prev) => ({
                  ...prev,
                  isActive: checked
                }));
              }}
            />
            <Group justify="flex-end">
              <Button
                variant="default"
                onClick={() => {
                  setFormModalOpen(false);
                  resetForm();
                }}
                disabled={isSaving || isMutating}
              >
                Cancel
              </Button>
              <Button type="submit" color="red" loading={isSaving}>
                {isEditing ? "Update Banner" : "Create Banner"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={deleteModalOpen}
        onClose={() => {
          if (isDeleting) return;
          setDeleteModalOpen(false);
          setBannerToDelete(null);
        }}
        title="Confirm Delete"
        centered
      >
        <Stack gap="md">
          <Text>
            Delete banner <b>{bannerToDelete?.title ?? ""}</b>? This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button
              variant="default"
              disabled={isDeleting || isMutating}
              onClick={() => {
                setDeleteModalOpen(false);
                setBannerToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button color="red" loading={isDeleting} onClick={() => void confirmDeleteBanner()}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={imagePreviewModalOpen}
        onClose={() => {
          setImagePreviewModalOpen(false);
          setImagePreviewData(null);
        }}
        title={imagePreviewData?.title ?? "Image Preview"}
        centered
        size="xl"
      >
        {imagePreviewData ? (
          <Box
            style={{
              position: "relative",
              width: "100%",
              height: "min(80vh, 760px)",
              borderRadius: 8,
              overflow: "hidden",
              backgroundColor: "#0b0b0b"
            }}
          >
            <Image
              src={imagePreviewData.url}
              alt={imagePreviewData.title}
              fill
              unoptimized
              sizes="90vw"
              style={{ objectFit: "contain", objectPosition: "center" }}
            />
          </Box>
        ) : null}
      </Modal>

      <Modal
        opened={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Preview Active Banner"
        centered
        padding={0}
        radius="md"
        size="auto"
        styles={{
          inner: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          },
          body: { padding: 0, height: "100%" },
          content: {
            backgroundColor: "#000",
            height: "min(calc(100vh - 32px), 860px)",
            width: "min(calc((100vh - 32px) * 0.5625), calc(100vw - 32px), 484px)",
            maxWidth: "100%",
            overflow: "hidden",
            margin: 0
          },
          header: {
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 10,
            background: "transparent"
          },
          close: {
            color: "#fff",
            backgroundColor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(2px)"
          },
          title: {
            color: "transparent",
            height: 0,
            overflow: "hidden"
          }
        }}
      >
        {currentPreviewBanner ? (
          <Box
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#000",
              position: "relative"
            }}
          >
            {activePreviewBanners.length > 1 ? (
              <Group
                gap={4}
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  right: 12,
                  zIndex: 3,
                  flexWrap: "nowrap"
                }}
              >
                {activePreviewBanners.map((item, index) => (
                  <Box
                    key={item.id}
                    style={{
                      flex: 1,
                      height: 3,
                      borderRadius: 999,
                      background:
                        index < previewIndex
                          ? "rgba(255,255,255,0.95)"
                          : index === previewIndex
                            ? `linear-gradient(to right, rgba(255,255,255,0.95) ${previewProgress}%, rgba(255,255,255,0.28) ${previewProgress}%)`
                            : "rgba(255,255,255,0.28)"
                    }}
                  />
                ))}
              </Group>
            ) : null}
            <Text
              c="white"
              fw={600}
              size="sm"
              style={{ position: "absolute", top: 18, right: 56, zIndex: 3, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
            >
              {previewIndex + 1} / {activePreviewBanners.length}
            </Text>
            {activePreviewBanners.length > 1 ? (
              <>
                <Box
                  role="button"
                  aria-label="Previous banner"
                  onClick={goToPrevPreview}
                  style={{ position: "absolute", left: 0, top: 44, bottom: 0, width: "35%", zIndex: 2, cursor: "pointer" }}
                />
                <Box
                  role="button"
                  aria-label="Next banner"
                  onClick={goToNextPreview}
                  style={{ position: "absolute", right: 0, top: 44, bottom: 0, width: "65%", zIndex: 2, cursor: "pointer" }}
                />
                <Group style={{ position: "absolute", left: 12, right: 12, top: "48%", zIndex: 3 }} justify="space-between">
                  <Button
                    variant="subtle"
                    color="gray"
                    size="compact-sm"
                    onClick={goToPrevPreview}
                    style={{ backgroundColor: "rgba(0,0,0,0.32)", color: "#fff" }}
                  >
                    <IconChevronLeft size={16} />
                  </Button>
                  <Button
                    variant="subtle"
                    color="gray"
                    size="compact-sm"
                    onClick={goToNextPreview}
                    style={{ backgroundColor: "rgba(0,0,0,0.32)", color: "#fff" }}
                  >
                    <IconChevronRight size={16} />
                  </Button>
                </Group>
              </>
            ) : null}
            <Box style={{ position: "relative", width: "100%", flex: 1 }}>
              <Image
                src={currentPreviewBanner.image_url || "/thumbnail.png"}
                alt={currentPreviewBanner.title}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 484px"
                style={{
                  objectFit: "contain",
                  objectPosition: "center"
                }}
              />
            </Box>
            <Box px="md" py="sm" style={{ width: "100%", background: "rgba(0, 0, 0, 0.72)" }}>
              <Text fw={700} c="white">
                {currentPreviewBanner.title}
              </Text>
              <Text size="sm" c="gray.3">
                {currentPreviewBanner.description || ""}
              </Text>
            </Box>
          </Box>
        ) : (
          <Box p="lg">
            <Text c="dimmed">No active banner right now.</Text>
          </Box>
        )}
      </Modal>
    </Stack>
  );
}
