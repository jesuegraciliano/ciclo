// Aguarda o conteúdo da página ser totalmente carregado antes de executar o script
document.addEventListener('DOMContentLoaded', () => {

    // --- BANCO DE DADOS ---
    // Tabelas de propriedades dos fluidos
    const tables = {
        R134a: {
            "-30": { P: 85.1, HL: 161.12, HV: 379.80 },
            "-26.3": { P: 101.3, HL: 165.80, HV: 382.16 },
            "-25": { P: 107.2, HL: 167.38, HV: 382.95 },
            "-20": { P: 133.7, HL: 173.74, HV: 386.08 },
            "-10": { P: 201.7, HL: 186.72, HV: 392.28 },
            "0":   { P: 294.0, HL: 200.00, HV: 398.36 },
            "10":  { P: 415.8, HL: 213.58, HV: 404.23 },
            "20":  { P: 572.8, HL: 227.49, HV: 409.84 },
            "30":  { P: 771.0, HL: 241.79, HV: 415.08 },
            "40":  { P: 1017.0, HL: 256.54, HV: 419.82 },
            "50":  { P: 1318.1, HL: 271.83, HV: 423.91 }
        },
        R410A: {
            "-40": { P: 175.0, HL: -0.00, HV: 262.83 },
            "-30": { P: 269.6, HL: 13.99, HV: 267.54 },
            "-20": { P: 399.6, HL: 28.24, HV: 271.89 },
            "-10": { P: 573.1, HL: 42.80, HV: 275.78 },
            "0":   { P: 798.7, HL: 57.76, HV: 279.12 },
            "10":  { P: 1085.7, HL: 73.21, HV: 281.78 },
            "20":  { P: 1444.2, HL: 89.27, HV: 283.55 },
            "30":  { P: 1885.1, HL: 106.14, HV: 284.16 },
            "40":  { P: 2420.7, HL: 124.09, HV: 283.13 },
            "50":  { P: 3065.2, HL: 143.65, HV: 279.58 }
        },
        R404A: {
            "-40": { P: 170.6, HL: 87.9,  HV: 345.3 },
            "-30": { P: 257.3, HL: 105.3, HV: 353.0 },
            "-20": { P: 376.9, HL: 122.8, HV: 360.0 },
            "-10": { P: 536.6, HL: 140.4, HV: 366.6 },
            "0":   { P: 746.2, HL: 158.2, HV: 372.8 },
            "10":  { P: 1016.8, HL: 176.2, HV: 378.5 },
            "20":  { P: 1361.4, HL: 194.5, HV: 383.8 },
            "30":  { P: 1786.2, HL: 213.0, HV: 388.7 },
            "40":  { P: 2300.0, HL: 231.8, HV: 393.2 }
        }
    };

    // --- SELEÇÃO DE ELEMENTOS DO DOM ---
    const fluidSelect = document.getElementById('fluid');
    const tempEvapSelect = document.getElementById('tempEvap');
    const tempCondSelect = document.getElementById('tempCond');
    const h2Input = document.getElementById('h2');
    const btnCalcular = document.getElementById('btnIrParaCalculo');
    const btnVoltar = document.getElementById('btnVoltar');
    const resultadoDiv = document.getElementById('resultado');
    const tela1 = document.getElementById('tela1');
    const tela2 = document.getElementById('tela2');

    // --- FUNÇÕES ---

    // Popula os seletores de temperatura com base no fluido escolhido
    function populateTemperatureOptions() {
        const fluid = fluidSelect.value;
        if (!fluid || !tables[fluid]) return;

        const temps = Object.keys(tables[fluid]).map(parseFloat).sort((a, b) => a - b);
        
        tempEvapSelect.innerHTML = "";
        tempCondSelect.innerHTML = "";

        temps.forEach(T => {
            const tempStr = String(T); // As chaves na tabela são strings
            const label = tempStr.replace('.', ',');

            // Cria opção para evaporação e condensação
            tempEvapSelect.add(new Option(label, tempStr));
            tempCondSelect.add(new Option(label, tempStr));
        });

        // Define valores padrão inteligentes
        tempEvapSelect.selectedIndex = Math.floor(temps.length / 4); // Uma temp. baixa
        tempCondSelect.selectedIndex = temps.length - 1; // A temp. mais alta
    }

    // Realiza os cálculos e mostra a tela de resultados
    function calcularEExibir() {
        const fluid = fluidSelect.value;
        const TevapKey = tempEvapSelect.value;
        const TcondKey = tempCondSelect.value;
        const h2 = parseFloat(h2Input.value);

        if (!fluid || !TevapKey || !TcondKey || isNaN(h2)) {
            alert("Por favor, preencha todos os campos corretamente.");
            return;
        }

        const evapData = tables[fluid][TevapKey];
        const condData = tables[fluid][TcondKey];
        
        const h1 = evapData.HV; // Entalpia vapor saturado na evaporação (kJ/kg)
        const h4 = condData.HL; // Entalpia líquido saturado na condensação (kJ/kg) (h3=h4)

        if (h2 <= h1) {
            alert(`Valor de h₂ inválido (${h2.toFixed(2)}). Ele deve ser maior que h₁ (${h1.toFixed(2)}).`);
            return;
        }

        const qL = h1 - h4;      // Efeito frigorífico (kJ/kg)
        const W = h2 - h1;       // Trabalho de compressão (kJ/kg)
        const COP = qL / W;

        // Montar o HTML do resultado
        resultadoDiv.innerHTML = `
            <p><strong>Fluido:</strong> ${fluid}</p>
            <hr>
            <p><strong>Coeficiente de Performance (COP):</strong> ${COP.toFixed(2)}</p>
            <p><strong>Efeito Frigorífico (qL):</strong> ${qL.toFixed(2)} kJ/kg</p>
            <p><strong>Trabalho de Compressão (W):</strong> ${W.toFixed(2)} kJ/kg</p>
            <hr>
            <p><strong>Pontos de Entalpia (h):</strong></p>
            <ul>
                <li>h₁ (saída do evaporador): <strong>${h1.toFixed(2)} kJ/kg</strong></li>
                <li>h₂ (saída do compressor): <strong>${h2.toFixed(2)} kJ/kg</strong></li>
                <li>h₃ = h₄ (saída do condensador): <strong>${h4.toFixed(2)} kJ/kg</strong></li>
            </ul>
        `;

        // Trocar de tela
        tela1.classList.remove('active');
        tela2.classList.add('active');
    }

    // Mostra a tela de entrada de dados
    function mostrarTela1() {
        tela2.classList.remove('active');
        tela1.classList.add('active');
    }
    
    // --- EVENT LISTENERS ---
    fluidSelect.addEventListener('change', populateTemperatureOptions);
    btnCalcular.addEventListener('click', calcularEExibir);
    btnVoltar.addEventListener('click', mostrarTela1);

    // --- INICIALIZAÇÃO ---
    // Preenche as opções de fluidos
    Object.keys(tables).forEach(fluidName => {
        fluidSelect.add(new Option(fluidName, fluidName));
    });

    // Popula as temperaturas para o primeiro fluido da lista ao carregar
    populateTemperatureOptions();
});
