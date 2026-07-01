/**
 * Sistema de Emissão de Orçamentos - TechPrime Soluções
 * Vanilla JavaScript Inteligente, Modularizado e Configurável
 */

document.addEventListener('DOMContentLoaded', () => {
    // Referências aos Elementos Fixos do DOM
    const elBudgetNumber = document.getElementById('budget-number');
    const elBudgetDate = document.getElementById('budget-date');
    const elSrvValue = document.getElementById('srv-value');
    const elDiscountType = document.getElementById('discount-type');
    const elDiscountValue = document.getElementById('discount-value');
    const elDiscountWrapper = document.getElementById('discount-value-wrapper');
    const elChkShowMaterials = document.getElementById('chk-show-materials');
    
    const tbodyMaterials = document.getElementById('tbody-materials');
    const tbodyLabor = document.getElementById('tbody-labor');

    // Referências aos Elementos do Modal de Configuração
    const modalConfig = document.getElementById('modal-config');
    const btnOpenConfig = document.getElementById('btn-config');
    const btnCloseConfig = document.getElementById('btn-close-modal');
    const btnSaveConfig = document.getElementById('btn-save-config');
    const inpUploadLogo = document.getElementById('inp-upload-logo');

    // Inicialização da Aplicação
    initBudgetMeta();
    generateQRCode();
    attachGlobalListeners();
    
    // Adiciona linhas iniciais vazias para experiência de uso rápida
    addMaterialRow();
    addLaborRow();

    /**
     * Inicializa Metadados Básicos (Número sequencial simulado e Data)
     */
    function initBudgetMeta() {
        const now = new Date();
        elBudgetDate.textContent = now.toLocaleDateString('pt-BR');
        elBudgetNumber.textContent = Math.floor(100000 + Math.random() * 900000);
    }

    /**
     * Gera o QR Code corporativo baseado no endereço fornecido
     */
    function generateQRCode() {
        const siteUrl = document.getElementById('lbl-comp-site').getAttribute('href') || "https://www.techprime.com.br";
        const container = document.getElementById('qrcode');
        container.innerHTML = '';
        new QRCode(container, {
            text: siteUrl,
            width: 60,
            height: 60,
            colorDark: "#000000",
            colorLight: "#ffffff"
        });
    }

    /**
     * Vincula escutas de eventos aos botões e triggers estruturais do sistema
     */
    function attachGlobalListeners() {
        document.getElementById('btn-add-material').addEventListener('click', () => addMaterialRow());
        document.getElementById('btn-add-labor').addEventListener('click', () => addLaborRow());
        
        // Triggers de recálculo instantâneo em inputs nativos
        document.querySelectorAll('.calc-trigger').forEach(input => {
            input.addEventListener('input', calculateTotals);
        });

        // Configuração de Toggle do Bloco de Descontos
        elDiscountType.addEventListener('change', (e) => {
            if (e.target.value === 'none') {
                elDiscountWrapper.style.display = 'none';
                elDiscountValue.value = 0;
            } else {
                elDiscountWrapper.style.display = 'block';
            }
            calculateTotals();
        });

        elDiscountValue.addEventListener('input', calculateTotals);

        // Monitor do checkbox de visualização de impressão
        elChkShowMaterials.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.remove('hide-materials');
            } else {
                document.body.classList.add('hide-materials');
            }
        });

        // Operações de Controle do Modal
        btnOpenConfig.addEventListener('click', () => modalConfig.classList.add('active'));
        btnCloseConfig.addEventListener('click', () => modalConfig.classList.remove('active'));
        btnSaveConfig.addEventListener('click', saveCorporateData);

        // Operações Estruturais do Orçamento
        document.getElementById('btn-clear').addEventListener('click', clearForm);
        document.getElementById('btn-new').addEventListener('click', () => {
            if(confirm("Deseja criar um novo orçamento? Limpará todos os dados do cliente e tabelas.")) {
                clearForm();
                initBudgetMeta();
            }
        });

        document.getElementById('btn-print').addEventListener('click', () => {
            const form = document.getElementById('form-budget');
            if(form.checkValidity()) {
                window.print();
            } else {
                form.reportValidity();
            }
        });
    }

    /**
     * Coleta as variáveis do modal e injeta em tempo de execução no Cabeçalho
     */
    function saveCorporateData() {
        // Atualiza textos do cabeçalho
        document.getElementById('lbl-comp-name').textContent = document.getElementById('inp-comp-name').value;
        document.getElementById('lbl-comp-cnpj').textContent = `CNPJ: ${document.getElementById('inp-comp-cnpj').value}`;
        document.getElementById('lbl-comp-phone').textContent = `Tel: ${document.getElementById('inp-comp-phone').value}`;
        document.getElementById('lbl-comp-email').textContent = `Email: ${document.getElementById('inp-comp-email').value}`;
        
        const siteValue = document.getElementById('inp-comp-site').value;
        const elSiteLabel = document.getElementById('lbl-comp-site');
        elSiteLabel.textContent = siteValue.replace(/^https?:\/\//, '');
        elSiteLabel.setAttribute('href', siteValue);

        // Processa as Redes Sociais Dinâmicas
        const instaUrl = document.getElementById('inp-comp-insta').value.trim();
        const faceUrl = document.getElementById('inp-comp-face').value.trim();
        const socialsContainer = document.getElementById('header-socials');
        socialsContainer.innerHTML = '';

        if(instaUrl) {
            socialsContainer.innerHTML += `<a href="${instaUrl}" target="_blank" title="Instagram"><i class="fa-brands fa-instagram"></i></a>`;
        }
        if(faceUrl) {
            socialsContainer.innerHTML += `<a href="${faceUrl}" target="_blank" title="Facebook"><i class="fa-brands fa-facebook"></i></a>`;
        }

        // Processa troca local da imagem da Logo caso um arquivo novo tenha sido inserido
        if (inpUploadLogo.files && inpUploadLogo.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('img-company-logo').setAttribute('src', e.target.result);
            }
            reader.readAsDataURL(inpUploadLogo.files[0]);
        }

        // Atualiza o QR code e fecha a janela
        generateQRCode();
        modalConfig.classList.remove('active');
    }

    /**
     * Adiciona uma nova linha dinâmica na Tabela de Materiais
     */
    function addMaterialRow() {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" class="mat-desc" required placeholder="Item do material"></td>
            <td><input type="number" class="mat-qty" min="1" value="1" required></td>
            <td><input type="number" class="mat-unit-price" min="0" step="0.01" value="0.00" required></td>
            <td class="mat-total-line">R$ 0,00</td>
            <td class="no-print"><button type="button" class="btn btn-danger btn-sm btn-del"><i class="fa-solid fa-trash"></i></button></td>
        `;

        tr.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                const qty = parseFloat(tr.querySelector('.mat-qty').value) || 0;
                const unitPrice = parseFloat(tr.querySelector('.mat-unit-price').value) || 0;
                if(qty < 0) tr.querySelector('.mat-qty').value = 1;
                if(unitPrice < 0) tr.querySelector('.mat-unit-price').value = 0;

                tr.querySelector('.mat-total-line').textContent = formatCurrency(qty * unitPrice);
                calculateTotals();
            });
        });

        tr.querySelector('.btn-del').addEventListener('click', () => {
            tr.remove();
            calculateTotals();
        });

        tbodyMaterials.appendChild(tr);
    }

    /**
     * Adiciona uma nova linha dinâmica na Tabela de Mão de Obra
     */
    function addLaborRow() {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" class="lab-desc" required placeholder="Etapa / Profissional"></td>
            <td><input type="number" class="lab-qty" min="1" value="1" required></td>
            <td><input type="number" class="lab-unit-price" min="0" step="0.01" value="0.00" required></td>
            <td class="lab-total-line">R$ 0,00</td>
            <td class="no-print"><button type="button" class="btn btn-danger btn-sm btn-del"><i class="fa-solid fa-trash"></i></button></td>
        `;

        tr.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                const qty = parseFloat(tr.querySelector('.lab-qty').value) || 0;
                const unitPrice = parseFloat(tr.querySelector('.lab-unit-price').value) || 0;
                if(qty < 0) tr.querySelector('.lab-qty').value = 1;
                if(unitPrice < 0) tr.querySelector('.lab-unit-price').value = 0;

                tr.querySelector('.lab-total-line').textContent = formatCurrency(qty * unitPrice);
                calculateTotals();
            });
        });

        tr.querySelector('.btn-del').addEventListener('click', () => {
            tr.remove();
            calculateTotals();
        });

        tbodyLabor.appendChild(tr);
    }

    /**
     * Processa a Varredura e Cálculo de Todas as Variáveis Financeiras em Tempo Real
     */
    function calculateTotals() {
        const baseServiceValue = parseFloat(elSrvValue.value) || 0;
        document.getElementById('sum-service').textContent = formatCurrency(baseServiceValue);

        let totalMaterials = 0;
        tbodyMaterials.querySelectorAll('tr').forEach(row => {
            const qty = parseFloat(row.querySelector('.mat-qty').value) || 0;
            const unitPrice = parseFloat(row.querySelector('.mat-unit-price').value) || 0;
            totalMaterials += (qty * unitPrice);
        });
        document.getElementById('total-materials-label').textContent = formatCurrency(totalMaterials);
        document.getElementById('sum-materials').textContent = formatCurrency(totalMaterials);

        let totalLabor = 0;
        tbodyLabor.querySelectorAll('tr').forEach(row => {
            const qty = parseFloat(row.querySelector('.lab-qty').value) || 0;
            const unitPrice = parseFloat(row.querySelector('.lab-unit-price').value) || 0;
            totalLabor += (qty * unitPrice);
        });
        document.getElementById('total-labor-label').textContent = formatCurrency(totalLabor);
        document.getElementById('sum-labor').textContent = formatCurrency(totalLabor);

        const subtotal = baseServiceValue + totalMaterials + totalLabor;
        document.getElementById('sum-subtotal').textContent = formatCurrency(subtotal);

        let discountCalculated = 0;
        const discType = elDiscountType.value;
        const discInputValue = parseFloat(elDiscountValue.value) || 0;

        if (discType === 'percent') {
            discountCalculated = subtotal * (discInputValue / 100);
        } else if (discType === 'value') {
            discountCalculated = discInputValue;
        }

        if(discountCalculated > subtotal) discountCalculated = subtotal;

        document.getElementById('sum-discount').textContent = `- ${formatCurrency(discountCalculated)}`;
        const totalGeneral = subtotal - discountCalculated;
        document.getElementById('sum-total').textContent = formatCurrency(totalGeneral);
    }

    function formatCurrency(value) {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function clearForm() {
        document.getElementById('form-budget').reset();
        tbodyMaterials.innerHTML = '';
        tbodyLabor.innerHTML = '';
        elDiscountWrapper.style.display = 'none';
        
        addMaterialRow();
        addLaborRow();
        calculateTotals();
    }
});