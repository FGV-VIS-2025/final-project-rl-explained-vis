<script>
    import { onMount } from 'svelte';
    import { q_learning } from '$lib/q_learning.js';
    import * as d3 from "d3";
    import QTableArrows from '$lib/QTableArrows.svelte';
    import QTableValues from '$lib/QTableValues.svelte';
    import EnvironmentGrid from '$lib/EnvironmentGrid.svelte';
    import AccuracyChart from '$lib/AccuracyChart.svelte';
    import ChangeParams from '$lib/ChangeParams.svelte';
    import ChangeGrid from '$lib/ChangeGrid.svelte';
    import InfoTooltip from '$lib/InfoTooltip.svelte';

    //Grid Params
    let world_width = 5;
    let world_height = 5;
    let start = [0, 0];
    let goal = [4, 4];
    let holes = [[1, 2], [2, 3], [3, 1], [4, 0], [0, 2], [4, 3]];

    let alpha = 0.1;
    let gamma = 0.9;
    let epsilon = 0.1;
    let epsilon_decay = 0.003;
    let num_episodes = 1000;
    let max_steps = 9;

    let agent_positions_data = [];
    let q_tables_data = [];
    let success_rates_data = [];

    let currentEpisode = 0;
    let currentStep = 0;

    let playing = false;
    let intervalId;

    const speeds = [500, 100, 20, 1];
    let currentSpeedIndex = 0;
    let playSpeed = speeds[currentSpeedIndex];

    let svgContainer;

    // Function to initialize or re-run Q-learning
    function initializeQLearning() {
            const { agent_positions, q_tables, success_rates } = q_learning({
            world_width,
            world_height,
            start,
            goal,
            holes,
            alpha,
            gamma,
            epsilon,
            epsilon_decay,     
            num_episodes,
            max_steps
        });
        agent_positions_data = agent_positions;
        q_tables_data = q_tables;
        success_rates_data = success_rates;
        currentEpisode = success_rates_data.length -1;
        currentStep = 0;
        stopAnimation();
    }

    onMount(() => {
        initializeQLearning();
    });

    // Derived state for current agent position
    $: currentAgentPosition = agent_positions_data[currentEpisode]?.[currentStep] || start;

    $: currentQTable = q_tables_data[currentEpisode]?.[currentStep];

    function nextStep() {
        if (!agent_positions_data[currentEpisode]) return;

        if (currentStep < agent_positions_data[currentEpisode].length - 1) {
            currentStep++;
        } else if (currentEpisode < agent_positions_data.length - 1) {
            currentEpisode++;
            currentStep = 0;
        } else {
            stopAnimation();
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            currentStep--;
        } else if (currentEpisode > 0) {
            currentEpisode--;
            currentStep = (agent_positions_data[currentEpisode]?.length || 1) - 1;
        }
    }

    function togglePlay() {
        if (playing) {
            stopAnimation();
        } else {
            startAnimation();
        }
    }

    function startAnimation() {
        playing = true;
        clearInterval(intervalId);
        intervalId = setInterval(nextStep, playSpeed);
    }

    function stopAnimation() {
        playing = false;
        clearInterval(intervalId);
    }

    function goToEpisode(e) {
        const episodeNum = parseInt(e.target.value, 10);
        if (!isNaN(episodeNum) && episodeNum >= 0 && episodeNum < agent_positions_data.length) {
            currentEpisode = episodeNum;
            currentStep = 0; // Reset step when changing episode
        }
    }

    function goToStep(e) {
        const stepNum = parseInt(e.target.value, 10);
        if (!isNaN(stepNum) && stepNum >= 0 && stepNum < (agent_positions_data[currentEpisode]?.length || 0)) {
            currentStep = stepNum;
        }
    }

    // Função para alternar a velocidade de reprodução
    function togglePlaySpeed() {
        currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
        playSpeed = speeds[currentSpeedIndex];
        // Se estiver tocando, reinicia a animação com a nova velocidade
        if (playing) {
            startAnimation();
        }
    }

    // Texto dinâmico para o botão de velocidade
    $: playSpeedText = currentSpeedIndex === 0 ? 'Slow' : currentSpeedIndex === 1 ? 'Mid' : currentSpeedIndex === 2 ? 'Fast' : "Catchau";

    $: showconfig = false;
    function showParamSetter(){
        console.log(showconfig)
        showconfig = true;
    }
</script>

<svelte:head>
    <title>Q-Learning Visualization</title>
</svelte:head>

<div class="main-layout">
    <div class="left-panel">
        <h1>Q-Learning Visualization</h1>

        <div class="grids-and-chart-wrapper">
            <div class="grids-wrapper">
                <div class="grid-display-wrapper">
                    <EnvironmentGrid
                        world_width={world_width}
                        world_height={world_height}
                        start={start}
                        goal={goal}
                        holes={holes}
                        currentAgentPosition={currentAgentPosition}
                    />
                </div>

                <div class="grid-display-wrapper">
                    {#if currentQTable}
                        <QTableArrows
                            qTable={currentQTable}
                            world_width={world_width}
                            world_height={world_height}
                            start={start}
                            goal={goal}
                            holes={holes}
                        />
                    {:else}
                        <p>Carregando visualização da Q-table (Setas)...</p>
                    {/if}
                </div>

                <div class="grid-display-wrapper">
                    {#if currentQTable}
                        <QTableValues
                            allQTables={q_tables_data}
                            qTable={currentQTable}
                            world_width={world_width}
                            world_height={world_height}
                            start={start}
                            goal={goal}
                            holes={holes}
                        />
                    {:else}
                        <p>Carregando visualização da Q-table (Valores)...</p>
                    {/if}
                </div>
            </div>

            <AccuracyChart
                success_rates_data={success_rates_data}
                currentEpisode={currentEpisode}
                width={650}
                height={250}
            />
        </div>
    </div>

    <div class="right-panel">
        <button class="btn-change" on:click={showParamSetter}>
            Alterar Parâmetros do Grid
        </button>
        {#if showconfig}
            <ChangeGrid on:configUpdated={initializeQLearning} 
                bind:showconfig={showconfig}        
                bind:world_width={world_width}
                bind:world_height={world_height}
                bind:hole_positions={holes}
                bind:start_position={start}
                bind:goal_position={goal} />
        {/if}
        <div class="controls">
            <h2>Controles de Simulação</h2>
            <ChangeParams
                on:paramsUpdated={initializeQLearning}
                bind:alpha={alpha}
                bind:gamma={gamma}
                bind:epsilon={epsilon}
                bind:epsilon_decay={epsilon_decay}
                bind:num_episodes={num_episodes}
                bind:max_steps={max_steps}
            />
            
            <div class="episode-and-speed-controls">
                <button on:click={togglePlaySpeed}>{playSpeedText}</button>
                <div class="episode-info">
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
                </div>
            </div>

            <div class="playback-buttons">
                <button on:click={initializeQLearning}>Reset</button>
                <button on:click={prevStep}>Previous Step</button>
                <button on:click={togglePlay}>{playing ? 'Pause' : 'Play'}</button>
                <button on:click={nextStep}>Next Step</button>
            </div>
        </div>
    </div>
</div>

<style>
    .main-layout {
        display: flex;
        justify-content: space-between;
        padding: 20px;
        font-family: Arial, sans-serif;
        background-color: #000000;
        color: #ffffff;
        min-height: 100vh;
        gap: 30px;
    }

    .left-panel {
        flex: 3;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .right-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 20px;
        background-color: #1a1a1a;
        border-radius: 8px;
        gap: 15px;
    }

    h1 {
        margin-bottom: 20px;
    }

    h2 {
        margin-top: 0;
        color: #00bcd4;
    }

    .grids-and-chart-wrapper {
        display: flex;
        flex-direction: column;
        gap: 30px;
        width: 100%;
        align-items: center;
    }

    .controls {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
    }

    .episode-and-speed-controls {
        display: flex;
        align-items: center;
        gap: 15px;
        flex-wrap: nowrap;
        width: 100%;
        justify-content: flex-start;
    }

    .episode-info {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-grow: 1;
    }

    .episode-info label {
        white-space: nowrap;
        flex-shrink: 0;
        min-width: 170px;
        text-align: center;
    }

    .episode-info input[type="range"] {
        flex-grow: 1;
        min-width: 100px;
        margin-top: 0;
        flex-shrink: 1;
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 8px;
        background: #333;
        border-radius: 5px;
        outline: none;
        transition: background 0.2s ease-in-out;
    }

    .episode-info input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #00bcd4;
        cursor: grab;
        margin-top: 0px;
        transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    .episode-info input[type="range"]::-webkit-slider-thumb:hover {
        background-color: #008c9e;
    }

    .episode-info input[type="range"]::-webkit-slider-thumb:active {
        cursor: grabbing;
        background-color: #007bff;
    }

    .episode-and-speed-controls button {
        padding: 8px 15px;
        cursor: pointer;
        background-color: #28a745;
        color: white;
        border: none;
        border-radius: 5px;
        transition: background-color 0.3s ease;
        white-space: nowrap;
        flex-shrink: 0;
        min-width: 80px;
        min-height: 35px;
        text-align: center;
    }

    .episode-and-speed-controls button:hover {
        background-color: #218838;
    }

    .playback-buttons {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 10px;
    }

    .playback-buttons button, .btn-change {
        padding: 10px 20px;
        cursor: pointer;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        transition: background-color 0.3s ease;
    }

    .playback-buttons button:hover, .btn-change:hover {
        background-color: #0056b3;
    }

    /* input[type="range"] {
        width: 100%;
        margin-top: 5px;
        background: #333;
        height: 8px;
        border-radius: 5px;
        outline: none;
    } */

    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #00bcd4;
        cursor: pointer;
        margin-top: -6px;
    }

    /* input[type="number"] {
        width: 100%;
        padding: 8px;
        border: 1px solid #333;
        background-color: #222;
        color: white;
        border-radius: 4px;
        margin-top: 5px;
    } */

    label {
        margin-top: 10px;
        font-weight: bold;
    }

    .grids-wrapper {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 20px;
        margin-bottom: 30px;
    }

    .grid-display-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-top: 20px;
        width: fit-content;
    }
</style>