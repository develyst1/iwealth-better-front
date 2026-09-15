"use client";

import { Alert } from "antd";
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
      type="error"
      showIcon
      message={title}
      description={message}
      style={{ marginBottom: 16 }}
    />
  );
}
