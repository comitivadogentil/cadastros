const form = document.getElementById('cadastroForm');
const tabela = document.querySelector('#tabelaParticipantes tbody');
const searchInput = document.getElementById('searchInput');
let participantes = JSON.parse(localStorage.getItem('participantes')) || [];

function atualizarTabela(filtro = "") {
  tabela.innerHTML = "";

  const filtrados = participantes.filter(p => {
    const nome = p.nome.toLowerCase();
    const telefone = p.telefone.toLowerCase();
    return nome.includes(filtro) || telefone.includes(filtro);
  });

  filtrados.forEach((p, index) => {
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${p.nome}</td>
      <td>${p.telefone}</td>
      <td>${p.email}</td>
      <td>${p.cavaleiro}</td>
      <td><button onclick="excluirParticipante(${index})" style="background:red;color:white;border:none;padding:5px 10px;">Excluir</button></td>
    `;
    tabela.appendChild(linha);
  });
}

function excluirParticipante(index) {
  if (confirm("Tem certeza que deseja excluir este participante?")) {
    participantes.splice(index, 1); // Remove do array
    localStorage.setItem('participantes', JSON.stringify(participantes)); // Atualiza o localStorage
    atualizarTabela(searchInput.value.toLowerCase()); // Atualiza a exibição
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const participante = {
    nome: document.getElementById('nome').value,
    email: document.getElementById('email').value,
    telefone: document.getElementById('telefone').value,
    cavaleiro: document.getElementById('cavaleiro').value
  };

  participantes.push(participante);
  localStorage.setItem('participantes', JSON.stringify(participantes));
  form.reset();
  atualizarTabela(searchInput.value.toLowerCase());
});

searchInput.addEventListener('input', () => {
  const filtro = searchInput.value.toLowerCase();
  atualizarTabela(filtro);
});

function exportarParticipantes() {
  const dados = JSON.stringify(participantes, null, 2);
  const blob = new Blob([dados], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'participantes_cavalgada.json';
  link.click();
}

atualizarTabela();
