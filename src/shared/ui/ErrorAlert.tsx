"use client";

import { Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { ApiError } from "@/shared/lib/types";

export function ErrorAlert({
  error,
  title = "เกิดข้อผิดพลาด",
}: {
  error: unknown;
  title?: string;
}) {
  if (!error) return null;
  const message =
    error instanceof ApiError
      ? `${error.message}${error.code ? ` (${error.code})` : ""}${
          error.status === 503 ? " — บริการยังไม่พร้อม (503)" : ""
        }`
      : error instanceof Error
        ? error.message
        : String(error);

  return (
    <Alert
      color="red"
      variant="light"
      title={title}
      icon={<IconAlertCircle size={18} />}
      mb="md"
    >
      {message}
    </Alert>
  );
}
