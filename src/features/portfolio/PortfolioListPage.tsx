"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  Modal,
  Space,
  Spin,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { Portfolio, User } from "@/shared/lib/types";
import { getToken } from "@/shared/lib/auth-token";
import { AppNav } from "@/shared/ui/AppNav";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { ShimmerButton } from "@/shared/ui/magic/ShimmerButton";
import * as authApi from "@/features/auth/api";
import * as portfolioApi from "./api";

const { Title, Text } = Typography;

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
    if (!window.confirm(`ลบพอร์ต "${p.name}" ?`)) return;
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
    <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
      <AppNav email={user?.email} />
      <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
        <Title level={2} style={{ margin: 0 }}>
          พอร์ตของฉัน
        </Title>
        <ShimmerButton
          icon={<PlusOutlined />}
          onClick={() => {
            setName("");
            setCreateOpen(true);
          }}
        >
          สร้างพอร์ต
        </ShimmerButton>
      </Flex>
      <ErrorAlert error={error} />
      {loading ? (
        <Flex justify="center" style={{ padding: 40 }}>
          <Spin size="large" />
        </Flex>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<FolderOpenOutlined />}
          title="ยังไม่มีพอร์ต"
          detail="สร้างพอร์ตแรกเพื่อบันทึก holdings และเทียบเหตุการณ์หุ้น"
        />
      ) : (
        <Space orientation="vertical" size="small" style={{ width: "100%" }}>
          {items.map((p) => (
            <Card key={p.id} size="small">
              <Flex justify="space-between" align="center" gap={12} wrap="wrap">
                <div>
                  <Link
                    href={`/portfolios/${p.id}`}
                    style={{
                      fontWeight: 600,
                      color: "#099268",
                      textDecoration: "none",
                    }}
                  >
                    {p.name}
                  </Link>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {p.currency ?? "USD"}
                    </Text>
                  </div>
                </div>
                <Space>
                  <Button href={`/portfolios/${p.id}`} size="small">
                    เข้าพอร์ต
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    aria-label="rename"
                    onClick={() => {
                      setRenameTarget(p);
                      setName(p.name);
                    }}
                  />
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    aria-label="delete"
                    disabled={busy}
                    onClick={() => void onDelete(p)}
                  />
                </Space>
              </Flex>
            </Card>
          ))}
        </Space>
      )}

      <Modal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        title="สร้างพอร์ต"
        footer={null}
        destroyOnHidden
      >
        <Form layout="vertical" onFinish={() => void onCreate()}>
          <Form.Item label="ชื่อพอร์ต" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น Core US"
            />
          </Form.Item>
          <ShimmerButton htmlType="submit" loading={busy} block>
            สร้าง
          </ShimmerButton>
        </Form>
      </Modal>

      <Modal
        open={!!renameTarget}
        onCancel={() => setRenameTarget(null)}
        title="เปลี่ยนชื่อพอร์ต"
        footer={null}
        destroyOnHidden
      >
        <Form layout="vertical" onFinish={() => void onRename()}>
          <Form.Item label="ชื่อพอร์ต" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
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
