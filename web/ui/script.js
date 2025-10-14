document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));

  if (!usuario) {
    alert("Você precisa estar logado para acessar esta página!");
    window.location.href = "../login/index.html";
    return;
  }

  // Criar botão logout
  criarBotaoLogout();

  // Exibir ou ocultar botão "Nova Turma" dependendo do perfil
  if (usuario.perfilId === 2) {
    document.getElementById("btnCadastrarTurma").style.display = "inline-block";
  } else {
    document.getElementById("btnCadastrarTurma").style.display = "none";
  }

  carregarTurmas(usuario);

  configurarModais(usuario);
});

// Função para criar botão logout
function criarBotaoLogout() {
  const topbar = document.querySelector(".topbar");
  const btnLogout = document.createElement("button");
  btnLogout.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`;
  btnLogout.classList.add("logout-btn");
  btnLogout.onclick = () => {
    sessionStorage.removeItem("usuario");
    window.location.href = "../login/index.html";
  };
  topbar.appendChild(btnLogout);
}

// Carregar turmas da API e montar a lista
async function carregarTurmas(usuario) {
  try {
    const response = await fetch("http://localhost:3000/turma");
    if (!response.ok) throw new Error("Erro ao buscar turmas");
    const turmas = await response.json();

    const lista = document.getElementById("listaTurmas");
    lista.innerHTML = "";

    turmas.forEach((turma, index) => {
      const tr = document.createElement("tr");

      // Se for professor, mostra botões editar e excluir, se não só visualizar
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${turma.nome}</td>
        <td>
          ${usuario.perfilId === 2
            ? `
              <button class="btn btn-edit" onclick="abrirModalAtualizarTurma(${turma.id}, '${turma.nome}')">Atualizar</button>
              <button class="btn btn-delete" onclick="excluirTurma(${turma.id})">Excluir</button>
              <button class="btn btn-view" onclick="visualizarAtividades(${turma.id}, '${turma.nome}')">Atividades</button>
            `
            : `<button class="btn btn-view" onclick="visualizarAtividades(${turma.id}, '${turma.nome}')">Atividades</button>`
          }
        </td>
      `;
      lista.appendChild(tr);
    });
  } catch (err) {
    alert("Erro ao carregar turmas: " + err.message);
  }
}

// Modal de cadastro e atualização
function configurarModais(usuario) {
  // Modal Turma
  const modalTurma = document.getElementById("modalTurma");
  const formTurma = document.getElementById("formTurma");
  const btnFecharTurma = modalTurma.querySelector(".close");

  btnFecharTurma.onclick = () => {
    modalTurma.style.display = "none";
    formTurma.reset();
  };

  window.onclick = (event) => {
    if (event.target === modalTurma) {
      modalTurma.style.display = "none";
      formTurma.reset();
    }
  };

  formTurma.onsubmit = async (e) => {
    e.preventDefault();
    if (usuario.perfilId !== 2) {
      alert("Você não tem permissão para realizar essa ação.");
      return;
    }

    const id = formTurma.dataset.id; // id da turma quando atualizar
    const nome = formTurma.nomeTurma.value.trim();

    if (!nome) {
      alert("Digite o nome da turma");
      return;
    }

    try {
      let res;
      if (id) {
        // Atualizar
        res = await fetch(`http://localhost:3000/turma/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome }),
        });
      } else {
        // Criar
        res = await fetch("http://localhost:3000/turma", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome }),
        });
      }

      if (!res.ok) throw new Error("Erro ao salvar turma");

      modalTurma.style.display = "none";
      formTurma.reset();
      delete formTurma.dataset.id; // limpa o id após update

      carregarTurmas(usuario);
    } catch (err) {
      alert(err.message);
    }
  };

  // Modal Atividade
  const modalAtividade = document.getElementById("modalAtividade");
  const formAtividade = document.getElementById("formAtividade");
  const btnFecharAtividade = modalAtividade.querySelector(".close");
  let turmaAtualId = null;

  btnFecharAtividade.onclick = () => {
    modalAtividade.style.display = "none";
    formAtividade.reset();
    turmaAtualId = null;
  };

  window.onclick = (event) => {
    if (event.target === modalAtividade) {
      modalAtividade.style.display = "none";
      formAtividade.reset();
      turmaAtualId = null;
    }
  };

  formAtividade.onsubmit = async (e) => {
    e.preventDefault();
    if (usuario.perfilId !== 2) {
      alert("Você não tem permissão para realizar essa ação.");
      return;
    }

    const nome = formAtividade.nomeAtividade.value.trim();
    if (!nome || !turmaAtualId) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/atividade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          turma_id: turmaAtualId,
        }),
      });

      if (!res.ok) throw new Error("Erro ao salvar atividade");

      modalAtividade.style.display = "none";
      formAtividade.reset();
      carregarAtividades(turmaAtualId, usuario);
    } catch (err) {
      alert(err.message);
    }
  };

  // Abrir modal atividade com turma selecionada
  window.abrirModalAtividade = (turmaId) => {
    if (usuario.perfilId !== 2) {
      alert("Você não tem permissão para realizar essa ação.");
      return;
    }
    turmaAtualId = turmaId;
    modalAtividade.style.display = "block";
  };

  // Abrir modal atualizar turma
  window.abrirModalAtualizarTurma = (id, nome) => {
    if (usuario.perfilId !== 2) {
      alert("Você não tem permissão para realizar essa ação.");
      return;
    }
    formTurma.dataset.id = id;
    formTurma.nomeTurma.value = nome;
    modalTurma.style.display = "block";
  };
}

// Excluir turma (somente perfilId 2)
async function excluirTurma(id) {
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  if (usuario.perfilId !== 2) {
    alert("Você não tem permissão para realizar essa ação.");
    return;
  }

  if (!confirm("Deseja realmente excluir esta turma?")) return;

  try {
    const res = await fetch(`http://localhost:3000/turma/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Erro ao excluir turma");

    carregarTurmas(usuario);
  } catch (err) {
    alert(err.message);
  }
}

// Visualizar atividades da turma selecionada
async function visualizarAtividades(turmaId, nomeTurma) {
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));

  document.getElementById("nomeTurmaAtividades").textContent = nomeTurma;
  document.getElementById("turmas-section").style.display = "none";
  document.getElementById("atividades-section").style.display = "block";

  try {
    const res = await fetch("http://localhost:3000/atividade");
    if (!res.ok) throw new Error("Erro ao buscar atividades");
    const atividades = await res.json();

    // 🛠️ Convertemos turmaId para número para comparação correta
    const atividadesFiltradas = atividades.filter(
      (a) => a.turma_id === Number(turmaId)
    );

    const lista = document.getElementById("listaAtividades");
    lista.innerHTML = "";

    atividadesFiltradas.forEach((atividade, index) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${atividade.nome}</td>
        <td>
          ${
            usuario.perfilId === 2
              ? `
            <button class="btn btn-edit" onclick="abrirModalAtualizarAtividade(${atividade.id}, '${atividade.nome}', ${atividade.turma_id})">Atualizar</button>
            <button class="btn btn-delete" onclick="excluirAtividade(${atividade.id}, ${atividade.turma_id})">Excluir</button>
          `
              : `-`
          }
        </td>
      `;

      lista.appendChild(tr);
    });
  } catch (err) {
    alert(err.message);
  }
}

function abrirModalCriarTurma() {
  const modalTurma = document.getElementById("modalTurma");
  const formTurma = document.getElementById("formTurma");

  delete formTurma.dataset.id;  // Remove qualquer id para garantir que é criação, não edição
  formTurma.reset();            // Limpa o formulário
  modalTurma.style.display = "block";  // Exibe o modal
}

// Associa o botão "Nova Turma" para abrir o modal ao carregar a página
document.getElementById("btnCadastrarTurma").onclick = abrirModalCriarTurma;

// Configuração do submit do form para criação/atualização da turma
const formTurma = document.getElementById("formTurma");
formTurma.onsubmit = async (e) => {
  e.preventDefault();

  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  if (!usuario || usuario.perfilId !== 2) {
    alert("Você não tem permissão para realizar essa ação.");
    return;
  }

  const id = formTurma.dataset.id;  // Se existir, é edição; se não, criação
  const nome = formTurma.nomeTurma.value.trim();

  if (!nome) {
    alert("Digite o nome da turma");
    return;
  }

  try {
    let res;
    if (id) {
      // Atualizar turma
      res = await fetch(`http://localhost:3000/turma/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });
    } else {
      // Criar turma
      res = await fetch("http://localhost:3000/turma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });
    }

    if (!res.ok) throw new Error("Erro ao salvar turma");

    // Fecha modal e limpa formulário após sucesso
    const modalTurma = document.getElementById("modalTurma");
    modalTurma.style.display = "none";
    formTurma.reset();
    delete formTurma.dataset.id;

    // Recarrega lista de turmas
    carregarTurmas(usuario);
  } catch (err) {
    alert(err.message);
  }
};


// Modal atualizar atividade - semelhante ao modal turma
window.abrirModalAtualizarAtividade = (id, nome, turmaId) => {
  const modalAtividade = document.getElementById("modalAtividade");
  const formAtividade = document.getElementById("formAtividade");

  formAtividade.dataset.id = id;
  formAtividade.nomeAtividade.value = nome;
  formAtividade.dataset.turmaId = turmaId;
  modalAtividade.style.display = "block";
};

// Excluir atividade (perfilId 2)
async function excluirAtividade(id, turmaId) {
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  if (usuario.perfilId !== 2) {
    alert("Você não tem permissão para realizar essa ação.");
    return;
  }

  if (!confirm("Deseja realmente excluir esta atividade?")) return;

  try {
    const res = await fetch(`http://localhost:3000/atividade/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Erro ao excluir atividade");

    visualizarAtividades(turmaId);
  } catch (err) {
    alert(err.message);
  }
}

// Voltar para lista de turmas
function voltarParaTurmas() {
  document.getElementById("atividades-section").style.display = "none";
  document.getElementById("turmas-section").style.display = "block";
}
