import { Suspense } from 'react';
import PartnerDetail from './partner-detail-client';

export const metadata = {
  title: 'Detalhes do Parceiro - Admin NomadWay',
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <PartnerDetail partnerId={id} />
    </Suspense>
  );
}