import { db } from '../db.js';

export const LoginView = {
  render() {
    return `
      <div class="login-card">
        <div class="login-header">
          <!-- Dental Clinic Logo -->
          <svg class="login-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2C10 2 8 3 8 5c0 2 1.5 3 2 4.5S9 12 9 14.5c0 2 1 3.5 3 3.5s3-1.5 3-3.5C15 12 14 11 14.5 9.5s2-2.5 2-4.5c0-2-2-3-4-3z"/>
            <path d="M12 18c-1.5 0-3 1.5-3 3 0 1 1 1 2 1s1-1 1-2v-2z"/>
            <path d="M12 18c1.5 0 3 1.5 3 3 0 1-1 1-2 1s-1-1-1-2v-2z"/>
          </svg>
          <h2 class="login-title">DentalVie</h2>
          <span class="login-subtitle">Acesso ao Sistema do Consultório</span>
        </div>

        <form class="login-form" id="login-form">
          <div class="form-group">
            <label for="l-username">Usuário (Username)</label>
            <input type="text" id="l-username" required placeholder="Ex: dr_gabriel" autocomplete="username">
          </div>
          <div class="form-group">
            <label for="l-password">Senha</label>
            <input type="password" id="l-password" required placeholder="Digite sua senha" autocomplete="current-password">
          </div>
          
          <div id="login-error" class="login-error-msg hidden">
            Usuário ou senha incorretos!
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 8px;">
            Acessar Sistema
          </button>
        </form>

        <div class="login-info-alert">
          <strong>Contas de Demonstração (Senha: 123)</strong><br>
          • <strong>dr_gabriel</strong> (Dentista)<br>
          • <strong>dra_beatriz</strong> (Dentista)<br>
          • <strong>secretaria_ana</strong> (Secretária)
        </div>
      </div>
    `;
  },

  afterRender(onLoginSuccess) {
    const form = document.getElementById('login-form');
    const errorMsg = document.getElementById('login-error');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const username = document.getElementById('l-username').value.trim();
      const password = document.getElementById('l-password').value;

      const user = db.login(username, password);

      if (user) {
        errorMsg.classList.add('hidden');
        onLoginSuccess();
      } else {
        errorMsg.classList.remove('hidden');
      }
    });
  }
};
