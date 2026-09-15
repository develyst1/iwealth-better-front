"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Paper,
  PasswordInput,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { setToken } from "@/shared/lib/auth-token";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import * as authApi from "./api";

type Mode = "login" | "register";

export function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : "อีเมลไม่ถูกต้อง"),
      password: (v) =>
        v.length >= 8 ? null : "รหัสผ่านอย่างน้อย 8 ตัวอักษร",
    },
  });

  async function onSubmit(values: { email: string; password: string }) {
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
    <Stack maw={420} mx="auto" mt="xl" gap="md">
      <div>
        <Title order={2}>iWealth Better</Title>
        <Text c="dimmed" size="sm">
          เข้าสู่ระบบเพื่อจัดการพอร์ตและเทียบเหตุการณ์หุ้น US
        </Text>
      </div>
      <Paper withBorder p="lg" radius="md">
        <SegmentedControl
          fullWidth
          mb="md"
          value={mode}
          onChange={(v) => setMode(v as Mode)}
          data={[
            { label: "เข้าสู่ระบบ", value: "login" },
            { label: "สมัครสมาชิก", value: "register" },
          ]}
        />
        <ErrorAlert error={error} />
        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack gap="sm">
            <TextInput
              label="อีเมล"
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
              {...form.getInputProps("email")}
            />
            <PasswordInput
              label="รหัสผ่าน"
              placeholder="อย่างน้อย 8 ตัวอักษร"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              {...form.getInputProps("password")}
            />
            <Button type="submit" loading={loading} fullWidth>
              {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
