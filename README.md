# OdontoManager

Sistema desktop para gestão odontológica, desenvolvido com Electron, JavaScript, HTML e CSS.

O projeto foi criado com o objetivo de facilitar a organização de dados em uma clínica odontológica, centralizando informações importantes em uma interface simples e prática.

## Funcionalidades

* Cadastro e organização de pacientes
* Interface desktop para uso local
* Estrutura modular com componentes e views
* Banco de dados local
* Projeto empacotável como aplicativo desktop

## Tecnologias utilizadas

* JavaScript
* Electron
* HTML5
* CSS3
* Vite
* Node.js

## Estrutura do projeto

```bash
OdontoManager/
├── components/        # Componentes da interface
├── views/             # Telas do sistema
├── app.js             # Lógica principal da aplicação
├── db.js              # Configuração/integração com banco de dados
├── main.js            # Processo principal do Electron
├── index.html         # Página principal
├── styles.css         # Estilos globais
├── package.json       # Dependências e scripts do projeto
├── vite.config.js     # Configuração do Vite
└── README.md
```

## Como rodar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/juliaaviee/OdontoManager.git
```

### 2. Entre na pasta do projeto

```bash
cd OdontoManager
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Execute o projeto

```bash
npm run dev
```

ou, dependendo da configuração do projeto:

```bash
npm start
```

## Observações

As pastas `node_modules`, `dist`, `dist-app`, `dist-desktop` e arquivos executáveis não são versionados no GitHub, pois são arquivos gerados automaticamente ou muito pesados.

Para gerar uma versão executável do sistema, utilize os scripts de build definidos no `package.json`.

## Status do projeto

Projeto em desenvolvimento.

## Autora

Desenvolvido por Júlia Barroso Vieira.

GitHub: [@juliaaviee](https://github.com/juliaaviee)
