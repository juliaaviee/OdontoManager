import { db } from '../db.js';

export const AgendaView = {
  currentDate: new Date(),
  viewMode: 'mensal', // 'mensal' ou 'diario'
  selectedDateStr: new Date().toISOString().split('T')[0],

  render() {
    const formattedPeriod = this.getFormattedPeriod();
    const patients = db.getPatients();
    
    // Gera opções de pacientes para o formulário
    const patientOptionsHTML = patients.map(p => `
      <option value="${p.id}">${p.name} (CPF: ${p.cpf})</option>
    `).join('');

    return `
      <div class="agenda-layout">
        <!-- Sidebar Controls -->
        <div class="agenda-sidebar">
          <button class="btn btn-primary" id="btn-new-app" style="width: 100%;">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            Novo Agendamento
          </button>

          <!-- Mini Info Card -->
          <div class="card" style="padding: 16px;">
            <h4 style="font-size: 14px; margin-bottom: 12px; color: var(--text-main);">Status de Consulta</h4>
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 12px; height: 12px; border-radius: 3px; background-color: var(--color-secondary);"></span>
                <span>Agendado (Confirmado)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 12px; height: 12px; border-radius: 3px; background-color: var(--color-warning);"></span>
                <span>Aguardando (Na Recepção)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 12px; height: 12px; border-radius: 3px; background-color: var(--color-info);"></span>
                <span>Em Atendimento (Na Cadeira)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 12px; height: 12px; border-radius: 3px; background-color: var(--color-success);"></span>
                <span>Concluído (Procedimento Pago)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Calendar Container -->
        <div class="calendar-panel">
          <!-- Calendar Header -->
          <div class="calendar-header-actions">
            <div class="calendar-title-box">
              <button class="btn btn-secondary btn-sm" id="btn-cal-prev">◄</button>
              <button class="btn btn-secondary btn-sm" id="btn-cal-today">Hoje</button>
              <button class="btn btn-secondary btn-sm" id="btn-cal-next">►</button>
              <span class="calendar-current-period">${formattedPeriod}</span>
            </div>
            
            <div class="calendar-view-modes">
              <button class="arch-btn ${this.viewMode === 'mensal' ? 'active' : ''}" id="btn-mode-month">Mensal</button>
              <button class="arch-btn ${this.viewMode === 'diario' ? 'active' : ''}" id="btn-mode-day">Diário</button>
            </div>
          </div>

          <!-- Calendar Render Area -->
          <div id="calendar-view-container">
            ${this.viewMode === 'mensal' ? this.renderMonthGrid() : this.renderDayTimeline()}
          </div>
        </div>
      </div>

      <!-- Add/Edit Appointment Modal -->
      <div class="modal-backdrop" id="appointment-modal">
        <div class="modal-container" style="max-width: 480px;">
          <div class="modal-header">
            <h3 class="modal-title" id="app-modal-title">Novo Agendamento Clínico</h3>
            <button class="btn-icon" id="btn-close-app-modal" style="width: 32px; height: 32px;">×</button>
          </div>
          <form id="appointment-form">
            <div class="modal-body">
              <input type="hidden" id="form-app-id">
              <div class="form-grid" style="grid-template-columns: 1fr;">
                <div class="form-group">
                  <label for="app-patient">Paciente *</label>
                  <select id="app-patient" required>
                    <option value="" disabled selected>Selecione o Paciente...</option>
                    ${patientOptionsHTML}
                  </select>
                </div>
                <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 12px;">
                  <div class="form-group">
                    <label for="app-date">Data da Consulta *</label>
                    <input type="date" id="app-date" required>
                  </div>
                  <div class="form-group">
                    <label for="app-time">Horário *</label>
                    <input type="time" id="app-time" required>
                  </div>
                </div>
                <div class="form-group">
                  <label for="app-treatment">Tratamento / Procedimento *</label>
                  <input type="text" id="app-treatment" required placeholder="Ex: Restauração, Limpeza, Avaliação">
                </div>
                <div class="form-group">
                  <label for="app-notes">Observações do Agendamento</label>
                  <textarea id="app-notes" rows="3" placeholder="Sintomas, alertas, solicitações especiais..."></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-app-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Confirmar Agendamento</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  getFormattedPeriod() {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    if (this.viewMode === 'mensal') {
      return `${months[this.currentDate.getMonth()]} de ${this.currentDate.getFullYear()}`;
    } else {
      // Diário
      const day = String(this.currentDate.getDate()).padStart(2, '0');
      const monthLabel = months[this.currentDate.getMonth()];
      const year = this.currentDate.getFullYear();
      return `${day} de ${monthLabel} de ${year}`;
    }
  },

  renderMonthGrid() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 (Dom) a 6 (Sáb)
    const lastDay = new Date(year, month + 1, 0).getDate();
    const prevLastDay = new Date(year, month, 0).getDate();

    const appointments = db.getAppointments();

    let cellsHTML = '';

    // Dias do mês anterior
    for (let i = firstDayIndex; i > 0; i--) {
      const dayNum = prevLastDay - i + 1;
      cellsHTML += `<div class="calendar-cell other-month"><span class="cell-day-num">${dayNum}</span></div>`;
    }

    // Dias do mês atual
    const todayStr = new Date().toISOString().split('T')[0];
    for (let day = 1; day <= lastDay; day++) {
      const currentCellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = currentCellDateStr === todayStr;

      // Filtra consultas para este dia
      const dayApps = appointments.filter(a => a.date === currentCellDateStr);
      
      const appBadgesHTML = dayApps.slice(0, 3).map(app => {
        let statusClass = 'scheduled';
        if (app.status === 'Concluído') statusClass = 'done';
        else if (app.status === 'Aguardando') statusClass = 'waiting';
        else if (app.status === 'Em Atendimento') statusClass = 'treatment';

        return `
          <div class="calendar-event-tag ${statusClass}" title="${app.time} - ${app.patientName} (${app.treatment})">
            ${app.time} ${app.patientName.split(' ')[0]}
          </div>
        `;
      }).join('');

      const hasMoreIndicator = dayApps.length > 3 ? `<div style="font-size: 9px; text-align: center; width:100%; color:var(--text-muted); font-weight:700;">+ ${dayApps.length - 3} mais</div>` : '';

      cellsHTML += `
        <div class="calendar-cell ${isToday ? 'today' : ''}" data-date="${currentCellDateStr}">
          <span class="cell-day-num">${day}</span>
          <div style="display:flex; flex-direction:column; gap:3px; width:100%; margin-top:4px;">
            ${appBadgesHTML}
            ${hasMoreIndicator}
          </div>
        </div>
      `;
    }

    return `
      <div class="calendar-grid-view">
        <div class="calendar-days-header">
          <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
        </div>
        <div class="calendar-cells-grid">
          ${cellsHTML}
        </div>
      </div>
    `;
  },

  renderDayTimeline() {
    const selectedDateStr = this.currentDate.toISOString().split('T')[0];
    const appointments = db.getAppointments().filter(a => a.date === selectedDateStr);
    
    // Lista de horários comerciais das 08h às 18h
    const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    
    const rowsHTML = hours.map(hour => {
      // Filtra consultas que batem com este horário (ou no mesmo intervalo de hora cheia)
      const hourApps = appointments.filter(a => {
        const appHour = a.time.split(':')[0];
        const searchHour = hour.split(':')[0];
        return appHour === searchHour;
      });

      const cardsHTML = hourApps.map(app => {
        let statusClass = 'scheduled';
        if (app.status === 'Concluído') statusClass = 'done';
        else if (app.status === 'Aguardando') statusClass = 'waiting';
        else if (app.status === 'Em Atendimento') statusClass = 'treatment';

        return `
          <div class="hour-event-card ${statusClass}" data-id="${app.id}">
            <div>
              <strong>${app.time}</strong> - ${app.patientName} <span style="font-weight: 500; font-size:11.5px; opacity:0.85;">(${app.treatment})</span>
            </div>
            <div style="display:flex; gap: 8px;">
              <span class="badge ${app.status === 'Concluído' ? 'badge-success' : app.status === 'Aguardando' ? 'badge-warning' : app.status === 'Em Atendimento' ? 'badge-info' : 'badge-secondary'}">${app.status}</span>
              <button class="btn-icon btn-delete-app" data-id="${app.id}" style="width:24px; height:24px; font-size:10px; border-color:transparent;" title="Deletar Agendamento">×</button>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="hour-row" data-hour="${hour}">
          <div class="hour-label">${hour}</div>
          <div class="hour-events-container" data-date="${selectedDateStr}" data-hour="${hour}">
            ${cardsHTML}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="day-view-hours">
        ${rowsHTML}
      </div>
    `;
  },

  afterRender(router) {
    // Caso seja aberto o modal de agendamento por atalho
    if (window.openAddAppointmentModalOnLoad) {
      window.openAddAppointmentModalOnLoad = false;
      
      const preselectedPatientId = window.preselectedPatientIdOnLoad || '';
      window.preselectedPatientIdOnLoad = null;

      this.openAppModal(null, preselectedPatientId);
    }

    // Toggle de Modos de Visão
    document.getElementById('btn-mode-month')?.addEventListener('click', () => {
      this.viewMode = 'mensal';
      router.loadView('agenda');
    });

    document.getElementById('btn-mode-day')?.addEventListener('click', () => {
      this.viewMode = 'diario';
      router.loadView('agenda');
    });

    // Navegação de Períodos
    document.getElementById('btn-cal-prev')?.addEventListener('click', () => {
      if (this.viewMode === 'mensal') {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      } else {
        this.currentDate.setDate(this.currentDate.getDate() - 1);
      }
      router.loadView('agenda');
    });

    document.getElementById('btn-cal-next')?.addEventListener('click', () => {
      if (this.viewMode === 'mensal') {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      } else {
        this.currentDate.setDate(this.currentDate.getDate() + 1);
      }
      router.loadView('agenda');
    });

    document.getElementById('btn-cal-today')?.addEventListener('click', () => {
      this.currentDate = new Date();
      router.loadView('agenda');
    });

    // Cliques em células do calendário mensal para abrir formulário
    if (this.viewMode === 'mensal') {
      const cells = document.querySelectorAll('.calendar-cell');
      cells.forEach(cell => {
        cell.addEventListener('click', () => {
          const date = cell.dataset.date;
          if (date) {
            // Se clicar na célula, muda a data atual para aquele dia e abre o agendamento pré-selecionado
            this.selectedDateStr = date;
            this.openAppModal(date);
          }
        });
      });
    } else {
      // Diário - Clique nos contêineres de hora vazios
      const hourContainers = document.querySelectorAll('.hour-events-container');
      hourContainers.forEach(container => {
        container.addEventListener('click', (e) => {
          // Se clicou no container vazio (não nos cards de consulta)
          if (e.target === container) {
            const date = container.dataset.date;
            const hour = container.dataset.hour;
            this.openAppModal(date, '', hour);
          }
        });
      });

      // Clique em um card existente para editar (opcional) ou excluir
      const appCards = document.querySelectorAll('.hour-event-card');
      appCards.forEach(card => {
        card.addEventListener('click', (e) => {
          // Se clicou em excluir
          const deleteBtn = e.target.closest('.btn-delete-app');
          if (deleteBtn) {
            e.stopPropagation();
            const id = deleteBtn.dataset.id;
            if (confirm('Deseja realmente cancelar este agendamento?')) {
              db.deleteAppointment(id);
              router.loadView('agenda');
            }
            return;
          }
          
          // Caso contrário, abre para editar
          const id = card.dataset.id;
          const app = db.getAppointmentById(id);
          if (app) {
            this.openAppModal(app.date, app.patientId, app.time, app);
          }
        });
      });
    }

    // Modal Events
    document.getElementById('btn-new-app')?.addEventListener('click', () => {
      this.openAppModal();
    });
    
    document.getElementById('btn-close-app-modal')?.addEventListener('click', () => this.closeAppModal());
    document.getElementById('btn-cancel-app-modal')?.addEventListener('click', () => this.closeAppModal());

    const appForm = document.getElementById('appointment-form');
    appForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAppFormSubmit(appForm, router);
    });
  },

  openAppModal(date = null, patientId = '', time = '', appToEdit = null) {
    const modal = document.getElementById('appointment-modal');
    const form = document.getElementById('appointment-form');
    const titleLabel = document.getElementById('app-modal-title');

    form.reset();

    const todayStr = new Date().toISOString().split('T')[0];
    document.getElementById('app-date').value = date || todayStr;
    document.getElementById('app-time').value = time || '09:00';
    document.getElementById('form-app-id').value = '';

    if (patientId) {
      document.getElementById('app-patient').value = patientId;
    }

    if (appToEdit) {
      titleLabel.innerText = 'Editar Agendamento';
      document.getElementById('form-app-id').value = appToEdit.id;
      document.getElementById('app-patient').value = appToEdit.patientId;
      document.getElementById('app-date').value = appToEdit.date;
      document.getElementById('app-time').value = appToEdit.time;
      document.getElementById('app-treatment').value = appToEdit.treatment;
      document.getElementById('app-notes').value = appToEdit.notes || '';
    } else {
      titleLabel.innerText = 'Novo Agendamento Clínico';
    }

    modal.classList.add('show');
  },

  closeAppModal() {
    const modal = document.getElementById('appointment-modal');
    modal.classList.remove('show');
  },

  handleAppFormSubmit(form, router) {
    const id = document.getElementById('form-app-id').value;
    const patientId = document.getElementById('app-patient').value;

    if (!patientId) {
      alert('Por favor, selecione um paciente!');
      return;
    }

    const appData = {
      id: id || undefined,
      patientId: patientId,
      date: document.getElementById('app-date').value,
      time: document.getElementById('app-time').value,
      treatment: document.getElementById('app-treatment').value,
      notes: document.getElementById('app-notes').value,
      status: id ? (db.getAppointmentById(id)?.status || 'Agendado') : 'Agendado'
    };

    db.saveAppointment(appData);
    this.closeAppModal();
    router.loadView('agenda');
  }
};
