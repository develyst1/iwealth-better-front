"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  Flex,
  Input,
  List,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import {
  LineChartOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from "@ant-design/icons";
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
import { ShimmerButton } from "@/shared/ui/magic/ShimmerButton";
import * as authApi from "@/features/auth/api";
import * as portfolioApi from "@/features/portfolio/api";
import * as compareApi from "./api";

const { Title, Text } = Typography;

function StubBarsChart({ bars }: { bars: CompareResult["bars"] }) {
  if (!bars.length) {
    return <Text type="secondary">ไม่มีข้อมูลราคา (bars)</Text>;
  }
  const closes = bars.map((b) => b.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || 1;
  const sample = bars
    .filter(
      (_, i) => i % Math.max(1, Math.floor(bars.length / 40)) === 0,
    )
    .slice(0, 48);

  return (
    <Space orientation="vertical" size={4} style={{ width: "100%" }}>
      <div className="stub-bars">
        {sample.map((b) => {
          const h = 16 + ((b.close - min) / span) * 90;
          return (
            <div
              key={b.date}
              title={`${b.date}: ${b.close}`}
              className="stub-bars__bar"
              style={{ height: h }}
            />
          );
        })}
      </div>
      <Text type="secondary" style={{ fontSize: 12 }}>
        Stub bars · {bars.length} points · close {min.toFixed(2)} –{" "}
        {max.toFixed(2)}
      </Text>
    </Space>
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
    (error.status === 503 ||
      error.code === "ADAPTER_ERROR" ||
      error.code === "ADAPTER_FAIL");

  return (
    <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
      <AppNav email={user?.email} />
      <div>
        <Title level={2} style={{ marginBottom: 4 }}>
          Compare — เทียบเหตุการณ์
        </Title>
        <Text type="secondary">
          เลือกสัญลักษณ์จาก holdings หรือพิมพ์เอง · ข้อมูลราคา/เหตุการณ์มาจาก
          stub adapter ผ่าน back
        </Text>
      </div>

      {bootLoading ? (
        <Flex justify="center" style={{ padding: 24 }}>
          <Spin size="large" />
        </Flex>
      ) : (
        <Card size="small">
          <Flex align="flex-end" wrap="wrap" gap={12}>
            {holdingOptions.length > 0 ? (
              <div>
                <Text style={{ display: "block", marginBottom: 4 }}>
                  จาก holdings
                </Text>
                <Select
                  placeholder="เลือก symbol"
                  options={holdingOptions}
                  value={
                    holdingOptions.some((o) => o.value === symbol)
                      ? symbol
                      : undefined
                  }
                  onChange={(v) => {
                    if (v) {
                      setSymbol(v);
                      setTyped(v);
                    }
                  }}
                  showSearch
                  allowClear
                  style={{ width: 220 }}
                />
              </div>
            ) : null}
            <div>
              <Text style={{ display: "block", marginBottom: 4 }}>
                หรือพิมพ์ symbol
              </Text>
              <Input
                placeholder="AAPL"
                value={typed}
                onChange={(e) => setTyped(e.target.value.toUpperCase())}
                style={{ width: 160 }}
              />
            </div>
            <ShimmerButton
              icon={<LineChartOutlined />}
              loading={loading}
              onClick={() => void runCompare(typed || symbol)}
            >
              โหลดเปรียบเทียบ
            </ShimmerButton>
          </Flex>
        </Card>
      )}

      <ErrorAlert
        error={error}
        title={adapterFail ? "Adapter ล้มเหลว" : "โหลดเปรียบเทียบไม่สำเร็จ"}
      />

      {!loading && !result && !error ? (
        <EmptyState
          icon={<LineChartOutlined />}
          title="ยังไม่มีผลเปรียบเทียบ"
          detail="เลือก symbol แล้วกดโหลดเปรียบเทียบ"
        />
      ) : null}

      {loading ? (
        <Flex justify="center">
          <Spin />
        </Flex>
      ) : null}

      {result ? (
        <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
          <Card size="small">
            <Flex
              justify="space-between"
              align="center"
              wrap="wrap"
              gap={12}
              style={{ marginBottom: 12 }}
            >
              <Space>
                <Text strong>{result.symbol}</Text>
                <Tag>
                  {result.range.from} → {result.range.to}
                </Tag>
              </Space>
              <ShimmerButton
                icon={<ThunderboltOutlined />}
                loading={summarizing}
                onClick={() => void onSummarize()}
              >
                สรุปด้วย AI
              </ShimmerButton>
            </Flex>
            <Text strong style={{ display: "block", marginBottom: 6 }}>
              Bars (stub)
            </Text>
            <StubBarsChart bars={result.bars} />
          </Card>

          <Card size="small" title="Events">
            {result.events.length === 0 ? (
              <Text type="secondary">ไม่มีเหตุการณ์ในช่วงนี้</Text>
            ) : (
              <List
                size="small"
                dataSource={result.events}
                renderItem={(ev) => (
                  <List.Item>
                    <Space wrap>
                      <Tag>{ev.type}</Tag>
                      <Text>
                        {ev.occurredAt.slice(0, 10)} — {ev.title}
                      </Text>
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </Card>

          <Card size="small" title="สรุป AI">
            {summaryError instanceof ApiError &&
            summaryError.status === 503 ? (
              <EmptyState
                icon={<WarningOutlined />}
                title="LLM ไม่พร้อม (503)"
                detail={
                  summaryError.message ||
                  "เซิร์ฟเวอร์สรุปยังไม่พร้อม — ลองใหม่ภายหลัง (เรียกผ่าน back เท่านั้น)"
                }
              />
            ) : (
              <ErrorAlert
                error={summaryError}
                title="สรุปด้วย AI ไม่สำเร็จ"
              />
            )}
            {summary ? (
              <Text style={{ whiteSpace: "pre-wrap" }}>{summary}</Text>
            ) : !summaryError ? (
              <Text type="secondary">
                กดปุ่ม &quot;สรุปด้วย AI&quot; เพื่อขอสรุปจาก back
                (ไม่เรียก vendor จาก browser)
              </Text>
            ) : null}
          </Card>
        </Space>
      ) : null}
    </Space>
  );
}
