// Simulador de Empréstimos - FinanceHub (Profissional)

let scenarios = [];

function formatCurrency(v){
  return `R$ ${v.toFixed(2).replace('.',',')}`;
}

function calculateLoan(){
  const amount = parseFloat(document.getElementById('loanAmount').value) || 0;
  const rateAnnual = parseFloat(document.getElementById('loanRate').value) || 0;
  const months = parseInt(document.getElementById('loanTerm').value) || 1;

  if (amount <= 0 || rateAnnual < 0 || months <= 0) return null;

  const rateMonthly = rateAnnual / 12 / 100;
  const numerator = rateMonthly * Math.pow(1 + rateMonthly, months);
  const denominator = Math.pow(1 + rateMonthly, months) - 1;
  const monthlyPayment = rateMonthly > 0 ? amount * (numerator / denominator) : amount / months;

  const totalPaid = monthlyPayment * months;
  const totalInterest = totalPaid - amount;

  return {
    amount,
    rateAnnual,
    rateMonthly,
    months,
    monthlyPayment,
    totalPaid,
    totalInterest
  };
}

function displayResults(loan){
  if (!loan) return;

  document.getElementById('resAmount').textContent = formatCurrency(loan.amount);
  document.getElementById('resMonthly').textContent = formatCurrency(loan.monthlyPayment);
  document.getElementById('resTotalInterest').textContent = formatCurrency(loan.totalInterest);
  document.getElementById('resTotalAmount').textContent = formatCurrency(loan.totalPaid);
  document.getElementById('resTerm').textContent = `${loan.months} meses (${(loan.months/12).toFixed(1)} anos)`;

  document.getElementById('resultSummary').style.display = 'block';
  document.getElementById('resultPlaceholder').style.display = 'none';
}

function generateAmortizationTable(loan){
  if (!loan) return;

  const tbody = document.getElementById('amortizationBody');
  tbody.innerHTML = '';

  let balance = loan.amount;
  const rows = [];

  for (let i = 1; i <= loan.months; i++) {
    const interestPayment = balance * loan.rateMonthly;
    const principalPayment = loan.monthlyPayment - interestPayment;
    balance -= principalPayment;
    balance = Math.max(0, balance);

    const rowClass = i % 2 === 0 ? 'alt' : '';
    rows.push(`
      <tr class="${rowClass}">
        <td style="text-align:center;color:var(--muted);font-weight:600">${i}</td>
        <td style="text-align:right;color:var(--red)">${formatCurrency(interestPayment)}</td>
        <td style="text-align:right;color:var(--green)">${formatCurrency(principalPayment)}</td>
        <td style="text-align:right;font-weight:700">${formatCurrency(balance)}</td>
      </tr>
    `);
  }

  tbody.innerHTML = rows.join('');
  document.getElementById('amortizationTable').style.display = 'table';
  document.getElementById('amortizationPlaceholder').style.display = 'none';
}

function addScenario(loan){
  scenarios.push(loan);
  updateComparator();
}

function updateComparator(){
  const comparatorContent = document.getElementById('comparatorContent');
  
  if (scenarios.length === 0) {
    comparatorContent.innerHTML = '<div style="text-align:center;color:var(--muted);padding:32px">Simule diferentes taxas e prazos para encontrar a melhor opção</div>';
    return;
  }

  let html = '<div class="comparator-grid">';
  scenarios.forEach((s, idx) => {
    html += `
      <div class="comparator-card">
        <div class="comp-header">
          <strong>Cenário ${idx + 1}</strong>
          <button type="button" class="btn-close" onclick="removeScenario(${idx})">×</button>
        </div>
        <div class="comp-item">
          <span>Taxa:</span><strong>${s.rateAnnual}% a.a.</strong>
        </div>
        <div class="comp-item">
          <span>Prazo:</span><strong>${s.months} meses</strong>
        </div>
        <div class="comp-item highlight">
          <span>Parcela:</span><strong>${formatCurrency(s.monthlyPayment)}</strong>
        </div>
        <div class="comp-item">
          <span>Total de Juros:</span><strong style="color:var(--red)">${formatCurrency(s.totalInterest)}</strong>
        </div>
        <div class="comp-item">
          <span>Total a Pagar:</span><strong>${formatCurrency(s.totalPaid)}</strong>
        </div>
      </div>
    `;
  });
  html += '</div>';
  comparatorContent.innerHTML = html;
}

function removeScenario(idx){
  scenarios.splice(idx, 1);
  updateComparator();
}

document.addEventListener('DOMContentLoaded', () => {
  const amountInput = document.getElementById('loanAmount');
  const amountSlider = document.getElementById('loanAmountSlider');
  const rateInput = document.getElementById('loanRate');
  const rateSlider = document.getElementById('loanRateSlider');
  const termInput = document.getElementById('loanTerm');
  const termSlider = document.getElementById('loanTermSlider');

  // sincronizar inputs com sliders
  amountInput.addEventListener('input', () => { amountSlider.value = amountInput.value; });
  rateInput.addEventListener('input', () => { rateSlider.value = rateInput.value; });
  termInput.addEventListener('input', () => { termSlider.value = termInput.value; });

  amountSlider.addEventListener('input', () => { amountInput.value = amountSlider.value; });
  rateSlider.addEventListener('input', () => { rateInput.value = rateSlider.value; });
  termSlider.addEventListener('input', () => { termInput.value = termSlider.value; });

  // submit
  document.getElementById('loanForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const loan = calculateLoan();
    if (loan) {
      displayResults(loan);
      generateAmortizationTable(loan);
      addScenario(loan);
      sessionStorage.setItem('currentLoan', JSON.stringify(loan));
    }
  });

  // solicitar
  document.getElementById('saveLoanBtn').addEventListener('click', () => {
    const loanData = sessionStorage.getItem('currentLoan');
    if (loanData) {
      const loan = JSON.parse(loanData);
      alert(`✓ Empréstimo solicitado com sucesso!\n\nValor: R$ ${loan.amount.toFixed(2).replace('.',',')}\nParcela: ${formatCurrency(loan.monthlyPayment)}\nPrazo: ${loan.months} meses\n\nEm breve você receberá contato.`);
    }
  });

  feather.replace();
});
