<script>
    import { onMount } from "svelte";
    import { q_learning } from "$lib/q_learning.js";
    import * as d3 from "d3";
    import QTableArrows from "$lib/QTableArrows.svelte";
    import QTableValues from "$lib/QTableValues.svelte";
    import EnvironmentGrid from "$lib/EnvironmentGrid.svelte";
    import AccuracyChart from "$lib/AccuracyChart.svelte";
    import ChangeParams from "$lib/ChangeParams.svelte";
    import ChangeGrid from "$lib/ChangeGrid.svelte";
    import InfoTooltip from "$lib/InfoTooltip.svelte";
    import Icon from "$lib/Icons.svelte";

    //Grid Params
    let world_width = 5;
    let world_height = 5;
    let start = [0, 0];
    let goal = [4, 4];
    let holes = [
        [1, 2],
        [2, 3],
        [3, 1],
        [4, 0],
        [0, 2],
        [4, 3],
    ];

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
            max_steps,
        });
        agent_positions_data = agent_positions;
        q_tables_data = q_tables;
        success_rates_data = success_rates;
        currentEpisode = success_rates_data.length - 1;
        currentStep = 0;
        stopAnimation();
    }

    onMount(() => {
        initializeQLearning();
    });

    // Derived state for current agent position
    $: currentAgentPosition =
        agent_positions_data[currentEpisode]?.[currentStep] || start;

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
            currentStep =
                (agent_positions_data[currentEpisode]?.length || 1) - 1;
        }
    }

    function togglePlay() {
        if (playing) {
            stopAnimation();
        } else if (
            !playing &&
            currentEpisode == success_rates_data.length - 1
        ) {
            currentEpisode = 0;
            startAnimation();
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
        if (
            !isNaN(episodeNum) &&
            episodeNum >= 0 &&
            episodeNum < agent_positions_data.length
        ) {
            currentEpisode = episodeNum;
            currentStep = 0; // Reset step when changing episode
        }
    }

    function goToStep(e) {
        const stepNum = parseInt(e.target.value, 10);
        if (
            !isNaN(stepNum) &&
            stepNum >= 0 &&
            stepNum < (agent_positions_data[currentEpisode]?.length || 0)
        ) {
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
    $: playSpeedText =
        currentSpeedIndex === 0
            ? "1X"
            : currentSpeedIndex === 1
              ? "2X"
              : currentSpeedIndex === 2
                ? "5X"
                : "10X";

    $: showParamGrid = false;
    function showParamSetter() {
        showParamGrid = true;
    }

    $: showParamRL = false;
    function showRLSetter() {
        console.log(showParamRL);
        showParamRL = true;
    }

    $: goal = goal;
</script>

<svelte:head>
    <title>Q-Learning Visualization</title>
</svelte:head>

<div class="main-layout">
    <div class="left-panel">
        <div class="buttons-change">
            <button class="btn-change" on:click={showParamSetter}>
                Alterar Parâmetros do Grid
            </button>
            {#if showParamGrid}
                <ChangeGrid
                    on:configUpdated={initializeQLearning}
                    bind:showconfig={showParamGrid}
                    bind:world_width
                    bind:world_height
                    bind:hole_positions={holes}
                    bind:start_position={start}
                    bind:goal_position={goal}
                />
            {/if}

            <button class="btn-change" on:click={showRLSetter}>
                Alterar parâmetros RL
            </button>
            {#if showParamRL}
                <ChangeParams
                    on:paramsUpdated={initializeQLearning}
                    bind:alpha
                    bind:gamma
                    bind:epsilon
                    bind:epsilon_decay
                    bind:num_episodes
                    bind:max_steps
                    bind:showParamRL
                />
            {/if}
        </div>
        <div class="player-controls">
            <button class="play-btn" on:click={togglePlaySpeed}
                >{playSpeedText}</button
            >
            <!-- Botão de reset -->
            <button on:click={initializeQLearning} title="Reset">
                <Icon name="reset" color="white"></Icon>
            </button>

            <!-- Botão anterior -->
            <button on:click={prevStep} title="Previous Step">
                <Icon name="previous"></Icon>
            </button>

            <!-- Botão play/pause -->
            <button on:click={togglePlay} title={playing ? "Pause" : "Play"}>
                {#if playing}
                    <Icon name="pause"></Icon>
                {:else}
                    <Icon name="play"></Icon>
                {/if}
            </button>

            <!-- Botão próximo -->
            <button on:click={nextStep} title="Next Step">
                <Icon name="next"></Icon>
            </button>

            <!-- Episode Slider -->
            <div class="episode-slider">
                <label for="episodeSlider">
                    Ep: {currentEpisode + 1}/{agent_positions_data.length}
                </label>
                <input
                    type="range"
                    id="episodeSlider"
                    min="0"
                    max={agent_positions_data.length > 0
                        ? agent_positions_data.length - 1
                        : 0}
                    bind:value={currentEpisode}
                    on:input={goToEpisode}
                    disabled={agent_positions_data.length === 0}
                />
            </div>
        </div>
        <div class="grid-display-wrapper-env">
            <EnvironmentGrid
                {world_width}
                {world_height}
                {start}
                {goal}
                bind:holes
                {currentAgentPosition}
            />
        </div>
    </div>
    <div class="right-panel">
        <div class="grids-and-chart-wrapper">
            <div class="grids-wrapper">
                <div class="grid-display-wrapper">
                    {#if currentQTable}
                        <QTableArrows
                            qTable={currentQTable}
                            {world_width}
                            {world_height}
                            {start}
                            {goal}
                            {holes}
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
                            {world_width}
                            {world_height}
                            {start}
                            {goal}
                            {holes}
                        />
                    {:else}
                        <p>Carregando visualização da Q-table (Valores)...</p>
                    {/if}
                </div>
            </div>

            <AccuracyChart
                {success_rates_data}
                {currentEpisode}
                width={650}
                height={250}
            />
        </div>
    </div>
</div>

<style>
    .main-layout {
        display: flex;
        justify-content: space-between;
        padding: 20px;
        font-family: Arial, sans-serif;
        background-color: #1e1e1e;
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

    .grid-display-wrapper-env {
        align-items: center;
    }

    .grids-and-chart-wrapper {
        display: flex;
        flex-direction: column;
        gap: 30px;
        width: 100%;
        align-items: center;
    }

    .btn-change {
        padding: 10px 20px;
        cursor: pointer;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        transition: background-color 0.3s ease;
    }

    .btn-change:hover {
        background-color: #0056b3;
    }

    .episode-slider input[type="range"] {
        width: 100%;
        height: 6px;
        background: #ccc;
        border-radius: 3px;
        outline: none;
        margin-top: 8px; /* opcional para espaçamento com o label */
        }

        /* Thumb (a bolinha) - WebKit (Chrome, Safari) */
.episode-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #000;
  cursor: pointer;
  margin-top: 0px; /* centraliza verticalmente em relação à track */
}


    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #00bcd4;
        cursor: pointer;
        margin-top: -6px;
    }

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
        width: fit-content;
    }

    .player-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.5rem;
    }

    .player-controls button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
    }

    .episode-slider {
        flex-grow: 1;
    }

    .play-btn {
        color: #ffffff;
    }

    input[type="range"] {
        width: 100%;
    }
</style>
