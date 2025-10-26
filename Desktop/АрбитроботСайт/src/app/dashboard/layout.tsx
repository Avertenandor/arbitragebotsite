/**
 * Dashboard Layout - доступен для всех
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-20">
      {children}
    </div>
  );
}
