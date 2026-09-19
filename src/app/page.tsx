"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Flex, Spin } from "antd";
import { getToken } from "@/shared/lib/auth-token";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getToken() ? "/portfolios" : "/login");
  }, [router]);

  return (
    <Flex align="center" justify="center" style={{ minHeight: 240 }}>
      <Spin size="large" />
    </Flex>
  );
}
