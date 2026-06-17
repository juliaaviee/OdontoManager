import { db } from '../db.js';

export const DashboardView = {
  render() {
    const stats = db.getDashboardStats();
    const todayStr = new Date().toISOString().split('T')[0];
    const allAppointments = db.getAppointments();
    
    const loggedUser = db.getLoggedUser();
    const isSecretaria = loggedUser && loggedUser.role === 'secretaria';

    // Filtra consultas de hoje ordenadas por horário
    const todayAppointments = allAppointments
      .filter(a => a.date === todayStr)
      .sort((a, b) => a.time.localeCompare(b.time));

    // Formata valores financeiros
    const formatCurrency = (val) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    // Gera lista de consultas de hoje em HTML
    let appointmentsHTML = '';
    if (todayAppointments.length === 0) {
      appointmentsHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <svg style="width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.5;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
          <p>Nenhuma consulta agendada para hoje.</p>
        </div>
      `;
    } else {
      appointmentsHTML = todayAppointments.map(app => {
        const getStatusBadgeClass = (status) => {
          if (status === 'Concluído') return 'badge-success';
          if (status === 'Aguardando') return 'badge-warning';
          if (status === 'Em Atendimento') return 'badge-info';
          return 'badge-secondary'; // Agendado
        };

        return `
          <div class="appointment-item" data-id="${app.id}">
            <div class="appointment-patient-info">
              <div class="appointment-time-badge">${app.time}</div>
              <div class="patient-meta-details">
                <span class="patient-name">${app.patientName}</span>
                <span class="treatment-type">${app.treatment}</span>
              </div>
            </div>
            <div class="appointment-actions">
              <span class="badge ${getStatusBadgeClass(app.status)}">${app.status}</span>
              <select class="status-select" data-id="${app.id}">
                <option value="Agendado" ${app.status === 'Agendado' ? 'selected' : ''}>Agendado</option>
                <option value="Aguardando" ${app.status === 'Aguardando' ? 'selected' : ''}>Aguardando</option>
                <option value="Em Atendimento" ${app.status === 'Em Atendimento' ? 'selected' : ''}>Em Atendimento</option>
                <option value="Concluído" ${app.status === 'Concluído' ? 'selected' : ''}>Concluído</option>
              </select>
            </div>
          </div>
        `;
      }).join('');
    }

    // Lógica do gráfico de fluxo de caixa (Últimos 6 dias)
    const transactions = db.getTransactions();
    const days = [];
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    // Pegar os últimos 6 dias incluindo hoje
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = weekdays[d.getDay()];
      
      const dayTransactions = transactions.filter(t => t.date === dateStr);
      const inflow = dayTransactions.filter(t => t.type === 'inflow').reduce((sum, t) => sum + Number(t.amount), 0);
      const outflow = dayTransactions.filter(t => t.type === 'outflow').reduce((sum, t) => sum + Number(t.amount), 0);
      
      days.push({ label, inflow, outflow });
    }

    // Calcula o maior valor para normalizar a altura das barras
    const maxVal = Math.max(...days.flatMap(d => [d.inflow, d.outflow]), 200); // Mínimo 200 para escala não ficar gigante

    const chartBarsHTML = days.map(d => {
      const inflowHeight = (d.inflow / maxVal) * 100;
      const outflowHeight = (d.outflow / maxVal) * 100;
      return `
        <div class="chart-bar-wrapper">
          <div class="chart-bar-combo">
            <div class="chart-bar inflow" style="height: ${inflowHeight}%;" title="Entrada: ${formatCurrency(d.inflow)}"></div>
            <div class="chart-bar outflow" style="height: ${outflowHeight}%;" title="Saída: ${formatCurrency(d.outflow)}"></div>
          </div>
          <span class="chart-label">${d.label}</span>
        </div>
      `;
    }).join('');

    return `
      <!-- KPI Grid -->
      <div class="dashboard-grid">
        <div class="card kpi-card">
          <div class="kpi-details">
            <span class="kpi-title">Pacientes Cadastrados</span>
            <span class="kpi-value">${stats.totalPatients}</span>
          </div>
          <div class="kpi-icon-box primary">
            <svg class="kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
        </div>

        <div class="card kpi-card">
          <div class="kpi-details">
            <span class="kpi-title">Consultas de Hoje</span>
            <span class="kpi-value">${stats.appointmentsToday}</span>
          </div>
          <div class="kpi-icon-box secondary">
            <svg class="kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
        </div>

        ${isSecretaria ? '' : `
        <div class="card kpi-card">
          <div class="kpi-details">
            <span class="kpi-title">Faturamento Mensal</span>
            <span class="kpi-value">${formatCurrency(stats.monthlyBilling)}</span>
          </div>
          <div class="kpi-icon-box success">
            <svg class="kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
        </div>
        `}

        <div class="card kpi-card">
          <div class="kpi-details">
            <span class="kpi-title">Tratamentos Ativos</span>
            <span class="kpi-value">${stats.activeTreatments}</span>
          </div>
          <div class="kpi-icon-box info">
            <svg class="kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
        </div>
      </div>

      <!-- Main Sections -->
      <div class="dashboard-sections" style="grid-template-columns: ${isSecretaria ? '1fr 300px' : '2fr 1fr'};">
        <!-- Today's Appointments -->
        <div class="card">
          <div class="section-header">
            <h2 class="section-title">Consultas Clínicas de Hoje</h2>
            <button class="btn btn-secondary btn-sm" id="btn-quick-appointment">Ver Agenda Completa</button>
          </div>
          <div class="appointment-list">
            ${appointmentsHTML}
          </div>
        </div>

        <!-- Quick actions & Flow Chart -->
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <!-- Quick actions -->
          <div class="card">
            <h2 class="section-title" style="margin-bottom: 16px;">Ações Rápidas</h2>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <button class="btn btn-primary" id="btn-add-patient-quick" style="width: 100%;">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                Cadastrar Novo Paciente
              </button>
              <button class="btn btn-secondary" id="btn-add-app-quick" style="width: 100%;">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                Agendar Consulta
              </button>
            </div>
          </div>

          ${isSecretaria ? '' : `
          <!-- Cash Flow Chart -->
          <div class="card">
            <h2 class="section-title" style="margin-bottom: 12px;">Fluxo de Caixa Semanal</h2>
            <div class="chart-container">
              ${chartBarsHTML}
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-color inflow"></span> Entradas
              </div>
              <div class="legend-item">
                <span class="legend-color outflow"></span> Saídas
              </div>
            </div>
          </div>
          `}
        </div>
      </div>
    `;
  },

  afterRender(router) {
    // Escuta mudança de status da consulta diretamente na tabela
    const statusSelects = document.querySelectorAll('.status-select');
    statusSelects.forEach(select => {
      select.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        const newStatus = e.target.value;
        
        const appointment = db.getAppointmentById(id);
        if (appointment) {
          appointment.status = newStatus;
          db.saveAppointment(appointment);
          
          // Se for concluído, vamos registrar automaticamente uma entrada financeira!
          if (newStatus === 'Concluído') {
            const hasTransaction = db.getTransactions().some(t => t.description.includes(`a_${id}`) || t.description.includes(appointment.patientName));
            if (!hasTransaction) {
              db.saveTransaction({
                type: 'inflow',
                amount: 250.00, // Preço padrão da consulta
                description: `Procedimento Concluído - ${appointment.patientName} (Ref: a_${id})`,
                patientId: appointment.patientId
              });
            }
          }
          
          // Recarrega o dashboard
          router.loadView('dashboard');
        }
      });
    });

    // Links Rápidos
    document.getElementById('btn-quick-appointment')?.addEventListener('click', () => {
      window.location.hash = '#agenda';
    });

    document.getElementById('btn-add-patient-quick')?.addEventListener('click', () => {
      window.location.hash = '#pacientes';
      // Passa um sinalizador global temporário para abrir o modal
      window.openAddPatientModalOnLoad = true;
    });

    document.getElementById('btn-add-app-quick')?.addEventListener('click', () => {
      window.location.hash = '#agenda';
      window.openAddAppointmentModalOnLoad = true;
    });
  }
};
