import { Suspense } from "react";
import { Center, Loader } from "@mantine/core";
import { ComparePage } from "@/features/compare/ComparePage";

export default function CompareRoute() {
  return (
    <Suspense
      fallback={
        <Center mih={240}>
          <Loader />
        </Center>
      }
    >
      <ComparePage />
    </Suspense>
  );
}
