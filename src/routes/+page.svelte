<script>
    import { goto } from '$app/navigation';

    function handleFirstAction() {
      goto("/explained");
      
    }
    
    function handleSecondAction() {
        goto("/visualization");
    }
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Press+Start+2P&display=swap" rel="stylesheet">
  <div class="center-box">
    <div class="text-box">
        Reinforcement Learning é uma subárea do aprendizado de máquina, a qual difere. 
        Com o objetivo de desmistificar o que é tal aprendizado, decidimos mostrar como esse aprendizado ocorre. 
        Aqui você conseguirá tanto aprender de um jeito dinâmico o que é o  reinforcement learning
        quanto entender interativamente como ele funciona, podendo brincar com um toy model e contorlando os parâmentros. 
    </div>

    <div class="button-group">
      <button on:click={handleFirstAction}>O que é Reinforcement Learning?</button>
      <button on:click={handleSecondAction}>Aprender interativamente</button>
    </div>
  </div>
  
  <style>
    /* Centraliza tudo no meio da tela */
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
  
    button {
      font-family: "Lato", sans-serif;
      background-color: #444;
      color: white;
      border: 2px solid white;
      padding: 10px 20px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      font-size: 1rem;
    }
  
    button:hover {
      background-color: #666;
    }
  </style>
  