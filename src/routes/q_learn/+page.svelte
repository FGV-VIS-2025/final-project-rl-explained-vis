<script>
    import { onMount } from 'svelte';
    import { base } from '$app/paths';

    // Estados do exemplo (grid 3x3)
    let gameBoard = [
        [0, 0, 0],
        [0, 2, 0], // fantasma no meio
        [0, 0, 1]  // objetivo no canto inferior direito
    ];

    // Parâmetros fixos do Q-Learning
    const alpha = 0.3;  // taxa de aprendizado
    const gamma = 0.9;  // fator de desconto

    // Tabela Q - 9 estados (0,0 até 2,2) x 4 ações (up, down, left, right)
    let qTable = {};

    // Controle de iterações
    let currentIteration = 0;
    let maxIterations = 30;

    // Histórico completo de todas as 30 iterações
    let allIterations = [];

    // Estado atual baseado na iteração selecionada
    let currentState = { agentPosition: { x: 0, y: 0 }, lastAction: '', lastReward: 0 };

    // Sequência determinística de 30 iterações (10 episódios de 3 passos cada)
    const predefinedSequence = [
        // Episódio 1: Explorando para a direita e encontrando fantasma
        { from: { x: 0, y: 0 }, action: 'right', description: 'Explorando para direita' },
        { from: { x: 1, y: 0 }, action: 'down', description: 'Descendo para explorar' },
        { from: { x: 1, y: 1 }, action: 'left', description: 'BATE NO FANTASMA!' },

        // Episódio 2: Tentando ir direto para baixo
        { from: { x: 0, y: 0 }, action: 'down', description: 'Tentando caminho diferente' },
        { from: { x: 0, y: 1 }, action: 'right', description: 'Indo para direita' },
        { from: { x: 1, y: 1 }, action: 'down', description: 'BATE NO FANTASMA!' },

        // Episódio 3: Descobrindo o caminho correto
        { from: { x: 0, y: 0 }, action: 'down', description: 'Tentando novamente' },
        { from: { x: 0, y: 1 }, action: 'down', description: 'Continuando para baixo' },
        { from: { x: 0, y: 2 }, action: 'right', description: 'Indo para direita' },
        { from: { x: 1, y: 2 }, action: 'right', description: 'ENCONTRA A MOEDA!' },

        // Episódio 4: Aplicando conhecimento
        { from: { x: 0, y: 0 }, action: 'down', description: 'Usando experiência anterior' },
        { from: { x: 0, y: 1 }, action: 'down', description: 'Caminho conhecido' },
        { from: { x: 0, y: 2 }, action: 'right', description: 'Em direção ao objetivo' },
        { from: { x: 1, y: 2 }, action: 'right', description: 'MOEDA NOVAMENTE!' },

        // Episódio 5: Explorando outras opções
        { from: { x: 0, y: 0 }, action: 'right', description: 'Testando outras rotas' },
        { from: { x: 1, y: 0 }, action: 'right', description: 'Continuando exploração' },
        { from: { x: 2, y: 0 }, action: 'down', description: 'Descendo pela direita' },
        { from: { x: 2, y: 1 }, action: 'down', description: 'Chegando ao objetivo' },
        { from: { x: 2, y: 2 }, action: 'left', description: 'CHEGOU NA MOEDA!' },

        // Episódio 6: Caminho otimizado
        { from: { x: 0, y: 0 }, action: 'down', description: 'Caminho mais eficiente' },
        { from: { x: 0, y: 1 }, action: 'down', description: 'Direto para baixo' },
        { from: { x: 0, y: 2 }, action: 'right', description: 'Duas casas para direita' },
        { from: { x: 1, y: 2 }, action: 'right', description: 'SUCESSO!' },

        // Episódio 7: Mais uma exploração
        { from: { x: 0, y: 0 }, action: 'right', description: 'Testando rota superior' },
        { from: { x: 1, y: 0 }, action: 'right', description: 'Pela parte de cima' },
        { from: { x: 2, y: 0 }, action: 'down', description: 'Descendo pela lateral' },
        { from: { x: 2, y: 1 }, action: 'down', description: 'CHEGA NA MOEDA!' },

        // Episódio 8: Aplicando conhecimento consolidado
        { from: { x: 0, y: 0 }, action: 'down', description: 'Rota conhecida segura' },
        { from: { x: 0, y: 1 }, action: 'down', description: 'Evitando fantasma' },
        { from: { x: 0, y: 2 }, action: 'right', description: 'Em direção ao sucesso' },
        { from: { x: 1, y: 2 }, action: 'right', description: 'SUCESSO GARANTIDO!' }
    ];

    // Inicializar Q-table
    function initializeQTable() {
        qTable = {};
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                const state = `${x},${y}`;
                qTable[state] = {
                    up: 0.0,
                    down: 0.0,
                    left: 0.0,
                    right: 0.0
                };
            }
        }
    }

    // Função para obter recompensa de um estado
    function getReward(x, y) {
        if (x < 0 || x >= 3 || y < 0 || y >= 3) return -10; // fora do grid
        if (gameBoard[y][x] === 2) return -10; // fantasma
        if (gameBoard[y][x] === 1) return +10; // objetivo
        return -0.1; // movimento normal (pequena penalidade)
    }

    // Função para executar uma ação
    function executeAction(x, y, action) {
        let newX = x, newY = y;

        switch(action) {
            case 'up': newY = Math.max(0, y - 1); break;
            case 'down': newY = Math.min(2, y + 1); break;
            case 'left': newX = Math.max(0, x - 1); break;
            case 'right': newX = Math.min(2, x + 1); break;
        }

        return { x: newX, y: newY };
    }

    // Atualizar Q-value usando a equação de Bellman
    function updateQValue(state, action, reward, nextState) {
        const currentQ = qTable[state][action];
        const nextStateValues = Object.values(qTable[nextState]);
        const maxNextQ = Math.max(...nextStateValues);

        // Q(s,a) = Q(s,a) + α[r + γ * max(Q(s',a')) - Q(s,a)]
        const newQValue = currentQ + alpha * (reward + gamma * maxNextQ - currentQ);
        qTable[state][action] = Number(newQValue.toFixed(2));
    }

    // Gerar todas as iterações
    function generateAllIterations() {
        initializeQTable();
        allIterations = [];

        let agentPos = { x: 0, y: 0 };

        for (let i = 0; i < predefinedSequence.length; i++) {
            const step = predefinedSequence[i];

            // Garantir que agente está na posição correta
            agentPos = step.from;
            const currentState = `${agentPos.x},${agentPos.y}`;

            // Executar ação
            const newPosition = executeAction(agentPos.x, agentPos.y, step.action);
            const reward = getReward(newPosition.x, newPosition.y);
            const nextState = `${newPosition.x},${newPosition.y}`;

            // Atualizar Q-table
            updateQValue(currentState, step.action, reward, nextState);

            // Salvar estado da iteração
            allIterations.push({
                agentPosition: { ...newPosition },
                lastAction: step.action,
                lastReward: reward,
                description: step.description,
                qTableSnapshot: JSON.parse(JSON.stringify(qTable)),
                episodeNumber: Math.floor(i / 3) + 1,
                stepInEpisode: (i % 3) + 1
            });

            agentPos = newPosition;

            // Reset para início após cada episódio (quando termina em moeda ou fantasma)
            if (reward !== -0.1) {
                agentPos = { x: 0, y: 0 };
            }
        }
    }

    // Atualizar estado baseado na iteração atual
    function updateCurrentState() {
        if (currentIteration === 0) {
            currentState = { agentPosition: { x: 0, y: 0 }, lastAction: '', lastReward: 0 };
            initializeQTable();
        } else {
            const iteration = allIterations[currentIteration - 1];
            currentState = iteration;
            qTable = JSON.parse(JSON.stringify(iteration.qTableSnapshot));
        }
    }

    // Função para obter cor da célula da Q-table
    function getQValueColor(value) {
        if (value > 0) {
            const intensity = Math.min(value / 10, 1);
            return `rgba(0, 150, 0, ${0.3 + intensity * 0.4})`;
        } else if (value < 0) {
            const intensity = Math.min(Math.abs(value) / 10, 1);
            return `rgba(150, 0, 0, ${0.3 + intensity * 0.4})`;
        } else {
            return 'rgba(100, 100, 100, 0.1)';
        }
    }

    // Reativo: atualizar quando currentIteration muda
    $: updateCurrentState(currentIteration);

    onMount(() => {
        generateAllIterations();
        updateCurrentState();
    });
</script>

<svelte:head>
    <title>Q-Learning Explicado</title>
</svelte:head>

<div class="container">
    <h1>Q-Learning Explicado</h1>

    <div class="intro-section">
        <h2>O que é Q-Learning?</h2>
        <p>
            Q-Learning é um algoritmo de <strong>aprendizado por reforço</strong> que ensina um agente
            a tomar decisões ótimas em um ambiente através de tentativa e erro, sem conhecimento prévio do ambiente.
        </p>

        <h3>Como Funciona:</h3>
        <p>
            O agente aprende interagindo com o ambiente e recebendo <strong>recompensas</strong> (positivas ou negativas) como feedback.
            Uma <strong>Q-Table</strong> armazena o valor esperado de cada ação em cada estado, sendo atualizada com a experiência.
        </p>

        <h3>Componentes Fundamentais:</h3>
        <ul>
            <li><strong>Estado (S):</strong> Posição atual do agente no ambiente</li>
            <li><strong>Ação (A):</strong> Movimento que o agente pode fazer (↑ ↓ ← →)</li>
            <li><strong>Recompensa (R):</strong> Feedback do ambiente (+10 objetivo, -10 fantasma, -0.1 movimento)</li>
            <li><strong>Q-Value Q(s,a):</strong> Valor esperado de executar ação 'a' no estado 's'</li>
        </ul>

        <div class="formula-section">
            <h3>Fórmula do Q-Learning (Equação de Bellman):</h3>
            <div class="formula">
                Q(s,a) ← Q(s,a) + α[r + γ max Q(s',a') - Q(s,a)]
            </div>
            <div class="formula-explanation">
                <p><strong>α (alpha):</strong> Taxa de aprendizado (0.3) - quanto aprender com cada experiência</p>
                <p><strong>γ (gamma):</strong> Fator de desconto (0.9) - importância de recompensas futuras</p>
                <p><strong>r:</strong> Recompensa imediata recebida</p>
                <p><strong>max Q(s',a'):</strong> Maior Q-value possível no próximo estado</p>
            </div>
        </div>

        <h3>Pergunta importante sobre Q-Learning:</h3>
        <p>
            As células da tabela Q que não recebem recompensa direta são atualizadas considerando
            tanto a <strong>recompensa imediata</strong> quanto o <strong>valor Q máximo do próximo estado</strong>.
            Isso permite que o conhecimento se "propague" - estados próximos ao objetivo ganham valores
            altos mesmo sem recompensa direta, criando um "mapa" para o sucesso.
        </p>
    </div>

    <div class="demo-section">
        <h2>Demonstração: 30 Iterações de Aprendizado</h2>
        <p>
            Navegue pelas iterações para ver como o Pacman aprende através de tentativa e erro.
            O agente explora o ambiente, encontra perigos (fantasma), descobre recompensas (moeda)
            e gradualmente desenvolve uma estratégia.
        </p>

        <!-- Controle de iteração -->
        <div class="iteration-control">
            <label>Iteração: <span class="iteration-value">{currentIteration}</span> de {maxIterations}</label>
            <input
                type="range"
                bind:value={currentIteration}
                min="0"
                max={maxIterations}
                step="1"
                class="iteration-slider"
            />
        </div>

        <!-- Status atual -->
        {#if currentIteration > 0}
            <div class="status">
                <div class="status-item">
                    <strong>Episódio:</strong> {allIterations[currentIteration - 1]?.episodeNumber || 'N/A'}
                </div>
                <div class="status-item">
                    <strong>Passo:</strong> {allIterations[currentIteration - 1]?.stepInEpisode || 'N/A'}
                </div>
                <div class="status-item">
                    <strong>Posição:</strong> ({currentState.agentPosition.x}, {currentState.agentPosition.y})
                </div>
                <div class="status-item">
                    <strong>Ação:</strong> {currentState.lastAction || 'Nenhuma'}
                </div>
                <div class="status-item">
                    <strong>Recompensa:</strong> {currentState.lastReward}
                </div>
                <div class="status-item description">
                    <strong>Descrição:</strong> {allIterations[currentIteration - 1]?.description || 'Estado inicial'}
                </div>
            </div>
        {:else}
            <div class="status">
                <div class="status-item description">
                    <strong>Estado inicial:</strong> Pacman na posição (0,0), Q-table zerada, pronto para aprender!
                </div>
            </div>
        {/if}

        <!-- Visualização -->
        <div class="visualization">
            <!-- Grid do ambiente -->
            <div class="environment">
                <h3>Ambiente (Grid 3x3)</h3>
                <div class="game-board">
                    {#each gameBoard as row, y}
                        {#each row as cell, x}
                            <div class="game-cell" class:agent={currentState.agentPosition.x === x && currentState.agentPosition.y === y}>
                                {#if currentState.agentPosition.x === x && currentState.agentPosition.y === y}
                                    <img src="{base}/pacman.png" alt="Agente" class="agent-icon"/>
                                {/if}
                                {#if cell === 1}
                                    <img src="{base}/coin.png" alt="Objetivo" class="coin-icon" />
                                {/if}
                                {#if cell === 2}
                                    <img src="{base}/fantasma.png" alt="Obstáculo" class="ghost-icon" />
                                {/if}
                                <div class="cell-coordinate">({x},{y})</div>
                            </div>
                        {/each}
                    {/each}
                </div>
                <div class="legend">
                    <div class="legend-item">
                        <img src="{base}/pacman.png" alt="Agente" class="legend-icon">
                        <span>Pacman (Agente)</span>
                    </div>
                    <div class="legend-item">
                        <img src="{base}/coin.png" alt="Objetivo" class="legend-icon">
                        <span>Moeda (+10)</span>
                    </div>
                    <div class="legend-item">
                        <img src="{base}/fantasma.png" alt="Obstáculo" class="legend-icon">
                        <span>Fantasma (-10)</span>
                    </div>
                </div>
            </div>

            <!-- Tabela Q -->
            <div class="qtable">
                <h3>Tabela Q - Valores de Ação-Estado</h3>
                <p class="qtable-desc">Cada célula mostra o valor esperado de executar uma ação em um estado:</p>
                <table>
                    <thead>
                        <tr>
                            <th>Estado (x,y)</th>
                            <th>↑ Up</th>
                            <th>↓ Down</th>
                            <th>← Left</th>
                            <th>→ Right</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each Object.entries(qTable) as [state, actions]}
                            <tr class:current-state={state === `${currentState.agentPosition.x},${currentState.agentPosition.y}`}>
                                <td class="state-cell">({state})</td>
                                <td class="q-value" style="background-color: {getQValueColor(actions.up)}">
                                    {actions.up.toFixed(2)}
                                </td>
                                <td class="q-value" style="background-color: {getQValueColor(actions.down)}">
                                    {actions.down.toFixed(2)}
                                </td>
                                <td class="q-value" style="background-color: {getQValueColor(actions.left)}">
                                    {actions.left.toFixed(2)}
                                </td>
                                <td class="q-value" style="background-color: {getQValueColor(actions.right)}">
                                    {actions.right.toFixed(2)}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>

                <div class="qtable-legend">
                    <div class="color-legend">
                        <div class="color-item">
                            <div class="color-box positive"></div>
                            <span>Valores Positivos (Boas ações)</span>
                        </div>
                        <div class="color-item">
                            <div class="color-box negative"></div>
                            <span>Valores Negativos (Ações perigosas)</span>
                        </div>
                        <div class="color-item">
                            <div class="color-box neutral"></div>
                            <span>Valores Neutros (Não explorados)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Explicação final -->
        <div class="learning-explanation">
            <h3>O que Observamos:</h3>
            <div class="learning-insights">
                <div class="insight">
                    <h4>Atualização da Q-Table</h4>
                    <p>A cada passo, a fórmula de Bellman atualiza os valores baseado na recompensa recebida e nas possibilidades futuras.</p>
                </div>

                <div class="insight">
                    <h4>Valores Negativos</h4>
                    <p>Quando o Pacman bate no fantasma, os Q-values das ações que levam a essa situação ficam negativos, ensinando-o a evitar esses caminhos.</p>
                </div>

                <div class="insight">
                    <h4>Valores Positivos</h4>
                    <p>Quando encontra a moeda, os Q-values das ações que levam ao objetivo ficam positivos, criando um "mapa" do caminho para o sucesso.</p>
                </div>

                <div class="insight">
                    <h4>Propagação de Conhecimento</h4>
                    <p>Com mais iterações, os valores se propagam pelo ambiente - estados próximos ao objetivo ganham valores altos, criando uma "atração" para o objetivo.</p>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        font-family: 'Lato', sans-serif;
        color: white;
    }

    h1, h2 {
        font-family: 'Press Start 2P', cursive;
        margin-top: 2em;
        margin-bottom: 1em;
    }

    h1 {
        font-size: 1.8rem;
    }

    h2 {
        font-size: 1.4rem;
    }

    h3 {
        margin-bottom: 1rem;
        font-size: 1.2rem;
    }

    .intro-section {
        margin-bottom: 3rem;
    }

    .demo-section {
        margin-bottom: 2rem;
    }

    .formula-section {
        margin: 2rem 0;
        background-color: #333;
        padding: 1.5rem;
        border-radius: 8px;
        border: 2px solid #666;
    }

    .formula {
        background-color: #222;
        border: 2px solid #555;
        border-radius: 8px;
        padding: 1rem;
        font-family: 'Courier New', monospace;
        font-size: 1.1rem;
        color: white;
        text-align: center;
        margin: 1rem 0;
    }

    .formula-explanation {
        font-size: 0.9rem;
        color: #ccc;
    }

    .iteration-control {
        background-color: #333;
        padding: 1rem;
        border-radius: 8px;
        border: 2px solid #666;
        margin-bottom: 2rem;
    }

    .iteration-control label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: bold;
    }

    .iteration-value {
        color: #fff;
        font-family: monospace;
    }

    .iteration-slider {
        width: 100%;
        height: 6px;
        background: #222;
        border-radius: 3px;
        outline: none;
    }

    .status {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
        padding: 1rem;
        background-color: #333;
        border-radius: 8px;
        border: 2px solid #666;
    }

    .status-item {
        padding: 0.5rem;
        background-color: #222;
        border-radius: 6px;
        border: 1px solid #555;
    }

    .status-item.description {
        grid-column: 1 / -1;
    }

    .visualization {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
        .visualization {
            grid-template-columns: 1fr;
        }
    }

    .environment {
        background-color: #333;
        padding: 1.5rem;
        border-radius: 8px;
        border: 2px solid #666;
    }

    .game-board {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px;
        margin-bottom: 1rem;
    }

    .game-cell {
        width: 80px;
        height: 80px;
        background-color: #222;
        border: 2px solid #555;
        border-radius: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        transition: all 0.3s ease;
    }

    .game-cell.agent {
        border-color: #fff;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }

    .agent-icon, .coin-icon, .ghost-icon {
        width: 60%;
        height: 60%;
        object-fit: contain;
        z-index: 2;
    }

    .cell-coordinate {
        position: absolute;
        bottom: 2px;
        right: 4px;
        font-size: 0.7rem;
        color: #999;
        z-index: 1;
    }

    .legend {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background-color: #222;
        padding: 0.5rem;
        border-radius: 6px;
        border: 1px solid #555;
    }

    .legend-icon {
        width: 20px;
        height: 20px;
    }

    .qtable {
        background-color: #333;
        padding: 1.5rem;
        border-radius: 8px;
        border: 2px solid #666;
        overflow-x: auto;
    }

    .qtable-desc {
        font-size: 0.9rem;
        color: #ccc;
        margin-bottom: 1rem;
        text-align: center;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1rem;
    }

    th, td {
        padding: 0.5rem;
        text-align: center;
        border: 1px solid #555;
    }

    th {
        background-color: #222;
        font-weight: bold;
    }

    .current-state {
        background-color: rgba(255, 255, 255, 0.1);
        border: 2px solid #fff;
    }

    .state-cell {
        font-weight: bold;
        background-color: #222;
    }

    .q-value {
        font-family: monospace;
        font-weight: bold;
        color: white;
        transition: all 0.3s ease;
    }

    .qtable-legend {
        margin-top: 1rem;
    }

    .color-legend {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }

    .color-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .color-box {
        width: 20px;
        height: 20px;
        border-radius: 4px;
    }

    .color-box.positive {
        background: rgba(0, 150, 0, 0.7);
    }

    .color-box.negative {
        background: rgba(150, 0, 0, 0.7);
    }

    .color-box.neutral {
        background: rgba(100, 100, 100, 0.3);
    }

    .learning-explanation {
        background-color: #333;
        border-radius: 8px;
        padding: 2rem;
        border: 2px solid #666;
    }

    .learning-insights {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-top: 1.5rem;
    }

    .insight {
        background-color: #222;
        padding: 1.5rem;
        border-radius: 8px;
        border: 1px solid #555;
    }

    .insight h4 {
        margin-bottom: 1rem;
        color: white;
    }

    ul, ol {
        padding-left: 2rem;
    }

    li {
        margin-bottom: 0.5rem;
    }

    strong {
        color: white;
    }

    p {
        font-size: 1.2rem;
        line-height: 1.6;
        margin-bottom: 1.5em;
        text-align: justify;
    }
</style>
