"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  LineChartOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { Holding, Portfolio, User } from "@/shared/lib/types";
import { getToken } from "@/shared/lib/auth-token";
import { AppNav } from "@/shared/ui/AppNav";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { ShimmerButton } from "@/shared/ui/magic/ShimmerButton";
import * as authApi from "@/features/auth/api";
import * as portfolioApi from "./api";

const { Title, Text } = Typography;

export function PortfolioDetailPage({ portfolioId }: { portfolioId: string }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Holding | null>(null);
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState<number | null>(1);
  const [avgCost, setAvgCost] = useState<number | null>(0);
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
    if (!window.confirm(`ลบ ${h.symbol}?`)) return;
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

  const columns = [
    {
      title: "Symbol",
      dataIndex: "symbol",
      key: "symbol",
      render: (s: string) => <Text strong>{s}</Text>,
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Avg cost (USD)",
      dataIndex: "avgCost",
      key: "avgCost",
      render: (v: number) => v.toFixed(2),
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      render: (_: unknown, h: Holding) => (
        <Space>
          <Button
            type="link"
            size="small"
            href={`/compare?symbol=${encodeURIComponent(h.symbol)}&portfolioId=${encodeURIComponent(portfolioId)}`}
          >
            Compare
          </Button>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            aria-label="edit"
            onClick={() => openEdit(h)}
          />
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            aria-label="delete"
            disabled={busy}
            onClick={() => void onDelete(h)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
      <AppNav email={user?.email} />
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12}>
        <div>
          <Link href="/portfolios" style={{ fontSize: 13, color: "#8c8c8c" }}>
            ← พอร์ตทั้งหมด
          </Link>
          <Title level={2} style={{ margin: "4px 0 0" }}>
            {portfolio?.name ?? "พอร์ต"}
          </Title>
        </div>
        <Space wrap>
          <Button
            icon={<LineChartOutlined />}
            href={`/compare?portfolioId=${encodeURIComponent(portfolioId)}`}
          >
            Compare
          </Button>
          <ShimmerButton icon={<PlusOutlined />} onClick={openCreate}>
            เพิ่ม holding
          </ShimmerButton>
        </Space>
      </Flex>
      <ErrorAlert error={error} />
      {loading ? (
        <Flex justify="center" style={{ padding: 40 }}>
          <Spin size="large" />
        </Flex>
      ) : holdings.length === 0 ? (
        <EmptyState
          icon={<PlusOutlined />}
          title="ยังไม่มี holdings"
          detail="เพิ่มสัญลักษณ์ (เช่น AAPL) พร้อมจำนวนและต้นทุนเฉลี่ย"
        />
      ) : (
        <Table
          rowKey="symbol"
          dataSource={holdings}
          columns={columns}
          pagination={false}
          size="middle"
          scroll={{ x: true }}
        />
      )}

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title={editing ? `แก้ไข ${editing.symbol}` : "เพิ่ม holding"}
        footer={null}
        destroyOnHidden
      >
        <Form layout="vertical" onFinish={() => void onSave()}>
          <Form.Item label="Symbol" required>
            <Input
              placeholder="AAPL"
              disabled={!!editing}
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            />
          </Form.Item>
          <Form.Item label="Quantity" required>
            <InputNumber
              min={0.0001}
              step={1}
              style={{ width: "100%" }}
              value={quantity}
              onChange={(v) => setQuantity(v)}
            />
          </Form.Item>
          <Form.Item label="Avg cost (USD)" required>
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: "100%" }}
              value={avgCost}
              onChange={(v) => setAvgCost(v)}
            />
          </Form.Item>
          <ShimmerButton htmlType="submit" loading={busy} block>
            บันทึก
          </ShimmerButton>
        </Form>
      </Modal>
    </Space>
  );
}
