"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ActionIcon,
  Anchor,
  Button,
  Group,
  Loader,
  Modal,
  NumberInput,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconChartCandle, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import type { Holding, Portfolio, User } from "@/shared/lib/types";
import { getToken } from "@/shared/lib/auth-token";
import { AppNav } from "@/shared/ui/AppNav";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import * as authApi from "@/features/auth/api";
import * as portfolioApi from "./api";

export function PortfolioDetailPage({ portfolioId }: { portfolioId: string }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Holding | null>(null);
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState<number | string>(1);
  const [avgCost, setAvgCost] = useState<number | string>(0);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [meRes, p] = await Promise.all([
        authApi.me(),
        portfolioApi.getPortfolio(portfolioId),
      ]);
      setUser(meRes.user);
      setPortfolio(p);
    } catch (e) {
      setError(e);
      if ((e as { status?: number }).status === 401) {
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [portfolioId, router]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setSymbol("");
    setQuantity(1);
    setAvgCost(0);
    setModalOpen(true);
  }

  function openEdit(h: Holding) {
    setEditing(h);
    setSymbol(h.symbol);
    setQuantity(h.quantity);
    setAvgCost(h.avgCost);
    setModalOpen(true);
  }

  async function onSave() {
    const qty = Number(quantity);
    const cost = Number(avgCost);
    if (!symbol.trim() || !(qty > 0) || !(cost >= 0)) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await portfolioApi.upsertHolding(portfolioId, {
        symbol: symbol.trim().toUpperCase(),
        quantity: qty,
        avgCost: cost,
      });
      setPortfolio(updated);
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(h: Holding) {
    if (!confirm(`ลบ ${h.symbol}?`)) return;
    setBusy(true);
    setError(null);
    try {
      await portfolioApi.deleteHolding(portfolioId, h.symbol);
      await load();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }

  const holdings = portfolio?.holdings ?? [];

  return (
    <Stack gap="md">
      <AppNav email={user?.email} />
      <Group justify="space-between" wrap="wrap">
        <div>
          <Anchor component={Link} href="/portfolios" size="sm" c="dimmed">
            ← พอร์ตทั้งหมด
          </Anchor>
          <Title order={2}>{portfolio?.name ?? "พอร์ต"}</Title>
        </div>
        <Group>
          <Button
            component={Link}
            href={`/compare?portfolioId=${encodeURIComponent(portfolioId)}`}
            variant="light"
            leftSection={<IconChartCandle size={16} />}
          >
            Compare
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
            เพิ่ม holding
          </Button>
        </Group>
      </Group>
      <ErrorAlert error={error} />
      {loading ? (
        <Loader mx="auto" />
      ) : holdings.length === 0 ? (
        <EmptyState
          icon={<IconPlus size={28} />}
          title="ยังไม่มี holdings"
          detail="เพิ่มสัญลักษณ์ (เช่น AAPL) พร้อมจำนวนและต้นทุนเฉลี่ย"
        />
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Symbol</Table.Th>
              <Table.Th>Qty</Table.Th>
              <Table.Th>Avg cost (USD)</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {holdings.map((h) => (
              <Table.Tr key={h.symbol}>
                <Table.Td>
                  <Text fw={600}>{h.symbol}</Text>
                </Table.Td>
                <Table.Td>{h.quantity}</Table.Td>
                <Table.Td>{h.avgCost.toFixed(2)}</Table.Td>
                <Table.Td>
                  <Group gap={4} justify="flex-end">
                    <Button
                      component={Link}
                      href={`/compare?symbol=${encodeURIComponent(h.symbol)}&portfolioId=${encodeURIComponent(portfolioId)}`}
                      size="compact-xs"
                      variant="subtle"
                    >
                      Compare
                    </Button>
                    <ActionIcon
                      variant="subtle"
                      aria-label="edit"
                      onClick={() => openEdit(h)}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      aria-label="delete"
                      disabled={busy}
                      onClick={() => void onDelete(h)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `แก้ไข ${editing.symbol}` : "เพิ่ม holding"}
      >
        <Stack>
          <TextInput
            label="Symbol"
            placeholder="AAPL"
            disabled={!!editing}
            value={symbol}
            onChange={(e) => setSymbol(e.currentTarget.value.toUpperCase())}
          />
          <NumberInput
            label="Quantity"
            min={0.0001}
            decimalScale={4}
            value={quantity}
            onChange={setQuantity}
          />
          <NumberInput
            label="Avg cost (USD)"
            min={0}
            decimalScale={4}
            value={avgCost}
            onChange={setAvgCost}
          />
          <Button loading={busy} onClick={() => void onSave()}>
            บันทึก
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
