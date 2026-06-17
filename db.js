/**
 * Banco de Dados Local com Suporte Multi-Usuário (Isolamento de Base por Dentista)
 * Gerencia credenciais e segmenta chaves do localStorage baseando-se no profissional ativo.
 */

// Contas do sistema
const USERS = [
  { id: 'dr_gabriel', username: 'dr_gabriel', name: 'Dr. Gabriel Medeiros', role: 'dentista', password: '123' },
  { id: 'dra_beatriz', username: 'dra_beatriz', name: 'Dra. Beatriz Santos', role: 'dentista', password: '123' },
  { id: 'secretaria_ana', username: 'secretaria_ana', name: 'Ana Paula (Secretária)', role: 'secretaria', password: '123' }
];

// Dados Dummy para Dr. Gabriel
const DUMMY_PATIENTS_GABRIEL = [
  {
    id: 'p_g1',
    name: 'Mariana Silva Souza',
    cpf: '123.456.789-00',
    birthDate: '1995-04-12',
    phone: '(11) 98765-4321',
    email: 'mariana.silva@email.com',
    gender: 'Feminino',
    anamnese: { allergy: 'Sim', allergyDesc: 'Penicilina', cardiac: 'Não', cardiacDesc: '', diabetes: 'Não', pressure: 'Normal', medication: 'Nenhuma', pregnant: 'Não' },
    odontogramState: { '18': { absent: true }, '16': { 'C': 'restaurado' }, '21': { 'T': 'carie' }, '36': { 'C': 'canal' } },
    createdAt: '2026-01-15',
    notes: 'Paciente super receptiva.'
  },
  {
    id: 'p_g2',
    name: 'Carlos Eduardo Santos',
    cpf: '987.654.321-11',
    birthDate: '1988-11-23',
    phone: '(11) 99122-3344',
    email: 'carlos.edu@email.com',
    gender: 'Masculino',
    anamnese: { allergy: 'Não', allergyDesc: '', cardiac: 'Sim', cardiacDesc: 'Sopro leve', diabetes: 'Não', pressure: 'Alta (Controlada)', medication: 'Losartana', pregnant: 'Não' },
    odontogramState: { '46': { 'C': 'carie' } },
    createdAt: '2026-02-10'
  }
];

const DUMMY_APPOINTMENTS_GABRIEL = [
  {
    id: 'a_g1',
    patientId: 'p_g1',
    patientName: 'Mariana Silva Souza',
    date: new Date().toISOString().split('T')[0], // Hoje
    time: '09:00',
    duration: 60,
    treatment: 'Restauração de Resina',
    status: 'Concluído',
    notes: 'Realizada restauração face oclusal dente 16.'
  },
  {
    id: 'a_g2',
    patientId: 'p_g2',
    patientName: 'Carlos Eduardo Santos',
    date: new Date().toISOString().split('T')[0], // Hoje
    time: '14:30',
    duration: 45,
    treatment: 'Avaliação Geral (Cárie dente 46)',
    status: 'Aguardando',
    notes: 'Sensibilidade ao frio no dente 46.'
  }
];

const DUMMY_TRANSACTIONS_GABRIEL = [
  { id: 't_g1', type: 'inflow', amount: 350.00, date: new Date().toISOString().split('T')[0], description: 'Restauração dente 16 - Mariana Souza', patientId: 'p_g1' },
  { id: 't_g2', type: 'outflow', amount: 150.00, date: new Date().toISOString().split('T')[0], description: 'Compra de luvas descartáveis' }
];

// Dados Dummy para Dra. Beatriz
const DUMMY_PATIENTS_BEATRIZ = [
  {
    id: 'p_b1',
    name: 'Ana Beatriz Ramos (Infantil)',
    cpf: '456.789.123-55',
    birthDate: '2019-06-30',
    phone: '(11) 97755-6677',
    email: 'mae.anabeatriz@email.com',
    gender: 'Feminino',
    anamnese: { allergy: 'Não', allergyDesc: '', cardiac: 'Não', cardiacDesc: '', diabetes: 'Não', pressure: 'Normal', medication: 'Nenhuma', pregnant: 'Não' },
    odontogramState: { '54': { 'C': 'carie' }, '62': { 'T': 'restaurado' } },
    createdAt: '2026-03-22'
  },
  {
    id: 'p_b2',
    name: 'Pedro Albuquerque Ribeiro',
    cpf: '222.333.444-55',
    birthDate: '1975-08-05',
    phone: '(11) 96655-4433',
    email: 'pedro.alb@email.com',
    gender: 'Masculino',
    anamnese: { allergy: 'Sim', allergyDesc: 'Dipirona', cardiac: 'Não', cardiacDesc: '', diabetes: 'Sim', pressure: 'Normal', medication: 'Metformina', pregnant: 'Não' },
    odontogramState: { '14': { 'L': 'carie', 'C': 'carie' } },
    createdAt: '2026-04-01'
  }
];

const DUMMY_APPOINTMENTS_BEATRIZ = [
  {
    id: 'a_b1',
    patientId: 'p_b1',
    patientName: 'Ana Beatriz Ramos (Infantil)',
    date: new Date().toISOString().split('T')[0], // Hoje
    time: '10:00',
    duration: 30,
    treatment: 'Profilaxia e Flúor',
    status: 'Concluído',
    notes: 'Excelente comportamento durante a limpeza.'
  },
  {
    id: 'a_b2',
    patientId: 'p_b2',
    patientName: 'Pedro Albuquerque Ribeiro',
    date: new Date().toISOString().split('T')[0], // Hoje
    time: '16:00',
    duration: 60,
    treatment: 'Tratamento de Canal',
    status: 'Agendado',
    notes: 'Primeira sessão do canal dente 14.'
  }
];

const DUMMY_TRANSACTIONS_BEATRIZ = [
  { id: 't_b1', type: 'inflow', amount: 180.00, date: new Date().toISOString().split('T')[0], description: 'Profilaxia - Ana B. Ramos', patientId: 'p_b1' },
  { id: 't_b2', type: 'outflow', amount: 200.00, date: new Date().toISOString().split('T')[0], description: 'Licença Software Odontológico' }
];

export const db = {
  // Inicializa os bancos de dados segmentados por profissional
  init() {
    // Inicialização da base do Dr. Gabriel
    if (!localStorage.getItem('odonto_patients_dr_gabriel')) {
      localStorage.setItem('odonto_patients_dr_gabriel', JSON.stringify(DUMMY_PATIENTS_GABRIEL));
      localStorage.setItem('odonto_appointments_dr_gabriel', JSON.stringify(DUMMY_APPOINTMENTS_GABRIEL));
      localStorage.setItem('odonto_transactions_dr_gabriel', JSON.stringify(DUMMY_TRANSACTIONS_GABRIEL));
    }
    
    // Inicialização da base da Dra. Beatriz
    if (!localStorage.getItem('odonto_patients_dra_beatriz')) {
      localStorage.setItem('odonto_patients_dra_beatriz', JSON.stringify(DUMMY_PATIENTS_BEATRIZ));
      localStorage.setItem('odonto_appointments_dra_beatriz', JSON.stringify(DUMMY_APPOINTMENTS_BEATRIZ));
      localStorage.setItem('odonto_transactions_dra_beatriz', JSON.stringify(DUMMY_TRANSACTIONS_BEATRIZ));
    }
  },

  // Retorna os dentistas cadastrados
  getDentists() {
    return USERS.filter(u => u.role === 'dentista');
  },

  // Retorna os detalhes de um usuário específico
  getUserById(id) {
    return USERS.find(u => u.id === id) || null;
  },

  // Valida login do profissional
  login(username, password) {
    const user = USERS.find(u => u.username === username && u.password === password);
    if (!user) return null;

    // Salva sessão atual
    sessionStorage.setItem('logged_user_id', user.id);
    sessionStorage.setItem('logged_user_name', user.name);
    sessionStorage.setItem('logged_user_role', user.role);

    // Configura o dentista ativo inicial no contexto da sessão
    if (user.role === 'dentista') {
      sessionStorage.setItem('active_dentist_id', user.id);
    } else {
      // Secretária: seleciona o primeiro dentista por padrão
      sessionStorage.setItem('active_dentist_id', 'dr_gabriel');
    }

    return user;
  },

  logout() {
    sessionStorage.clear();
  },

  // Retorna qual base de dentista deve ser lida atualmente
  getActiveDentistId() {
    return sessionStorage.getItem('active_dentist_id') || null;
  },

  setActiveDentistId(id) {
    sessionStorage.setItem('active_dentist_id', id);
  },

  // Retorna os dados do usuário autenticado no momento
  getLoggedUser() {
    const id = sessionStorage.getItem('logged_user_id');
    if (!id) return null;
    return {
      id,
      name: sessionStorage.getItem('logged_user_name'),
      role: sessionStorage.getItem('logged_user_role')
    };
  },

  // --- CRUD DE PACIENTES SEGMENTADO ---
  getPatients() {
    const dentistId = this.getActiveDentistId();
    if (!dentistId) return [];
    return JSON.parse(localStorage.getItem(`odonto_patients_${dentistId}`)) || [];
  },

  getPatientById(id) {
    const patients = this.getPatients();
    return patients.find(p => p.id === id) || null;
  },

  savePatient(patient) {
    const dentistId = this.getActiveDentistId();
    if (!dentistId) return null;

    const patients = this.getPatients();
    if (!patient.id) {
      patient.id = 'p_' + Date.now();
      patient.createdAt = new Date().toISOString().split('T')[0];
      if (!patient.odontogramState) patient.odontogramState = {};
      patients.push(patient);
    } else {
      const index = patients.findIndex(p => p.id === patient.id);
      if (index !== -1) {
        patients[index] = { ...patients[index], ...patient };
      }
    }
    localStorage.setItem(`odonto_patients_${dentistId}`, JSON.stringify(patients));
    this.syncPatientNameInAppointments(patient.id, patient.name);
    return patient;
  },

  deletePatient(id) {
    const dentistId = this.getActiveDentistId();
    if (!dentistId) return;

    let patients = this.getPatients();
    patients = patients.filter(p => p.id !== id);
    localStorage.setItem(`odonto_patients_${dentistId}`, JSON.stringify(patients));

    let appointments = this.getAppointments();
    appointments = appointments.filter(a => a.patientId !== id);
    localStorage.setItem(`odonto_appointments_${dentistId}`, JSON.stringify(appointments));
  },

  syncPatientNameInAppointments(patientId, newName) {
    const dentistId = this.getActiveDentistId();
    if (!dentistId) return;

    const appointments = this.getAppointments();
    let updated = false;
    appointments.forEach(app => {
      if (app.patientId === patientId) {
        app.patientName = newName;
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem(`odonto_appointments_${dentistId}`, JSON.stringify(appointments));
    }
  },

  // --- CRUD DE AGENDAMENTOS SEGMENTADO ---
  getAppointments() {
    const dentistId = this.getActiveDentistId();
    if (!dentistId) return [];
    return JSON.parse(localStorage.getItem(`odonto_appointments_${dentistId}`)) || [];
  },

  getAppointmentById(id) {
    const appointments = this.getAppointments();
    return appointments.find(a => a.id === id) || null;
  },

  saveAppointment(appointment) {
    const dentistId = this.getActiveDentistId();
    if (!dentistId) return null;

    const appointments = this.getAppointments();
    const patient = this.getPatientById(appointment.patientId);
    if (patient) {
      appointment.patientName = patient.name;
    }

    if (!appointment.id) {
      appointment.id = 'a_' + Date.now();
      appointments.push(appointment);
    } else {
      const index = appointments.findIndex(a => a.id === appointment.id);
      if (index !== -1) {
        appointments[index] = { ...appointments[index], ...appointment };
      }
    }
    localStorage.setItem(`odonto_appointments_${dentistId}`, JSON.stringify(appointments));
    return appointment;
  },

  deleteAppointment(id) {
    const dentistId = this.getActiveDentistId();
    if (!dentistId) return;

    let appointments = this.getAppointments();
    appointments = appointments.filter(a => a.id !== id);
    localStorage.setItem(`odonto_appointments_${dentistId}`, JSON.stringify(appointments));
  },

  // --- CRUD FINANCEIRO SEGMENTADO ---
  getTransactions() {
    const dentistId = this.getActiveDentistId();
    if (!dentistId) return [];
    return JSON.parse(localStorage.getItem(`odonto_transactions_${dentistId}`)) || [];
  },

  saveTransaction(transaction) {
    const dentistId = this.getActiveDentistId();
    if (!dentistId) return null;

    const transactions = this.getTransactions();
    if (!transaction.id) {
      transaction.id = 't_' + Date.now();
      transaction.date = transaction.date || new Date().toISOString().split('T')[0];
      transactions.push(transaction);
    } else {
      const index = transactions.findIndex(t => t.id === transaction.id);
      if (index !== -1) {
        transactions[index] = { ...transactions[index], ...transaction };
      }
    }
    localStorage.setItem(`odonto_transactions_${dentistId}`, JSON.stringify(transactions));
    return transaction;
  },

  deleteTransaction(id) {
    const dentistId = this.getActiveDentistId();
    if (!dentistId) return;

    let transactions = this.getTransactions();
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem(`odonto_transactions_${dentistId}`, JSON.stringify(transactions));
  },

  // --- ESTATÍSTICAS DO DASHBOARD ---
  getDashboardStats() {
    const patients = this.getPatients();
    const appointments = this.getAppointments();
    const transactions = this.getTransactions();
    const todayStr = new Date().toISOString().split('T')[0];

    const totalPatients = patients.length;
    const appointmentsToday = appointments.filter(a => a.date === todayStr).length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyBilling = transactions
      .filter(t => {
        if (t.type !== 'inflow') return false;
        const tDate = new Date(t.date);
        return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const activeTreatments = appointments.filter(a => a.date >= todayStr && a.status !== 'Concluído').length;

    return {
      totalPatients,
      appointmentsToday,
      monthlyBilling,
      activeTreatments
    };
  }
};
