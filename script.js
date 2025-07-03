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

    // Tabela de h2 para R134a (exemplo, você pode expandir para outros fluidos)
    // A ideia é que esta tabela contenha h2 para diferentes temperaturas de evaporação e condensação
    const h2_data = [
        {"TempEvap": -20, "TempCond": 40, "h2": 430, "fluid": "R134a"},
        {"TempEvap": -20, "TempCond": 50, "h2": 434.6, "fluid": "R134a"},
        {"TempEvap": -10, "TempCond": 40, "h2": 426.5, "fluid": "R134a"},
        {"TempEvap": -10, "TempCond": 50, "h2": 432, "fluid": "R134a"},
        {"TempEvap": -5, "TempCond": 40, "h2": 425.4, "fluid": "R134a"},
        {"TempEvap": -5, "TempCond": 50, "h2": 431, "fluid": "R134a"},
        {"TempEvap": 0, "TempCond": 40, "h2": 424.5, "fluid": "R134a"},
        {"TempEvap": 0, "TempCond": 50, "h2": 430, "fluid": "R134a"},
        // Adicione mais dados para outros fluidos e temperaturas se necessário
        {"TempEvap": -20, "TempCond": 40, "h2": 285.0, "fluid": "R410A"},
        {"TempEvap": -20, "TempCond": 50, "h2": 288.5, "fluid": "R410A"},
        {"TempEvap": -10, "TempCond": 40, "h2": 280.0, "fluid": "R410A"},
        {"TempEvap": -10, "TempCond": 50, "h2": 284.0, "fluid": "R410A"},
    ];

    // --- SELEÇÃO DE ELEMENTOS DO DOM ---
    const fluidSelect = document.getElementById('fluid');
    const tempEvapSelect = document.getElementById('tempEvap');
    const tempCondSelect = document.getElementById('tempCond');
    const h2ManualInput = document.getElementById('h2ManualInput');
    const h2FromTableSelect = document.getElementById('h2FromTable');
    const h2FromTableToggle = document.getElementById('h2FromTableToggle');
    const h2TableSelectionDiv = document.getElementById('h2TableSelection');
    const h2ManualInputDiv = document.getElementById('h2ManualInputDiv');
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
        
        // Atualiza as opções de h2 da tabela após a mudança de fluido ou temperaturas
        populateH2Options();
    }

    // Popula as opções de h2 na tabela com base no fluido e temperaturas selecionadas
    function populateH2Options() {
        const fluid = fluidSelect.value;
        const tempEvap = parseFloat(tempEvapSelect.value);
        const tempCond = parseFloat(tempCondSelect.value);

        h2FromTableSelect.innerHTML = "<option value=''>-- selecione as temperaturas --</option>";

        if (!fluid || isNaN(tempEvap) || isNaN(tempCond)) {
            return;
        }

        const filteredH2 = h2_data.filter(data => 
            data.fluid === fluid && 
            data.TempEvap === tempEvap && 
            data.TempCond === tempCond
        );

        if (filteredH2.length > 0) {
            filteredH2.forEach(data => {
                h2FromTableSelect.add(new Option(`${data.h2.toFixed(2)} kJ/kg (T_evap: ${data.TempEvap}°C, T_cond: ${data.TempCond}°C)`, data.h2));
            });
            h2FromTableSelect.selectedIndex = 1; // Seleciona a primeira opção válida
        } else {
            h2FromTableSelect.add(new Option("Nenhum h₂ disponível para estas temperaturas", ""));
        }
    }

    // Alterna a visibilidade do campo de entrada manual e do seletor de tabela para h2
    function toggleH2InputMode() {
        if (h2FromTableToggle.checked) {
            h2TableSelectionDiv.style.display = 'block';
            h2ManualInputDiv.style.display = 'none';
            h2ManualInput.value = ''; // Limpa o valor manual
        } else {
            h2TableSelectionDiv.style.display = 'none';
            h2ManualInputDiv.style.display = 'block';
            h2FromTableSelect.value = ''; // Limpa a seleção da tabela
        }
    }

    // Realiza os cálculos e mostra a tela de resultados
    function calcularEExibir() {
        const fluid = fluidSelect.value;
        const TevapKey = tempEvapSelect.value;
        const TcondKey = tempCondSelect.value;
        let h2;

        if (h2FromTableToggle.checked) {
            h2 = parseFloat(h2FromTableSelect.value);
        } else {
            h2 = parseFloat(h2ManualInput.value);
        }

        if (!fluid || !TevapKey || !TcondKey || isNaN(h2) || h2 === 0) { // Adicionei h2 === 0 para pegar casos onde o select não tem valor
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
    tempEvapSelect.addEventListener('change', populateH2Options);
    tempCondSelect.addEventListener('change', populateH2Options);
    h2FromTableToggle.addEventListener('change', toggleH2InputMode);
    btnCalcular.addEventListener('click', calcularEExibir);
    btnVoltar.addEventListener('click', mostrarTela1);

    // --- INICIALIZAÇÃO ---
    // Preenche as opções de fluidos
    Object.keys(tables).forEach(fluidName => {
        fluidSelect.add(new Option(fluidName, fluidName));
    });

    // Popula as temperaturas para o primeiro fluido da lista ao carregar
    populateTemperatureOptions();
    // Inicializa o modo de entrada de h2
    toggleH2InputMode();
});
