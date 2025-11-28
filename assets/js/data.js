(function(window){
  const TRANSACTIONS = [
    { id:1, date:'2025-11-25 15:30', category:'Alimentação', description:'iFood', amount:-45.90 },
    { id:2, date:'2025-11-24 08:15', category:'Transporte', description:'Posto Shell', amount:-120.00 },
    { id:3, date:'2025-11-23 14:22', category:'Compras', description:'Amazon', amount:-89.99 },
    { id:4, date:'2025-11-20 10:05', category:'Receitas', description:'Salário - Empresa X', amount:2500.00 },
    { id:5, date:'2025-11-18 09:30', category:'Assinatura', description:'Streaming', amount:-29.90 },
    { id:6, date:'2025-11-15 12:00', category:'Receitas', description:'Pix - Cliente', amount:350.00 }
  ];

  // map de cores por categoria (adicione conforme precisar)
  const CATEGORY_COLORS = {
    'Alimentação':'#10b981',
    'Transporte':'#06b6d4',
    'Compras':'#ef4444',
    'Receitas':'#6b46ff',
    'Assinatura':'#7c3aed',
    'Outros':'#6b7280'
  };

  function getTransactions(){ return TRANSACTIONS.slice(); }
  function getRecent(n=3){
    return getTransactions().sort((a,b)=> new Date(b.date) - new Date(a.date)).slice(0,n);
  }
  function addTransaction(tx){
    tx.id = TRANSACTIONS.length ? TRANSACTIONS[TRANSACTIONS.length-1].id + 1 : 1;
    TRANSACTIONS.push(tx);
    return tx;
  }
  function computeTotals(){
    const inflow = TRANSACTIONS.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0);
    const outflow = TRANSACTIONS.filter(t=>t.amount<0).reduce((s,t)=>s+t.amount,0);
    const balance = inflow + outflow;
    return { inflow, outflow, balance };
  }
  function computeCategoryPercentages(){
    // considera apenas despesas (valores negativos) para o gráfico de gastos por categoria
    const sums = {};
    let totalAbs = 0;
    TRANSACTIONS.forEach(t=>{
      if (t.amount < 0) {
        sums[t.category] = (sums[t.category] || 0) + Math.abs(t.amount);
        totalAbs += Math.abs(t.amount);
      }
    });
    const result = Object.keys(sums).map(k=>{
      const amount = sums[k];
      const percent = totalAbs ? (amount/totalAbs*100) : 0;
      return { name:k, amount, percent:parseFloat(percent.toFixed(2)), color: CATEGORY_COLORS[k] || '#cccccc' };
    }).sort((a,b)=>b.amount-a.amount);
    return result;
  }
  function computeCashback(rate = 0.015) {
    // 1. Calcula o total de cashback ganho com base em todas as despesas
    const totalEarned = TRANSACTIONS
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + (Math.abs(t.amount) * rate), 0);

    // 2. Calcula o total de cashback já resgatado
    const totalRedeemed = TRANSACTIONS
      .filter(t => t.description === 'Resgate de Cashback')
      .reduce((sum, t) => sum + t.amount, 0);

    // 3. O total disponível é a diferença
    const total = parseFloat(Math.max(0, totalEarned - totalRedeemed).toFixed(2));

    // A divisão mock pode ser mantida se for usada em outro lugar
    const thisMonth = parseFloat((total * 0.36).toFixed(2));
    const partners = parseFloat((total - thisMonth).toFixed(2));

    return { total, thisMonth, partners };
  }

  window.FH = {
    getTransactions,
    getRecent,
    addTransaction,
    computeTotals,
    computeCategoryPercentages,
    computeCashback
  };
})(window);