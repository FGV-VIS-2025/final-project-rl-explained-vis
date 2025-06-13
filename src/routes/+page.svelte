<script>
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';

    function goToVisualization() {
        goto(`${base}/visualization`);
    }

    function goToExplanation() {
        goto(`${base}/explained`);
    }

    function goToTheory() {
        goto(`${base}/teorical_explanation`);
    }
</script>

<svelte:head>
    <title>Reinforcement Learning Visualized</title>
</svelte:head>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Press+Start+2P&display=swap" rel="stylesheet">

<div class="main-container">
    <div class="visualization-showcase">
        <div class="showcase-content">
            <h2>Interactive Visualization</h2>
            <p>Explore how reinforcement learning works by interacting with a live model. Adjust parameters, watch the agent learn, and see the results in real time.</p>
            <button class="btn-primary" on:click={goToVisualization}>
                Start Exploring
            </button>
        </div>
    </div>

    <div class="learning-section">
        <div class="explanation-card">
            <h3>What is Reinforcement Learning?</h3>
            <p>Understand the basic concepts behind reinforcement learning through an interactive, step-by-step explanation with visual examples.</p>
            <button class="btn-secondary" on:click={goToExplanation}>
                Learn the Basics
            </button>
        </div>

        <div class="explanation-card">
            <h3>Formal Definition</h3>
            <p>Dive deeper into the theory with formal definitions of agents, environments, policies, and rewards in reinforcement learning.</p>
            <button class="btn-secondary" on:click={goToTheory}>
                Explore Theory
            </button>
        </div>
    </div>

    <div class="about-section">
        <h2>About This Project</h2>
        <div class="about-content">
            <p>This interactive learning platform helps demystify reinforcement learning by combining visual explanations with hands-on exploration. Our main focus is the interactive visualization that lets you control the learning process and see how RL works using Q-learning.</p>
            <p>This project was developed as part of the Data Visualization course at FGV.</p>
        </div>

        <div class="authors-section">
            <h3>Developed by</h3>
            <div class="authors-list">
                <a href="https://github.com/kauanmaf" class="author-link" target="_blank" rel="noopener noreferrer">
                    <div class="author-card">
                        <span class="author-name">Kauan Mariani Ferreira</span>
                        <span class="github-icon">GitHub</span>
                    </div>
                </a>
                <a href="https://github.com/PedroPHC25" class="author-link" target="_blank" rel="noopener noreferrer">
                    <div class="author-card">
                        <span class="author-name">Pedro Henrique Coterli</span>
                        <span class="github-icon">GitHub</span>
                    </div>
                </a>
                <a href="https://github.com/gtironi" class="author-link" target="_blank" rel="noopener noreferrer">
                    <div class="author-card">
                        <span class="author-name">Gustavo Tironi</span>
                        <span class="github-icon">GitHub</span>
                    </div>
                </a>
            </div>
        </div>
    </div>
</div>

<style>
    /* Letra média */
    h2 {
        font-family: 'Press Start 2P', monospace;
        font-size: 1.2rem;
        margin-top: 1rem;
        margin-bottom: 1.2rem;
        color: white;
    }

    /* Letra menor */
    h3 {
        font-family: 'Press Start 2P', monospace;
        font-size: 1rem;
        margin-bottom: 1.2rem;
        color: white;
    }

    /* Muda o estilo do paragrafo*/
    p {
        font-family: "Lato", sans-serif;
        font-size: 1rem;
        color: white;
        margin-bottom: 1.5rem;
    }

    .main-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
    }

    /* Box da viz */
    .visualization-showcase {
        background-color: #2d2d2d;
        border-radius: 12px;
        padding: 2rem;
        margin-bottom: 2rem;
        text-align: center;
    }

    /* Muda espaço do paragrafo*/
    .showcase-content p {
        font-size: 1.2rem;
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
    }

    /* Box das explicaçẽos em 2 colunas*/
    .learning-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        margin-bottom: 2rem;
    }

    .explanation-card {
        background-color: #2d2d2d;
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
    }

    /* Box d osobre*/
    .about-section {
        background-color: #2d2d2d;
        border-radius: 12px;
        padding: 2rem;
        margin-bottom: 2rem;
        text-align: center;
    }

    .about-content {
        max-width: 800px;
        margin: 0 auto 2rem;
    }

    /* Aumenta um pouco a letra*/
    .about-section p {
        font-size: 1.1rem;
    }

    /* Botoes da Viz */
    .btn-primary {
        background-color: #9a5bf4;
        color: white;
        font-family: 'Press Start 2P', monospace;
        font-size: 1.2rem;
        padding: 1rem 2rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
    }

    .btn-primary:hover {
        background-color: #b278ff;
    }

    /* Botões das explicações */
    .btn-secondary {
        background-color: #9a5bf4;
        color: white;
        font-family: 'Press Start 2P', monospace;
        font-size: 0.8rem;
        padding: 0.8rem 1.5rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
    }

    .btn-secondary:hover {
        background-color: #b278ff;
    }

    /* Autores */
    .authors-section {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid #444;
    }

    /* Coloca os autores lado a lado */
    .authors-list {
        display: flex;
        justify-content: center;
        gap: 2rem;
    }

    .author-link {
        text-decoration: none;
        color: inherit;
    }

    /* Cria um box bonitinho para os autores */
    .author-card {
        background-color: #333;
        border: 2px solid #444;
        border-radius: 8px;
        padding: 1rem 1.5rem;
        text-align: center;
    }

    .author-link:hover .author-card {
        border-color: #9a5bf4;
    }

    .author-name {
        font-family: "Lato", sans-serif;
        font-weight: bold;
        color: white;
        margin-bottom: 0.5rem;
    }

    /* Firula para ficar bonito*/
    .github-icon {
        font-family: "Press Start 2P", monospace;
        font-size: 0.6rem;
        color: #9a5bf4;
        padding: 0.3rem 0.6rem;
        background-color: #222;
        border-radius: 4px;
    }
</style>
