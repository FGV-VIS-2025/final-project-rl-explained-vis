<script>
    import { onMount } from 'svelte';
    import { q_learning } from '$lib/q_learning.js';
    import * as d3 from "d3";
    import QTableArrows from '$lib/QTableArrows.svelte';
    import QTableValues from '$lib/QTableValues.svelte';
    import EnvironmentGrid from '$lib/EnvironmentGrid.svelte';
    import AccuracyChart from '$lib/AccuracyChart.svelte';

    let world_width = 5;
    let world_height = 5;
    let start = [0, 0];
    let goal = [4, 4];
    let holes = [[1, 2], [2, 3], [3, 1], [4, 0], [0, 2], [4, 3]];

    let agent_positions_data = [];
    let q_tables_data = [];
    let success_rates_data = [];

    let currentEpisode = 0;
    let currentStep = 0;

    let playing = false;
    let intervalId;
    let playSpeed = 2; // milliseconds

    let svgContainer;

    // Function to initialize or re-run Q-learning
    function initializeQLearning() {
        const { agent_positions, q_tables, success_rates } = q_learning({
            world_width,
            world_height,
            start,
            goal,
            holes
        });
        agent_positions_data = agent_positions;
        q_tables_data = q_tables;
        success_rates_data = success_rates;
        currentEpisode = 0;
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

</script>

<svelte:head>
	<title>Q-Learning Visualization</title>
</svelte:head>

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
        width={750}
        height={250}
    />

    <!-- <div class="info-panel">
        <h2>Current Q-Values for Agent's Cell ({currentAgentPosition[0]}, {currentAgentPosition[1]}):</h2>
        <ul>
            {#each Object.entries(currentQTable) as [action, value]}
                <li>{action}: {value.toFixed(2)}</li>
            {/each}
        </ul>

        <h2>Success Rate (Last 100 Episodes):</h2>
        <p>{success_rates_data[currentEpisode]}%</p>
    </div> -->
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        font-family: Arial, sans-serif;
        background-color: #000000;
        color: #ffffff;
        min-height: 100vh;
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