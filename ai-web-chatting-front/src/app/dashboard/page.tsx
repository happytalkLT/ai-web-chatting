import DashboardFeature from '@/features/dashboard/DashboardFeature';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardFeature />
    </ProtectedRoute>
  );
}