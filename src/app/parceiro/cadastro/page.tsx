import { Suspense } from 'react';
import PartnerRegisterClient from './register-client';

export const metadata = {
  title: 'Cadastro de Parceiro - NomadWay',
  description: 'Torne-se um parceiro NomadWay e ganhe comissões por indicação.',
};

export default function PartnerRegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PartnerRegisterClient />
    </Suspense>
  );
}