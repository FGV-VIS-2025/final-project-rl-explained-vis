<script>
  import { onMount } from 'svelte';

  let currentStep = 0;

  let gameBoard = [
    [0, 1, 2],
    [0, 0, 0],
    [1, 2, 1]
  ];

  function nextStep() {
    if (currentStep < 3) {
      currentStep++;
    }
  }

  function resetDemo() {
    currentStep = 0;
  }
</script>

<svelte:head>
  <title>O que é Reinforcement Learning?</title>
</svelte:head>

<div class="container">
  <h1>A ideia por trás do Reinforcement Learning</h1>

  <p>A ideia por trás do Reinforcement Learning é que um agente (uma IA) aprenderá com o ambiente interagindo com ele (por tentativa e erro) e recebendo recompensas (negativas ou positivas) como feedback por realizar ações.</p>

  <p>Aprender com interações com o ambiente vem de nossas experiências naturais.</p>

  <p>Por exemplo, imagine colocar seu irmão mais novo na frente de um videogame que ele nunca jogou, dar a ele um controle e deixá-lo sozinho.</p>

  <!-- Primeiro container - sempre visível -->
  <div class="demo-container">
    <div class="boy-container">
      <img src="/menino.png" alt="Menino jogando" class="boy-icon" />
    </div>

    <div class="game-container">
      <div class="game-board">
        {#each gameBoard as row, i}
          {#each row as cell, j}
          <div class="game-cell" class:red-cell={cell === 2}>
            {#if i === 0 && j === 0}
              <img src="/avatar.png" alt="Avatar" class="avatar-icon"/>
            {/if}
            {#if cell === 1}
              <img src="/coin.png" alt="Moeda" class="coin-icon" />
            {/if}
          </div>
          {/each}
        {/each}
      </div>
    </div>
  </div>

  <!-- Conteúdo do passo 1 - aparece depois do primeiro clique -->
  {#if currentStep >= 1}
    <p>Seu irmão vai interagir com o ambiente (o videogame) pressionando o botão certo (ação). Ele conseguiu uma moeda, isso é uma recompensa +1. É positivo, ele acabou de entender que neste jogo ele deve pegar as moedas.</p>

    <div class="demo-container">
      <div class="boy-container">
        <img src="/menino.png" alt="Menino jogando" class="boy-icon" />
        <div class="reward-indicator">+1</div>
      </div>

      <div class="game-container">
        <div class="game-board">
          {#each gameBoard as row, i}
            {#each row as cell, j}
              <div class="game-cell" class:red-cell={cell === 2}>
                {#if i === 0 && j === 1}
                    <img src="/avatar.png" alt="Avatar" class="avatar-icon"/>
                {/if}
                {#if cell === 1 && (i !== 0 && j !== 1)}
                  <img src="/coin.png" alt="Moeda" class="coin-icon" />
                {/if}
                {#if i === 0 && j === 0}
                  <div class="arrow">→</div>
                {/if}
              </div>
            {/each}
          {/each}
        </div>
      </div>
    </div>
    {/if}

    {#if currentStep >= 2}

    <p>Mas então, ele pressiona o botão direito novamente e cai em um buraco. Ele acabou de morrer, então essa é uma recompensa -1.</p>

    <div class="demo-container">
      <div class="boy-container">
        <img src="/menino.png" alt="Menino jogando" class="boy-icon" />
        <div class="death-indicator">-1</div>
      </div>

      <div class="game-container">
        <div class="game-board">
          {#each gameBoard as row, i}
            {#each row as cell, j}
              <div class="game-cell" class:red-cell={cell === 2}>
                {#if i === 0 && j === 2}
                    <img src="/avatar.png" alt="Avatar" class="avatar-icon"/>
                {/if}
                {#if cell === 1 && (i !== 0 && j !== 1)}
                  <img src="/coin.png" alt="Moeda" class="coin-icon" />
                {/if}
                {#if i === 0 && j === 1}
                    <div class="arrow">→</div>
                {/if}
              </div>
            {/each}
          {/each}
        </div>
      </div>
    </div>

    <p>Ao interagir com o ambiente através de tentativa e erro, seu irmão mais novo entende que precisa pegar moedas neste ambiente, mas evitar os inimigos. Sem qualquer supervisão, a criança ficará cada vez melhor em jogar o jogo.</p>

    <p>É assim que humanos e animais aprendem, através da interação. O Reinforcement Learning é apenas uma abordagem computacional de aprendizado a partir de ações.</p>

    <h2>Uma definição formal</h2>
    <p>Podemos agora fazer uma definição formal:</p>
    <p>Reinforcement Learning é um framework para resolver tarefas de controle (também chamadas de problemas de decisão) construindo agentes que aprendem com o ambiente interagindo com ele através de tentativa e erro e recebendo recompensas (positivas ou negativas) como único feedback.</p>
    <p>Mas como funciona o Reinforcement Learning?</p>
  {/if}

  <!-- Botões de controle -->
  <div class="button-container">
    <button on:click={nextStep} disabled={currentStep >= 3}>Próximo Passo</button>
    <button on:click={resetDemo}>Recomeçar</button>
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

  p {
    font-size: 1.2rem;
    line-height: 1.6;
    margin-bottom: 1.5em;
    text-align: justify;
  }

  .demo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 2em 0;
    gap: 2em;
  }

  .boy-container {
    position: relative;
    width: 150px;
    height: 150px;
  }

  .boy-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .death-indicator {
    position: absolute;
    top: -20px;
    right: -20px;
    background-color: red;
    color: white;
    font-weight: bold;
    padding: 5px 10px;
    border-radius: 50%;
    animation: pulse 1s infinite;
  }

  .reward-indicator {
    position: absolute;
    top: -20px;
    right: -20px;
    background-color: green;
    color: white;
    font-weight: bold;
    padding: 5px 10px;
    border-radius: 50%;
    animation: pulse 1s infinite;
  }

  .game-container {
    background-color: #333;
    padding: 10px;
    border-radius: 8px;
    border: 2px solid #666;
  }

  .game-board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 4px;
    width: 200px;
    height: 200px;
  }

  .game-cell {
    background-color: #222;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .red-cell {
    background-color: #f44336;
  }

  .coin-icon {
    width: 60%;
    height: 60%;
    object-fit: contain;
    z-index: 1;
  }

  .avatar-icon {
    width: 70%;
    height: 70%;
    object-fit: contain;
    z-index: 2;
    animation: bounce 0.5s infinite alternate;
  }

  .arrow {
    position: absolute;
    font-size: 2rem;
    color: yellow;
    animation: blink 1s infinite;
    z-index: 3;
  }

  .down-arrow {
    transform: rotate(90deg);
  }

  .button-container {
    display: flex;
    justify-content: center;
    gap: 1em;
    margin-top: 2em;
    margin-bottom: 2em;
  }

  button {
    font-family: 'Press Start 2P', cursive;
    background-color: #333;
    color: white;
    border: 2px solid white;
    padding: 10px 20px;
    cursor: pointer;
    transition: background-color 0.3s;
    font-size: 0.8rem;
  }

  button:hover:not(:disabled) {
    background-color: #555;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }

  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0.3; }
    100% { opacity: 1; }
  }

  @keyframes bounce {
    from { transform: translateY(0); }
    to { transform: translateY(-5px); }
  }
</style>
