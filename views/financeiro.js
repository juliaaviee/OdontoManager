import { db } from '../db.js';

export const FinanceiroView = {
  // Lista de procedimentos padrão para preenchimento rápido
  procedimentosPadrao: [
    { nome: 'Consulta de Avaliação', valor: 150.00 },
    { nome: 'Profilaxia e Flúor (Limpeza)', valor: 180.00 },
    { nome: 'Restauração de Resina', valor: 250.00 },
    { nome: 'Tratamento Endodôntico (Canal)', valor: 850.00 },
    { nome: 'Exodontia Simples (Extração)', valor: 300.00 },
    { nome: 'Clareamento Dental Caseiro', valor: 600.00 },
    { nome: 'Clareamento Dental a Laser', valor: 1200.00 },
    { nome: 'Instalação de Aparelho Ortodôntico', valor: 750.00 }
  ],
  
  // Lista temporária de itens do orçamento ativo
  activeBudgetItems: [],

  render() {
    const transactions = db.getTransactions()
      .sort((a, b) => b.date.localeCompare(a.date));
    const patients = db.getPatients();

    // Calcula balanço financeiro
    const totalInflow = transactions.filter(t => t.type === 'inflow').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalOutflow = transactions.filter(t => t.type === 'outflow').reduce((sum, t) => sum + Number(t.amount), 0);
    const netBalance = totalInflow - totalOutflow;

    const formatCurrency = (val) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    // Gera linhas da tabela de transações
    const transactionsHTML = transactions.map(t => `
      <tr>
        <td>${formatDate(t.date)}</td>
        <td>
          <span class="badge ${t.type === 'inflow' ? 'badge-success' : 'badge-danger'}">
            ${t.type === 'inflow' ? 'Entrada' : 'Saída'}
          </span>
        </td>
        <td>${t.description}</td>
        <td class="${t.type === 'inflow' ? 'text-success' : 'text-danger'} text-bold">
          ${t.type === 'inflow' ? '+' : '-'} ${formatCurrency(t.amount)}
        </td>
        <td>
          <button class="btn-icon btn-delete-trans" data-id="${t.id}" style="width:24px; height:24px; font-size:10px; border-color:transparent;" title="Excluir Lançamento">×</button>
        </td>
      </tr>
    `).join('');

    // Gera opções para o selecionador de pacientes
    const patientOptionsHTML = patients.map(p => `
      <option value="${p.id}">${p.name} (CPF: ${p.cpf})</option>
    `).join('');

    // Gera lista dos procedimentos do orçamento ativo
    let budgetItemsHTML = '';
    let budgetTotal = 0;

    if (this.activeBudgetItems.length === 0) {
      budgetItemsHTML = `
        <div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 13.5px; border: 1px dashed var(--border-color); border-radius: var(--border-radius-md);">
          Adicione procedimentos abaixo para gerar o orçamento.
        </div>
      `;
    } else {
      budgetItemsHTML = this.activeBudgetItems.map((item, index) => {
        budgetTotal += Number(item.valor);
        return `
          <div class="budget-item-row" style="margin-bottom: 8px; border-bottom: 1px solid var(--border-color-light); padding-bottom: 6px;">
            <span style="font-size: 13.5px; font-weight: 500;">${item.nome}</span>
            <span class="text-bold text-success" style="font-size: 13.5px; text-align: right;">${formatCurrency(item.valor)}</span>
            <button type="button" class="btn-icon btn-remove-budget-item" data-index="${index}" style="width: 24px; height: 24px; border: none; background: none; color: var(--color-danger); font-size: 14px;">×</button>
          </div>
        `;
      }).join('');
    }

    // Procedimentos padrão para o dropdown do orçamento
    const defaultProceduresHTML = this.procedimentosPadrao.map(p => `
      <option value="${p.valor}">${p.nome} - ${formatCurrency(p.valor)}</option>
    `).join('');

    return `
      <!-- Finance Summary Grid -->
      <div class="finance-summary-grid">
        <div class="card kpi-card">
          <div class="kpi-details">
            <span class="kpi-title">Total de Entradas</span>
            <span class="kpi-value text-success">+ ${formatCurrency(totalInflow)}</span>
          </div>
          <div class="kpi-icon-box success">
            <svg class="kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
        </div>

        <div class="card kpi-card">
          <div class="kpi-details">
            <span class="kpi-title">Total de Saídas</span>
            <span class="kpi-value text-danger">- ${formatCurrency(totalOutflow)}</span>
          </div>
          <div class="kpi-icon-box danger">
            <svg class="kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
          </div>
        </div>

        <div class="card kpi-card">
          <div class="kpi-details">
            <span class="kpi-title">Saldo Líquido</span>
            <span class="kpi-value ${netBalance >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(netBalance)}</span>
          </div>
          <div class="kpi-icon-box ${netBalance >= 0 ? 'success' : 'danger'}">
            <svg class="kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="10" x2="12" y2="10"/></svg>
          </div>
        </div>
      </div>

      <!-- Financial Sections Split -->
      <div class="finance-flow-sections">
        
        <!-- Left: Cash Flow History -->
        <div class="card" style="display:flex; flex-direction:column; gap:16px;">
          <div class="section-header">
            <h2 class="section-title">Fluxo de Caixa (Entradas & Saídas)</h2>
            <button class="btn btn-primary btn-sm" id="btn-add-transaction">Lançar Movimentação</button>
          </div>

          <div class="table-responsive" style="max-height: 480px; overflow-y: auto;">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                ${transactionsHTML || `<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--text-muted);">Nenhuma transação financeira registrada.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right: Budget Builder -->
        <div class="card budget-builder-card">
          <h2 class="section-title">Gerador de Orçamentos Clínicos</h2>
          
          <div class="form-group">
            <label for="budget-patient">Vincular a Paciente</label>
            <select id="budget-patient">
              <option value="" selected>Selecione um Paciente (Opcional)...</option>
              ${patientOptionsHTML}
            </select>
          </div>

          <!-- Items list in active budget -->
          <div class="budget-items-list">
            <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Procedimentos no Orçamento</label>
            ${budgetItemsHTML}
          </div>

          <!-- Subtotal / Total -->
          <div class="budget-total-box">
            <span>Total Geral:</span>
            <span class="text-success">${formatCurrency(budgetTotal)}</span>
          </div>

          <!-- Input fields to add dynamic procedure -->
          <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 8px;">
            <h4 style="font-size: 13.5px; margin-bottom: 8px; color: var(--text-main);">Adicionar Procedimento</h4>
            <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 8px; margin-bottom: 8px;">
              <div class="form-group">
                <select id="proc-quick-select">
                  <option value="" disabled selected>Escolher procedimento padrão...</option>
                  ${defaultProceduresHTML}
                  <option value="custom">Personalizado / Digitar...</option>
                </select>
              </div>
              <div class="form-group">
                <input type="number" id="proc-value-input" placeholder="Valor R$" step="0.01">
              </div>
            </div>
            
            <div class="form-group" id="proc-custom-name-wrapper" style="display:none; margin-bottom: 8px;">
              <input type="text" id="proc-custom-name" placeholder="Digite a descrição do procedimento personalizado">
            </div>

            <button class="btn btn-secondary btn-sm" id="btn-add-procedure-item" style="width: 100%;">
              Incluir Procedimento no Orçamento
            </button>
          </div>

          <button class="btn btn-primary" id="btn-save-budget-transaction" style="margin-top: 12px;" ${budgetTotal === 0 ? 'disabled' : ''}>
            Faturar Orçamento (Registrar Entrada)
          </button>
        </div>

      </div>

      <!-- Manual Transaction Modal (Backdrop) -->
      <div class="modal-backdrop" id="trans-modal">
        <div class="modal-container" style="max-width: 440px;">
          <div class="modal-header">
            <h3 class="modal-title">Lançar Movimentação Financeira</h3>
            <button class="btn-icon" id="btn-close-trans-modal" style="width: 32px; height: 32px;">×</button>
          </div>
          <form id="trans-form">
            <div class="modal-body">
              <div class="form-grid" style="grid-template-columns: 1fr;">
                <div class="form-group">
                  <label for="t-type">Tipo de Movimento *</label>
                  <select id="t-type" required>
                    <option value="inflow">Entrada (Receita / Pagamento)</option>
                    <option value="outflow">Saída (Despesa / Custo)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="t-amount">Valor (R$) *</label>
                  <input type="number" id="t-amount" placeholder="0.00" step="0.01" required>
                </div>
                <div class="form-group">
                  <label for="t-desc">Descrição / Detalhes *</label>
                  <input type="text" id="t-desc" placeholder="Ex: Compra de luvas e agulhas, Restauração de resina" required>
                </div>
                <div class="form-group">
                  <label for="t-patient">Vincular a Paciente (Se Entrada)</label>
                  <select id="t-patient">
                    <option value="">Nenhum</option>
                    ${patientOptionsHTML}
                  </select>
                </div>
                <div class="form-group">
                  <label for="t-date">Data do Lançamento</label>
                  <input type="date" id="t-date">
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-trans-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar Lançamento</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  afterRender(router) {
    // Caso tenha sido passado paciente pré-selecionado do prontuário
    if (window.preselectedPatientIdOnLoad) {
      const select = document.getElementById('budget-patient');
      if (select) {
        select.value = window.preselectedPatientIdOnLoad;
      }
      window.preselectedPatientIdOnLoad = null;
    }

    // Modal de movimentação
    const modal = document.getElementById('trans-modal');
    document.getElementById('btn-add-transaction')?.addEventListener('click', () => {
      const todayStr = new Date().toISOString().split('T')[0];
      document.getElementById('trans-form').reset();
      document.getElementById('t-date').value = todayStr;
      modal.classList.add('show');
    });

    document.getElementById('btn-close-trans-modal')?.addEventListener('click', () => modal.classList.remove('show'));
    document.getElementById('btn-cancel-trans-modal')?.addEventListener('click', () => modal.classList.remove('show'));

    const transForm = document.getElementById('trans-form');
    transForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleTransSubmit(transForm, router);
    });

    // Excluir transação financeira
    const deleteBtns = document.querySelectorAll('.btn-delete-trans');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (confirm('Deseja realmente deletar este lançamento financeiro?')) {
          db.deleteTransaction(id);
          router.loadView('financeiro');
        }
      });
    });

    // Eventos do Orçador
    const quickSelect = document.getElementById('proc-quick-select');
    const customNameWrapper = document.getElementById('proc-custom-name-wrapper');
    const valInput = document.getElementById('proc-value-input');

    // Ao mudar o dropdown de procedimentos
    quickSelect?.addEventListener('change', () => {
      const val = quickSelect.value;
      if (val === 'custom') {
        customNameWrapper.style.display = 'block';
        valInput.value = '';
      } else {
        customNameWrapper.style.display = 'none';
        valInput.value = val;
      }
    });

    // Adiciona item de orçamento
    document.getElementById('btn-add-procedure-item')?.addEventListener('click', () => {
      let nome = '';
      const selectedOption = quickSelect.options[quickSelect.selectedIndex];
      
      if (quickSelect.value === 'custom') {
        nome = document.getElementById('proc-custom-name').value.trim();
        if (!nome) {
          alert('Por favor, informe a descrição do procedimento personalizado!');
          return;
        }
      } else if (quickSelect.value) {
        nome = selectedOption.text.split(' - ')[0];
      } else {
        alert('Por favor, selecione um procedimento ou digite um personalizado!');
        return;
      }

      const valor = parseFloat(valInput.value);
      if (isNaN(valor) || valor <= 0) {
        alert('Por favor, informe um valor de procedimento válido e maior que zero!');
        return;
      }

      this.activeBudgetItems.push({ nome, valor });
      
      // Reseta inputs
      quickSelect.value = '';
      valInput.value = '';
      customNameWrapper.style.display = 'none';
      document.getElementById('proc-custom-name').value = '';

      router.loadView('financeiro');
    });

    // Remove item do orçamento
    const removeBtns = document.querySelectorAll('.btn-remove-budget-item');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        this.activeBudgetItems.splice(index, 1);
        router.loadView('financeiro');
      });
    });

    // Faturar Orçamento (Registrar transação)
    document.getElementById('btn-save-budget-transaction')?.addEventListener('click', () => {
      const patientSelect = document.getElementById('budget-patient');
      const patientId = patientSelect.value;
      const patientName = patientId ? patientSelect.options[patientSelect.selectedIndex].text.split(' (')[0] : '';
      
      const budgetTotal = this.activeBudgetItems.reduce((sum, item) => sum + Number(item.valor), 0);
      if (budgetTotal === 0) return;

      const desc = patientId
        ? `Orçamento Faturado - ${patientName} (${this.activeBudgetItems.length} itens)`
        : `Orçamento Avulso Faturado (${this.activeBudgetItems.length} itens)`;

      db.saveTransaction({
        type: 'inflow',
        amount: budgetTotal,
        description: desc,
        patientId: patientId || undefined
      });

      alert('Orçamento faturado com sucesso e lançado no fluxo de caixa!');
      this.activeBudgetItems = [];
      router.loadView('financeiro');
    });
  },

  handleTransSubmit(form, router) {
    const modal = document.getElementById('trans-modal');
    const patientSelect = document.getElementById('t-patient');
    const patientId = patientSelect.value;

    const data = {
      type: document.getElementById('t-type').value,
      amount: parseFloat(document.getElementById('t-amount').value),
      description: document.getElementById('t-desc').value,
      patientId: patientId || undefined,
      date: document.getElementById('t-date').value
    };

    db.saveTransaction(data);
    modal.classList.remove('show');
    router.loadView('financeiro');
  }
};
