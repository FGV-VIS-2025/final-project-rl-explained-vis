<script>
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';

    function handleFirstAction() {
    goto(`${base}/explained`); // Prepend the base path
  }

  function handleSecondAction() {
    goto(`${base}/visualization`); // Prepend the base path
  }
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Press+Start+2P&display=swap" rel="stylesheet">
  <div class="center-box">
    <div class="text-box">
        Reinforcement Learning is a subfield of machine learning that differs from others.
        With the goal of demystifying what this learning is, we decided to show how this learning occurs.
        Here you will be able to both learn dynamically what reinforcement learning is
        and understand interactively how it works, being able to play with a toy model and control its parameters.
    </div>

    <div class="button-group">
      <button class= "btn-handle" on:click={handleFirstAction}>What is Reinforcement Learning?</button>
      <button class= "btn-handle" on:click={handleSecondAction}>Learn Interactively</button>
    </div>
  </div>

  <style>
    /* Centraliza tudo no meio da tela */
    .btn-handle {
    padding: 6px 12px;
    cursor: pointer;
    background-color: #9a5bf4; /* tom roxo da imagem */
    color: white;
    font-family: 'Press Start 2P', monospace; /* estilo pixel retro */
    font-size: 1em;
    text-transform: none;
    display: inline-block;
    text-align: center;
}
    .center-box {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #444;
      color: white;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
      text-align: center;
      min-height: 40vh;
      min-width: 60vw;
    }

    .text-box {
        font-family: "Lato", sans-serif;
        text-align: justify;
        margin-left: 5rem;
        margin-right: 5rem;
        margin-bottom: 1rem;
        font-size: 1.5rem;
    }
    /* .center-box h2 {
      font-family: "Lato", sans-serif;
      font-size: 2rem;
      margin-bottom: 20px;
    } */

    .button-group {
      display: flex;
      gap: 15px;
      justify-content: center;
    }


  </style>
