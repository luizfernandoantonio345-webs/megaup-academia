import { Link } from 'react-router-dom'
import { Zap, ArrowLeft } from 'lucide-react'

const LAST_UPDATE = '07 de julho de 2026'

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color:'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.02em' }}>{title}</h2>
      <div style={{ fontSize: 13, color:'var(--text-secondary)', lineHeight: 1.8 }}>{children}</div>
    </div>
  )
}

function Tag({ color, children }) {
  return (
    <span style={{ display: 'inline-block', background: `${color}1a`, border: `1px solid ${color}33`, borderRadius: 6, padding: '2px 8px', fontSize: 11, color, fontWeight: 600, marginRight: 6, marginBottom: 6 }}>
      {children}
    </span>
  )
}

export default function Privacidade() {
  return (
    <div style={{ minHeight: '100vh', background:'var(--bg-page)', color:'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, background:'var(--bg-page)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 'auto' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap style={{ width: 13, height: 13, color: 'white' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color:'var(--text-primary)' }}>MegaUp</span>
        </div>
        <Link to="/registrar" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color:'var(--text-muted)', textDecoration: 'none' }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Voltar ao cadastro
        </Link>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 8 }}>Política de Privacidade</h1>
          <p style={{ fontSize: 13, color:'var(--text-muted)', marginBottom: 16 }}>Última atualização: {LAST_UPDATE}</p>
          <div style={{ background:'var(--bg-card)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#fca5a5', lineHeight: 1.7 }}>
            Esta Política descreve como o MegaUp coleta, usa e protege seus dados pessoais em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>.
          </div>
        </div>

        <Section title="1. Quem somos (Controlador e Operador)">
          <p style={{ marginBottom: 8 }}>O MegaUp é desenvolvido e operado de forma autônoma. Para fins da LGPD:</p>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li><strong style={{ color:'var(--text-primary)' }}>Controlador dos dados dos alunos:</strong> o personal trainer que utiliza a plataforma.</li>
            <li><strong style={{ color:'var(--text-primary)' }}>Operador:</strong> o MegaUp, que processa os dados por instrução do personal trainer.</li>
            <li><strong style={{ color:'var(--text-primary)' }}>Controlador dos dados de conta:</strong> o MegaUp, em relação aos dados dos personal trainers cadastrados.</li>
          </ul>
        </Section>

        <Section title="2. Dados que coletamos">
          <p style={{ marginBottom: 12 }}>Coletamos os seguintes tipos de dados:</p>
          <div style={{ marginBottom: 12 }}>
            <p style={{ color:'var(--text-primary)', fontWeight: 500, marginBottom: 6 }}>Dados de conta (Personal Trainer)</p>
            <div><Tag color="#f87171">Nome completo</Tag><Tag color="#f87171">E-mail</Tag><Tag color="#f87171">Nome da academia</Tag><Tag color="#f87171">Data de aceite dos termos</Tag></div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <p style={{ color:'var(--text-primary)', fontWeight: 500, marginBottom: 6 }}>Dados dos alunos (inseridos pelo personal)</p>
            <div><Tag color="#34d399">Nome</Tag><Tag color="#34d399">E-mail</Tag><Tag color="#34d399">Peso e medidas corporais</Tag><Tag color="#34d399">Percentual de gordura</Tag><Tag color="#34d399">Fotos de evolução</Tag><Tag color="#34d399">Histórico de treinos</Tag></div>
          </div>
          <div>
            <p style={{ color:'var(--text-primary)', fontWeight: 500, marginBottom: 6 }}>Dados técnicos (automáticos)</p>
            <div><Tag color="#fbbf24">Endereço IP</Tag><Tag color="#fbbf24">Logs de acesso</Tag><Tag color="#fbbf24">Tipo de dispositivo</Tag></div>
          </div>
        </Section>

        <Section title="3. Finalidade e Base Legal">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px 8px 0', color:'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Finalidade</th>
                <th style={{ textAlign: 'left', padding: '8px 12px 8px 0', color:'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Base Legal (LGPD)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Prestação do serviço (gestão de alunos e treinos)', 'Execução de contrato (Art. 7º, V)'],
                ['Envio de notificações e e-mails de lembrete', 'Consentimento (Art. 7º, I) e Legítimo interesse (Art. 7º, IX)'],
                ['Cobrança e controle financeiro', 'Execução de contrato (Art. 7º, V)'],
                ['Segurança e prevenção a fraudes', 'Legítimo interesse (Art. 7º, IX)'],
                ['Melhoria do produto (dados agregados e anonimizados)', 'Legítimo interesse (Art. 7º, IX)'],
              ].map(([fin, base], i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 12px 10px 0', color:'var(--text-secondary)' }}>{fin}</td>
                  <td style={{ padding: '10px 12px 10px 0', color:'var(--text-muted)' }}>{base}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="4. Compartilhamento de Dados">
          <p style={{ marginBottom: 8 }}>Seus dados são compartilhados apenas com:</p>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li><strong style={{ color:'var(--text-primary)' }}>Render.com</strong> — infraestrutura de hospedagem (servidores nos EUA, com cláusulas contratuais padrão).</li>
            <li><strong style={{ color:'var(--text-primary)' }}>Resend</strong> — serviço de envio de e-mails transacionais.</li>
            <li><strong style={{ color:'var(--text-primary)' }}>Stripe</strong> — processamento de pagamentos (dados de cartão nunca passam pelos servidores do MegaUp).</li>
          </ul>
          <p style={{ marginTop: 10 }}>Não vendemos, alugamos ou compartilhamos dados com terceiros para fins de marketing.</p>
        </Section>

        <Section title="5. Dados Sensíveis de Saúde">
          <p>Dados como peso, percentual de gordura, medidas corporais e fotos de evolução são considerados dados sensíveis pela LGPD. Esses dados são tratados somente com o consentimento explícito do aluno (Art. 11, I) e armazenados com criptografia em repouso no banco de dados PostgreSQL. Fotos são armazenadas em formato base64 diretamente no banco, sem servidores de mídia de terceiros.</p>
        </Section>

        <Section title="6. Seus Direitos como Titular">
          <p style={{ marginBottom: 8 }}>Você tem os seguintes direitos, conforme Art. 18 da LGPD:</p>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li><strong style={{ color:'var(--text-primary)' }}>Confirmação e acesso</strong> — saber quais dados temos sobre você.</li>
            <li><strong style={{ color:'var(--text-primary)' }}>Correção</strong> — corrigir dados incompletos ou desatualizados.</li>
            <li><strong style={{ color:'var(--text-primary)' }}>Anonimização ou exclusão</strong> — para dados tratados com base em consentimento.</li>
            <li><strong style={{ color:'var(--text-primary)' }}>Portabilidade</strong> — receber seus dados em formato estruturado.</li>
            <li><strong style={{ color:'var(--text-primary)' }}>Revogação de consentimento</strong> — a qualquer momento, sem prejuízo ao uso anterior.</li>
            <li><strong style={{ color:'var(--text-primary)' }}>Oposição</strong> — ao tratamento baseado em legítimo interesse.</li>
          </ul>
          <p style={{ marginTop: 10 }}>Para exercer seus direitos, envie e-mail para: <span style={{ color: '#f87171' }}>santossod345@gmail.com</span></p>
        </Section>

        <Section title="7. Retenção de Dados">
          <p>Os dados são mantidos enquanto a conta estiver ativa. Após o encerramento da conta, os dados são deletados em até 30 dias, exceto quando obrigação legal exige retenção por prazo maior (ex: dados fiscais — 5 anos).</p>
        </Section>

        <Section title="8. Segurança">
          <p>Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo: autenticação JWT com expiração, senhas armazenadas com hash bcrypt, comunicações via HTTPS/TLS, banco de dados PostgreSQL com acesso restrito e isolamento multi-tenant por linha.</p>
        </Section>

        <Section title="9. Cookies e Armazenamento Local">
          <p>O MegaUp utiliza localStorage do navegador para armazenar o token de autenticação. Não utilizamos cookies de rastreamento ou analytics de terceiros.</p>
        </Section>

        <Section title="10. Transferência Internacional">
          <p>Dados podem ser processados nos EUA (Render.com) com base em cláusulas contratuais padrão e mecanismos reconhecidos pela ANPD para transferências internacionais.</p>
        </Section>

        <Section title="11. Contato e Encarregado (DPO)">
          <p>Responsável pelo tratamento de dados pessoais:</p>
          <p style={{ marginTop: 8 }}>E-mail: <span style={{ color: '#f87171' }}>santossod345@gmail.com</span></p>
          <p>Tempo de resposta: até 15 dias úteis.</p>
        </Section>

        <Section title="12. Alterações nesta Política">
          <p>Esta política pode ser atualizada. Você será notificado por e-mail sobre mudanças relevantes. A data de "Última atualização" no topo desta página indica quando foi revisada pela última vez.</p>
        </Section>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 24, marginTop: 8 }}>
          <Link to="/termos" style={{ color: '#f87171', fontSize: 13, textDecoration: 'none' }}>
            Ver Termos de Uso →
          </Link>
        </div>
      </div>
    </div>
  )
}


