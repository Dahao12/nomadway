import { Suspense } from 'react';
import ComissoesPage from './comissoes-client';

export const metadata = {
  title: 'Comissões - Portal do Parceiro - NomadWay',
};

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <ComissoesPage />
    </Suspense>
  );
}