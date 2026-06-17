/**
 * Componente Odontograma Interativo (Adulto e Infantil)
 * Gerencia a renderização dos dentes em SVG e as interações clínicas.
 */

export class Odontograma {
  constructor({ containerId, patient, onUpdate }) {
    this.container = document.getElementById(containerId);
    this.patient = patient;
    this.onUpdate = onUpdate;
    this.activeMode = 'adulto'; // 'adulto' ou 'infantil'
    this.activeBrush = null; // 'carie', 'restaurado', 'canal', 'saudavel', 'ausente' ou null (inspeção)
    
    // Inicializa o estado dos dentes do paciente se não existir
    if (!this.patient.odontogramState) {
      this.patient.odontogramState = {};
    }
    
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  // Define qual procedimento (pincel) está ativo
  setBrush(brushType) {
    this.activeBrush = this.activeBrush === brushType ? null : brushType;
    this.updateBrushUI();
  }

  updateBrushUI() {
    // Atualiza botões da legenda para mostrar qual está selecionado
    const pills = this.container.querySelectorAll('.legend-pill');
    pills.forEach(pill => {
      const type = pill.dataset.type;
      if (type === this.activeBrush) {
        pill.classList.add('active');
        pill.style.borderColor = 'var(--color-primary)';
      } else {
        pill.classList.remove('active');
        pill.style.borderColor = '';
      }
    });
  }

  setMode(mode) {
    this.activeMode = mode;
    this.render();
    this.bindEvents();
    this.updateBrushUI();
  }

  // Gera o SVG de um dente com 5 faces
  getToothSVG(number) {
    const state = this.patient.odontogramState[number] || {};
    const isAbsent = state.absent || false;
    
    // Classes de cada face
    const getFaceClass = (face) => {
      const faceState = state[face] || '';
      return faceState ? `tooth-face ${faceState}` : 'tooth-face';
    };

    return `
      <div class="tooth-box ${isAbsent ? 'ausente' : ''}" data-tooth="${number}">
        <span class="tooth-number">${number}</span>
        <svg class="tooth-svg" viewBox="0 0 40 40" data-tooth="${number}">
          <!-- Top (Vestibular / Labial) -->
          <polygon class="${getFaceClass('T')}" points="0,0 40,0 30,10 10,10" data-face="T" title="Face Superior/Vestibular" />
          
          <!-- Right (Distal / Mesial) -->
          <polygon class="${getFaceClass('R')}" points="40,0 30,10 30,30 40,40" data-face="R" title="Face Direita" />
          
          <!-- Bottom (Lingual / Palatina) -->
          <polygon class="${getFaceClass('B')}" points="0,40 40,40 30,30 10,30" data-face="B" title="Face Inferior/Lingual" />
          
          <!-- Left (Mesial / Distal) -->
          <polygon class="${getFaceClass('L')}" points="0,0 10,10 10,30 0,40" data-face="L" title="Face Esquerda" />
          
          <!-- Center (Oclusal / Incisal) -->
          <polygon class="${getFaceClass('C')}" points="10,10 30,10 30,30 10,30" data-face="C" title="Face Central/Oclusal" />
        </svg>
      </div>
    `;
  }

  render() {
    // Listagem dos dentes de acordo com a nomenclatura internacional (FDI)
    // Adulto: Quadrantes 1, 2, 4, 3
    const adultUpperRight = [18, 17, 16, 15, 14, 13, 12, 11];
    const adultUpperLeft  = [21, 22, 23, 24, 25, 26, 27, 28];
    const adultLowerRight = [48, 47, 46, 45, 44, 43, 42, 41];
    const adultLowerLeft  = [31, 32, 33, 34, 35, 36, 37, 38];

    // Infantil: Quadrantes 5, 6, 8, 7
    const childUpperRight = [55, 54, 53, 52, 51];
    const childUpperLeft  = [61, 62, 63, 64, 65];
    const childLowerRight = [85, 84, 83, 82, 81];
    const childLowerLeft  = [71, 72, 73, 74, 75];

    let upperRowHTML = '';
    let lowerRowHTML = '';

    if (this.activeMode === 'adulto') {
      upperRowHTML += adultUpperRight.map(n => this.getToothSVG(n)).join('');
      upperRowHTML += '<div style="width: 2px; background: var(--border-color); margin: 0 10px;"></div>';
      upperRowHTML += adultUpperLeft.map(n => this.getToothSVG(n)).join('');

      lowerRowHTML += adultLowerRight.map(n => this.getToothSVG(n)).join('');
      lowerRowHTML += '<div style="width: 2px; background: var(--border-color); margin: 0 10px;"></div>';
      lowerRowHTML += adultLowerLeft.map(n => this.getToothSVG(n)).join('');
    } else {
      // Infantil
      upperRowHTML += childUpperRight.map(n => this.getToothSVG(n)).join('');
      upperRowHTML += '<div style="width: 2px; background: var(--border-color); margin: 0 10px;"></div>';
      upperRowHTML += childUpperLeft.map(n => this.getToothSVG(n)).join('');

      lowerRowHTML += childLowerRight.map(n => this.getToothSVG(n)).join('');
      lowerRowHTML += '<div style="width: 2px; background: var(--border-color); margin: 0 10px;"></div>';
      lowerRowHTML += childLowerLeft.map(n => this.getToothSVG(n)).join('');
    }

    this.container.innerHTML = `
      <div class="odontograma-container">
        <div class="odontograma-header">
          <div class="odontograma-arch-switch">
            <button class="arch-btn ${this.activeMode === 'adulto' ? 'active' : ''}" data-mode="adulto">Adulto (Permanentes)</button>
            <button class="arch-btn ${this.activeMode === 'infantil' ? 'active' : ''}" data-mode="infantil">Infantil (Decíduos)</button>
          </div>
          
          <div class="odontograma-legend">
            <span class="legend-pill" data-type="carie" title="Clique para pintar faces com cárie">
              <span class="color-dot carie"></span> Cárie
            </span>
            <span class="legend-pill" data-type="restaurado" title="Clique para pintar faces restauradas">
              <span class="color-dot restaurado"></span> Restauração
            </span>
            <span class="legend-pill" data-type="canal" title="Clique para pintar tratamento de canal">
              <span class="color-dot canal"></span> Canal
            </span>
            <span class="legend-pill" data-type="saudavel" title="Clique para limpar ou marcar saudável">
              <span class="color-dot saudavel"></span> Saudável
            </span>
            <span class="legend-pill" data-type="ausente" title="Clique para extrair/marcar dente ausente">
              <span class="color-dot ausente"></span> Ausente
            </span>
          </div>
        </div>

        <div class="odontograma-view">
          <div class="odontograma-row upper-arch">
            ${upperRowHTML}
          </div>
          <div class="odontograma-row lower-arch">
            ${lowerRowHTML}
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Clique nos botões de modo (Adulto / Infantil)
    const modeBtns = this.container.querySelectorAll('.arch-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setMode(btn.dataset.mode);
      });
    });

    // Clique nas legendas para selecionar o pincel ativo
    const pills = this.container.querySelectorAll('.legend-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.setBrush(pill.dataset.type);
      });
    });

    // Evento de clique nas faces do dente ou na caixa do dente
    const toothBoxes = this.container.querySelectorAll('.tooth-box');
    toothBoxes.forEach(box => {
      const toothNum = box.dataset.tooth;

      // Clique nas faces individuais (SVG Polygons)
      const polygons = box.querySelectorAll('.tooth-face');
      polygons.forEach(polygon => {
        polygon.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleFaceClick(toothNum, polygon.dataset.face, polygon);
        });
      });

      // Clique na caixa do dente (para marcar ausente)
      box.addEventListener('click', () => {
        if (this.activeBrush === 'ausente') {
          this.toggleToothAbsent(toothNum, box);
        }
      });
    });
  }

  handleFaceClick(toothNum, face, element) {
    if (!this.activeBrush) {
      // Se não houver pincel ativo, abre menu rápido ou ciclo de estados padrão
      this.cycleFaceState(toothNum, face, element);
      return;
    }

    if (this.activeBrush === 'ausente') {
      const box = this.container.querySelector(`.tooth-box[data-tooth="${toothNum}"]`);
      this.toggleToothAbsent(toothNum, box);
      return;
    }

    // Aplica o pincel ativo na face
    if (!this.patient.odontogramState[toothNum]) {
      this.patient.odontogramState[toothNum] = {};
    }

    if (this.activeBrush === 'saudavel') {
      // Limpa o estado da face
      delete this.patient.odontogramState[toothNum][face];
      element.className.baseVal = 'tooth-face';
    } else {
      this.patient.odontogramState[toothNum][face] = this.activeBrush;
      element.className.baseVal = `tooth-face ${this.activeBrush}`;
    }

    this.onUpdate(this.patient);
  }

  cycleFaceState(toothNum, face, element) {
    if (!this.patient.odontogramState[toothNum]) {
      this.patient.odontogramState[toothNum] = {};
    }

    const currentState = this.patient.odontogramState[toothNum][face] || '';
    let newState = '';

    // Ciclo: Saudável/Limpo -> Cárie -> Restaurado -> Canal -> Saudável
    if (!currentState) newState = 'carie';
    else if (currentState === 'carie') newState = 'restaurado';
    else if (currentState === 'restaurado') newState = 'canal';
    else newState = ''; // Limpo

    if (newState) {
      this.patient.odontogramState[toothNum][face] = newState;
      element.className.baseVal = `tooth-face ${newState}`;
    } else {
      delete this.patient.odontogramState[toothNum][face];
      element.className.baseVal = 'tooth-face';
    }

    this.onUpdate(this.patient);
  }

  toggleToothAbsent(toothNum, boxElement) {
    if (!this.patient.odontogramState[toothNum]) {
      this.patient.odontogramState[toothNum] = {};
    }

    const currentAbsent = this.patient.odontogramState[toothNum].absent || false;
    const newAbsent = !currentAbsent;

    this.patient.odontogramState[toothNum].absent = newAbsent;
    
    if (newAbsent) {
      boxElement.classList.add('ausente');
    } else {
      boxElement.classList.remove('ausente');
    }

    this.onUpdate(this.patient);
  }
}
