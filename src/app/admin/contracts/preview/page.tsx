'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

interface ContractData {
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_cpf?: string;
  client_rg?: string;
  client_passport?: string;
  client_passport_expiry?: string;
  client_nationality?: string;
  client_birth_date?: string;
  client_address?: string;
  client_city?: string;
  client_country?: string;
  client_cep?: string;
  service_value?: string;
  payment_method?: string;
}

function ContractPreviewContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const formData = searchParams.get('data');
    if (formData) {
      try {
        setData(JSON.parse(decodeURIComponent(formData)));
      } catch {
        console.error('Error parsing form data');
      }
    }
    setLoading(false);
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!data) return <div className="error">Dados não encontrados</div>;

  const today = new Date();
  const dateStr = today.toLocaleDateString('pt-BR');
  const valueNum = parseFloat(data.service_value || '1499.90');
  const valueFormatted = `€${valueNum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const f = (v: string | undefined, p: string) => v || p;

  return (
    <>
      <button onClick={handlePrint} className="print-btn">📄 Baixar PDF</button>
      <button onClick={() => window.close()} className="close-btn">Fechar</button>

      <div id="contract">
        {/* PAGE 1 - COVER */}
        <div className="page cover">
          <div className="logo">
            <div className="logo-icon">N</div>
            <div className="logo-text"><span>Nomad</span><span className="way">Way</span></div>
          </div>
          
          <div className="title">
            <p className="subtitle">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</p>
            <h1>Assessoria em Visto</h1>
            <p className="subtitle2">Nômade Digital — Espanha</p>
          </div>
          
          <div className="client-box">
            <p className="label">CONTRATANTE</p>
            <p className="value">{f(data.client_name, '[NOME COMPLETO]')}</p>
          </div>
          
          <div className="dates">
            <div className="date-box">
              <p className="label">DATA</p>
              <p className="value">{dateStr}</p>
            </div>
            <div className="date-box">
              <p className="label">VALIDADE</p>
              <p className="value">Até conclusão</p>
            </div>
          </div>
          
          <p className="footer">Documento Confidencial</p>
        </div>

        {/* PAGE 2 */}
        <div className="page">
          <header>
            <div className="hdr-logo"><span className="hdr-n">N</span><span>NomadWay</span></div>
            <div className="hdr-right">
              <p>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</p>
              <p>Assessoria em Visto de Nômade Digital</p>
            </div>
          </header>

          <section className="s">
            <h2><span className="num">1</span> PARTES</h2>
          </section>

          <div className="block client">
            <p className="lbl">CONTRATANTE</p>
            <p><strong>Nome:</strong> {f(data.client_name, '[NOME]')}</p>
            <p><strong>Nacionalidade:</strong> {f(data.client_nationality, '[NACIONALIDADE]')}</p>
            <p><strong>Nasc.:</strong> {data.client_birth_date ? new Date(data.client_birth_date).toLocaleDateString('pt-BR') : '[DATA]'} | <strong>Passaporte:</strong> {f(data.client_passport, '[PASSAPORTE]')} ({f(data.client_passport_expiry, '[VALIDADE]')})</p>
            <p><strong>CPF:</strong> {f(data.client_cpf, '[CPF]')} | <strong>RG:</strong> {f(data.client_rg, '[RG]')}</p>
          </div>

          <div className="block company">
            <p className="lbl">CONTRATADA</p>
            <p className="name">NOMADWAY</p>
            <p>Representante Legal: Edmar Candido Braga — CPF: 023.711.176-41</p>
            <p>Endereço: Rua Londrina, 230 — Jardim Canadá — Pouso Alegre – MG</p>
            <p>CEP: 37558-753 | E-mail: contato@nomadway.com.br</p>
            <p>Banco: Bradesco | Ag: 1497-4 | Cc: 008561-5 | PIX: edbraga20@gmail.com</p>
          </div>

          <section className="s"><h2><span className="num">2</span> OBJETO</h2></section>
          <div className="block">Prestação de serviços especializados de assessoria estratégica, documental e informativa para solicitação de Visto de Nômade Digital e residência para trabalho remoto internacional na Espanha.</div>

          <section className="s"><h2><span className="num">3</span> ESCOPO</h2></section>
          <div className="checks">
            <div>✓ Análise de elegibilidade migratória</div>
            <div>✓ Planejamento estratégico do processo</div>
            <div>✓ Lista personalizada de documentos</div>
            <div>✓ Modelos de declarações e contratos</div>
            <div>✓ Revisão documental técnica</div>
            <div>✓ Orientação para solicitação do visto</div>
            <div>✓ Acompanhamento consultivo</div>
          </div>

          <section className="s"><h2><span className="num">4</span> NATUREZA DA PRESTAÇÃO</h2></section>
          <div className="block warn">Assessoria privada documental e estratégica. Não há garantia de aprovação do visto, pois a decisão final pertence exclusivamente às autoridades migratórias.</div>

          <section className="s"><h2><span className="num">5</span> PRAZO</h2></section>
          <div className="block">Vigência até a conclusão do processo administrativo do visto.</div>

          <section className="s"><h2><span className="num">💰</span> VALOR E PAGAMENTO</h2></section>
          <div className="value-box">
            <p className="lbl">VALOR TOTAL DO SERVIÇO</p>
            <p className="val">{valueFormatted}</p>
          </div>
          <div className="block">Pagamento à vista no ato da assinatura. Formas: PIX, Wise, Remessa.</div>

          <footer className="pg">NomadWay © 2026 — Documento Confidencial — Página 2</footer>
        </div>

        {/* PAGE 3 */}
        <div className="page">
          <header>
            <div className="hdr-logo"><span className="hdr-n">N</span><span>NomadWay</span></div>
            <div className="hdr-right">
              <p>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</p>
              <p>Assessoria em Visto de Nômade Digital</p>
            </div>
          </header>

          <section className="s"><h2><span className="num">7</span> OBRIGAÇÕES DA CONTRATADA</h2></section>
          <div className="checks green">
            <div>✓ Fornecer orientação estratégica e documental</div>
            <div>✓ Disponibilizar materiais e modelos</div>
            <div>✓ Auxiliar na organização do processo</div>
            <div>✓ Manter confidencialidade das informações</div>
          </div>

          <section className="s"><h2><span className="num">8</span> OBRIGAÇÕES DO CONTRATANTE</h2></section>
          <div className="checks red">
            <div>✓ Fornecer documentos verdadeiros</div>
            <div>✓ Cumprir prazos solicitados</div>
            <div>✓ Efetuar pagamentos conforme acordado</div>
            <div>✓ Responsabilizar-se pelas informações</div>
          </div>

          <section className="s"><h2><span className="num">9</span> LIMITAÇÃO DE RESPONSABILIDADE</h2></section>
          <div className="block orange">O CONTRATANTE reconhece que a aprovação do visto depende exclusivamente das autoridades. Nenhuma assessoria pode garantir resultado. Prazos e exigências podem mudar.</div>

          <section className="s"><h2><span className="num">10</span> POLÍTICA DE CANCELAMENTO</h2></section>
          <div className="block red">
            <p>Após início dos trâmites não há reembolso.</p>
            <p><strong>Considera-se iniciado:</strong></p>
            <ul>
              <li>Envio da lista de documentos</li>
              <li>Primeira análise estratégica</li>
              <li>Entrega de modelos personalizados</li>
              <li>Início do acompanhamento</li>
            </ul>
          </div>

          <section className="s"><h2><span className="num">11</span> PROTEÇÃO DE DADOS</h2></section>
          <div className="block"><strong>Base legal:</strong> LGPD e GDPR. Dados utilizados exclusivamente para execução do serviço. Retenção: 5 anos após conclusão.</div>

          <section className="s"><h2><span className="num">12</span> CONFIDENCIALIDADE</h2></section>
          <div className="block">Todas as informações serão tratadas como estritamente confidenciais.</div>

          <section className="s"><h2><span className="num">13</span> PROPRIEDADE INTELECTUAL</h2></section>
          <div className="block">Materiais e métodos pertencem à NOMADWAY para uso exclusivo do CONTRATANTE.</div>

          <section className="s"><h2><span className="num">14</span> RELAÇÃO ENTRE AS PARTES</h2></section>
          <div className="block">Sem vínculo empregatício, sociedade ou representação legal entre as partes.</div>

          <footer className="pg">NomadWay © 2026 — Documento Confidencial — Página 3</footer>
        </div>

        {/* PAGE 4 */}
        <div className="page">
          <header>
            <div className="hdr-logo"><span className="hdr-n">N</span><span>NomadWay</span></div>
            <div className="hdr-right">
              <p>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</p>
              <p>Assessoria em Visto de Nômade Digital</p>
            </div>
          </header>

          <section className="s"><h2><span className="num">15</span> FORÇA MAIOR</h2></section>
          <div className="block">A CONTRATADA não se responsabiliza por atrasos decorrentes de mudanças legislativas ou decisões governamentais.</div>

          <section className="s"><h2><span className="num">16</span> LEGISLAÇÃO E FORO</h2></section>
          <div className="block">Regido pelas leis brasileiras. Foro: comarca de Pouso Alegre – MG.</div>

          <section className="s"><h2><span className="num">17</span> ASSINATURA DIGITAL</h2></section>
          <div className="block blue">As partes concordam que este contrato pode ser assinado digitalmente com validade jurídica plena.</div>

          <section className="s"><h2><span className="num">18</span> DECLARAÇÃO FINAL</h2></section>
          <div className="block red">
            <p><strong>O CONTRATANTE declara que:</strong></p>
            <p>(I) compreende integralmente o serviço contratado</p>
            <p>(II) está ciente de que não há garantia de aprovação</p>
            <p>(III) concorda com todos os termos deste contrato</p>
          </div>

          <div className="sign">
            <h3>ASSINATURAS</h3>
            <div className="sign-grid">
              <div className="sign-box">
                <div className="line"></div>
                <p className="lbl">CONTRATANTE</p>
                <p className="name">{f(data.client_name, '[NOME]')}</p>
                <p className="mute">CPF: {f(data.client_cpf, '[CPF]')}</p>
                <p className="mute">Data: {dateStr}</p>
              </div>
              <div className="sign-box">
                <div className="line red"></div>
                <p className="lbl red">CONTRATADA</p>
                <p className="name b">NOMADWAY</p>
                <p className="name">Edmar Candido Braga</p>
                <p className="mute">Representante Legal</p>
                <p className="mute">CPF: 023.711.176-41</p>
                <p className="mute">Data: {dateStr}</p>
              </div>
            </div>
          </div>

          <div className="wit">
            <h4>TESTEMUNHAS (OPCIONAL)</h4>
            <div className="wit-grid">
              <div className="wit-box">
                <div className="line"></div>
                <p>Nome: ____________________</p>
                <p>CPF: _____________________</p>
              </div>
              <div className="wit-box">
                <div className="line"></div>
                <p>Nome: ____________________</p>
                <p>CPF: _____________________</p>
              </div>
            </div>
          </div>

          <footer className="pg">NomadWay © 2026 — Documento Confidencial — Página 4</footer>
        </div>
      </div>

      <style jsx global>{`
        @page {
          size: A4;
          margin: 0;
        }
        
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        @media print {
          .print-btn, .close-btn { display: none !important; }
          body, html { margin: 0 !important; padding: 0 !important; }
        }
        
        body {
          font-family: Helvetica, Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #000;
          margin: 0;
          padding: 0;
          background: #f5f5f5;
        }
        
        .print-btn {
          position: fixed;
          top: 12px;
          right: 12px;
          z-index: 999;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        
        .close-btn {
          position: fixed;
          top: 12px;
          right: 130px;
          z-index: 999;
          background: #e5e5e5;
          color: #333;
          padding: 10px 16px;
          border-radius: 8px;
          border: none;
          font-size: 14px;
          cursor: pointer;
        }
        
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          border-radius: 10px;
          animation: pulse 1s infinite;
        }
        
        .error {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          color: #dc2626;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        #contract {
          max-width: 210mm;
          margin: 0 auto;
          background: white;
        }
        
        .page {
          width: 210mm;
          height: 297mm;
          padding: 15mm;
          box-sizing: border-box;
          position: relative;
          page-break-after: always;
          background: white;
        }
        
        .page.cover {
          background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .logo {
          background: white;
          padding: 15px 25px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 35px;
        }
        
        .logo-icon {
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          color: white;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: bold;
          border-radius: 10px;
        }
        
        .logo-text {
          font-size: 20px;
          font-weight: bold;
        }
        
        .logo-text span:first-child { color: #0F172A; }
        .logo-text .way {
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .title {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .subtitle {
          color: #94A3B8;
          font-size: 10px;
          letter-spacing: 3px;
          margin-bottom: 8px;
        }
        
        .title h1 {
          color: white;
          font-size: 22px;
          font-weight: 600;
          margin: 8px 0;
        }
        
        .subtitle2 {
          color: #F59E0B;
          font-size: 13px;
          margin-top: 8px;
        }
        
        .client-box {
          background: #1E293B;
          padding: 15px 30px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 25px;
        }
        
        .label {
          color: #94A3B8;
          font-size: 9px;
          letter-spacing: 2px;
          margin-bottom: 4px;
        }
        
        .value {
          color: white;
          font-size: 15px;
          font-weight: 600;
        }
        
        .dates {
          display: flex;
          gap: 15px;
        }
        
        .date-box {
          background: #1E293B;
          padding: 12px 20px;
          border-radius: 8px;
          text-align: center;
        }
        
        .cover .footer {
          position: absolute;
          bottom: 18mm;
          color: #64748B;
          font-size: 10px;
        }
        
        /* Header */
        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 6px;
          border-bottom: 3px solid #DC2626;
          margin-bottom: 6mm;
        }
        
        .hdr-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .hdr-n {
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          color: white;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          border-radius: 4px;
        }
        
        .hdr-logo span:last-child {
          font-size: 11px;
          font-weight: bold;
        }
        
        .hdr-right {
          text-align: right;
          font-size: 7px;
          color: #64748B;
          line-height: 1.3;
        }
        
        /* Sections */
        .s {
          margin: 3mm 0;
        }
        
        .s h2 {
          font-size: 11px;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 5px;
          margin: 0;
        }
        
        .num {
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          color: white;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          border-radius: 3px;
        }
        
        .block {
          background: #F8FAFC;
          padding: 8px;
          border-radius: 4px;
          font-size: 9px;
          line-height: 1.5;
          margin-bottom: 3mm;
          border-left: 3px solid #E2E8F0;
        }
        
        .block.client { border-color: #3B82F6; }
        .block.company { border-color: #DC2626; background: #FEF2F2; }
        .block.warn, .block.orange { border-color: #F59E0B; background: #FEF3C7; }
        .block.red { border-color: #DC2626; background: #FEF2F2; }
        .block.blue { border-color: #3B82F6; background: #EFF6FF; }
        
        .block p { margin: 2px 0; }
        
        .lbl {
          font-size: 8px;
          font-weight: bold;
          color: #3B82F6;
          margin-bottom: 3px;
        }
        
        .block.company .lbl { color: #DC2626; }
        
        .name {
          font-size: 11px;
          font-weight: bold;
          margin-bottom: 3px;
        }
        
        .checks {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2mm;
          margin-bottom: 3mm;
        }
        
        .checks div {
          background: #ECFDF5;
          padding: 5px 8px;
          border-radius: 3px;
          font-size: 9px;
          color: #166534;
        }
        
        .checks.green div { background: #ECFDF5; color: #166534; }
        .checks.red div { background: #FEF2F2; color: #991B1B; }
        
        .value-box {
          background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
          padding: 10px;
          border-radius: 6px;
          border: 2px solid #10B981;
          margin-bottom: 3mm;
        }
        
        .value-box .lbl {
          font-size: 9px;
          color: #166534;
        }
        
        .value-box .val {
          font-size: 20px;
          font-weight: bold;
          color: #166534;
        }
        
        ul {
          margin: 4px 0 0 16px;
          padding: 0;
        }
        
        li {
          font-size: 9px;
          margin: 2px 0;
        }
        
        /* Signatures */
        .sign {
          margin-top: 12mm;
        }
        
        .sign h3 {
          font-size: 11px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 8mm;
        }
        
        .sign-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10mm;
        }
        
        .sign-box {
          text-align: center;
        }
        
        .line {
          border-bottom: 1px solid #64748B;
          height: 12mm;
          margin-bottom: 3mm;
        }
        
        .line.red { border-bottom: 2px solid #DC2626; }
        
        .sign-box .lbl { font-size: 9px; font-weight: bold; margin-bottom: 2px; }
        .sign-box .lbl.red { color: #DC2626; }
        .sign-box .name { font-size: 10px; margin: 1px 0; }
        .sign-box .name.b { font-weight: bold; }
        .sign-box .mute { font-size: 8px; color: #64748B; margin: 1px 0; }
        
        /* Witnesses */
        .wit {
          margin-top: 10mm;
        }
        
        .wit h4 {
          font-size: 9px;
          font-weight: normal;
          text-align: center;
          margin-bottom: 4mm;
        }
        
        .wit-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10mm;
        }
        
        .wit-box {
          text-align: center;
        }
        
        .wit-box .line {
          border-bottom: 1px solid #64748B;
          height: 8mm;
        }
        
        .wit-box p {
          font-size: 8px;
          color: #64748B;
          margin: 2px 0;
        }
        
        /* Footer */
        .pg {
          position: absolute;
          bottom: 6mm;
          left: 15mm;
          right: 15mm;
          text-align: center;
          font-size: 7px;
          color: #64748B;
        }
      `}</style>
    </>
  );
}

export default function ContractPDFPage() {
  return (
    <Suspense fallback={<div className="loading"><div className="spinner"></div></div>}>
      <ContractPreviewContent />
    </Suspense>
  );
}