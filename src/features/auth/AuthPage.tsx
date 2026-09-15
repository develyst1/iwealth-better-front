"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Form, Input, Segmented, Space, Typography } from "antd";
import { setToken } from "@/shared/lib/auth-token";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { BorderBeam } from "@/shared/ui/magic/BorderBeam";
import { ShimmerButton } from "@/shared/ui/magic/ShimmerButton";
import * as authApi from "./api";

const { Title, Text } = Typography;

type Mode = "login" | "register";

export function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [form] = Form.useForm<{ email: string; password: string }>();

  async function onFinish(values: { email: string; password: string }) {
    setLoading(true);
    setError(null);
    try {
      const res =
        mode === "login"
          ? await authApi.login(values.email, values.password)
          : await authApi.register(values.email, values.password);
      setToken(res.token);
      router.replace("/portfolios");
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto 0" }}>
      <div className="login-hero">
        <Title level={2} style={{ marginBottom: 4 }}>
          iWealth Better
        </Title>
        <Text type="secondary">
          เข้าสู่ระบบเพื่อจัดการพอร์ตและเทียบเหตุการณ์หุ้น US
        </Text>
      </div>

      <BorderBeam style={{ marginTop: 12 }}>
        <Card bordered={false} styles={{ body: { padding: 24 } }}>
          <Segmented
            block
            value={mode}
            onChange={(v) => setMode(v as Mode)}
            options={[
              { label: "เข้าสู่ระบบ", value: "login" },
              { label: "สมัครสมาชิก", value: "register" },
            ]}
            style={{ marginBottom: 16 }}
          />
          <ErrorAlert error={error} />
          <Form
            form={form}
            layout="vertical"
            onFinish={(v) => void onFinish(v)}
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label="อีเมล"
              rules={[
                { required: true, message: "กรอกอีเมล" },
                { type: "email", message: "อีเมลไม่ถูกต้อง" },
              ]}
            >
              <Input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                size="large"
              />
            </Form.Item>
            <Form.Item
              name="password"
              label="รหัสผ่าน"
              rules={[
                { required: true, message: "กรอกรหัสผ่าน" },
                { min: 8, message: "รหัสผ่านอย่างน้อย 8 ตัวอักษร" },
              ]}
            >
              <Input.Password
                placeholder="อย่างน้อย 8 ตัวอักษร"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                size="large"
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <ShimmerButton
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
              </ShimmerButton>
            </Form.Item>
          </Form>
          <Space style={{ marginTop: 12 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              stub v0 · Magic UI accents + Ant Design
            </Text>
          </Space>
        </Card>
      </BorderBeam>
    </div>
  );
}
