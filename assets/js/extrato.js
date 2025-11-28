// Dados mock — substitua por fetch ao backend quando necessário
const MOCK_TRANSACTIONS = [
  { id:1, date:'2025-11-25 15:30', category:'Alimentação', description:'iFood', amount:-45.90 },
  { id:2, date:'2025-11-24 08:15', category:'Transporte', description:'Posto Shell', amount:-120.00 },
  { id:3, date:'2025-11-23 14:22', category:'Compras', description:'Amazon', amount:-89.99 },
  { id:4, date:'2025-11-20 10:05', category:'Salário', description:'Pagamento Empresa X', amount:2500.00 },
  { id:5, date:'2025-11-18 09:30', category:'Assinatura', description:'Streaming', amount:-29.90 },
  { id:6, date:'2025-11-15 12:00', category:'Pix', description:'Recebido - Cliente', amount:350.00 }
];

function formatCurrency(v){
  const sign = v < 0 ? '-' : '';
  const n = Math.abs(v).toFixed(2).replace('.', ',');
  return `${sign}R$ ${n}`;
}

// variavel global para representar a lista atualmente mostrada
let CURRENT_DISPLAYED = [];

// atualizar renderDetList para setar CURRENT_DISPLAYED
function renderDetList(transactions){
  const container = document.getElementById('detList');
  if(!container) return;
  const rows = transactions.slice().sort((a,b)=> new Date(b.date) - new Date(a.date));

  // marca lista atual
  CURRENT_DISPLAYED = rows.slice();

  // montar tabela profissional
  const thead = `
    <table class="det-table" role="table" aria-label="Extrato de transações">
      <thead>
        <tr>
          <th class="col-date">Data</th>
          <th class="col-desc">Descrição / Estabelecimento</th>
          <th class="col-cat">Categoria</th>
          <th class="col-amount">Valor (R$)</th>
        </tr>
      </thead>
      <tbody>
  `;
  const tbody = rows.map(tx => {
    const datePart = tx.date.split(' ')[0];
    const timePart = tx.date.split(' ')[1] || '';
    const type = tx.amount < 0 ? 'outflow' : 'inflow';
    const amt = (Math.abs(tx.amount).toFixed(2)).replace('.',',');
    const sign = tx.amount < 0 ? '-' : '';
    return `
      <tr>
        <td class="col-date" data-label="Data">${datePart} <div style="color:var(--muted);font-size:12px">${timePart}</div></td>
        <td class="col-desc" data-label="Descrição"><strong>${tx.description}</strong><div style="color:var(--muted);font-size:13px">${tx.merchant || ''}</div></td>
        <td class="col-cat" data-label="Categoria">${tx.category || '—'}</td>
        <td class="col-amount" data-label="Valor"><span class="amount ${type}">${sign}R$ ${amt}</span></td>
      </tr>
    `;
  }).join('');

  const end = `</tbody></table>`;
  container.innerHTML = thead + tbody + end;

  // atualizar totais e cabeçalhos de impressão
  updateTotals(transactions);
  document.getElementById('printHolder').textContent = 'Maria Silva';
  document.getElementById('printCPF').textContent = '000.000.000-00';
  document.getElementById('printPeriod').textContent = 'Todos';
}

function updateTotals(transactions){
  const inflow = transactions.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0);
  const outflow = transactions.filter(t=>t.amount<0).reduce((s,t)=>s+t.amount,0);
  const balance = inflow + outflow;

  document.getElementById('totalInflow').textContent = formatCurrency(inflow);
  document.getElementById('totalOutflow').textContent = formatCurrency(Math.abs(outflow));
  document.getElementById('currentBalance').textContent = formatCurrency(balance);
}

function applyFilters(){
  const q = (document.getElementById('searchInput').value || '').toLowerCase().trim();
  const type = document.getElementById('filterType').value;
  let filtered = FH.getTransactions().slice();

  if(type === 'inflow') filtered = filtered.filter(t=>t.amount>0);
  if(type === 'outflow') filtered = filtered.filter(t=>t.amount<0);
  if(q) filtered = filtered.filter(t=> (t.description||'').toLowerCase().includes(q) || (t.category||'').toLowerCase().includes(q));

  renderDetList(filtered);
}

// exportCsv agora usa CURRENT_DISPLAYED por padrão
function exportCsv(transactions){
  const txs = transactions && transactions.length ? transactions : CURRENT_DISPLAYED;
  const header = ['id','date','category','description','amount'];
  const lines = txs.map(t => [t.id, `"${t.date}"`, `"${t.category}"`, `"${t.description}"`, t.amount].join(','));
  const csv = [header.join(','), ...lines].join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `extrato_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// evento Export CSV
const exportCsvBtn = document.getElementById('exportCsv');
if (exportCsvBtn) exportCsvBtn.addEventListener('click', () => exportCsv());

// exportar PDF usa CURRENT_DISPLAYED (a tabela já foi renderizada)
const exportPdfBtn = document.getElementById('exportPdf');
if (exportPdfBtn) {
  exportPdfBtn.addEventListener('click', async () => {
    const btn = exportPdfBtn;
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = 'Gerando PDF...';
    try {
      // garantia: html2pdf disponível
      if (typeof html2pdf === 'undefined') throw new Error('html2pdf não carregado. Verifique CDN em extrato.html');

      // escolhe área a exportar (use .det-list para apenas tabela ou .card para tudo)
      const src = document.querySelector('.card');
      if (!src) throw new Error('Elemento .card não encontrado');

      // clona e sanitiza (remove controles que não devem ir para o pdf)
      const clone = src.cloneNode(true);
      clone.style.boxShadow = 'none';
      // remover elementos com classe .no-print ou botões
      clone.querySelectorAll('.no-print, button, input, select').forEach(n => n.remove());

      // anexa temporariamente ao body (fora da viewport)
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      document.body.appendChild(clone);

      // esperar fontes/estilos aplicarem
      await new Promise(r => setTimeout(r, 400));

      const opt = {
        margin:       0.4,
        filename:     `extrato_${new Date().toISOString().slice(0,10)}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(clone).save();

      // cleanup
      document.body.removeChild(clone);
    } catch (err) {
      console.error('Erro export PDF:', err);
      // fallback simples: abrir diálogo de impressão do navegador
      if (confirm('Falha ao gerar PDF automaticamente.\nDeseja abrir a janela de impressão do navegador (fallback)?')) {
        window.print();
      } else {
        alert('Erro: ' + (err.message || err));
      }
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}

// imprimir: usa o layout atual (tabela renderizada) — mostra diálogo de impressão
const printBtn = document.getElementById('printBtn');
if (printBtn) {
  printBtn.addEventListener('click', () => {
    // forçar re-render (garante tabela atualizada) e abrir diálogo de impressão
    renderDetList(CURRENT_DISPLAYED.length ? CURRENT_DISPLAYED : FH.getTransactions());
    window.print();
  });
}

// init
document.addEventListener('DOMContentLoaded', () => {
  // render inicial
  renderDetList(FH.getTransactions());

  // popular select de categorias dinamicamente (a partir de transações existentes)
  function populateCategoryOptions(){
    const sel = document.getElementById('addCategory');
    const txs = FH.getTransactions();
    const cats = Array.from(new Set(txs.map(t => t.category || 'Outros')));
    sel.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('') + '<option value="Outros">Outros</option>';
  }
  populateCategoryOptions();

  // filtros e export
  document.getElementById('searchInput').addEventListener('input', () => applyFilters());
  document.getElementById('filterType').addEventListener('change', () => applyFilters());
  document.getElementById('exportCsv').addEventListener('click', () => exportCsv(FH.getTransactions()));

  // adicionar transação via formulário
  const addForm = document.getElementById('addTxForm');
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const dateInput = document.getElementById('addDate').value;
      const amountInput = parseFloat(document.getElementById('addAmount').value);
      const category = document.getElementById('addCategory').value || 'Outros';
      const description = document.getElementById('addDescription').value || '';
      const msg = document.getElementById('addMsg');

      if (!dateInput || Number.isNaN(amountInput)) {
        if (msg) msg.textContent = 'Preencha data e valor.';
        return;
      }
      // formatar data 'YYYY-MM-DD HH:MM'
      const date = dateInput.replace('T',' ');
      const tx = { date, category, description, amount: amountInput };
      FH.addTransaction(tx);
      // recarregar UI
      populateCategoryOptions();
      applyFilters(); // re-aplica filtros e renderiza
      addForm.reset();
      if (msg) { msg.textContent = 'Adicionado'; setTimeout(()=> msg.textContent = '',2000); }
    });
  }
});