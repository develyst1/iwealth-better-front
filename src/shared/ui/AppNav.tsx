"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Anchor,
  Badge,
  Group,
  Button,
  Text,
  Title,
} from "@mantine/core";
import { IconChartCandle, IconLogout, IconBriefcase } from "@tabler/icons-react";
import { clearToken } from "@/shared/lib/auth-token";
import * as authApi from "@/features/auth/api";

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

  return (
    <Group justify="space-between" mb="lg" wrap="wrap" gap="sm">
      <Group gap="md">
        <Title order={3} c="brand.8">
          iWealth Better
        </Title>
        <Badge variant="light" color="gray" size="sm">
          stub v0
        </Badge>
      </Group>
      <Group gap="sm">
        <Anchor
          component={Link}
          href="/portfolios"
          size="sm"
          fw={pathname.startsWith("/portfolios") ? 700 : 500}
          c={pathname.startsWith("/portfolios") ? "brand.8" : "dimmed"}
        >
          <Group gap={4}>
            <IconBriefcase size={16} />
            พอร์ต
          </Group>
        </Anchor>
        <Anchor
          component={Link}
          href="/compare"
          size="sm"
          fw={pathname.startsWith("/compare") ? 700 : 500}
          c={pathname.startsWith("/compare") ? "brand.8" : "dimmed"}
        >
          <Group gap={4}>
            <IconChartCandle size={16} />
            Compare
          </Group>
        </Anchor>
        {email ? (
          <Text size="xs" c="dimmed">
            {email}
          </Text>
        ) : null}
        <Button
          size="xs"
          variant="subtle"
          color="gray"
          leftSection={<IconLogout size={14} />}
          onClick={onLogout}
        >
          ออกจากระบบ
        </Button>
      </Group>
    </Group>
  );
}
