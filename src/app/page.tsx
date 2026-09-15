"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Center, Loader } from "@mantine/core";
import { getToken } from "@/shared/lib/auth-token";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getToken() ? "/portfolios" : "/login");
  }, [router]);

  return (
    <Center mih={240}>
      <Loader />
    </Center>
  );
}
