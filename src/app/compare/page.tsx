import { Suspense } from "react";
import { Flex, Spin } from "antd";
import { ComparePage } from "@/features/compare/ComparePage";

export default function CompareRoute() {
  return (
    <Suspense
      fallback={
        <Flex align="center" justify="center" style={{ minHeight: 240 }}>
          <Spin size="large" />
        </Flex>
      }
    >
      <ComparePage />
    </Suspense>
  );
}
