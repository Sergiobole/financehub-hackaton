document.addEventListener('DOMContentLoaded', () => {
    const pixForm = document.getElementById('pix-form');
    const btnPagar = document.getElementById('btnPagar');
    const btnReceber = document.getElementById('btnReceber');
    const btnCopiaECola = document.getElementById('btnCopiaECola');
    const btnMinhasChaves = document.getElementById('btnMinhasChaves');
    const pixPagarSection = document.getElementById('pixPagarSection');
    const pixReceberSection = document.getElementById('pixReceberSection');
    const pixCopiaEColaSection = document.getElementById('pixCopiaEColaSection');
    const pixMinhasChavesSection = document.getElementById('pixMinhasChavesSection');
    const pixKeysList = document.getElementById('pix-keys-list');
    const generateQrBtn = document.getElementById('generate-qr-btn');
    const qrCodeContainer = document.getElementById('qr-code-container');
    const qrCodeImg = document.getElementById('qr-code-img');
    const pixCopyPasteInput = document.getElementById('pix-copy-paste');
    const copyBtn = document.getElementById('copy-btn');

    // Tab switching logic
    btnPagar.addEventListener('click', () => {
        pixPagarSection.style.display = 'block';
        pixReceberSection.style.display = 'none';
        pixCopiaEColaSection.style.display = 'none';
        pixMinhasChavesSection.style.display = 'none';
        btnPagar.classList.add('active');
        btnReceber.classList.remove('active');
        btnCopiaECola.classList.remove('active');
        btnMinhasChaves.classList.remove('active');
    });

    btnReceber.addEventListener('click', () => {
        pixPagarSection.style.display = 'none';
        pixReceberSection.style.display = 'block';
        pixCopiaEColaSection.style.display = 'none';
        pixMinhasChavesSection.style.display = 'none';
        btnPagar.classList.remove('active');
        btnReceber.classList.add('active');
        btnCopiaECola.classList.remove('active');
        btnMinhasChaves.classList.remove('active');
    });

    btnCopiaECola.addEventListener('click', () => {
        pixPagarSection.style.display = 'none';
        pixReceberSection.style.display = 'none';
        pixCopiaEColaSection.style.display = 'block';
        pixMinhasChavesSection.style.display = 'none';
        btnPagar.classList.remove('active');
        btnReceber.classList.remove('active');
        btnCopiaECola.classList.add('active');
        btnMinhasChaves.classList.remove('active');
    });

    btnMinhasChaves.addEventListener('click', () => {
        pixPagarSection.style.display = 'none';
        pixReceberSection.style.display = 'none';
        pixCopiaEColaSection.style.display = 'none';
        pixMinhasChavesSection.style.display = 'block';
        btnPagar.classList.remove('active');
        btnReceber.classList.remove('active');
        btnCopiaECola.classList.remove('active');
        btnMinhasChaves.classList.add('active');
        loadPixKeys();
    });

    function loadPixKeys() {
        // Dummy data for pix keys
        const pixKeys = [
            { type: 'CPF', key: '123.456.789-00' },
            { type: 'E-mail', key: 'seuemail@exemplo.com' },
            { type: 'Celular', key: '(11) 98765-4321' }
        ];

        pixKeysList.innerHTML = ''; // Clear the list first

        if (pixKeys.length === 0) {
            pixKeysList.innerHTML = '<p>Você ainda não cadastrou nenhuma chave Pix.</p>';
            return;
        }

        pixKeys.forEach(key => {
            const keyElement = document.createElement('div');
            keyElement.classList.add('pix-key-item');
            keyElement.innerHTML = `
                <p><strong>Tipo:</strong> ${key.type}</p>
                <p><strong>Chave:</strong> ${key.key}</p>
            `;
            pixKeysList.appendChild(keyElement);
        });
    }

    if (generateQrBtn) {
        generateQrBtn.addEventListener('click', () => {
            const receiveAmount = parseFloat(document.getElementById('receive-amount').value);

            if (isNaN(receiveAmount) || receiveAmount <= 0) {
                alert('Por favor, insira um valor válido para gerar o QR Code.');
                return;
            }

            // Simulate generating a Pix Copy and Paste code
            const pixCopiaECola = `00020126360014br.gov.bcb.pix0114+55119999999995204000053039865405${receiveAmount.toFixed(2)}5802BR5913NOME DO RECEBEDOR6008BRASILIA62070503***6304E2A2`;
            pixCopyPasteInput.value = pixCopiaECola;

            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCopiaECola)}`;
            qrCodeImg.src = qrCodeUrl;
            qrCodeContainer.style.display = 'block';
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            pixCopyPasteInput.select();
            document.execCommand('copy');
            alert('Código Copia e Cola copiado para a área de transferência!');
        });
    }


    if (pixForm) {
        pixForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const pixKey = document.getElementById('pix-key').value;
            const pixAmount = parseFloat(document.getElementById('pix-amount').value);
            const pixKeyType = document.getElementById('pix-key-type').value;
            const description = document.getElementById('pix-description').value;

            if (!pixKey || isNaN(pixAmount) || pixAmount <= 0) {
                alert('Por favor, preencha a chave pix e um valor válido.');
                return;
            }

            const currentBalance = FH.computeTotals().balance;

            if (pixAmount > currentBalance) {
                alert('Saldo insuficiente para realizar a transferência.');
                return;
            }

            // Simulate password confirmation
            const password = prompt('Digite sua senha para confirmar a transferência:');

            if (password) { // simplified check
                const newTransaction = {
                    date: new Date().toISOString().slice(0, 16).replace('T', ' '),
                    category: 'Pix',
                    description: `Pix para ${pixKey} ${description? '- ' + description : ''}`,
                    amount: -pixAmount
                };

                FH.addTransaction(newTransaction);

                alert('Transferência Pix realizada com sucesso!');
                window.location.href = 'extrato.html';
            } else {
                alert('Senha não informada. Transferência cancelada.');
            }
        });
    }
});
