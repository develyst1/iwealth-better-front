import { PortfolioDetailPage } from "@/features/portfolio/PortfolioDetailPage";

export default async function PortfolioDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PortfolioDetailPage portfolioId={id} />;
}
