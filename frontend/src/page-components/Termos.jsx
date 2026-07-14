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

export default function Termos() {
  return (
    <div style={{ minHeight: '100vh', background:'var(--bg-page)', color:'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, background:'var(--bg-page)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 'auto' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: '#E8342B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 8 }}>Termos de Uso</h1>
          <p style={{ fontSize: 13, color:'var(--text-muted)' }}>Última atualização: {LAST_UPDATE}</p>
        </div>

        <Section title="1. Aceitação dos Termos">
          <p>Ao criar uma conta ou utilizar o MegaUp, você concorda com estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não utilize a plataforma.</p>
        </Section>

        <Section title="2. Descrição do Serviço">
          <p>O MegaUp é uma plataforma SaaS (Software como Serviço) destinada a personal trainers e profissionais de educação física. O serviço permite a gestão de alunos, prescrição de treinos, acompanhamento de resultados, controle financeiro e comunicação entre personal e alunos.</p>
        </Section>

        <Section title="3. Elegibilidade e Cadastro">
          <p style={{ marginBottom: 8 }}>Para utilizar o MegaUp como Personal Trainer, você deve:</p>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li>Ter pelo menos 18 anos de idade.</li>
            <li>Fornecer informações verdadeiras e atualizadas no cadastro.</li>
            <li>Ser responsável por manter a confidencialidade de sua senha.</li>
            <li>Notificar imediatamente o MegaUp sobre qualquer uso não autorizado da sua conta.</li>
          </ul>
        </Section>

        <Section title="4. Plano Gratuito e Cobrança">
          <p style={{ marginBottom: 8 }}>O MegaUp oferece um período de avaliação gratuito (trial) de 14 dias. Após o término do trial:</p>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li>O acesso a funcionalidades pagas será restrito até a contratação de um plano.</li>
            <li>Os dados do usuário permanecem armazenados por 30 dias após o vencimento sem pagamento.</li>
            <li>O cancelamento pode ser realizado a qualquer momento, sem multa.</li>
          </ul>
        </Section>

        <Section title="5. Uso Aceitável">
          <p style={{ marginBottom: 8 }}>É proibido utilizar o MegaUp para:</p>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li>Atividades ilegais ou que violem direitos de terceiros.</li>
            <li>Envio de spam ou comunicações não solicitadas.</li>
            <li>Acesso não autorizado a sistemas ou dados de outros usuários.</li>
            <li>Revenda ou sublicenciamento do serviço sem autorização prévia por escrito.</li>
          </ul>
        </Section>

        <Section title="6. Dados dos Alunos e Responsabilidade">
          <p>O personal trainer é o controlador dos dados de seus alunos, conforme a LGPD (Lei nº 13.709/2018). O MegaUp atua como operador. O personal trainer é responsável por obter o consentimento adequado de seus alunos para o tratamento de dados, especialmente dados sensíveis de saúde.</p>
        </Section>

        <Section title="7. Propriedade Intelectual">
          <p>Todo o conteúdo, código, marcas e design do MegaUp são propriedade exclusiva do desenvolvedor. Os dados inseridos pelo usuário (alunos, treinos, avaliações) pertencem ao próprio usuário e podem ser exportados ou excluídos mediante solicitação.</p>
        </Section>

        <Section title="8. Disponibilidade e SLA">
          <p>O MegaUp se esforça para manter a disponibilidade do serviço, mas não garante 100% de uptime. Interrupções programadas serão comunicadas com antecedência. O MegaUp não se responsabiliza por perdas decorrentes de indisponibilidade do serviço.</p>
        </Section>

        <Section title="9. Limitação de Responsabilidade">
          <p>Na máxima extensão permitida pela lei, o MegaUp não será responsável por danos indiretos, incidentais, especiais ou consequentes. A responsabilidade total do MegaUp está limitada ao valor pago pelo usuário nos 3 meses anteriores ao evento gerador.</p>
        </Section>

        <Section title="10. Alterações nos Termos">
          <p>O MegaUp pode atualizar estes Termos periodicamente. Usuários serão notificados por e-mail sobre alterações relevantes. O uso continuado da plataforma após a notificação constitui aceite das novas condições.</p>
        </Section>

        <Section title="11. Encerramento de Conta">
          <p>O MegaUp pode suspender ou encerrar contas que violem estes Termos, após notificação. O usuário pode encerrar sua conta a qualquer momento por meio das configurações ou enviando e-mail para o suporte. Após o encerramento, os dados são deletados em até 30 dias.</p>
        </Section>

        <Section title="12. Lei Aplicável e Foro">
          <p>Estes Termos são regidos pelas leis da República Federativa do Brasil. Para resolução de conflitos, fica eleito o foro da comarca de domicílio do desenvolvedor.</p>
        </Section>

        <Section title="13. Contato">
          <p>Dúvidas sobre estes Termos devem ser enviadas para: <span style={{ color: '#FF8078' }}>santossod345@gmail.com</span></p>
        </Section>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 24, marginTop: 8 }}>
          <Link to="/privacidade" style={{ color: '#FF8078', fontSize: 13, textDecoration: 'none' }}>
            Ver Política de Privacidade (LGPD) →
          </Link>
        </div>
      </div>
    </div>
  )
}


