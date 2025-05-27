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

    let width_icon = 19
</script>

<svelte:head>
    <title>Q-Learning Visualization</title>
</svelte:head>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DotGothic16&family=Pixelify+Sans:wght@400..700&family=Press+Start+2P&family=Tiny5&family=VT323&display=swap" rel="stylesheet">

<div class="main-layout">
    <div class="left-panel">
        <div class="buttons-change">
            <button class="btn-change" on:click={showParamSetter}>
                Parâmetros Grid
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
                Parâmetros RL
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
                <Icon width_icon = {width_icon} name="reset" color="white"></Icon>
            </button>

            <!-- Botão anterior -->
            <button on:click={prevStep} title="Previous Step">
                <Icon width_icon = {width_icon} name="previous"></Icon>
            </button>

            <!-- Botão play/pause -->
            <button on:click={togglePlay} title={playing ? "Pause" : "Play"}>
                {#if playing}
                    <Icon width_icon = {width_icon} name="pause"></Icon>
                {:else}
                    <Icon width_icon = {width_icon} name="play"></Icon>
                {/if}
            </button>

            <!-- Botão próximo -->
            <button on:click={nextStep} title="Next Step">
                <Icon width_icon = {width_icon} name="next"></Icon>
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
                success_rates_data={success_rates_data}
                bind:currentEpisode={currentEpisode}
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
    padding: 6px 12px;
    cursor: pointer;
    background-color: #9a5bf4; /* tom roxo da imagem */
    color: white;
    border: 2px solid black;
    border-radius: 0; /* estilo quadrado */
    font-family: 'Press Start 2P', monospace; /* estilo pixel retro */
    font-size: 10px;
    text-transform: none;
    letter-spacing: 1px;
    display: inline-block;
    text-align: center;
}



    .btn-change:hover {
        background-color: #0056b3;
    }

    /* .episode-slider input[type="range"] {
        background-color: #9a5bf4;
        width: 100%;
        height: 6px;
        background: #ccc;
        border-radius: 3px;
        outline: none;
        margin-top: 8px;
        }
        .episode-slider input[type="range"]::-moz-range-track {
    width: 100%;
    height: 6px;
    background: #9a5bf4; 
    border-radius: 3px;
    cursor: pointer;
}
.episode-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #000;
  cursor: pointer;
  margin-top: 0px; 
}


    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #00bcd4;
        cursor: pointer;
        margin-top: -6px;
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
        width: fit-content;
    }

    .player-controls {
        display: flex;
        font-size: 0.8rem;
        align-items: center;
        gap: 0.5rem;
        padding-top: 1rem;
        padding-right: 4rem;
        padding-left: 4rem;
        padding-bottom: 1rem;
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
    .episode-slider input[type="range"] {
    -webkit-appearance: none; /* Remove o estilo padrão do navegador para Webkit */
    appearance: none; /* Estilo padrão */
    width: 100%;
    height: 6px;
    background: transparent; /* Torna o fundo do input transparente para que a barra de progresso personalizada seja visível */
    border-radius: 3px;
    outline: none;
    margin-top: 8px;
}

/* Estilo para a barra de progresso (o "track") */
.episode-slider input[type="range"]::-webkit-slider-runnable-track {
    width: 100%;
    height: 6px;
    background: #9a5bf4; /* A cor que você quer para a barra */
    border-radius: 3px;
    cursor: pointer;
}

.episode-slider input[type="range"]::-moz-range-track {
    width: 100%;
    height: 6px;
    background: #9a5bf4; /* A cor que você quer para a barra */
    border-radius: 3px;
    cursor: pointer;
}

.episode-slider input[type="range"]::-ms-track {
    width: 100%;
    height: 6px;
    background: transparent; /* Necessário para MS Edge/IE para o track */
    border-color: transparent;
    color: transparent;
    cursor: pointer;
}

.episode-slider input[type="range"]::-ms-fill-lower {
    background: #9a5bf4; /* Cor da parte "preenchida" para MS Edge/IE */
    border-radius: 3px;
}

.episode-slider input[type="range"]::-ms-fill-upper {
    background: #ccc; /* Cor da parte "não preenchida" para MS Edge/IE */
    border-radius: 3px;
}


/* Estilo para o "polegar" (o "thumb") */
.episode-slider input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none; /* Remove o estilo padrão do navegador para Webkit */
    height: 18px; /* Tamanho do thumb */
    width: 18px; /* Tamanho do thumb */
    border-radius: 50%; /* Para torná-lo redondo */
    background: #ffffff; /* Cor do thumb (verde para contraste) */
    cursor: pointer;
    margin-top: -6px; /* Ajuste para centralizar o thumb na track */
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; /* Sombra opcional */
}

.episode-slider input[type="range"]::-moz-range-thumb {
    height: 18px;
    width: 18px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    box-shadow: 1px 1px 1px #ffffff, 0px 0px 1px #0d0d0d;
}

.episode-slider input[type="range"]::-ms-thumb {
    height: 18px;
    width: 18px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    margin-top: 0px; /* IE/Edge lidam com a posição do thumb de forma diferente */
    box-shadow: 1px 1px 1px #ffffff, 0px 0px 1px #0d0d0d;
}

    input[type="range"] {
        width: 100%;
    }
</style>
