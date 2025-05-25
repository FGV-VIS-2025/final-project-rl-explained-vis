<script>
    import { onMount, onDestroy } from 'svelte';
    import * as d3 from 'd3';
    import {
        world_width,
        world_height,
        start_position,
        goal_position,
        hole_positions,
        q_learning_params
    } from '$lib/stores.js';
    import { q_learning } from '$lib/q_learning.js';
    import Change from '$lib/change.svelte'; 

    // Estados para a Visualização do Q-Learning
    let agent_positions_data = [];
    let q_tables_data = [];
    let success_rates_data = [];

    // Variáveis reativas para a visualização
    let currentEpisode = 0;
    let currentStep = 0;
    let playing = false;
    let playSpeed = 200;
    let playInterval;

    // Variáveis para o grid e o agente
    let currentGrid = []; // A representação do grid (para 'S', 'G', 'H')
    let currentAgentPosition = [0, 0];
    let currentQTable = {};

    // As variáveis do gridworld (start, goal, holes, width, height) serão pegas dos stores
    // $world_width, $world_height, $start_position, $goal_position, $hole_positions

    // === Stores Svelte: Reativas e Dinâmicas ===
    // Svelte facilita pegar os valores atuais dos stores com o prefixo '$'
    $: world_width_val = $world_width;
    $: world_height_val = $world_height;
    $: start_val = $start_position;
    $: goal_val = $goal_position;
    $: holes_val = $hole_positions;
    $: q_params_val = $q_learning_params; // Pegar os parâmetros do Q-Learning

    // === Variáveis Reativas para o Grid e Agente ===
    // Essas variáveis são recalculadas automaticamente quando suas dependências mudam
    $: {
        currentAgentPosition = agent_positions_data[currentEpisode]?.[currentStep] || start_val;
        // console.log("Current Agent Position updated:", currentAgentPosition); // Para depuração
    }

    $: {
        const episodeQTables = q_tables_data[currentEpisode] || [];
        const stepQTable = episodeQTables[currentStep];
        if (stepQTable) {
            currentQTable = stepQTable[`${currentAgentPosition[0]},${currentAgentPosition[1]}`] || {};
            // console.log("Current Q-Table for cell updated:", currentQTable); // Para depuração
        } else {
            currentQTable = {};
        }
    }

    $: {
        // Recria o grid base (S, G, H) sempre que as configurações do mundo mudam
        currentGrid = Array.from({ length: world_height_val }, (_, r) =>
            Array.from({ length: world_width_val }, (_, c) => ' ')
        );

        if (start_val[0] !== -1 && start_val[1] !== -1) { // Verifica se é um ponto válido
            currentGrid[start_val[0]][start_val[1]] = 'S';
        }
        if (goal_val[0] !== -1 && goal_val[1] !== -1) { // Verifica se é um ponto válido
            currentGrid[goal_val[0]][goal_val[1]] = 'G';
        }

        for (const [r, c] of holes_val) {
            if (currentGrid[r] && currentGrid[r][c] !== undefined) { // Evita erro se buraco fora dos limites
                if ((r !== start_val[0] || c !== start_val[1]) && (r !== goal_val[0] || c !== goal_val[1])) {
                    currentGrid[r][c] = 'H';
                }
            }
        }
    }

    // === Funções de Controle da Visualização ===

    function goToEpisode() {
        // Garante que o passo atual não exceda o número de passos do novo episódio
        if (agent_positions_data[currentEpisode]) {
            currentStep = Math.min(currentStep, agent_positions_data[currentEpisode].length - 1);
        } else {
            currentStep = 0; // Se o episódio não tiver dados, reseta o passo
        }
        stopPlay(); // Para a reprodução ao mudar de episódio
    }

    function goToStep() {
        stopPlay(); // Para a reprodução ao mudar de passo
    }

    function nextStep() {
        if (currentStep < (agent_positions_data[currentEpisode]?.length || 0) - 1) {
            currentStep++;
        } else if (currentEpisode < agent_positions_data.length - 1) {
            currentEpisode++;
            currentStep = 0; // Vai para o próximo episódio, começando do primeiro passo
        } else {
            stopPlay(); // Chegou ao fim
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            currentStep--;
        } else if (currentEpisode > 0) {
            currentEpisode--;
            // Vai para o último passo do episódio anterior
            currentStep = (agent_positions_data[currentEpisode]?.length || 0) - 1;
        }
        stopPlay(); // Para a reprodução ao ir para trás
    }

    function togglePlay() {
        playing = !playing;
        if (playing) {
            playInterval = setInterval(nextStep, playSpeed);
        } else {
            stopPlay();
        }
    }

    function stopPlay() {
        if (playInterval) {
            clearInterval(playInterval);
            playInterval = null;
        }
        playing = false;
    }

    // === Lógica de Inicialização e Re-execução do Q-Learning ===

    // Função para chamar o algoritmo Q-Learning
    function initializeQLearning() {
        stopPlay(); // Para qualquer reprodução em andamento

        const config = {
            world_width: $world_width,
            world_height: $world_height,
            alpha: $q_learning_params.alpha,
            gamma: $q_learning_params.gamma,
            epsilon: $q_learning_params.epsilon,
            epsilon_decay: $q_learning_params.epsilon_decay,
            num_episodes: $q_learning_params.num_episodes,
            max_steps: $q_learning_params.max_steps,
            step_punishment: $q_learning_params.step_punishment,
            hole_punishment: $q_learning_params.hole_punishment,
            goal_reward: $q_learning_params.goal_reward,
            start: $start_position,
            goal: $goal_position,
            holes: $hole_positions,
        };

        console.log("Iniciando Q-Learning com configuração:", config);
        const results = q_learning(config);

        agent_positions_data = results.agent_positions;
        q_tables_data = results.q_tables;
        success_rates_data = results.success_rates;

        // Resetar para o primeiro episódio/passo para iniciar a visualização
        currentEpisode = 0;
        currentStep = 0;
        get_accuracy(svgContainer, 1000, 300, success_rates_data)


        // Iniciar a reprodução automaticamente após rodar o Q-Learning
        // togglePlay(); // Pode comentar se não quiser que comece a tocar automaticamente
    }
    let svgContainer; // Referência ao elemento SVG
    // === Gerenciamento do Ciclo de Vida do Componente ===


    function get_accuracy(svgContainer ,width, height, success_rates_data){
        d3.select(svgContainer).selectAll("path").remove();
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };

        const svg = d3
            .select(svgContainer)
            .attr("width", width)
            .attr("height", height);

        const x = d3
            .scaleLinear()
            .domain([0, success_rates_data.length - 1])
            .range([margin.left, width - margin.right]);

        const y = d3
            .scaleLinear()
            .domain([0, 100])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const line = d3
            .line()
            .x((d, i) => x(i))
            .y((d) => y(d));

        const tickInterval = 100;
        const xTicks = [];

        for (let i = 0; i <= success_rates_data.length; i += tickInterval) {
            xTicks.push(i);
        }

        console.log(xTicks);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).tickValues(xTicks));

        svg.append("path")
            .datum(success_rates_data)
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("d", line);

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));
    }

    

    $: showconfig = false;
    function showParamSetter(){
        showconfig = true;
    }
    function unShowParamSetter(){
        showconfig = false;
    }

    onMount(() => {
    // Inicializa o Q-Learning quando o componente é montado pela primeira vez
    initializeQLearning();
    });

    onDestroy(() => {
        // Limpa o intervalo quando o componente é destruído para evitar vazamento de memória
        stopPlay();
    });

</script>

<svelte:head>
    <title>Q-Learning Visualization</title>
</svelte:head>

<button class="btn-change" on:click={showParamSetter}>
    alterar param
</button>
{#if showconfig}
    <Change on:configUpdated={initializeQLearning} bind:showconfig={showconfig}/>
{/if}

<div class="container">
    <h1>Q-Learning Visualization</h1>

    <div class="controls">
        <label for="episodeSlider">Episode: {currentEpisode + 1}/{agent_positions_data.length}</label>
        <input
            type="range"
            id="episodeSlider"
            min="0"
            max={agent_positions_data.length > 0 ? agent_positions_data.length - 1 : 0}
            bind:value={currentEpisode}
            on:input={goToEpisode}
            disabled={agent_positions_data.length === 0}
        />

        <label for="stepSlider">Step: {currentStep + 1}/{agent_positions_data[currentEpisode]?.length || 0}</label>
        <input
            type="range"
            id="stepSlider"
            min="0"
            max={agent_positions_data[currentEpisode]?.length ? agent_positions_data[currentEpisode].length - 1 : 0}
            bind:value={currentStep}
            on:input={goToStep}
            disabled={!agent_positions_data[currentEpisode]}
        />

        <div class="playback-buttons">
            <button on:click={prevStep}>Previous Step</button>
            <button on:click={togglePlay}>{playing ? 'Pause' : 'Play'}</button>
            <button on:click={nextStep}>Next Step</button>
        </div>

        <label for="playSpeed">Play Speed (ms):</label>
        <input type="number" id="playSpeed" bind:value={playSpeed} min="50" max="1000" step="50" />

        <button on:click={initializeQLearning}>Rerun Q-Learning</button>
    </div>

    <div class="grid-container" style="--grid-width: {world_width_val}; --grid-height: {world_height_val};">
        {#each currentGrid as row, r (r)}
            {#each row as cell, c (c)}
                <div
                    class="cell"
                    class:start={r === start_val[0] && c === start_val[1]}
                    class:goal={r === goal_val[0] && c === goal_val[1]}
                    class:hole={holes_val.some(h => h[0] === r && h[1] === c)}
                    class:agent={r === currentAgentPosition[0] && c === currentAgentPosition[1]}
                >
                    {cell}
                </div>
            {/each}
        {/each}
    </div>

    <div class="info-panel">
        <h2>Current Q-Values for Agent's Cell ({currentAgentPosition[0]}, {currentAgentPosition[1]}):</h2>
        <ul>
            {#each Object.entries(currentQTable) as [action, value]}
                <li>{action}: {value.toFixed(2)}</li>
            {/each}
        </ul>

        <h2>Success Rate (Current Episode):</h2>
        <p>{success_rates_data[currentEpisode] || 'N/A'}%</p>
    </div>

    <svg bind:this={svgContainer}></svg>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        font-family: Arial, sans-serif;
    }

    .controls {
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
        max-width: 500px;
    }

    .playback-buttons button {
        margin: 0 5px;
        padding: 8px 15px;
        cursor: pointer;
    }

    .grid-container {
        display: grid;
        grid-template-columns: repeat(var(--grid-width), 50px);
        grid-template-rows: repeat(var(--grid-height), 50px);
        margin-top: 20px;
        border: 2px solid #333; /* Borda mais visível para o grid */
    }

    .cell {
        width: 50px;
        height: 50px;
        border: 1px solid #ccc; /* Borda interna para cada célula */
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        background-color: #f9f9f9;
        position: relative;
    }

    .cell.start {
        background-color: #d4edda; /* Light green */
    }

    .cell.goal {
        background-color: #d1ecf1; /* Light blue */
    }

    .cell.hole {
        background-color: #f8d7da; /* Light red */
    }

    .cell.agent {
        background-color: #ffeeba; /* Light yellow */
        border: 2px solid #ffc107;
        box-sizing: border-box; /* Include padding and border in the element's total width and height */
    }

    .info-panel {
        margin-top: 30px;
        padding: 20px;
        border: 1px solid #eee;
        border-radius: 8px;
        background-color: #f5f5f5;
        color: #000;
        width: 100%;
        max-width: 500px;
    }

    .info-panel ul {
        list-style: none;
        padding: 0;
    }

    .info-panel li {
        margin-bottom: 5px;
    }
</style>