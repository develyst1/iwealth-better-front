"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ActionIcon,
  Button,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconBriefcaseOff,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import type { Portfolio, User } from "@/shared/lib/types";
import { getToken } from "@/shared/lib/auth-token";
import { AppNav } from "@/shared/ui/AppNav";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import * as authApi from "@/features/auth/api";
import * as portfolioApi from "./api";

export function PortfolioListPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Portfolio | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [meRes, listRes] = await Promise.all([
        authApi.me(),
        portfolioApi.listPortfolios(),
      ]);
      setUser(meRes.user);
      setItems(listRes.items ?? []);
    } catch (e) {
      setError(e);
      if ((e as { status?: number }).status === 401) {
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate() {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await portfolioApi.createPortfolio(name.trim());
      setCreateOpen(false);
      setName("");
      await load();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }

  async function onRename() {
    if (!renameTarget || !name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await portfolioApi.renamePortfolio(renameTarget.id, name.trim());
      setRenameTarget(null);
      setName("");
      await load();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(p: Portfolio) {
    if (!confirm(`ลบพอร์ต "${p.name}" ?`)) return;
    setBusy(true);
    setError(null);
    try {
      await portfolioApi.deletePortfolio(p.id);
      await load();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stack gap="md">
      <AppNav email={user?.email} />
      <Group justify="space-between">
        <Title order={2}>พอร์ตของฉัน</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            setName("");
            setCreateOpen(true);
          }}
        >
          สร้างพอร์ต
        </Button>
      </Group>
      <ErrorAlert error={error} />
      {loading ? (
        <Loader mx="auto" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<IconBriefcaseOff size={28} />}
          title="ยังไม่มีพอร์ต"
          detail="สร้างพอร์ตแรกเพื่อบันทึก holdings และเทียบเหตุการณ์หุ้น"
        />
      ) : (
        <Stack gap="sm">
          {items.map((p) => (
            <Paper key={p.id} withBorder p="md" radius="md">
              <Group justify="space-between" wrap="nowrap">
                <div>
                  <Text
                    component={Link}
                    href={`/portfolios/${p.id}`}
                    fw={600}
                    c="brand.8"
                    style={{ textDecoration: "none" }}
                  >
                    {p.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {p.currency ?? "USD"}
                  </Text>
                </div>
                <Group gap={4}>
                  <Button
                    component={Link}
                    href={`/portfolios/${p.id}`}
                    size="xs"
                    variant="light"
                  >
                    เข้าพอร์ต
                  </Button>
                  <ActionIcon
                    variant="subtle"
                    aria-label="rename"
                    onClick={() => {
                      setRenameTarget(p);
                      setName(p.name);
                    }}
                  >
                    <IconPencil size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    aria-label="delete"
                    disabled={busy}
                    onClick={() => void onDelete(p)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}

      <Modal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        title="สร้างพอร์ต"
      >
        <Stack>
          <TextInput
            label="ชื่อพอร์ต"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="เช่น Core US"
          />
          <Button loading={busy} onClick={() => void onCreate()}>
            สร้าง
          </Button>
        </Stack>
      </Modal>

      <Modal
        opened={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        title="เปลี่ยนชื่อพอร์ต"
      >
        <Stack>
          <TextInput
            label="ชื่อพอร์ต"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <Button loading={busy} onClick={() => void onRename()}>
            บันทึก
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
