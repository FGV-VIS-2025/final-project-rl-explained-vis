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
  <title>What is Reinforcement Learning?</title>
</svelte:head>

<div class="container">
  <h1>The Idea Behind Reinforcement Learning</h1>

  <p>The idea behind Reinforcement Learning is that an agent (an AI) will learn from the environment by interacting with it (through trial and error) and receiving rewards (negative or positive) as feedback for performing actions.</p>

  <p>Learning from interactions with the environment comes from our natural experiences.</p>

  <p>For instance, imagine putting your little brother in front of a video game he never played, giving him a controller, and leaving him alone.</p>

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
              <img src="/pacman.png" alt="Avatar" class="avatar-icon"/>
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
    <p>Your brother will interact with the environment (the video game) by pressing the right button (action). He got a coin, that's a +1 reward. It's positive, he just understood that in this game he must get the coins.</p>

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
                    <img src="/pacman.png" alt="Avatar" class="avatar-icon"/>
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

    <p>But then, he presses the right button again and he falls into a hole. He just died, so that's a -1 reward.</p>

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
                    <img src="/pacman.png" alt="Avatar" class="avatar-icon"/>
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

    <p>By interacting with his environment through trial and error, your little brother understands that he needs to get coins in this environment but avoid the enemies. Without any supervision, the child will get better and better at playing the game.</p>

    <p>That's how humans and animals learn, through interaction. Reinforcement Learning is just a computational approach of learning from actions.</p>

    <div class="button-container column">
      <button class="large-button">
        <a href="/teorical_explanation" style="text-decoration: none; color: inherit;">A Formal Definition</a>
      </button>
      <button on:click={resetDemo} class="small-button">Restart</button>
    </div>
  {/if}

  <!-- Botões de controle -->
  {#if currentStep < 2}
    <div class="button-container">
      <button on:click={nextStep} disabled={currentStep >= 3}>Next Step</button>
      <button on:click={resetDemo}>Restart</button>
    </div>
  {/if}

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

  .button-container.column {
    flex-direction: column;
    gap: 1em;
    margin: 2em auto;
  }

  .large-button {
    width: 100%;
    max-width: 400px;
    padding: 15px 20px;
    font-size: 1.2rem;
    margin: 0 auto;
  }

  .small-button {
    width: auto;
    max-width: 120px;
    padding: 8px 15px;
    font-size: 0.7rem;
    margin: 0 auto;
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
