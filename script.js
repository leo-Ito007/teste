document.addEventListener("DOMContentLoaded", () => {
  
  // CONFIGURAÇÃO MASTER DO ADMINISTRADOR SUPREMO
  const SEU_EMAIL_DONO = "leonardo.salles.felipe@escola.pr.gov.br".trim().toLowerCase();

  // VARIÁVEIS DE CONTROLE DE PERMISSÃO E SESSÃO
  let ehAdmin = false;
  let ehProfessor = false;
  let emailUsuarioLogado = ""; 
  let idSelecionado = null;

  // BANCO DE DADOS COMPLETO DA SEMANA (Segunda a Sexta | Período Manhã e Tarde)
  let gradeSemanal = {
    "segunda-feira": [
      { id: 1, periodo: "Manhã", hora: "07:30 - 08:15", professor: "Profª Marta", info: "Biologia - 1º A", status: "ocupado", reservadoPor: "marta@escola.pr.gov.br" },
      { id: 2, periodo: "Manhã", hora: "08:15 - 09:00", professor: "Prof. Carlos", info: "História - 3º C", status: "ocupado", reservadoPor: "carlos@escola.pr.gov.br" },
      { id: 3, periodo: "Tarde", hora: "13:15 - 14:00", professor: "Prof. Marcos", info: "Matemática - 7º B", status: "ocupado", reservadoPor: "marcos@escola.pr.gov.br" },
      { id: 4, periodo: "Tarde", hora: "14:00 - 14:45", professor: "Nenhum", info: "Livre", status: "disponivel", reservadoPor: "" }
    ],
    "terça-feira": [
      { id: 5, periodo: "Manhã", hora: "07:30 - 08:15", professor: "Profª Letícia", info: "Química - 2º B", status: "ocupado", reservadoPor: "" },
      { id: 6, periodo: "Manhã", hora: "08:15 - 09:00", professor: "Nenhum", info: "Livre", status: "disponivel", reservadoPor: "" },
      { id: 7, periodo: "Tarde", hora: "13:15 - 14:00", professor: "Profª Cláudia", info: "Português - 9º A", status: "ocupado", reservadoPor: "" },
      { id: 8, periodo: "Tarde", hora: "14:00 - 14:45", professor: "Prof. Roberto", info: "Física - 3º A", status: "ocupado", reservadoPor: "" }
    ],
    "quarta-feira": [
      { id: 9, periodo: "Manhã", hora: "07:30 - 08:15", professor: "Prof. Jorge", info: "Filosofia - 3º B", status: "ocupado", reservadoPor: "" },
      { id: 10, periodo: "Manhã", hora: "08:15 - 09:00", professor: "Profª Marta", info: "Biologia - 2º A", status: "ocupado", reservadoPor: "" },
      { id: 11, periodo: "Tarde", hora: "13:15 - 14:00", professor: "Nenhum", info: "Livre", status: "disponivel", reservadoPor: "" },
      { id: 12, periodo: "Tarde", hora: "14:00 - 14:45", professor: "Profª Letícia", info: "Química - 1º C", status: "ocupado", reservadoPor: "" }
    ],
    "quinta-feira": [
      { id: 13, periodo: "Manhã", hora: "07:30 - 08:15", professor: "Nenhum", info: "Livre", status: "disponivel", reservadoPor: "" },
      { id: 14, periodo: "Manhã", hora: "08:15 - 09:00", professor: "Prof. Carlos", info: "História - 1º B", status: "ocupado", reservadoPor: "" },
      { id: 15, periodo: "Tarde", hora: "13:15 - 14:00", professor: "Prof. Marcos", info: "Matemática - 8º A", status: "ocupado", reservadoPor: "" },
      { id: 16, periodo: "Tarde", hora: "14:00 - 14:45", professor: "Profª Cláudia", info: "Português - 2º C", status: "ocupado", reservadoPor: "" }
    ],
    "sexta-feira": [
      { id: 17, periodo: "Manhã", hora: "07:30 - 08:15", professor: "Prof. Roberto", info: "Física - 3º C", status: "ocupado", reservadoPor: "" },
      { id: 18, periodo: "Manhã", hora: "08:15 - 09:00", professor: "Profª Ana", info: "Geografia - 1º A", status: "ocupado", reservadoPor: "" },
      { id: 19, periodo: "Tarde", hora: "13:15 - 14:00", professor: "Profª Ana", info: "Geografia - 6º B", status: "ocupado", reservadoPor: "" },
      { id: 20, periodo: "Tarde", hora: "14:00 - 14:45", professor: "Nenhum", info: "Livre", status: "disponivel", reservadoPor: "" }
    ]
  };

  // Inicializa os bancos de dados na memória local se não existirem
  if (!localStorage.getItem('emailsAdmins')) {
    localStorage.setItem('emailsAdmins', JSON.stringify([SEU_EMAIL_DONO]));
  }
  if (!localStorage.getItem('emailsProfessores')) {
    localStorage.setItem('emailsProfessores', JSON.stringify([]));
  }

  // Força o e-mail do dono a estar sempre na lista de administradores
  let listaAdmins = JSON.parse(localStorage.getItem('emailsAdmins')) || [];
  if (!listaAdmins.includes(SEU_EMAIL_DONO)) {
    listaAdmins.push(SEU_EMAIL_DONO);
    localStorage.setItem('emailsAdmins', JSON.stringify(listaAdmins));
  }

  // CAPTURA DO CALENDÁRIO AUTOMÁTICO DO BRASIL
  const formatadorDia = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' });
  let diaDaSemanaAtual = formatadorDia.format(new Date()).toLowerCase();

  if (diaDaSemanaAtual === "sábado" || diaDaSemanaAtual === "domingo") {
    diaDaSemanaAtual = "segunda-feira";
  }

  // ATRIBUIÇÃO DOS CLIQUES COM VALIDAÇÃO DE SEGURANÇA
  const ligarClique = (id, funcao) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", funcao);
  };

  // Mapeia todos os botões do HTML aos seus cliques corretos
  ligarClique("btnAcessar", processarLoginInicial);
  ligarClique("btnSair", fazerLogout);
  ligarClique("abaProf", () => mudarVisao('professor'));
  ligarClique("abaOperador", () => mudarVisao('operador'));
  ligarClique("btnConfirmarProf", salvarOcupacaoProfessor);
  ligarClique("btnSalvarOperador", salvarEdicaoOperador);
  ligarClique("btnAutorizarEmail", adicionarNovoAcesso);

  function processarLoginInicial() {
    const inputEmail = document.getElementById('loginEmail');
    if (!inputEmail) return;

    const emailDigitado = inputEmail.value.trim().toLowerCase();
    
    if (!emailDigitado || !emailDigitado.includes('@')) {
      alert("Por favor, introduza um endereço de e-mail válido.");
      return;
    }

    emailUsuarioLogado = emailDigitado; 

    const bancoAdmins = (JSON.parse(localStorage.getItem('emailsAdmins')) || []).map(e => e.trim().toLowerCase());
    const bancoProfessores = (JSON.parse(localStorage.getItem('emailsProfessores')) || []).map(e => e.trim().toLowerCase());

    document.getElementById('telaLogin').style.display = "none";
    document.getElementById('conteudoSite').style.display = "block";
    document.getElementById('userStatus').innerText = emailDigitado;

    if (emailDigitado === SEU_EMAIL_DONO || bancoAdmins.includes(emailDigitado)) {
      ehAdmin = true;
      ehProfessor = true;
      document.getElementById('abaOperador').style.display = "block"; 
    } else if (bancoProfessores.includes(emailDigitado)) {
      ehAdmin = false;
      ehProfessor = true;
      document.getElementById('abaOperador').style.display = "none";  
    } else {
      ehAdmin = false;
      ehProfessor = false; 
      document.getElementById('abaOperador').style.display = "none";
    }
    
    mudarVisao('professor'); 
  }

  function fazerLogout() {
    ehAdmin = false;
    ehProfessor = false;
    emailUsuarioLogado = "";
    document.getElementById('conteudoSite').style.display = "none";
    document.getElementById('telaLogin').style.display = "flex";
    document.getElementById('loginEmail').value = "";
    mudarVisao('professor');
  }

  function adicionarNovoAcesso() {
    const novoEmail = document.getElementById('novoEmailAutorizado').value.trim().toLowerCase();
    if (!novoEmail || !novoEmail.includes('@')) return alert("Digite um e-mail válido!");

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
      let lista = JSON.parse(localStorage.getItem('emailsAdmins')) || [];
      lista = lista.filter(e => e.trim().toLowerCase() !== email);
      localStorage.setItem('emailsAdmins', JSON.stringify(lista));
    } else {
      let lista = JSON.parse(localStorage.getItem('emailsProfessores')) || [];
      lista = lista.filter(e => e.trim().toLowerCase() !== email);
      localStorage.setItem('emailsProfessores', JSON.stringify(lista));
    }
    atualizarListaEmailsNaTela();
  };

  function atualizarListaEmailsNaTela() {
    const container = document.getElementById('listaEmailsHtml');
    if (!container) return;
    container.innerHTML = "";
    
    const admins = JSON.parse(localStorage.getItem('emailsAdmins')) || [];
    const profs = JSON.parse(localStorage.getItem('emailsProfessores')) || [];

    admins.forEach(email => {
      container.innerHTML += `
        <div class="email-item">
          <span>👑 [ADMIN] ${email}</span>
          ${email !== SEU_EMAIL_DONO ? `<button class="btn-perigo" style="padding:2px 6px; font-size:12px;" onclick="removerEmailDoBanco('\${email}', 'admin')">Remover</button>` : ''}
        </div>
      `;
    });

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
    const abaProf = document.getElementById('abaProf');
    const abaOperador = document.getElementById('abaOperador');
    const visaoProfessor = document.getElementById('visaoProfessor');
    const visaoOperador = document.getElementById('visaoOperador');

    if (abaProf) abaProf.classList.remove('ativa');
    if (abaOperador) abaOperador.classList.remove('ativa');
    if (visaoProfessor) visaoProfessor.classList.remove('ativa');
    if (visaoOperador) visaoOperador.classList.remove('ativa');

    document.getElementById('formProfessor').style.display = "none";
    document.getElementById('formOperador').style.display = "none";

    if (tipo === 'professor') {
      if (abaProf) abaProf.classList.add('ativa');
      if (visaoProfessor) {
        visaoProfessor.classList.add('ativa');
        visaoProfessor.style.display = "block";
      }
      if (visaoOperador) visaoOperador.style.display = "none";
    } else {
      if (abaOperador) abaOperador.classList.add('ativa');
      if (visaoProfessor) visaoProfessor.style.display = "none";
      if (visaoOperador) {
        visaoOperador.classList.add('ativa');
        visaoOperador.style.display = "block";
      }
      atualizarListaEmailsNaTela();
    }
    renderizarTelas();
  }

  function renderizarTelas() {
    const tabelaProf = document.getElementById('tabelaProfessor');
    const tabelaOp = document.getElementById('tabelaOperador');
    if (!tabelaProf || !tabelaOp) return;

    tabelaProf.innerHTML = "";
    tabelaOp.innerHTML = "";

    const diaCapitalizado = diaDaSemanaAtual.charAt(0).toUpperCase() + diaDaSemanaAtual.slice(1);
    let cronogramaDoDia = gradeSemanal[diaDaSemanaAtual] || gradeSemanal["segunda-feira"];

    const tituloProf = document.querySelector("#visaoProfessor h3");
    const tituloOp = document.querySelector("#visaoOperador h3");
    if (tituloProf) tituloProf.innerText = `Grade Horária de Hoje (${diaCapitalizado})`;
    if (tituloOp) tituloOp.innerText = `⚙️ Gerenciador da Grade Geral (${diaCapitalizado})`;

    cronogramaDoDia.forEach(item => {
      let badgeStatus = "";
      if (item.status === "ocupado") {
        badgeStatus = `<span class="status-ocupado">Ocupado</span>`;
      } else if (item.status === "falta") {
        badgeStatus = `<span class="status-vaga">⚠️ AULA VAGA (FALTA)</span>`;
      } else {
        badgeStatus = `<span class="status-disponivel">Disponível</span>`;
      }

      let acaoProf = `<span style="color:#94a3b8;">Apenas Leitura</span>`;

      if (ehProfessor) {
        if (item.status === "falta" || item.status === "disponivel") {
          acaoProf = `<button class="btn-acao-linha btn-acao" data-id="${item.id}" style="padding:5px 10px;">Ocupar</button>`;
        } else if (item.status === "ocupado" && item.reservadoPor === emailUsuarioLogado) {
          acaoProf = `<button class="btn-cancelar-linha btn-perigo" data-id="${item.id}" style="padding:5px 10px;">❌ Cancelar</button>`;
        } else if (item.status === "ocupado") {
          acaoProf = `<span style="color:#64748b; font-size:13px;">Reservado</span>`;
        }
      } else {
        acaoProf = `<span style="color:#e11d48; font-weight:500;">🔒 Requer Permissão</span>`;
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

    if (ehProfessor) {
      document.querySelectorAll(".btn-acao-linha").forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
      });
      document.querySelectorAll(".btn-cancelar-linha").forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
      });
      document.querySelectorAll(".btn-acao-linha").forEach(btn => {
        btn.addEventListener("click", (e) => abrirFormProfessor(parseInt(e.target.dataset.id)));
      });
      document.querySelectorAll(".btn-cancelar-linha").forEach(btn => {
        btn.addEventListener("click", (e) => cancelarReservaProfessor(parseInt(e.target.dataset.id)));
      });
    }

    if (ehAdmin) {
      document.querySelectorAll(".btn-editar-linha").forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
      });
      document.querySelectorAll(".btn-falta-linha").forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
      });
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
    let materiaSelect = document.getElementById('profInputMateria').value;
    let turma = document.getElementById('profInputTurma').value.trim();

    if (!nome || !materiaSelect || !turma) {
      return alert("Preencha todos os campos e selecione uma matéria!");
    }

    let item = encontrarItemPorId(idSelecionado);
    item.professor = nome;
    item.info = `${materiaSelect} - ${turma}`;
    item.status = "ocupado";
    item.reservadoPor = emailUsuarioLogado;

    document.getElementById('formProfessor').style.display = "none";
    document.getElementById('profInputNome').value = "";
    document.getElementById('profInputMateria').value = "";
    document.getElementById('profInputTurma').value = "";
    renderizarTelas();
  }

function cancelarReservaProfessor(id) {
    // 1. Busca no banco de dados o horário específico que o professor clicou
    let item = encontrarItemPorId(id);
    
    // Trava de segurança: Garante que o item existe e que o usuário logado realmente tem direito de cancelar
    if (!item) return;
    
    if (item.reservadoPor !== emailUsuarioLogado) {
      alert("Segurança: Você não tem permissão para cancelar uma reserva feita por outro professor!");
      return;
    }

    // 2. Abre uma caixa de confirmação na tela para evitar cliques acidentais
    if (confirm(`Tem certeza que deseja cancelar sua reserva do horário ${item.hora}?`)) {
      
      // 3. Reseta os dados do horário, limpando o agendamento
      item.professor = "Nenhum";
      item.info = "Livre";
      item.status = "disponivel";
      item.reservadoPor = ""; // Apaga o carimbo do e-mail para deixar livre para outros

      // 4. Se você estiver usando o IndexedDB (Arquivo 2), descomente a linha abaixo para salvar permanentemente:
      // LocalDB.save("cronograma", item);

      // 5. Atualiza a tela na hora para mostrar o status "Disponível" em verde
      renderizarTelas();
      
      alert("Reserva cancelada com sucesso! O horário agora está disponível.");
    }
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

    if (item.professor.toLowerCase() === "nenhum" || item.professor === "") {
      item.status = "disponivel";
      item.reservadoPor = "";
    }

    document.getElementById('formOperador').style.display = "none";
    renderizarTelas();
  }

  function marcarFaltaOperador(id) {
    let item = encontrarItemPorId(id);
    item.status = "falta";
    item.info = `AULA VAGA - Original de ${item.professor}`;
    item.reservadoPor = "";
    renderizarTelas();
  }
});
