import { db } from './db.js';
import { LoginView } from './views/login.js';
import { DashboardView } from './views/dashboard.js';
import { PatientsView } from './views/pacientes.js';
import { AgendaView } from './views/agenda.js';
import { FinanceiroView } from './views/financeiro.js';

class AppRouter {
  constructor() {
    this.routes = {
      'dashboard': DashboardView,
      'pacientes': PatientsView,
      'agenda': AgendaView,
      'financeiro': FinanceiroView
    };
    this.contentContainer = document.getElementById('app-content');
    this.titleContainer = document.getElementById('view-title');
    
    window.addEventListener('hashchange', () => this.handleHashChange());
  }

  init() {
    if (!window.location.hash) {
      window.location.hash = '#dashboard';
    } else {
      this.handleHashChange();
    }
  }

  handleHashChange() {
    // Impede carregar rotas normais se não estiver autenticado
    const user = db.getLoggedUser();
    if (!user) {
      checkAuthAndBoot();
      return;
    }

    const hash = window.location.hash.substring(1).split('?')[0];

    // Bloqueia acesso da secretária à rota financeira
    if (hash === 'financeiro' && user.role === 'secretaria') {
      window.location.hash = '#dashboard';
      return;
    }

    const route = this.routes[hash];

    if (route) {
      this.loadView(hash);
    } else {
      window.location.hash = '#dashboard';
    }
  }

  loadView(viewName) {
    const view = this.routes[viewName];
    if (!view) return;

    this.contentContainer.innerHTML = `
      <div class="loader-container">
        <div class="loader"></div>
      </div>
    `;

    const titles = {
      'dashboard': 'Painel de Controle',
      'pacientes': 'Fichas de Pacientes',
      'agenda': 'Agenda de Consultas',
      'financeiro': 'Controle Financeiro'
    };
    this.titleContainer.innerText = titles[viewName] || 'Clínica Odontológica';

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    const activeNav = document.getElementById(`nav-${viewName}`);
    if (activeNav) {
      activeNav.classList.add('active');
    }

    setTimeout(() => {
      try {
        this.contentContainer.innerHTML = view.render();
        view.afterRender(this);
      } catch (err) {
        console.error('Erro ao renderizar view:', err);
        this.contentContainer.innerHTML = `
          <div style="padding: 24px; color: var(--color-danger); text-align: center;">
            <h3>Ocorreu um erro ao carregar a página.</h3>
            <p>${err.message}</p>
          </div>
        `;
      }
    }, 100);
  }
}

// Declarado para uso nos eventos de login
let router;

function checkAuthAndBoot() {
  const user = db.getLoggedUser();
  const loginContainer = document.getElementById('login-container');
  const mainAppContainer = document.getElementById('main-app-container');

  if (!user) {
    // Esconde app principal e mostra formulário de login
    mainAppContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
    loginContainer.innerHTML = LoginView.render();
    
    LoginView.afterRender(() => {
      // Callback executado ao logar com sucesso
      checkAuthAndBoot();
    });
  } else {
    // Esconde tela de login e mostra app principal
    loginContainer.classList.add('hidden');
    mainAppContainer.classList.remove('hidden');

    // Configura o rodapé do perfil do profissional na barra lateral
    document.getElementById('sidebar-user-name').innerText = user.name;
    document.getElementById('sidebar-user-role').innerText = user.role === 'dentista' ? 'Cirurgião-Dentista' : 'Secretária Clínica';

    // Oculta/Exibe o item de finanças da Sidebar conforme permissão do perfil
    const navFinanceiro = document.getElementById('nav-financeiro');
    if (user.role === 'secretaria') {
      if (navFinanceiro) navFinanceiro.style.display = 'none';
      if (window.location.hash === '#financeiro') {
        window.location.hash = '#dashboard';
      }
    } else {
      if (navFinanceiro) navFinanceiro.style.display = '';
    }
    
    // Iniciais para avatar
    const initials = user.name
      .split(' ')
      .filter(n => n.length > 2)
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    document.getElementById('sidebar-user-avatar').innerText = initials || 'US';

    // Seletor de Dentista Ativo (Apenas para perfil Secretária)
    const dentistSelectorBox = document.getElementById('dentist-selector-container');
    const selectEl = document.getElementById('active-dentist-select');

    if (user.role === 'secretaria') {
      dentistSelectorBox.classList.remove('hidden');
      const dentists = db.getDentists();
      const currentActiveId = db.getActiveDentistId();

      selectEl.innerHTML = dentists.map(d => `
        <option value="${d.id}" ${d.id === currentActiveId ? 'selected' : ''}>${d.name}</option>
      `).join('');

      // Troca de base de dados reativa ao selecionar outro profissional
      selectEl.onchange = (e) => {
        db.setActiveDentistId(e.target.value);
        // Reseta o paciente ativo para evitar conflito de IDs entre bases diferentes
        PatientsView.selectedPatientId = null;
        
        // Recarrega a tela ativa
        router.handleHashChange();
      };
    } else {
      dentistSelectorBox.classList.add('hidden');
    }

    // Inicializa o roteador se ainda não foi inicializado
    if (!router) {
      router = new AppRouter();
    }
    router.init();
  }
}

// Inicializações globais na página
document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializa o Banco de Dados Local
  db.init();

  // 2. Inicializa controle de autenticação
  checkAuthAndBoot();

  // 3. Gerenciamento de Tema (Light / Dark Mode)
  const themeToggleBtn = document.getElementById('theme-toggle');
  const sunIcon = themeToggleBtn.querySelector('.sun-icon');
  const moonIcon = themeToggleBtn.querySelector('.moon-icon');
  
  const savedTheme = localStorage.getItem('odonto_theme') || 'light';
  applyTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
  });

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    }
    localStorage.setItem('odonto_theme', theme);
  }

  // 4. Botão de Sair (Logout)
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    if (confirm('Deseja realmente sair do sistema?')) {
      db.logout();
      window.location.hash = '#dashboard';
      // Limpa os estados das visualizações
      PatientsView.selectedPatientId = null;
      // Reinicia tela de login
      checkAuthAndBoot();
    }
  });

  // 5. Barra de Pesquisa Global no Header
  const globalSearchInput = document.getElementById('global-search');
  const searchResultsDropdown = document.getElementById('search-results');

  globalSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      searchResultsDropdown.classList.add('hidden');
      return;
    }

    const patients = db.getPatients();
    const matches = patients.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.cpf.includes(query)
    );

    if (matches.length === 0) {
      searchResultsDropdown.innerHTML = `<div class="search-result-empty">Nenhum paciente encontrado na base deste dentista.</div>`;
    } else {
      searchResultsDropdown.innerHTML = matches.map(p => `
        <div class="search-result-item" data-id="${p.id}">
          <span class="search-result-name">${p.name}</span>
          <span class="search-result-meta">CPF: ${p.cpf} | Tel: ${p.phone}</span>
        </div>
      `).join('');
    }

    searchResultsDropdown.classList.remove('hidden');

    const items = searchResultsDropdown.querySelectorAll('.search-result-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        
        globalSearchInput.value = '';
        searchResultsDropdown.classList.add('hidden');

        PatientsView.selectedPatientId = id;
        window.location.hash = '#pacientes';
        if (router) {
          router.loadView('pacientes');
        }
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!globalSearchInput.contains(e.target) && !searchResultsDropdown.contains(e.target)) {
      searchResultsDropdown.classList.add('hidden');
    }
  });
});
