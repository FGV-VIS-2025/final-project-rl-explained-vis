<script>
  import { onMount } from 'svelte';
  import { base } from '$app/paths';

    // Estados do exemplo (grid 3x3)
    let gameBoard = [
        [0, 0, 0],
        [0, 2, 0], // fantasma no meio
        [0, 0, 1]  // coin no canto inferior direito
    ];

    // Parâmetros do Q-Learning
    const alpha = 0.3;  // taxa de aprendizado
    const gamma = 0.9;  // fator de desconto

    // Tabela Q
    let qTable = {};

    // Sequência predefinida de ações
    const predefinedSequence = [
        // Fantasma
        { from: { x: 0, y: 0 }, action: 'right' },
        { from: { x: 1, y: 0 }, action: 'down' },
        { from: { x: 1, y: 1 }, action: 'none' },

        // Moeda
        { from: { x: 0, y: 0 }, action: 'down' },
        { from: { x: 0, y: 1 }, action: 'down' },
        { from: { x: 0, y: 2 }, action: 'right' },
        { from: { x: 1, y: 2 }, action: 'right' },
        { from: { x: 2, y: 2 }, action: 'none' },

        // Fantasma
        { from: { x: 0, y: 0 }, action: 'down' },
        { from: { x: 0, y: 1 }, action: 'right' },
        { from: { x: 1, y: 1 }, action: 'none' },

        // Moeda
        { from: { x: 0, y: 0 }, action: 'right' },
        { from: { x: 1, y: 0 }, action: 'right' },
        { from: { x: 2, y: 0 }, action: 'down' },
        { from: { x: 2, y: 1 }, action: 'down' },
        { from: { x: 2, y: 2 }, action: 'none' },

        // Moeda
        { from: { x: 0, y: 0 }, action: 'down' },
        { from: { x: 0, y: 1 }, action: 'down' },
        { from: { x: 0, y: 2 }, action: 'right' },
        { from: { x: 1, y: 2 }, action: 'right' },
        { from: { x: 2, y: 2 }, action: 'none' },

        // Fantasma
        { from: { x: 0, y: 0 }, action: 'right' },
        { from: { x: 1, y: 0 }, action: 'down' },
        { from: { x: 0, y: 0 }, action: 'right' },
        { from: { x: 1, y: 0 }, action: 'down' },
        { from: { x: 1, y: 1 }, action: 'none' },

        // Moeda
        { from: { x: 0, y: 0 }, action: 'right' },
        { from: { x: 1, y: 0 }, action: 'right' },
        { from: { x: 2, y: 0 }, action: 'down' },
        { from: { x: 2, y: 1 }, action: 'down' },
        { from: { x: 2, y: 2 }, action: 'none' },

        // Moeda
        { from: { x: 0, y: 0 }, action: 'down' },
        { from: { x: 0, y: 1 }, action: 'down' },
        { from: { x: 0, y: 2 }, action: 'right' },
        { from: { x: 1, y: 2 }, action: 'right' },
        { from: { x: 2, y: 2 }, action: 'none' }
    ];

    // Controle de iterações
    let currentIteration = 0;
    let maxIterations = predefinedSequence.length - 1;

    // Histórico completo de todas as iterações
    let allIterations = [];

    // Estado atual baseado na iteração selecionada
    let currentState = { agentPosition: { x: 0, y: 0 }, lastAction: '', lastReward: 0 };

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
        if (gameBoard[y][x] === 2) return -100; // fantasma
        if (gameBoard[y][x] === 1) return +100; // objetivo
        return -1; // movimento normal (pequena penalidade)
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

        for (let i = 0; i < predefinedSequence.length; i++) {
            const step = predefinedSequence[i];
            const currentState = `${step.from.x},${step.from.y}`;

            // Determinar nova posição: se há próximo step, usar seu 'from', senão manter posição atual
            let newPosition;
            if (i + 1 < predefinedSequence.length) {
                newPosition = predefinedSequence[i + 1].from;
            } else {
                // Último step, manter posição atual
                newPosition = step.from;
            }

            const reward = getReward(newPosition.x, newPosition.y);
            const nextState = `${newPosition.x},${newPosition.y}`;

            // Atualizar Q-table apenas se não for ação 'none'
            if (step.action !== 'none') {
                updateQValue(currentState, step.action, reward, nextState);
            }

            // Salvar estado da iteração
            allIterations.push({
                agentPosition: { ...newPosition },
                lastAction: step.action,
                lastReward: reward,
                qTableSnapshot: JSON.parse(JSON.stringify(qTable))
            });
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
            const intensity = Math.min(value / 100, 1);
            return `rgba(0, 150, 0, ${0.3 + intensity * 0.4})`;
        } else if (value < 0) {
            const intensity = Math.min(Math.abs(value) / 100, 1);
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
        console.log(allIterations);
    });
</script>

<svelte:head>
    <title>Q-Learning Explicado</title>
</svelte:head>

<div class="container">
    <h1>Q-Learning Explained</h1>

    <div class="intro-section">
        <p>
            Q-Learning is a <strong>reinforcement learning</strong> algorithm that teaches an agent
            to make optimal decisions in an environment. Key aspects of its approach include:
        </p>
        <ul>
            <li>It finds the optimal policy indirectly by training a value or action-value function that will tell us the value of each state or each state-action pair.</li>
            <li>It updates its action-value function at each step instead of at the end of the episode.</li>
        </ul>

        <h3>How it Works:</h3>
        <p>The agent learns by interacting with the environment and receiving <strong>rewards</strong> (positive or negative) as feedback. Q-Learning is the algorithm used to iteratively refine a special function called the Q-function. </p>
        <p>Internally, our Q-function is encoded by a  <strong> Q-table</strong>, a table where each cell corresponds to a state-action pair value. A Q-Table stores the expected value of each action in each state, being updated with experience.</p>

        <h3>How the Q-Table is updated:</h3>
        <ul>
            <li><strong>State (S):</strong> The agent's current position in the environment</li>
            <li><strong>Action (A):</strong> The movement the agent can make (↑ ↓ ← →)</li>
            <li><strong>Reward (R):</strong> Feedback from the environment (+10 goal, -10 ghost, -0.1 move)</li>
            <li><strong>Q-Value Q(s,a):</strong> The expected value of performing action 'a' in state 's'</li>
        </ul>

        <div class="formula-section">
            <h3>Q-Learning Formula (Bellman Equation):</h3>
            <div class="formula">
                Q(s,a) ← Q(s,a) + α[r + γ max Q(s',a') - Q(s,a)]
            </div>
            <div class="formula-explanation">
                <p><strong>α (alpha):</strong>  how much to learn from each experience</p>
                <p><strong>γ (gamma):</strong>  importance of future rewards</p>
                <p><strong>r:</strong> Immediate reward received</p>
                <p><strong>max Q(s',a'):</strong> Maximum possible Q-value in the next state</p>
            </div>
        </div>

        <p>
            In other words, the Q-table cells are updated considering
            both the <strong>immediate reward</strong> and the <strong>maximum value of the next state</strong>.
            This allows knowledge to "propagate", that means, states close to the goal gain
            high values even without direct reward, creating a "map" to success.
        </p>
    </div>

    <div class="demo-section">
        <h2>See it in Action</h2>
        <p>
            Navigate through the iterations (scroll the slider below) to see how Pacman learns through trial and error.
            The agent explores the environment, encounters dangers (ghosts), discovers rewards (coins),
            and gradually develops a strategy. In this example, the <strong> α (alpha) was set to 0.3</strong> and the <strong> γ (gamma) was set to 0.9</strong>.
        </p>

        <!-- Controle de iteração -->
        <div class="iteration-control">
            <label>Interaction: <span class="iteration-value">{currentIteration}</span> de {maxIterations}</label>
            <input
                type="range"
                bind:value={currentIteration}
                min="0"
                max={maxIterations}
                step="1"
                class="iteration-slider"
            />
        </div>

        <!-- Visualização -->
        <div class="visualization">
            <div class="environment">
              <h3>Environment (3x3 Grid)</h3>
              <div class="game-board">
                {#each gameBoard as row, y}
                  {#each row as cell, x}
                    <div class="game-cell" class:agent={currentState.agentPosition.x === x && currentState.agentPosition.y === y}>
                      {#if currentState.agentPosition.x === x && currentState.agentPosition.y === y}
                        <img src="{base}/pacman.png" alt="Agent" class="agent-icon"/>
                      {/if}
                      {#if cell === 1}
                        <img src="{base}/coin.png" alt="Coin" class="coin-icon" />
                      {/if}
                      {#if cell === 2}
                        <img src="{base}/fantasma.png" alt="Ghost" class="ghost-icon" />
                      {/if}
                      <div class="cell-coordinate">({x},{y})</div>
                    </div>
                  {/each}
                {/each}
              </div>
              <div class="legend">
                <div class="legend-item">
                  <img src="{base}/pacman.png" alt="Agent" class="legend-icon">
                  <span>Pacman (Agent)</span>
                </div>
                <div class="legend-item">
                  <img src="{base}/coin.png" alt="Coin" class="legend-icon">
                  <span>Coin (+100)</span>
                </div>
                <div class="legend-item">
                  <img src="{base}/fantasma.png" alt="Ghost" class="legend-icon">
                  <span>Ghost (-100)</span>
                </div>
              </div>
            </div>

            <div class="qtable">
              <h3>Q-Table - State-Action Values</h3>
              <p class="qtable-desc">Each cell shows the expected value of performing an action in a state:</p>
              <table>
                <thead>
                  <tr>
                    <th>State (x,y)</th>
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
                    <span>Positive Values (Good actions)</span>
                  </div>
                  <div class="color-item">
                    <div class="color-box negative"></div>
                    <span>Negative Values (Dangerous actions)</span>
                  </div>
                  <div class="color-item">
                    <div class="color-box neutral"></div>
                    <span>Neutral Values (Unexplored)</span>
                  </div>
                </div>
              </div>
            </div>
        </div>
    </div>
</div>

<div class="button-container column">
    <button class="large-button">
      <a href="{base + "/visualization"}" style="text-decoration: none; color: inherit;">Explore the Iterative Visualization</a>
    </button>
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



    ul {
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

  /* Button Container */
  .button-container {
    display: flex;
    justify-content: center;
    margin-top: 2em;
    margin-bottom: 2em;
  }

  .button-container.column {
    flex-direction: column;
    gap: 1em;
    margin-top: 0;
  }

  .large-button {
    width: 100%;
    max-width: 800px;
    padding: 15px 20px;
    font-size: 1.2rem;
    margin: 0 auto;
    font-family: 'Press Start 2P', cursive;
    background-color: #333;
    color: white;
    border: 2px solid white;
    cursor: pointer;
    transition: background-color 0.3s;
  }
</style>
