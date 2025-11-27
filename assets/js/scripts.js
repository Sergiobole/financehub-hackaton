document.addEventListener('DOMContentLoaded', () => {
  // usuário (mock)
  const user = { id:1, name:'Maria Silva', email:'maria@email.com' };
  const userArea = document.getElementById('userArea');
  if (userArea) userArea.textContent = user.name;

  // atualizar cards com base em FH.computeTotals()
  const totals = FH.computeTotals();
  const balanceEl = document.querySelector('.card.balance .card-value');
  const balanceNote = document.querySelector('.card.balance .card-note');
  const receiptsEl = document.querySelectorAll('.card.small .card-value')[0];
  const receiptsNote = document.querySelectorAll('.card.small .card-note')[0];
  const expensesEl = document.querySelectorAll('.card.small .card-value')[1];
  const expensesNote = document.querySelectorAll('.card.small .card-note')[1];

  if (balanceEl) balanceEl.textContent = `R$ ${totals.balance.toFixed(2).replace('.',',')}`;
  if (balanceNote) balanceNote.textContent = '+2.5% este mês'; // mantém nota estática ou calcule depois
  if (receiptsEl) receiptsEl.textContent = `R$ ${totals.inflow.toFixed(2).replace('.',',')}`;
  if (expensesEl) expensesEl.textContent = `R$ ${Math.abs(totals.outflow).toFixed(2).replace('.',',')}`;

  // preencher lista de transações recentes a partir de FH.getRecent()
  const transactions = FH.getRecent(3);
  const txList = document.getElementById('txList');
  if (txList) {
    txList.innerHTML = transactions.map(tx => `
      <li class="tx-item">
        <div class="tx-left">
          <div class="tx-icon" style="background:#fff">
            <span style="display:inline-block;width:18px;height:18px;border-radius:4px;background:#eef"></span>
          </div>
          <div class="tx-content">
            <strong>${tx.category}</strong>
            <small>${tx.description} • ${tx.date.split(' ')[1]}</small>
          </div>
        </div>
        <div class="tx-right">
          <div class="tx-amount">${tx.amount < 0 ? '-R$ '+Math.abs(tx.amount).toFixed(2) : 'R$ '+tx.amount.toFixed(2)}</div>
        </div>
      </li>
    `).join('');
  }

  // gráfico: usa FH.computeCategoryPercentages()
  const categories = FH.computeCategoryPercentages();
  const ctx = document.getElementById('pieChart').getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categories.map(c => c.name),
      datasets: [{
        data: categories.map(c => c.percent),
        backgroundColor: categories.map(c => c.color),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'right', labels:{boxWidth:12} },
        tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.raw}%` } }
      }
    }
  });

  // cashback: usar FH.computeCashback()
  const cb = FH.computeCashback();
  const cbAmountEl = document.querySelector('.cb-amount');
  const cbThis = document.querySelector('.cb-break div:first-child .muted');
  const cbPartners = document.querySelector('.cb-break div:last-child .muted');
  if (cbAmountEl) cbAmountEl.textContent = `R$ ${cb.total.toFixed(2).replace('.',',')}`;
  if (cbThis) cbThis.textContent = `R$ ${cb.thisMonth.toFixed(2).replace('.',',')}`;
  if (cbPartners) cbPartners.textContent = `R$ ${cb.partners.toFixed(2).replace('.',',')}`;
});