<script>
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  function returnStart()
  {
    goto(`${base}/`);
  }
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DotGothic16&family=Pixelify+Sans:wght@400..700&family=Press+Start+2P&family=Tiny5&family=VT323&display=swap" rel="stylesheet">

<header>
<h1 on:click|preventDefault={returnStart} role="button" tabindex="0" style="cursor: pointer;">
  Reinforcement Learning
</h1>
</header>

<slot></slot>


<style>
    :global(body) {
        margin: 0;
        padding: 0;
        background-color: #1e1e1e;
        color: white;
        font-family: "Press Start 2P";

    }

    header {
        display: flex;
        justify-content: center;
        align-items: center;
    }


    h1 {
        font-family: "Press Start 2P", sans-serif;
        font-size: 1.5rem;
        text-align: center;
        color: white;
        white-space: nowrap;
        overflow: hidden;
        border-right: 2px solid white;
        width: 0; 
        animation: typing 3s steps(22, end) forwards,
                   blink 0.7s step-end infinite,
                   shake 2s infinite;
    }




    @keyframes typing {
      from { width: 0 }
      to { width: 22ch } /* 26 characters in "Reinforcement Learning" */
    }

    @keyframes blink {
      50% { border-color: transparent }
    }
</style>
