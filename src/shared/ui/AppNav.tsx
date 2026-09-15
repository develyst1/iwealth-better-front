"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, Flex, Menu, Space, Tag, Typography } from "antd";
import {
  WalletOutlined,
  LineChartOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { clearToken } from "@/shared/lib/auth-token";
import * as authApi from "@/features/auth/api";

const { Title, Text } = Typography;

export function AppNav({ email }: { email?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function onLogout() {
    try {
      await authApi.logout();
    } catch {
      /* drop token anyway */
    }
    clearToken();
    router.replace("/login");
  }

  const selected = pathname.startsWith("/compare")
    ? ["compare"]
    : pathname.startsWith("/portfolios")
      ? ["portfolios"]
      : [];

  return (
    <Flex
      justify="space-between"
      align="center"
      wrap="wrap"
      gap={12}
      style={{ marginBottom: 20 }}
    >
      <Space align="center" size="middle">
        <Title level={3} style={{ margin: 0, color: "#099268" }}>
          iWealth Better
        </Title>
        <Tag>stub v0</Tag>
      </Space>
      <Space wrap size="middle">
        <Menu
          mode="horizontal"
          selectedKeys={selected}
          style={{ border: "none", background: "transparent", minWidth: 180 }}
          items={[
            {
              key: "portfolios",
              icon: <WalletOutlined />,
              label: <Link href="/portfolios">พอร์ต</Link>,
            },
            {
              key: "compare",
              icon: <LineChartOutlined />,
              label: <Link href="/compare">Compare</Link>,
            },
          ]}
        />
        {email ? (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {email}
          </Text>
        ) : null}
        <Button
          type="text"
          size="small"
          icon={<LogoutOutlined />}
          onClick={() => void onLogout()}
        >
          ออกจากระบบ
        </Button>
      </Space>
    </Flex>
  );
}
