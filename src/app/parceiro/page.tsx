import { Suspense } from 'react';
import PartnerDashboard from './dashboard-client';

export const metadata = {
  title: 'Portal do Parceiro - NomadWay',
  description: 'Acompanhe suas vendas, comissões e leads em tempo real.',
};

export default function ParceiroPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <PartnerDashboard />
    </Suspense>
  );
}