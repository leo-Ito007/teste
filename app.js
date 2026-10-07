document.addEventListener("DOMContentLoaded", () => {
  
  // CONFIGURAÇÃO MASTER DO ADMINISTRADOR SUPREMO
  const SEU_EMAIL_DONO = "leonardo.salles.felipe@escola.pr.gov.br".trim().toLowerCase();

  // VARIÁVEIS DE CONTROLE DE PERMISSÃO
  let ehAdmin = false;
  let ehProfessor = false;

  // Inicializa os bancos de dados na memória local se não existirem
  if (!localStorage.getItem('emailsAdmins')) {
    localStorage.setItem('emailsAdmins', JSON.stringify([SEU_EMAIL_DONO]));
  }
  if (!localStorage.getItem('emailsProfessores')) {
    localStorage.setItem('emailsProfessores', JSON.stringify([]));
  }

  // Força o e-mail do dono a estar sempre na lista de administradores
  let listaAdmins = JSON.parse(localStorage.getItem('emailsAdmins'));
  if (!listaAdmins.includes(SEU_EMAIL_DONO)) {
    listaAdmins.push(SEU_EMAIL_DONO);
    localStorage.setItem('emailsAdmins', JSON.stringify(listaAdmins));
  }

  // BANCO DE DADOS COMPLETO DA SEMANA (Segunda a Sexta | Período Manhã e Tarde)
  let gradeSemanal = {
    "segunda-feira": [
      { id: 1, periodo: "Manhã", hora: "07:30 - 08:15", professor: "Profª Marta", info: "Biologia - 1º A", status: "ocupado" },
      { id: 2, periodo: "Manhã", hora: "08:15 - 09:00", professor: "Prof. Carlos", info: "História - 3º C", status: "ocupado" },
      { id: 3, periodo: "Tarde", hora: "13:15 - 14:00", professor: "Prof. Marcos", info: "Matemática - 7º B", status: "ocupado" },
      { id: 4, periodo: "Tarde", hora: "14:00 - 14:45", professor: "Nenhum", info: "Livre", status: "disponivel" }
    ],
    "terça-feira": [
      { id: 5, periodo: "Manhã", hora: "07:30 - 08:15", professor: "Profª Letícia", info: "Química - 2º B", status: "ocupado" },
      { id: 6, periodo: "Manhã", hora: "08:15 - 09:00", professor: "Nenhum", info: "Livre", status: "disponivel" },
      { id: 7, periodo: "Tarde", hora: "13:15 - 14:00", professor: "Profª Cláudia", info: "Português - 9º A", status: "ocupado" },
      { id: 8, periodo: "Tarde", hora: "14:00 - 14:45", professor: "Prof. Roberto", info: "Física - 3º A", status: "ocupado" }
    ],
    "quarta-feira": [
      { id: 9, periodo: "Manhã", hora: "07:30 - 08:15", professor: "Prof. Jorge", info: "Filosofia - 3º B", status: "ocupado" },
      { id: 10, periodo: "Manhã", hora: "08:15 - 09:00", professor: "Profª Marta", info: "Biologia - 2º A", status: "ocupado" },
      { id: 11, periodo: "Tarde", hora: "13:15 - 14:00", professor: "Nenhum", info: "Livre", status: "disponivel" },
      { id: 12, periodo: "Tarde", hora: "14:00 - 14:45", professor: "Profª Letícia", info: "Química - 1º C", status: "ocupado" }
    ],
    "quinta-feira": [
      { id: 13, periodo: "Manhã", hora: "07:30 - 08:15", professor: "Nenhum", info: "Livre", status: "disponivel" },
      { id: 14, periodo: "Manhã", hora: "08:15 - 09:00", professor: "Prof. Carlos", info: "História - 1º B", status: "ocupado" },
      { id: 15, periodo: "Tarde", hora: "13:15 - 14:00", professor: "Prof. Marcos", info: "Matemática - 8º A", status: "ocupado" },
      { id: 16, periodo: "Tarde", hora: "14:00 - 14:45", professor: "Profª Cláudia", info: "Português - 2º C", status: "ocupado" }
    ],
    "sexta-feira": [
      { id: 17, periodo: "Manhã", hora: "07:30 - 08:15", professor: "Prof. Roberto", info: "Física - 3º C", status: "ocupado" },
      { id: 18, periodo: "Manhã", hora: "08:15 - 09:00", professor: "Profª Ana", info: "Geografia - 1º A", status: "ocupado" },
      { id: 19, periodo: "Tarde", hora: "13:15 - 14:00", professor: "Profª Ana", info: "Geografia - 6º B", status: "ocupado" },
      { id: 20, periodo: "Tarde", hora: "14:00 - 14:45", professor: "Nenhum", info: "Livre", status: "disponivel" }
    ]
  };

  // CAPTURA DO CALENDÁRIO AUTOMÁTICO DO BRASIL
  const formatadorDia = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' });
  let diaDaSemanaAtual = formatadorDia.format(new Date()).toLowerCase();

  if (diaDaSemanaAtual === "sábado" || diaDaSemanaAtual === "domingo") {
    diaDaSemanaAtual = "segunda-feira";
  }

  let idSelecionado = null;

  // MAPEAMENTO DOS VÍNCULOS DE CLIQUES
  document.getElementById("btnAcessar").addEventListener("click", processarLoginInicial);
  document.getElementById("btnSair").addEventListener("click", fazerLogout);
  document.getElementById("abaProf").addEventListener("click", () => mudarVisao('professor'));
  document.getElementById("abaOperador").addEventListener("click", () => mudarVisao('operador'));
  document.getElementById("btnConfirmarProf").addEventListener("click", salvarOcupacaoProfessor);
  document.getElementById("btnSalvarOperador").addEventListener("click", salvarEdicaoOperador);
  document.getElementById("btnAutorizarEmail").addEventListener("click", adicionarNovoAcesso);

  // NOVA FUNÇÃO DE LOGIN SEM ALERTAS (MENSAGENS)
  function processarLoginInicial() {
    const emailDigitado = document.getElementById('loginEmail').value.trim().toLowerCase();
    
    if (!emailDigitado || !emailDigitado.includes('@')) {
      alert("Por favor, introduza um endereço de e-mail válido.");
      return;
    }

    const bancoAdmins = JSON.parse(localStorage.getItem('emailsAdmins')) || [SEU_EMAIL_DONO];
    const bancoProfessores = JSON.parse(localStorage.getItem('emailsProfessores')) || [];

    // Transição de tela imediata
    document.getElementById('telaLogin').style.display = "none";
    document.getElementById('conteudoSite').style.display = "block";
    document.getElementById('userStatus').innerText = emailDigitado;

    // DEFINIÇÃO DO NÍVEL DE PERMISSÃO
    if (emailDigitado === SEU_EMAIL_DONO || bancoAdmins.includes(emailDigitado)) {
      ehAdmin = true;
      ehProfessor = true;
      document.getElementById('abaOperador').style.display = "block"; // Enxerga o painel completo
    } else if (bancoProfessores.includes(emailDigitado)) {
      ehAdmin = false;
      ehProfessor = true;
      document.getElementById('abaOperador').style.display = "none";  // Não vê o painel de gerenciamento
    } else {
      ehAdmin = false;
      ehProfessor = false; // Visitante / Aluno comum
      document.getElementById('abaOperador').style.display = "none";
    }
    
    renderizarTelas();
  }

  function fazerLogout() {
    ehAdmin = false;
    ehProfessor = false;
    document.getElementById('conteudoSite').style.display = "none";
    document.getElementById('telaLogin').style.display = "flex";
    document.getElementById('loginEmail').value = "";
    mudarVisao('professor');
  }

  // ADICIONAR INTEGRANTES POR PERMISSÃO SELECIONADA
  function adicionarNovoAcesso() {
    const novoEmail = document.getElementById('novoEmailAutorizado').value.trim().toLowerCase();
    if (!novoEmail || !novoEmail.includes('@')) return alert("Digite um e-mail válido!");

    // Adiciona o elemento Select dinamicamente no HTML para escolher o nível, ou assume por padrão baseado no input.
    // Para simplificar no mesmo formulário, vamos criar uma caixa de seleção rápida via prompt para não quebrar seu HTML:
    let nivel = prompt("Digite '1' para cadastrar como PROFESSOR ou '2' para cadastrar como ADMINISTRADOR:");

    if (nivel === "1") {
      let lista = JSON.parse(localStorage.getItem('emailsProfessores')) || [];
      if (!lista.includes(novoEmail)) {
        lista.push(novoEmail);
        localStorage.setItem('emailsProfessores', JSON.stringify(lista));
        alert(`Sucesso! E-mail ${novoEmail} cadastrado no grupo: PROFESSORES.`);
      } else { alert("Este e-mail já está cadastrado."); }
    } else if (nivel === "2") {
      let lista = JSON.parse(localStorage.getItem('emailsAdmins')) || [];
      if (!lista.includes(novoEmail)) {
        lista.push(novoEmail);
        localStorage.setItem('emailsAdmins', JSON.stringify(lista));
        alert(`Sucesso! E-mail ${novoEmail} cadastrado no grupo: ADMINISTRADORES.`);
      } else { alert("Este e-mail já está cadastrado."); }
    } else {
      alert("Operação cancelada ou opção inválida.");
    }

    document.getElementById('novoEmailAutorizado').value = "";
    atualizarListaEmailsNaTela();
  }

  window.removerEmailDoBanco = function(email, tipo) {
    if (email === SEU_EMAIL_DONO) return alert("O Dono master do sistema não pode ser removido!");
    
    if (tipo === 'admin') {
      let lista = JSON.parse(localStorage.getItem('emailsAdmins'));
      lista = lista.filter(e => e !== email);
      localStorage.setItem('emailsAdmins', JSON.stringify(lista));
    } else {
      let lista = JSON.parse(localStorage.getItem('emailsProfessores'));
      lista = lista.filter(e => e !== email);
      localStorage.setItem('emailsProfessores', JSON.stringify(lista));
    }
    atualizarListaEmailsNaTela();
  };

  function atualizarListaEmailsNaTela() {
    const container = document.getElementById('listaEmailsHtml');
    container.innerHTML = "";
    
    const admins = JSON.parse(localStorage.getItem('emailsAdmins')) || [];
    const profs = JSON.parse(localStorage.getItem('emailsProfessores')) || [];

    // Lista os Administradores
    admins.forEach(email => {
      container.innerHTML += `
        <div class="email-item">
          <span>👑 [ADMIN] ${email}</span>
          ${email !== SEU_EMAIL_DONO ? `<button class="btn-perigo" style="padding:2px 6px; font-size:12px;" onclick="removerEmailDoBanco('${email}', 'admin')">Remover</button>` : ''}
        </div>
      `;
    });

    // Lista os Professores
    profs.forEach(email => {
      container.innerHTML += `
        <div class="email-item">
          <span>👨‍🏫 [PROFESSOR] ${email}</span>
          <button class="btn-perigo" style="padding:2px 6px; font-size:12px;" onclick="removerEmailDoBanco('${email}', 'prof')">Remover</button>
        </div>
      `;
    });
  }

  function mudarVisao(tipo) {
    document.getElementById('visaoProfessor').classList.remove('ativa');
    document.getElementById('visaoOperador').classList.remove('ativa');
    document.getElementById('abaProf').classList.remove('ativa');
    document.getElementById('abaOperador').classList.remove('ativa');
    document.getElementById('formProfessor').style.display = "none";
    document.getElementById('formOperador').style.display = "none";

    if (tipo === 'professor') {
      document.getElementById('visaoProfessor').classList.add('ativa');
      document.getElementById('abaProf').classList.add('ativa');
    } else {
      document.getElementById('visaoOperador').classList.add('ativa');
      document.getElementById('abaOperador').classList.add('ativa');
      atualizarListaEmailsNaTela();
    }
    renderizarTelas();
  }

  // RENDERIZAÇÃO COMPLETA COM FILTROS DE TRÊS NÍVEIS
  function renderizarTelas() {
    const tabelaProf = document.getElementById('tabelaProfessor');
    const tabelaOp = document.getElementById('tabelaOperador');
    tabelaProf.innerHTML = "";
    tabelaOp.innerHTML = "";

    const diaCapitalizado = diaDaSemanaAtual.charAt(0).toUpperCase() + diaDaSemanaAtual.slice(1);
    let cronogramaDoDia = gradeSemanal[diaDaSemanaAtual] || gradeSemanal["segunda-feira"];

    document.querySelector("#visaoProfessor h3").innerText = `Grade Horária de Hoje (${diaCapitalizado})`;
    document.querySelector("#visaoOperador h3").innerText = `⚙️ Gerenciador da Grade Geral (${diaCapitalizado})`;

    cronogramaDoDia.forEach(item => {
      let badgeStatus = "";
      if (item.status === "ocupado") badgeStatus = `<span class="status-ocupado">Ocupado</span>`;
      else if (item.status === "falta") badgeStatus = `<span class="status-vaga">⚠️ AULA VAGA (FALTA)</span>`;
      else badgeStatus = `<span class="status-disponivel">Disponível</span>`;

      let acaoProf = `<span style="color:#94a3b8;">Apenas Leitura</span>`;

      if ((item.status === "falta" || item.status === "disponivel")) {
        // PERMISSÃO ESCRITA: Professores e Admins conseguem ver o botão Ocupar
        if (ehProfessor) {
          acaoProf = `<button class="btn-acao-linha btn-acao" data-id="${item.id}" style="padding:5px 10px;">Ocupar</button>`;
        } else {
          acaoProf = `<span style="color:#e11d48; font-weight:500;">🔒 Requer Permissão</span>`;
        }
      }

      tabelaProf.innerHTML += `
        <tr>
          <td><strong>${item.hora} <br><small style="color:#2563eb">${item.periodo}</small></strong></td>
          <td>${item.professor}</td>
          <td>${item.info}</td>
          <td>${badgeStatus}</td>
          <td>${acaoProf}</td>
        </tr>
      `;

      tabelaOp.innerHTML += `
        <tr>
          <td><strong>${item.hora} <br><small style="color:#2563eb">${item.periodo}</small></strong></td>
          <td>${item.professor}</td>
          <td>${item.info}</td>
          <td>${badgeStatus}</td>
          <td>
            <button class="btn-editar-linha btn-acao" data-id="${item.id}" style="background:#475569; padding:5px 10px;">✏️ Editar</button>
            <button class="btn-falta-linha btn-perigo" data-id="${item.id}" style="padding:5px 10px;">🚨 Falta</button>
          </td>
        </tr>
      `;
    });

    // Atribuição condicional de cliques baseada nas credenciais validadas
    if (ehProfessor) {
      document.querySelectorAll(".btn-acao-linha").forEach(btn => {
        btn.addEventListener("click", (e) => abrirFormProfessor(parseInt(e.target.dataset.id)));
      });
    }
    if (ehAdmin) {
      document.querySelectorAll(".btn-editar-linha").forEach(btn => {
        btn.addEventListener("click", (e) => abrirFormOperador(parseInt(e.target.dataset.id)));
      });
      document.querySelectorAll(".btn-falta-linha").forEach(btn => {
        btn.addEventListener("click", (e) => marcarFaltaOperador(parseInt(e.target.dataset.id)));
      });
    }
  }

  function encontrarItemPorId(id) {
    for (let dia in gradeSemanal) {
      let achado = gradeSemanal[dia].find(h => h.id === id);
      if (achado) return achado;
    }
    return null;
  }

  function abrirFormProfessor(id) {
    idSelecionado = id;
    let item = encontrarItemPorId(id);
    document.getElementById('profHoraTexto').innerText = `${item.hora} (${item.periodo})`;
    document.getElementById('formProfessor').style.display = "block";
    document.getElementById('formProfessor').scrollIntoView({ behavior: 'smooth' });
  }

  function salvarOcupacaoProfessor() {
    let nome = document.getElementById('profInputNome').value.trim();
    let turma = document.getElementById('profInputTurma').value.trim();
    if(!nome || !turma) return alert("Preencha todos os campos!");

    let item = encontrarItemPorId(idSelecionado);
    item.professor = nome;
    item.info = `Subst. - ${turma}`;
    item.status = "ocupado";
    
    document.getElementById('formProfessor').style.display = "none";
    document.getElementById('profInputNome').value = "";
    document.getElementById('profInputTurma').value = "";
    renderizarTelas();
  }

  function abrirFormOperador(id) {
    idSelecionado = id;
    let item = encontrarItemPorId(id);
    document.getElementById('opInputHora').value = item.hora;
    document.getElementById('opInputProf').value = item.professor;
    document.getElementById('opInputInfo').value = item.info;
    document.getElementById('formOperador').style.display = "block";
  }

  function salvarEdicaoOperador() {
    let item = encontrarItemPorId(idSelecionado);
    item.hora = document.getElementById('opInputHora').value;
    item.professor = document.getElementById('opInputProf').value;
    item.info = document.getElementById('opInputInfo').value;
    
    if(item.professor.toLowerCase() === "nenhum" || item.professor === "") {
      item.status = "disponivel";
    }
    
    document.getElementById('formOperador').style.display = "none";
    renderizarTelas();
  }

  function marcarFaltaOperador(id) {
    let item = encontrarItemPorId(id);
    item.status = "falta";
    item.info = `AULA VAGA - Original de ${item.professor}`;
    renderizarTelas();
  }
});