<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  function returnToExplained() {
    goto("/explained");
  }

  let currentSection = 'agent';

  function navigateToSection(section) {
    currentSection = section;
    const element = document.querySelector(`[data-section="${section}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onMount(() => {
    // Inicializa a visualização ou configurações necessárias
  });
</script>

<svelte:head>
  <title>Reinforcement Learning - Formal Definition</title>
</svelte:head>

<div class="container">
  <h1>Reinforcement Learning: A Formal Definition</h1>

  <nav class="section-nav">
    <ul>
      <li><button class:active={currentSection === 'agent'} on:click={() => navigateToSection('agent')}>Agent</button></li>
      <li><button class:active={currentSection === 'environment'} on:click={() => navigateToSection('environment')}>Environment</button></li>
      <li><button class:active={currentSection === 'rewards'} on:click={() => navigateToSection('rewards')}>Rewards</button></li>
      <li><button class:active={currentSection === 'policy'} on:click={() => navigateToSection('policy')}>Policy</button></li>
    </ul>
  </nav>

  <!-- Section 1: Agent -->
  <section class="section" data-section="agent">
    <div class="section-container">
      <div class="text-content">
        <h2>The Agent</h2>
        <p>An <strong>agent</strong> is the learner and decision-maker in reinforcement learning. It's the entity that takes actions in an environment to achieve a goal.</p>

        <div class="key-points">
          <h3>Key Characteristics:</h3>
          <ul>
            <li><strong>Autonomous:</strong> Makes decisions independently</li>
            <li><strong>Goal-oriented:</strong> Seeks to maximize cumulative reward</li>
            <li><strong>Adaptive:</strong> Learns from experience over time</li>
            <li><strong>Interactive:</strong> Constantly engages with its environment</li>
          </ul>
        </div>

        <p>The agent observes the current state of the environment and selects actions based on its current knowledge and strategy. Initially, the agent may make random or poor decisions, but through experience, it learns to make better choices.</p>
      </div>

      <div class="visual-content">
        <div class="agent-visualization">
          <img src="/pacman.png" alt="Pacman Agent" class="agent-image">
          <div class="actions-container">
            <h3>Available Actions</h3>
            <div class="action-grid">
              <div class="action-cell"></div>
              <div class="action-cell action-up">
                <span class="action-arrow">↑</span>
                <span class="action-label">Up</span>
              </div>
              <div class="action-cell"></div>
              <div class="action-cell action-left">
                <span class="action-arrow">←</span>
                <span class="action-label">Left</span>
              </div>
              <div class="action-cell agent-cell">
                <img src="/pacman.png" alt="Pacman" class="small-agent">
              </div>
              <div class="action-cell action-right">
                <span class="action-arrow">→</span>
                <span class="action-label">Right</span>
              </div>
              <div class="action-cell"></div>
              <div class="action-cell action-down">
                <span class="action-arrow">↓</span>
                <span class="action-label">Down</span>
              </div>
              <div class="action-cell"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 2: Environment -->
  <section class="section" data-section="environment">
    <div class="section-container">
      <div class="text-content">
        <h2>The Environment</h2>
        <p>The <strong>environment</strong> is everything external to the agent. It's the world in which the agent operates and includes all factors that can affect the agent's performance.</p>

        <div class="key-points">
          <h3>Environment Properties:</h3>
          <ul>
            <li><strong>States:</strong> All possible situations the agent can encounter</li>
            <li><strong>Dynamics:</strong> How the environment changes in response to actions</li>
            <li><strong>Feedback:</strong> Provides rewards and new states to the agent</li>
            <li><strong>Rules:</strong> Defines what actions are possible in each state</li>
          </ul>
        </div>

        <p>No nosso exemplo, temos um ambiente determinístico onde o Pacman se move em um grid. Se ele encontrar um fantasma (representado por células vermelhas), ele morre. O ambiente é determinístico porque cada ação sempre leva ao mesmo resultado, sem aleatoriedade.</p>
      </div>

      <div class="visual-content">
        <div class="environment-grid">
          <div class="grid-row">
            <div class="grid-cell"><img src="/pacman.png" alt="Pacman" class="small-agent"></div>
            <div class="grid-cell"><img src="/coin.png" alt="Coin" class="coin-icon"></div>
            <div class="grid-cell danger-cell"></div>
          </div>
          <div class="grid-row">
            <div class="grid-cell"></div>
            <div class="grid-cell"></div>
            <div class="grid-cell"></div>
          </div>
          <div class="grid-row">
            <div class="grid-cell"><img src="/coin.png" alt="Coin" class="coin-icon"></div>
            <div class="grid-cell danger-cell"></div>
            <div class="grid-cell"><img src="/coin.png" alt="Coin" class="coin-icon"></div>
          </div>
        </div>
        <div class="environment-legend">
          <div class="legend-item">
            <img src="/pacman.png" alt="Pacman" class="small-agent">
            <span>Agente</span>
          </div>
          <div class="legend-item">
            <img src="/coin.png" alt="Coin" class="coin-icon">
            <span>Recompensa</span>
          </div>
          <div class="legend-item">
            <div class="small-danger-cell"></div>
            <span>Perigo</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 3: Rewards -->
  <section class="section" data-section="rewards">
    <div class="section-container">
      <div class="text-content">
        <h2>Rewards & Feedback</h2>
        <p>The <strong>reward signal</strong> is the primary way the environment communicates with the agent about the quality of its actions. It's the foundation of learning in RL.</p>

        <div class="key-points">
          <h3>Types of Rewards:</h3>
          <ul>
            <li><strong>Positive:</strong> Encourages the behavior that led to this outcome</li>
            <li><strong>Negative:</strong> Discourages the behavior (also called penalties)</li>
            <li><strong>Zero:</strong> Neutral feedback, neither encouraging nor discouraging</li>
            <li><strong>Sparse:</strong> Rewards given infrequently, only at key moments</li>
            <li><strong>Dense:</strong> Frequent rewards providing constant guidance</li>
          </ul>
        </div>

        <p>The reward signal must be carefully designed to align with the desired behavior. Poor reward design can lead to unintended consequences where the agent finds ways to "game the system."</p>
      </div>

      <div class="visual-content">
        <div class="rewards-visualization">
          <div class="reward-timeline">
            <div class="timeline-point negative">
              <div class="reward-value">-1</div>
              <div class="reward-label">Cada Passo</div>
            </div>
            <div class="timeline-point negative">
              <div class="reward-value">-100</div>
              <div class="reward-label">Fantasma</div>
            </div>
            <div class="timeline-point positive">
              <div class="reward-value">+100</div>
              <div class="reward-label">Moeda</div>
            </div>
          </div>
          <div class="cumulative-reward">
            <div class="cumulative-label">Recompensa Acumulada</div>
            <div class="cumulative-value" id="cumulative-value">+97</div>
            <div class="reward-explanation">
              <p>Pacman recebe -1 por cada passo que dá, incentivando-o a encontrar o caminho mais curto.</p>
              <p>Recebe +100 quando pega uma moeda, e -100 se encontrar um fantasma.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 4: Policy -->
  <section class="section" data-section="policy">
    <div class="section-container">
      <div class="text-content">
        <h2>Policy - What the Agent Learns</h2>
        <p>A <strong>policy</strong> is the agent's strategy or behavior function that maps states to actions. It represents what the agent has learned about how to behave in different situations.</p>

        <div class="key-points">
          <h3>Types of Policies:</h3>
          <ul>
            <li><strong>Deterministic:</strong> Always selects the same action for a given state</li>
            <li><strong>Stochastic:</strong> Selects actions based on probabilities</li>
            <li><strong>Optimal:</strong> The best possible policy that maximizes expected reward</li>
            <li><strong>Greedy:</strong> Always chooses the action with highest estimated value</li>
          </ul>
        </div>

        <p>The goal of reinforcement learning is to find an optimal policy - one that maximizes the expected cumulative reward over time. The agent learns this policy through trial and error, gradually improving its decision-making as it gains more experience.</p>

        <div class="formula">
          <h4>Policy Notation:</h4>
          <code>π(a|s) = probability of taking action a in state s</code>
        </div>

        <p>No nosso exemplo do Pacman, a política aprendida indica a melhor direção a seguir em cada posição do grid. Com o tempo, o agente aprende a evitar os fantasmas e a encontrar o caminho mais curto até as moedas.</p>
      </div>

      <div class="visual-content">
        <div class="policy-visualization">
          <div class="policy-grid">
            <div class="policy-row">
              <div class="policy-cell"><span class="policy-arrow right">→</span></div>
              <div class="policy-cell"><span class="policy-arrow right">→</span></div>
              <div class="policy-cell"><span class="policy-arrow down">↓</span></div>
            </div>
            <div class="policy-row">
              <div class="policy-cell"><span class="policy-arrow down">↓</span></div>
              <div class="policy-cell"><span class="policy-arrow right">→</span></div>
              <div class="policy-cell"><span class="policy-arrow down">↓</span></div>
            </div>
            <div class="policy-row">
              <div class="policy-cell"><span class="policy-arrow right">→</span></div>
              <div class="policy-cell"><span class="policy-arrow right">→</span></div>
              <div class="policy-cell goal-cell">G</div>
            </div>
          </div>
          <div class="policy-explanation">
            <p>As setas representam a melhor ação a tomar em cada estado, conforme aprendido pelo agente.</p>
            <p>Esta política foi aprendida após muitas interações com o ambiente, tentativa e erro, e maximização da recompensa acumulada.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="button-container">
    <button class="return-button" on:click={returnToExplained}>Voltar</button>
  </div>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Lato', sans-serif;
    color: white;
  }

  h1, h2, h3, h4 {
    font-family: 'Press Start 2P', cursive;
    margin-top: 1em;
    margin-bottom: 0.8em;
  }

  h1 {
    font-size: 1.8rem;
    text-align: center;
    margin-bottom: 1.5em;
  }

  h2 {
    font-size: 1.4rem;
    border-bottom: 2px solid #444;
    padding-bottom: 0.5em;
  }

  h3 {
    font-size: 1rem;
  }

  p {
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 1.2em;
    text-align: justify;
  }

  .section-nav {
    margin-bottom: 2em;
  }

  .section-nav ul {
    display: flex;
    justify-content: space-around;
    list-style: none;
    padding: 0;
    margin: 0;
    flex-wrap: wrap;
  }

  .section-nav button {
    font-family: 'Press Start 2P', cursive;
    background-color: #333;
    color: white;
    border: 2px solid #555;
    padding: 10px 15px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 0.8rem;
    margin: 5px;
  }

  .section-nav button:hover, .section-nav button.active {
    background-color: #555;
    border-color: #777;
  }

  .section {
    margin-bottom: 4em;
    padding: 1em;
    border-radius: 8px;
    background-color: #2a2a2a;
  }

  .section-container {
    display: flex;
    flex-direction: row;
    gap: 2em;
  }

  .text-content {
    flex: 1;
  }

  .visual-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .key-points {
    background-color: #333;
    padding: 1em;
    border-radius: 8px;
    margin: 1.5em 0;
  }

  .key-points ul {
    padding-left: 1.5em;
  }

  .key-points li {
    margin-bottom: 0.5em;
  }

  .formula {
    background-color: #333;
    padding: 1em;
    border-radius: 8px;
    margin: 1.5em 0;
    font-family: monospace;
  }

  code {
    font-family: monospace;
    background-color: #444;
    padding: 0.2em 0.4em;
    border-radius: 4px;
  }

  /* Agent Visualization */
  .agent-visualization {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2em;
  }

  .agent-image {
    width: 100px;
    height: 100px;
    object-fit: contain;
  }

  .actions-container {
    width: 100%;
    max-width: 300px;
  }

  .action-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 5px;
  }

  .action-cell {
    background-color: #333;
    border-radius: 4px;
    height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .agent-cell {
    background-color: #444;
  }

  .action-arrow {
    font-size: 1.5rem;
    color: #ffcc00;
  }

  .action-label {
    font-size: 0.7rem;
    margin-top: 5px;
  }

  .small-agent {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }

  /* Environment Visualization */
  .environment-grid {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .grid-row {
    display: flex;
    gap: 5px;
  }

  .grid-cell {
    width: 60px;
    height: 60px;
    background-color: #333;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .danger-cell {
    background-color: #f44336;
  }

  .coin-icon {
    width: 30px;
    height: 30px;
    object-fit: contain;
  }

  .environment-legend {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .small-danger-cell {
    width: 20px;
    height: 20px;
    background-color: #f44336;
    border-radius: 4px;
  }

  /* Rewards Visualization */
  .rewards-visualization {
    width: 100%;
    max-width: 400px;
  }

  .reward-timeline {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    position: relative;
  }

  .reward-timeline::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #555;
    z-index: 0;
  }

  .timeline-point {
    background-color: #333;
    border-radius: 8px;
    padding: 10px;
    z-index: 1;
    text-align: center;
  }

  .timeline-point.positive {
    border: 2px solid #4caf50;
  }

  .timeline-point.negative {
    border: 2px solid #f44336;
  }

  .timeline-point.neutral {
    border: 2px solid #ffeb3b;
  }

  .reward-value {
    font-size: 1.2rem;
    font-weight: bold;
    font-family: 'Press Start 2P', cursive;
  }

  .positive .reward-value {
    color: #4caf50;
  }

  .negative .reward-value {
    color: #f44336;
  }

  .neutral .reward-value {
    color: #ffeb3b;
  }

  .reward-label {
    font-size: 0.8rem;
    margin-top: 5px;
  }

  .cumulative-reward {
    background-color: #333;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
  }

  .cumulative-label {
    font-size: 0.9rem;
    margin-bottom: 10px;
  }

  .cumulative-value {
    font-size: 1.8rem;
    font-weight: bold;
    color: #4caf50;
    font-family: 'Press Start 2P', cursive;
  }

  .reward-explanation {
    margin-top: 15px;
    text-align: left;
    font-size: 0.9rem;
  }

  .reward-explanation p {
    font-size: 0.9rem;
    margin-bottom: 0.5em;
  }

  /* Policy Visualization */
  .policy-visualization {
    width: 100%;
    max-width: 400px;
  }

  .policy-grid {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 20px;
  }

  .policy-row {
    display: flex;
    gap: 5px;
  }

  .policy-cell {
    width: 60px;
    height: 60px;
    background-color: #333;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .policy-arrow {
    font-size: 1.5rem;
    color: #ffcc00;
  }

  .goal-cell {
    background-color: #4caf50;
    color: white;
    font-weight: bold;
    font-size: 1.5rem;
  }

  .policy-explanation {
    background-color: #333;
    padding: 15px;
    border-radius: 8px;
  }

  .policy-explanation p {
    font-size: 0.9rem;
    margin-bottom: 0.5em;
  }

  /* Button Container */
  .button-container {
    display: flex;
    justify-content: center;
    margin-top: 2em;
    margin-bottom: 2em;
  }

  .return-button {
    font-family: 'Press Start 2P', cursive;
    background-color: #333;
    color: white;
    border: 2px solid white;
    padding: 15px 30px;
    cursor: pointer;
    transition: background-color 0.3s;
    font-size: 1rem;
  }

  .return-button:hover {
    background-color: #555;
  }

  /* Responsive Design */
  @media (max-width: 900px) {
    .section-container {
      flex-direction: column;
    }

    .visual-content {
      margin-top: 2em;
    }
  }
</style>
