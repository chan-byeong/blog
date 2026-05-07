import { AdminDashboard } from '@/components/admin/admin-dashboard';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminDashboard>{children}</AdminDashboard>;
}
