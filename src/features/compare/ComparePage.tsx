"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Badge,
  Button,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  List,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconBrain,
  IconChartCandle,
} from "@tabler/icons-react";
import type {
  CompareResult,
  Holding,
  Portfolio,
  User,
} from "@/shared/lib/types";
import { ApiError } from "@/shared/lib/types";
import { getToken } from "@/shared/lib/auth-token";
import { AppNav } from "@/shared/ui/AppNav";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import * as authApi from "@/features/auth/api";
import * as portfolioApi from "@/features/portfolio/api";
import * as compareApi from "./api";

function StubBarsChart({ bars }: { bars: CompareResult["bars"] }) {
  if (!bars.length) {
    return (
      <Text size="sm" c="dimmed">
        ไม่มีข้อมูลราคา (bars)
      </Text>
    );
  }
  const closes = bars.map((b) => b.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || 1;
  const sample = bars.filter((_, i) => i % Math.max(1, Math.floor(bars.length / 40)) === 0).slice(0, 48);

  return (
    <Stack gap={4}>
      <Group gap={2} align="flex-end" h={120} wrap="nowrap" style={{ overflowX: "auto" }}>
        {sample.map((b) => {
          const h = 16 + ((b.close - min) / span) * 90;
          return (
            <div
              key={b.date}
              title={`${b.date}: ${b.close}`}
              style={{
                width: 8,
                minWidth: 8,
                height: h,
                background: "var(--mantine-color-brand-6)",
                borderRadius: 2,
                opacity: 0.85,
              }}
            />
          );
        })}
      </Group>
      <Text size="xs" c="dimmed">
        Stub bars · {bars.length} points · close {min.toFixed(2)} – {max.toFixed(2)}
      </Text>
    </Stack>
  );
}

export function ComparePage() {
  const router = useRouter();
  const search = useSearchParams();
  const initialSymbol = (search.get("symbol") ?? "").toUpperCase();
  const portfolioId = search.get("portfolioId") ?? "";

  const [user, setUser] = useState<User | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [symbol, setSymbol] = useState(initialSymbol);
  const [typed, setTyped] = useState(initialSymbol);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [summaryError, setSummaryError] = useState<unknown>(null);
  const [bootLoading, setBootLoading] = useState(true);

  const holdingOptions = useMemo(
    () =>
      holdings.map((h) => ({
        value: h.symbol,
        label: `${h.symbol} (qty ${h.quantity})`,
      })),
    [holdings],
  );

  const boot = useCallback(async () => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setBootLoading(true);
    try {
      const meRes = await authApi.me();
      setUser(meRes.user);
      let all: Holding[] = [];
      if (portfolioId) {
        const p = await portfolioApi.getPortfolio(portfolioId);
        all = p.holdings ?? [];
      } else {
        const list = await portfolioApi.listPortfolios();
        const details = await Promise.all(
          (list.items ?? []).map((p: Portfolio) =>
            portfolioApi.getPortfolio(p.id).catch(() => null),
          ),
        );
        const map = new Map<string, Holding>();
        for (const p of details) {
          for (const h of p?.holdings ?? []) {
            map.set(h.symbol, h);
          }
        }
        all = Array.from(map.values());
      }
      setHoldings(all);
      if (!initialSymbol && all[0]) {
        setSymbol(all[0].symbol);
        setTyped(all[0].symbol);
      }
    } catch (e) {
      setError(e);
      if ((e as { status?: number }).status === 401) {
        router.replace("/login");
      }
    } finally {
      setBootLoading(false);
    }
  }, [initialSymbol, portfolioId, router]);

  useEffect(() => {
    void boot();
  }, [boot]);

  async function runCompare(sym: string) {
    const s = sym.trim().toUpperCase();
    if (!s) return;
    setLoading(true);
    setError(null);
    setSummary(null);
    setSummaryError(null);
    setResult(null);
    try {
      const data = await compareApi.compare({ symbol: s });
      setResult(data);
      setSymbol(s);
      setTyped(s);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  async function onSummarize() {
    if (!result) return;
    setSummarizing(true);
    setSummaryError(null);
    setSummary(null);
    try {
      const res = await compareApi.summarizeCompare({ compare: result });
      setSummary(res.content);
    } catch (e) {
      setSummaryError(e);
    } finally {
      setSummarizing(false);
    }
  }

  const adapterFail =
    error instanceof ApiError &&
    (error.status === 503 || error.code === "ADAPTER_ERROR" || error.code === "ADAPTER_FAIL");

  return (
    <Stack gap="md">
      <AppNav email={user?.email} />
      <Title order={2}>Compare — เทียบเหตุการณ์</Title>
      <Text size="sm" c="dimmed">
        เลือกสัญลักษณ์จาก holdings หรือพิมพ์เอง · ข้อมูลราคา/เหตุการณ์มาจาก stub adapter ผ่าน back
      </Text>

      {bootLoading ? (
        <Loader mx="auto" />
      ) : (
        <Paper withBorder p="md" radius="md">
          <Group align="flex-end" wrap="wrap">
            {holdingOptions.length > 0 ? (
              <Select
                label="จาก holdings"
                placeholder="เลือก symbol"
                data={holdingOptions}
                value={holdingOptions.some((o) => o.value === symbol) ? symbol : null}
                onChange={(v) => {
                  if (v) {
                    setSymbol(v);
                    setTyped(v);
                  }
                }}
                searchable
                clearable
                w={220}
              />
            ) : null}
            <TextInput
              label="หรือพิมพ์ symbol"
              placeholder="AAPL"
              value={typed}
              onChange={(e) => setTyped(e.currentTarget.value.toUpperCase())}
              w={160}
            />
            <Button
              leftSection={<IconChartCandle size={16} />}
              loading={loading}
              onClick={() => void runCompare(typed || symbol)}
            >
              โหลดเปรียบเทียบ
            </Button>
          </Group>
        </Paper>
      )}

      <ErrorAlert
        error={error}
        title={adapterFail ? "Adapter ล้มเหลว" : "โหลดเปรียบเทียบไม่สำเร็จ"}
      />

      {!loading && !result && !error ? (
        <EmptyState
          icon={<IconChartCandle size={28} />}
          title="ยังไม่มีผลเปรียบเทียบ"
          detail="เลือก symbol แล้วกดโหลดเปรียบเทียบ"
        />
      ) : null}

      {loading ? <Loader mx="auto" /> : null}

      {result ? (
        <Stack gap="md">
          <Paper withBorder p="md" radius="md">
            <Group justify="space-between" mb="sm">
              <Group gap="xs">
                <Text fw={700}>{result.symbol}</Text>
                <Badge variant="light">
                  {result.range.from} → {result.range.to}
                </Badge>
              </Group>
              <Button
                leftSection={<IconBrain size={16} />}
                loading={summarizing}
                onClick={() => void onSummarize()}
              >
                สรุปด้วย AI
              </Button>
            </Group>
            <Text size="sm" fw={600} mb={6}>
              Bars (stub)
            </Text>
            <StubBarsChart bars={result.bars} />
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Text fw={600} mb="sm">
              Events
            </Text>
            {result.events.length === 0 ? (
              <Text size="sm" c="dimmed">
                ไม่มีเหตุการณ์ในช่วงนี้
              </Text>
            ) : (
              <List spacing="xs" size="sm">
                {result.events.map((ev) => (
                  <List.Item key={ev.id}>
                    <Group gap="xs" wrap="wrap">
                      <Badge size="xs" variant="outline">
                        {ev.type}
                      </Badge>
                      <Text size="sm" span>
                        {ev.occurredAt.slice(0, 10)} — {ev.title}
                      </Text>
                    </Group>
                  </List.Item>
                ))}
              </List>
            )}
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Text fw={600} mb="sm">
              สรุป AI
            </Text>
            {summaryError instanceof ApiError && summaryError.status === 503 ? (
              <EmptyState
                icon={<IconAlertTriangle size={28} />}
                title="LLM ไม่พร้อม (503)"
                detail={
                  summaryError.message ||
                  "เซิร์ฟเวอร์สรุปยังไม่พร้อม — ลองใหม่ภายหลัง (เรียกผ่าน back เท่านั้น)"
                }
              />
            ) : (
              <ErrorAlert error={summaryError} title="สรุปด้วย AI ไม่สำเร็จ" />
            )}
            {summary ? (
              <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                {summary}
              </Text>
            ) : !summaryError ? (
              <Text size="sm" c="dimmed">
                กดปุ่ม &quot;สรุปด้วย AI&quot; เพื่อขอสรุปจาก back (ไม่เรียก vendor จาก browser)
              </Text>
            ) : null}
          </Paper>
        </Stack>
      ) : null}
    </Stack>
  );
}
