document.addEventListener('DOMContentLoaded', () => {
  const cbTotalEl = document.getElementById('cbTotal');
  const cbHistoryEl = document.getElementById('cbHistory');
  const redeemButton = document.querySelector('.loan-result-card .btn.primary');
  const cashbackRate = 0.015; // Taxa de cashback

  // Função para formatar valores monetários
  const formatCurrency = (value) => `R$ ${value.toFixed(2).replace('.', ',')}`;

  // Função principal para renderizar a página
  function renderCashbackPage() {
    const cashbackData = FH.computeCashback(cashbackRate);

    // 1. Atualiza o saldo total de cashback
    if (cbTotalEl) {
      cbTotalEl.textContent = formatCurrency(cashbackData.total);
    }

    // 2. Gera e mostra o histórico de *ganhos* (só na primeira vez)
    if (cbHistoryEl && !cbHistoryEl.hasAttribute('data-rendered')) {
      const transactions = FH.getTransactions();
      const expenses = transactions.filter(t => t.amount < 0);

      if (expenses.length > 0) {
        const historyHtml = expenses.map(tx => {
          const cashbackEarned = Math.abs(tx.amount) * cashbackRate;
          return `
            <div class="tx-item" style="padding: 12px 8px;">
              <div class="tx-left">
                <div class="tx-icon" style="background: #e6f7f2; color: var(--green);">
                  <span data-feather="dollar-sign"></span>
                </div>
                <div class="tx-content">
                  <strong>Cashback recebido</strong>
                  <small>Na compra em ${tx.description}</small>
                </div>
              </div>
              <div class="tx-amount" style="color: var(--green); font-weight: 600;">+${formatCurrency(cashbackEarned).replace('R$ ','')}</div>
            </div>
          `;
        }).join('');

        cbHistoryEl.innerHTML = historyHtml;
        feather.replace();
        cbHistoryEl.setAttribute('data-rendered', 'true'); // Evita rerenderizar a lista
      } else {
        cbHistoryEl.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 24px;">Nenhum cashback ganho ainda.</p>';
      }
    }
  }

  // 3. Adiciona funcionalidade ao botão de resgate
  if (redeemButton) {
    redeemButton.addEventListener('click', () => {
      const cashbackData = FH.computeCashback(cashbackRate);
      
      if (cashbackData.total > 0) {
        // Cria a nova transação de crédito
        const redemptionTx = {
          date: new Date().toISOString(),
          category: 'Receitas',
          description: 'Resgate de Cashback',
          amount: cashbackData.total
        };

        // Adiciona a transação ao "banco de dados"
        FH.addTransaction(redemptionTx);

        // Alerta de sucesso e atualiza a UI
        alert(`Resgate de ${formatCurrency(cashbackData.total)} solicitado com sucesso!`);
        renderCashbackPage(); // Re-renderiza a página para atualizar o saldo
      } else {
        alert('Você não possui saldo de cashback para resgatar.');
      }
    });
  }

  // Renderização inicial da página
  renderCashbackPage();
});