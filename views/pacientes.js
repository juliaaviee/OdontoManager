import { db } from '../db.js';
import { Odontograma } from '../components/odontograma.js';

export const PatientsView = {
  selectedPatientId: null,
  activeTab: 'odontograma', // 'odontograma', 'historico', 'anamnese', 'financeiro'

  render() {
    if (this.selectedPatientId) {
      return this.renderDetailView();
    }
    return this.renderListView();
  },

  renderListView() {
    const patients = db.getPatients();
    
    // Gera linhas da tabela
    const rowsHTML = patients.map(p => `
      <tr class="patient-row" data-id="${p.id}" style="cursor: pointer;">
        <td>
          <div class="table-patient-name">${p.name}</div>
          <span style="font-size: 11px; color: var(--text-muted);">CPF: ${p.cpf}</span>
        </td>
        <td>${p.phone}</td>
        <td>${p.email}</td>
        <td>${this.formatDate(p.birthDate)}</td>
        <td>
          <div class="table-actions" onclick="event.stopPropagation();">
            <button class="btn btn-secondary btn-sm btn-edit" data-id="${p.id}">
              Editar
            </button>
            <button class="btn btn-danger btn-sm btn-delete" data-id="${p.id}">
              Excluir
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    return `
      <div class="patients-container">
        <div class="actions-bar">
          <div class="filter-group">
            <div class="search-input-wrapper">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" id="patient-search-list" placeholder="Pesquisar pacientes...">
            </div>
          </div>
          <button class="btn btn-primary" id="btn-new-patient">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            Novo Paciente
          </button>
        </div>

        <div class="table-responsive">
          <table class="custom-table" id="patients-table">
            <thead>
              <tr>
                <th>Nome / CPF</th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>Data de Nascimento</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML || `<tr><td colspan="5" style="text-align: center; padding: 32px; color: var(--text-muted);">Nenhum paciente cadastrado.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Modal (Initial Hidden) -->
      <div class="modal-backdrop" id="patient-modal">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-title-label">Cadastrar Novo Paciente</h3>
            <button class="btn-icon" id="btn-close-modal" style="width: 32px; height: 32px;">×</button>
          </div>
          <form id="patient-form">
            <div class="modal-body">
              <input type="hidden" id="form-patient-id">
              <div class="form-grid">
                <div class="form-group full-width">
                  <label for="p-name">Nome Completo *</label>
                  <input type="text" id="p-name" required placeholder="Ex: Mariana Silva Souza">
                </div>
                <div class="form-group">
                  <label for="p-cpf">CPF *</label>
                  <input type="text" id="p-cpf" required placeholder="000.000.000-00">
                </div>
                <div class="form-group">
                  <label for="p-birth">Data de Nascimento *</label>
                  <input type="date" id="p-birth" required>
                </div>
                <div class="form-group">
                  <label for="p-phone">Telefone / WhatsApp *</label>
                  <input type="text" id="p-phone" required placeholder="(00) 00000-0000">
                </div>
                <div class="form-group">
                  <label for="p-email">E-mail</label>
                  <input type="email" id="p-email" placeholder="nome@email.com">
                </div>
                <div class="form-group">
                  <label for="p-gender">Gênero</label>
                  <select id="p-gender">
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <!-- Anamnese inicial rápida -->
                <div class="form-group full-width" style="margin-top: 12px; border-top: 1px solid var(--border-color); padding-top: 12px;">
                  <h4 style="font-size: 14px; margin-bottom: 8px; color: var(--text-main);">Informações de Anamnese</h4>
                </div>
                <div class="form-group">
                  <label for="p-allergy">Tem Alguma Alergia?</label>
                  <select id="p-allergy">
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="p-allergy-desc">Descrição da Alergia</label>
                  <input type="text" id="p-allergy-desc" placeholder="Ex: Penicilina, Corantes">
                </div>
                <div class="form-group">
                  <label for="p-cardiac">Problema Cardíaco?</label>
                  <select id="p-cardiac">
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="p-cardiac-desc">Especificar Cardíaco</label>
                  <input type="text" id="p-cardiac-desc" placeholder="Ex: Sopro, Hipertensão">
                </div>
                <div class="form-group">
                  <label for="p-diabetes">Diabético?</label>
                  <select id="p-diabetes">
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="p-pressure">Pressão Arterial</label>
                  <select id="p-pressure">
                    <option value="Normal">Normal</option>
                    <option value="Alta (Controlada)">Alta (Controlada)</option>
                    <option value="Alta">Alta</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Paciente</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  renderDetailView() {
    const patient = db.getPatientById(this.selectedPatientId);
    if (!patient) {
      this.selectedPatientId = null;
      return `<div>Erro: Paciente não encontrado. <button class="btn btn-primary" onclick="window.location.reload();">Voltar</button></div>`;
    }

    // Calcula idade
    const birthYear = new Date(patient.birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    // Filtra consultas deste paciente
    const appointments = db.getAppointments()
      .filter(a => a.patientId === patient.id)
      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));

    // Filtra transações deste paciente
    const transactions = db.getTransactions()
      .filter(t => t.patientId === patient.id)
      .sort((a, b) => b.date.localeCompare(a.date));

    // Orçamentos e tratamentos vinculados
    const totalTransactions = transactions.reduce((sum, t) => sum + (t.type === 'inflow' ? Number(t.amount) : 0), 0);

    const loggedUser = db.getLoggedUser();
    const isSecretaria = loggedUser && loggedUser.role === 'secretaria';

    return `
      <div>
        <button class="btn btn-secondary btn-sm" id="btn-back-list" style="margin-bottom: 20px;">
          ← Voltar para Lista de Pacientes
        </button>

        <div class="patient-profile-grid">
          <!-- Left Panel: Info Card -->
          <div class="card profile-card">
            <div class="profile-avatar-large">
              ${patient.name.charAt(0)}
            </div>
            <div class="profile-name">${patient.name}</div>
            <div class="badge badge-success">Paciente Ativo</div>

            <div class="profile-info-list">
              <div class="info-item">
                <span class="info-label">CPF</span>
                <span class="info-value">${patient.cpf}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Idade / Nasc.</span>
                <span class="info-value">${age} anos (${this.formatDate(patient.birthDate)})</span>
              </div>
              <div class="info-item">
                <span class="info-label">Telefone</span>
                <span class="info-value">${patient.phone}</span>
              </div>
              <div class="info-item">
                <span class="info-label">E-mail</span>
                <span class="info-value">${patient.email || 'Não informado'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Gênero</span>
                <span class="info-value">${patient.gender}</span>
              </div>
            </div>

            <button class="btn btn-secondary btn-sm" id="btn-edit-profile" data-id="${patient.id}" style="width: 100%; margin-top: 12px;">
              Editar Informações Ficha
            </button>
          </div>

          <!-- Right Panel: Tabs System -->
          <div class="card" style="padding: 24px; min-height: 500px;">
            <div class="tabs-header">
              <button class="tab-btn ${this.activeTab === 'odontograma' ? 'active' : ''}" data-tab="odontograma">Odontograma Interativo</button>
              <button class="tab-btn ${this.activeTab === 'historico' ? 'active' : ''}" data-tab="historico">Histórico de Consultas</button>
              <button class="tab-btn ${this.activeTab === 'anamnese' ? 'active' : ''}" data-tab="anamnese">Anamnese Médica</button>
              ${isSecretaria ? '' : `<button class="tab-btn ${this.activeTab === 'financeiro' ? 'active' : ''}" data-tab="financeiro">Financeiro / Orçamentos</button>`}
            </div>

            <!-- Tab: Odontograma -->
            <div class="tab-content ${this.activeTab === 'odontograma' ? 'active' : ''}" id="tab-odontograma">
              <div id="odontograma-svg-container"></div>
              
              <div class="form-group full-width" style="margin-top: 24px;">
                <label for="p-notes" style="font-weight: 700;">Observações Clínicas Gerais</label>
                <textarea id="p-notes" rows="4" style="width: 100%; margin-top: 8px; resize: vertical;" placeholder="Anotações sobre tratamentos, evolução clínica...">${patient.notes || ''}</textarea>
                <button class="btn btn-primary btn-sm" id="btn-save-notes" style="margin-top: 10px; align-self: flex-end;">
                  Salvar Observações
                </button>
              </div>
            </div>

            <!-- Tab: Historico -->
            <div class="tab-content ${this.activeTab === 'historico' ? 'active' : ''}" id="tab-historico">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="font-size: 16px;">Agendamentos e Fichas de Evolução</h4>
                <button class="btn btn-primary btn-sm" id="btn-add-appointment-patient">Agendar Próxima Consulta</button>
              </div>
              
              <div class="appointment-list">
                ${appointments.length === 0 ? `
                  <p style="text-align: center; padding: 32px; color: var(--text-muted);">Nenhum agendamento registrado para este paciente.</p>
                ` : appointments.map(app => `
                  <div class="appointment-item" style="border-left: 4px solid var(--color-primary);">
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                      <span style="font-weight: 700; color: var(--text-main); font-size: 14.5px;">
                        ${this.formatDate(app.date)} às ${app.time}
                      </span>
                      <span style="font-size: 13px; font-weight: 600; color: var(--color-primary-dark);">${app.treatment}</span>
                      ${app.notes ? `<p style="font-size: 12.5px; color: var(--text-muted); margin-top: 4px; font-style: italic;">Obs: ${app.notes}</p>` : ''}
                    </div>
                    <span class="badge ${app.status === 'Concluído' ? 'badge-success' : app.status === 'Aguardando' ? 'badge-warning' : 'badge-secondary'}">
                      ${app.status}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Tab: Anamnese -->
            <div class="tab-content ${this.activeTab === 'anamnese' ? 'active' : ''}" id="tab-anamnese">
              <h4 style="font-size: 16px; margin-bottom: 16px;">Questionário de Saúde Clínica</h4>
              <div class="anamnese-grid">
                <div class="anamnese-item">
                  <div class="anamnese-status ${patient.anamnese.allergy === 'Sim' ? 'yes' : 'no'}"></div>
                  <div class="anamnese-label">Alergias: <strong>${patient.anamnese.allergy}</strong> ${patient.anamnese.allergy === 'Sim' ? `(${patient.anamnese.allergyDesc})` : ''}</div>
                </div>
                <div class="anamnese-item">
                  <div class="anamnese-status ${patient.anamnese.cardiac === 'Sim' ? 'yes' : 'no'}"></div>
                  <div class="anamnese-label">Problema Cardíaco: <strong>${patient.anamnese.cardiac}</strong> ${patient.anamnese.cardiac === 'Sim' ? `(${patient.anamnese.cardiacDesc})` : ''}</div>
                </div>
                <div class="anamnese-item">
                  <div class="anamnese-status ${patient.anamnese.diabetes === 'Sim' ? 'yes' : 'no'}"></div>
                  <div class="anamnese-label">Diabético: <strong>${patient.anamnese.diabetes}</strong></div>
                </div>
                <div class="anamnese-item">
                  <div class="anamnese-status ${patient.anamnese.pressure !== 'Normal' ? 'yes' : 'no'}"></div>
                  <div class="anamnese-label">Pressão Arterial: <strong>${patient.anamnese.pressure}</strong></div>
                </div>
              </div>
              <p style="font-size: 12.5px; color: var(--text-muted); margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 16px;">
                * Para alterar as respostas do questionário de saúde, clique no botão "Editar Informações Ficha" na lateral esquerda.
              </p>
            </div>

            <!-- Tab: Financeiro/Orçamentos -->
            ${isSecretaria ? '' : `
            <div class="tab-content ${this.activeTab === 'financeiro' ? 'active' : ''}" id="tab-financeiro">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="font-size: 16px;">Histórico de Pagamentos e Orçamentos</h4>
                <button class="btn btn-primary btn-sm" id="btn-new-budget-patient">Gerar Orçamento / Receita</button>
              </div>

              <div class="table-responsive" style="margin-bottom: 20px;">
                <table class="custom-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Descrição</th>
                      <th>Valor Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${transactions.length === 0 ? `
                      <tr><td colspan="3" style="text-align: center; padding: 24px; color: var(--text-muted);">Nenhum pagamento realizado ainda.</td></tr>
                    ` : transactions.map(t => `
                      <tr>
                        <td>${this.formatDate(t.date)}</td>
                        <td>${t.description}</td>
                        <td class="text-success text-bold">${this.formatCurrency(t.amount)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="2" style="text-align: right; font-weight: 700; padding: 14px;">Total Pago pelo Paciente:</td>
                      <td class="text-success text-bold" style="padding: 14px; font-size: 15px;">${this.formatCurrency(totalTransactions)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            `}

          </div>
        </div>
      </div>

      <!-- Add/Edit Modal in Detail view too, for edit -->
      <div class="modal-backdrop" id="patient-modal">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-title-label">Editar Cadastro do Paciente</h3>
            <button class="btn-icon" id="btn-close-modal" style="width: 32px; height: 32px;">×</button>
          </div>
          <form id="patient-form">
            <div class="modal-body">
              <input type="hidden" id="form-patient-id" value="${patient.id}">
              <div class="form-grid">
                <div class="form-group full-width">
                  <label for="p-name">Nome Completo *</label>
                  <input type="text" id="p-name" required value="${patient.name}">
                </div>
                <div class="form-group">
                  <label for="p-cpf">CPF *</label>
                  <input type="text" id="p-cpf" required value="${patient.cpf}">
                </div>
                <div class="form-group">
                  <label for="p-birth">Data de Nascimento *</label>
                  <input type="date" id="p-birth" required value="${patient.birthDate}">
                </div>
                <div class="form-group">
                  <label for="p-phone">Telefone / WhatsApp *</label>
                  <input type="text" id="p-phone" required value="${patient.phone}">
                </div>
                <div class="form-group">
                  <label for="p-email">E-mail</label>
                  <input type="email" id="p-email" value="${patient.email || ''}">
                </div>
                <div class="form-group">
                  <label for="p-gender">Gênero</label>
                  <select id="p-gender">
                    <option value="Feminino" ${patient.gender === 'Feminino' ? 'selected' : ''}>Feminino</option>
                    <option value="Masculino" ${patient.gender === 'Masculino' ? 'selected' : ''}>Masculino</option>
                    <option value="Outro" ${patient.gender === 'Outro' ? 'selected' : ''}>Outro</option>
                  </select>
                </div>

                <!-- Anamnese -->
                <div class="form-group full-width" style="margin-top: 12px; border-top: 1px solid var(--border-color); padding-top: 12px;">
                  <h4 style="font-size: 14px; margin-bottom: 8px; color: var(--text-main);">Informações de Anamnese</h4>
                </div>
                <div class="form-group">
                  <label for="p-allergy">Tem Alguma Alergia?</label>
                  <select id="p-allergy">
                    <option value="Não" ${patient.anamnese.allergy === 'Não' ? 'selected' : ''}>Não</option>
                    <option value="Sim" ${patient.anamnese.allergy === 'Sim' ? 'selected' : ''}>Sim</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="p-allergy-desc">Descrição da Alergia</label>
                  <input type="text" id="p-allergy-desc" value="${patient.anamnese.allergyDesc || ''}" placeholder="Ex: Penicilina">
                </div>
                <div class="form-group">
                  <label for="p-cardiac">Problema Cardíaco?</label>
                  <select id="p-cardiac">
                    <option value="Não" ${patient.anamnese.cardiac === 'Não' ? 'selected' : ''}>Não</option>
                    <option value="Sim" ${patient.anamnese.cardiac === 'Sim' ? 'selected' : ''}>Sim</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="p-cardiac-desc">Especificar Cardíaco</label>
                  <input type="text" id="p-cardiac-desc" value="${patient.anamnese.cardiacDesc || ''}" placeholder="Ex: Sopro">
                </div>
                <div class="form-group">
                  <label for="p-diabetes">Diabético?</label>
                  <select id="p-diabetes">
                    <option value="Não" ${patient.anamnese.diabetes === 'Não' ? 'selected' : ''}>Não</option>
                    <option value="Sim" ${patient.anamnese.diabetes === 'Sim' ? 'selected' : ''}>Sim</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="p-pressure">Pressão Arterial</label>
                  <select id="p-pressure">
                    <option value="Normal" ${patient.anamnese.pressure === 'Normal' ? 'selected' : ''}>Normal</option>
                    <option value="Alta (Controlada)" ${patient.anamnese.pressure === 'Alta (Controlada)' ? 'selected' : ''}>Alta (Controlada)</option>
                    <option value="Alta" ${patient.anamnese.pressure === 'Alta' ? 'selected' : ''}>Alta</option>
                    <option value="Baixa" ${patient.anamnese.pressure === 'Baixa' ? 'selected' : ''}>Baixa</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Atualizar Ficha</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  afterRender(router) {
    // Caso seja aberto o modal de cadastro rapidamente de fora (Dashboard / Agenda)
    if (window.openAddPatientModalOnLoad && !this.selectedPatientId) {
      window.openAddPatientModalOnLoad = false;
      this.openModal();
    }

    if (this.selectedPatientId) {
      this.afterRenderDetailView(router);
    } else {
      this.afterRenderListView(router);
    }
  },

  afterRenderListView(router) {
    const table = document.getElementById('patients-table');
    const newBtn = document.getElementById('btn-new-patient');
    const modal = document.getElementById('patient-modal');
    const closeModalBtn = document.getElementById('btn-close-modal');
    const cancelModalBtn = document.getElementById('btn-cancel-modal');
    const form = document.getElementById('patient-form');
    const searchInput = document.getElementById('patient-search-list');

    // Clique nas linhas para abrir os detalhes
    const rows = table.querySelectorAll('tbody tr.patient-row');
    rows.forEach(row => {
      row.addEventListener('click', () => {
        this.selectedPatientId = row.dataset.id;
        router.loadView('pacientes');
      });
    });

    // Filtro de pesquisa na lista
    searchInput?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const rowsToSearch = table.querySelectorAll('tbody tr');
      
      rowsToSearch.forEach(row => {
        const text = row.innerText.toLowerCase();
        if (text.includes(query)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });

    // Botões para editar cadastro direto na tabela
    const editBtns = table.querySelectorAll('.btn-edit');
    editBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        const patient = db.getPatientById(id);
        if (patient) {
          this.openModal(patient);
        }
      });
    });

    // Botões para excluir paciente direto na tabela
    const deleteBtns = table.querySelectorAll('.btn-delete');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        if (confirm('Deseja realmente excluir este paciente? Todos os agendamentos e orçamentos vinculados serão deletados permanentemente.')) {
          db.deletePatient(id);
          router.loadView('pacientes');
        }
      });
    });

    // Modais
    newBtn?.addEventListener('click', () => this.openModal());
    closeModalBtn?.addEventListener('click', () => this.closeModal());
    cancelModalBtn?.addEventListener('click', () => this.closeModal());

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit(form, router);
    });
  },

  afterRenderDetailView(router) {
    const backBtn = document.getElementById('btn-back-list');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const saveNotesBtn = document.getElementById('btn-save-notes');
    const editProfileBtn = document.getElementById('btn-edit-profile');
    const addAppBtn = document.getElementById('btn-add-appointment-patient');
    const newBudgetBtn = document.getElementById('btn-new-budget-patient');

    // Botão de fechar modal (caso edite no detail)
    document.getElementById('btn-close-modal')?.addEventListener('click', () => this.closeModal());
    document.getElementById('btn-cancel-modal')?.addEventListener('click', () => this.closeModal());
    document.getElementById('patient-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit(document.getElementById('patient-form'), router);
    });

    // Voltar para lista
    backBtn?.addEventListener('click', () => {
      this.selectedPatientId = null;
      router.loadView('pacientes');
    });

    // Cliques nas abas
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        
        // Esconde todos
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

        // Mostra o selecionado
        document.getElementById(`tab-${this.activeTab}`).classList.add('active');
        btn.classList.add('active');

        // Se a aba for o odontograma, reinicia ele
        if (this.activeTab === 'odontograma') {
          this.initOdontogram();
        }
      });
    });

    // Salvar Observações Clínicas
    saveNotesBtn?.addEventListener('click', () => {
      const notes = document.getElementById('p-notes').value;
      const patient = db.getPatientById(this.selectedPatientId);
      if (patient) {
        patient.notes = notes;
        db.savePatient(patient);
        alert('Observações clínicas salvas com sucesso!');
      }
    });

    // Editar perfil (Abre o modal preenchido)
    editProfileBtn?.addEventListener('click', () => {
      const patient = db.getPatientById(this.selectedPatientId);
      if (patient) {
        this.openModal(patient);
      }
    });

    // Agendar consulta (manda para a tela da agenda e passa id do paciente)
    addAppBtn?.addEventListener('click', () => {
      window.location.hash = '#agenda';
      window.preselectedPatientIdOnLoad = this.selectedPatientId;
      window.openAddAppointmentModalOnLoad = true;
    });

    // Manda para tela financeiro para criar um orçamento
    newBudgetBtn?.addEventListener('click', () => {
      window.location.hash = '#financeiro';
      window.preselectedPatientIdOnLoad = this.selectedPatientId;
    });

    // Inicializa o Odontograma
    if (this.activeTab === 'odontograma') {
      this.initOdontogram();
    }
  },

  initOdontogram() {
    const patient = db.getPatientById(this.selectedPatientId);
    if (patient) {
      new Odontograma({
        containerId: 'odontograma-svg-container',
        patient: patient,
        onUpdate: (updatedPatient) => {
          db.savePatient(updatedPatient);
        }
      });
    }
  },

  openModal(patient = null) {
    const modal = document.getElementById('patient-modal');
    const form = document.getElementById('patient-form');
    const titleLabel = document.getElementById('modal-title-label');

    if (patient) {
      // Editar
      titleLabel.innerText = 'Editar Cadastro do Paciente';
      document.getElementById('form-patient-id').value = patient.id;
      document.getElementById('p-name').value = patient.name;
      document.getElementById('p-cpf').value = patient.cpf;
      document.getElementById('p-birth').value = patient.birthDate;
      document.getElementById('p-phone').value = patient.phone;
      document.getElementById('p-email').value = patient.email || '';
      document.getElementById('p-gender').value = patient.gender;
      
      // Anamnese
      document.getElementById('p-allergy').value = patient.anamnese.allergy;
      document.getElementById('p-allergy-desc').value = patient.anamnese.allergyDesc || '';
      document.getElementById('p-cardiac').value = patient.anamnese.cardiac;
      document.getElementById('p-cardiac-desc').value = patient.anamnese.cardiacDesc || '';
      document.getElementById('p-diabetes').value = patient.anamnese.diabetes;
      document.getElementById('p-pressure').value = patient.anamnese.pressure;
    } else {
      // Cadastrar Novo
      titleLabel.innerText = 'Cadastrar Novo Paciente';
      form.reset();
      document.getElementById('form-patient-id').value = '';
    }

    modal.classList.add('show');
  },

  closeModal() {
    const modal = document.getElementById('patient-modal');
    modal.classList.remove('show');
  },

  handleFormSubmit(form, router) {
    const id = document.getElementById('form-patient-id').value;
    
    const patientData = {
      id: id || undefined,
      name: document.getElementById('p-name').value,
      cpf: document.getElementById('p-cpf').value,
      birthDate: document.getElementById('p-birth').value,
      phone: document.getElementById('p-phone').value,
      email: document.getElementById('p-email').value,
      gender: document.getElementById('p-gender').value,
      anamnese: {
        allergy: document.getElementById('p-allergy').value,
        allergyDesc: document.getElementById('p-allergy-desc').value,
        cardiac: document.getElementById('p-cardiac').value,
        cardiacDesc: document.getElementById('p-cardiac-desc').value,
        diabetes: document.getElementById('p-diabetes').value,
        pressure: document.getElementById('p-pressure').value,
        medication: id ? (db.getPatientById(id)?.anamnese.medication || 'Nenhuma') : 'Nenhuma',
        pregnant: id ? (db.getPatientById(id)?.anamnese.pregnant || 'Não') : 'Não'
      }
    };

    db.savePatient(patientData);
    this.closeModal();
    
    // Recarrega a view
    router.loadView('pacientes');
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  },

  formatCurrency(val) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  }
};
