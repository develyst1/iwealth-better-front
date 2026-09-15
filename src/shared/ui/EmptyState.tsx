"use client";

import { Empty, Flex, Typography } from "antd";
import type { ReactNode } from "react";

const { Text, Title } = Typography;

export function EmptyState({
  icon,
  title,
  detail,
}: {
  icon?: ReactNode;
  title: string;
  detail?: string;
}) {
  return (
    <Flex vertical align="center" gap={8} style={{ padding: "32px 0" }}>
      <Empty
        image={icon ? Empty.PRESENTED_IMAGE_SIMPLE : undefined}
        description={null}
      />
      {icon ? <div style={{ fontSize: 28, color: "#0ca678" }}>{icon}</div> : null}
      <Title level={5} style={{ margin: 0 }}>
        {title}
      </Title>
      {detail ? (
        <Text type="secondary" style={{ textAlign: "center", maxWidth: 400 }}>
          {detail}
        </Text>
      ) : null}
    </Flex>
  );
}
