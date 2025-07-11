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
  const valorRestante = (p.valorCamisas || 0) - (p.valorPago || 0);
  const linha = document.createElement('tr');

  linha.innerHTML = `
  <td>${p.nome}</td>
  <td>${p.telefone}</td>
  <td>${p.cavaleiro || '-'}</td>
  <td>${p.camisaTamanho || '-'} (${p.camisaQuantidade || 0})</td>
  <td>
    Total: R$ ${p.valorCamisas?.toFixed(2) || '0.00'}<br>
    Pago: R$ ${p.valorPago?.toFixed(2) || '0.00'}<br>
    Falta: R$ ${(p.valorCamisas - p.valorPago).toFixed(2)}<br>
    <button onclick="editarPagamento(${index})" style="background:green;color:white;border:none;padding:5px 10px;">Editar Pagamento</button>
  </td>
  <td>
    <button onclick="alternarPagamento(${index})"
      style="background:${p.pago ? 'green' : 'orange'};color:white;border:none;padding:5px 10px;">
      ${p.pago ? 'Pago' : 'Não Pago'}
    </button>
    <button onclick="excluirParticipante(${index})"
      style="background:red;color:white;border:none;padding:5px 10px;margin-top:5px;">
      Excluir
    </button>
  </td>
`;

  tabela.appendChild(linha);
});
}

function excluirParticipante(index) {
  const participante = participantes[index];

  // ⚠️ Restaura camisas ao estoque, se ele tiver comprado
  if (participante.camisaTamanho && participante.camisaQuantidade > 0) {
    const indexEstoque = estoque.findIndex(e => e.tamanho === participante.camisaTamanho);
    if (indexEstoque !== -1) {
      estoque[indexEstoque].quantidade += participante.camisaQuantidade;
    } else {
      // Caso o tamanho não exista mais no estoque, recria
      estoque.push({
        tamanho: participante.camisaTamanho,
        quantidade: participante.camisaQuantidade,
        preco: parseFloat(localStorage.getItem('precoUnitario')) || 0
      });
    }
    localStorage.setItem('estoque', JSON.stringify(estoque));
    atualizarTabelaEstoque();
  }

  // Remove o participante
  participantes.splice(index, 1);
  localStorage.setItem('participantes', JSON.stringify(participantes));
  atualizarTabela(searchInput.value.toLowerCase());
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

function editarParticipante(index) {
  const participante = participantes[index];
  document.getElementById('nome').value = participante.nome;
  document.getElementById('email').value = participante.email;
  document.getElementById('telefone').value = participante.telefone;
  document.getElementById('cavaleiro').value = participante.cavaleiro;

  excluirParticipante(index); // Remove o antigo antes de adicionar o novo ao salvar
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const telefone = document.getElementById('telefone').value.trim();

  if (!nome || !telefone) {
    alert('Nome e telefone são obrigatórios!');
    return;
  }

  const participante = {
    nome,
    email,
    telefone,
    cavaleiro: document.getElementById('cavaleiro').value
  };

  participantes.push(participante);
  localStorage.setItem('participantes', JSON.stringify(participantes));
  form.reset();
  atualizarTabela(searchInput.value.toLowerCase());
});

function exportarParaCSV() {
  let csv = 'Nome,Email,Telefone,Cavaleiro\n';
  participantes.forEach(p => {
    csv += `"${p.nome}","${p.email}","${p.telefone}","${p.cavaleiro}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'participantes_cavalgada.csv';
  a.click();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const cavaleiro = document.querySelector('input[name="cavaleiro"]:checked')?.value || "-";

  const camisaTamanho = document.getElementById('camisaTamanho').value;
  const camisaQuantidade = parseInt(document.getElementById('camisaQuantidade').value);
  const precoUnitario = parseFloat(localStorage.getItem('precoUnitario')) || 0;
  let valorCamisas = camisaQuantidade * precoUnitario;

  if (!nome || !telefone) {
    alert('Nome e telefone são obrigatórios!');
    return;
  }

  // Validação de estoque (se camisa for informada)
  if (camisaTamanho && camisaQuantidade > 0) {
    const indexEstoque = estoque.findIndex(e => e.tamanho === camisaTamanho);
    if (indexEstoque === -1 || estoque[indexEstoque].quantidade < camisaQuantidade) {
      alert(`Estoque insuficiente para ${camisaTamanho}. Disponível: ${indexEstoque >= 0 ? estoque[indexEstoque].quantidade : 0}`);
      return;
    }
    // Reduz estoque
    estoque[indexEstoque].quantidade -= camisaQuantidade;
    localStorage.setItem('estoque', JSON.stringify(estoque));
    atualizarTabelaEstoque();
  } else {
    valorCamisas = 0;
  }

  const participante = {
  nome,
  telefone,
  cavaleiro, // <- este precisa vir corretamente
  camisaTamanho,
  camisaQuantidade,
  valorCamisas,
  valorPago: 0,
  pago: false
};

  participantes.push(participante);
  localStorage.setItem('participantes', JSON.stringify(participantes));
  form.reset();

  // Reaplica o preço salvo no campo de preço (se tiver)
  if (document.getElementById('preco')) {
    document.getElementById('preco').value = precoUnitario.toFixed(2);
  }

  atualizarTabela(searchInput.value.toLowerCase());
});

function alternarPagamento(index) {
  participantes[index].pago = !participantes[index].pago;
  localStorage.setItem('participantes', JSON.stringify(participantes));
  atualizarTabela(searchInput.value.toLowerCase());
}

function editarPagamento(index) {
  const participante = participantes[index];
  const valorAtual = participante.valorPago || 0;
  const valorTotal = participante.valorCamisas || 0;
  const valorRestante = valorTotal - valorAtual;

  const novoValor = prompt(
    `Valor já pago: R$ ${valorAtual.toFixed(2)}\n` +
    `Valor restante: R$ ${valorRestante.toFixed(2)}\n\n` +
    `Informe quanto deseja adicionar ao pagamento:`,
    ""
  );

  if (novoValor !== null) {
    const valorNumerico = parseFloat(novoValor);
    if (!isNaN(valorNumerico) && valorNumerico > 0 && valorNumerico <= valorRestante) {
      participante.valorPago += valorNumerico;
      participante.pago = participante.valorPago >= valorTotal;

      localStorage.setItem('participantes', JSON.stringify(participantes));
      atualizarTabela(searchInput.value.toLowerCase());
    } else {
      alert("Valor inválido. Deve ser maior que 0 e no máximo R$ " + valorRestante.toFixed(2));
    }
  }
}



// estoque

const estoqueForm = document.getElementById('estoqueForm');
const tabelaEstoque = document.querySelector('#tabelaEstoque tbody');
const totalCamisasSpan = document.getElementById('totalCamisas');
const totalEstoqueSpan = document.getElementById('totalEstoque');
const precoInput = document.getElementById('preco');

let estoque = JSON.parse(localStorage.getItem('estoque')) || [];
let precoUnitarioSalvo = localStorage.getItem('precoUnitario');

// Preenche o input com o valor salvo (se houver)
if (precoUnitarioSalvo) {
  precoInput.value = parseFloat(precoUnitarioSalvo).toFixed(2);
}

estoqueForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const tamanho = document.getElementById('tamanho').value;
  const quantidade = parseInt(document.getElementById('quantidade').value);
  const precoUnitario = parseFloat(precoInput.value);

  // Salva o valor do preço unitário para usos futuros
  localStorage.setItem('precoUnitario', precoUnitario.toFixed(2));

  estoque.push({ tamanho, quantidade, preco: precoUnitario });
  localStorage.setItem('estoque', JSON.stringify(estoque));
  estoqueForm.reset();

  // Recarrega o valor salvo após reset
  precoInput.value = precoUnitario.toFixed(2);

  atualizarTabelaEstoque();
});

function atualizarTabelaEstoque() {
  tabelaEstoque.innerHTML = "";
  let totalCamisas = 0;
  let totalEstoque = 0;

  estoque.forEach((item, index) => {
    const subtotal = item.quantidade * item.preco;
    totalCamisas += item.quantidade;
    totalEstoque += subtotal;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.tamanho}</td>
      <td>${item.quantidade}</td>
      <td>R$ ${item.preco.toFixed(2)}</td>
      <td>R$ ${subtotal.toFixed(2)}</td>
      <td><button onclick="removerItemEstoque(${index})" style="background:red;color:white;border:none;padding:5px 10px;">Excluir</button></td>
    `;
    tabelaEstoque.appendChild(row);
  });

  totalCamisasSpan.textContent = totalCamisas;
  totalEstoqueSpan.textContent = totalEstoque.toFixed(2);
}

function removerItemEstoque(index) {
  if (confirm("Deseja remover este item do estoque?")) {
    estoque.splice(index, 1);
    localStorage.setItem('estoque', JSON.stringify(estoque));
    atualizarTabelaEstoque();
  }
}

async function gerarPDFEstoque() {
  const { jsPDF } = window.jspdf;

  const elemento = document.querySelector('table#tabelaEstoque').parentElement;

  const canvas = await html2canvas(elemento, { scale: 2 });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgProps = pdf.getImageProperties(imgData);
  const imgWidth = pageWidth - 20;
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

  let y = 10;
  if (imgHeight < pageHeight) {
    pdf.addImage(imgData, 'PNG', 10, y, imgWidth, imgHeight);
  } else {
    // quebra automática em múltiplas páginas se necessário
    let position = 0;
    while (position < imgHeight) {
      pdf.addImage(imgData, 'PNG', 10, -position + 10, imgWidth, imgHeight);
      position += pageHeight;
      if (position < imgHeight) pdf.addPage();
    }
  }

  pdf.save('estoque_camisas.pdf');
}

atualizarTabelaEstoque();
