<script>
    import { onMount } from 'svelte';
    import { q_learning } from '$lib/q_learning.js';
    import * as d3 from "d3";
    import QTableArrows from '$lib/QTableArrows.svelte';
    import QTableValues from '$lib/QTableValues.svelte';

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

    function get_accuracy(svgContainer ,width, height, success_rates_data){
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };

        const svg = d3
            .select(svgContainer)
            .attr("width", width)
            .attr("height", height);

        const x = d3
            .scaleLinear()
            .domain([0, q_tables_data.length > 0 ? q_tables_data.length - 1 : 0])
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

        svg.selectAll("*").remove();
            const totalEpisodes = q_tables_data.length;
    
        for (let i = 0; i <= totalEpisodes; i += tickInterval) {
            xTicks.push(i);
        }

        if (totalEpisodes > 0 && xTicks[xTicks.length - 1] < totalEpisodes - 1) {
            xTicks.push(totalEpisodes - 1);
        }

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

        if (success_rates_data.length > 0) {
            const lastDataPoint = success_rates_data[success_rates_data.length - 1];
            const lastEpisodeIndex = success_rates_data.length - 1;

            svg.append("circle")
                .attr("cx", x(lastEpisodeIndex))
                .attr("cy", y(lastDataPoint))
                .attr("r", 5)
                .attr("fill", "blue")
                .attr("stroke", "white")
                .attr("stroke-width", 1.5);

            svg.append("line")
                .attr("x1", x(lastEpisodeIndex))
                .attr("y1", margin.top)
                .attr("x2", x(lastEpisodeIndex))
                .attr("y2", height - margin.bottom)
                .attr("stroke", "blue")
                .attr("stroke-width", 2)
                .attr("opacity", 0.2);
        }
    }

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
        get_accuracy(svgContainer,1000, 300, success_rates_data)
    });

    $: if (svgContainer && success_rates_data.length > 0) {
        get_accuracy(svgContainer, 1000, 300, success_rates_data.slice(0, currentEpisode + 1));
    }

    // Derived state for current agent position
    $: currentAgentPosition = agent_positions_data[currentEpisode]?.[currentStep] || start;

    // Derived state for current grid
    $: currentGrid = Array.from({ length: world_height }, (_, r) =>
        Array.from({ length: world_width }, (_, c) => {
            if (r === start[0] && c === start[1]) return 'S';
            if (r === goal[0] && c === goal[1]) return 'G';
            if (holes.some(h => h[0] === r && h[1] === c)) return 'H';
            return ' ';
        })
    );

    // Derived state for current Q-values (for display)
    $: currentQTable = q_tables_data[currentEpisode]?.[`${currentAgentPosition[0]},${currentAgentPosition[1]}`] || {};

    $: currentQTableForArrows = q_tables_data[currentEpisode]?.[currentStep];

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

    <div class="grid-container" style="--grid-width: {world_width}; --grid-height: {world_height};">
        {#each currentGrid as row, r (r)}
            {#each row as cell, c (c)}
                <div
                    class="cell"
                    class:start={r === start[0] && c === start[1]}
                    class:goal={r === goal[0] && c === goal[1]}
                    class:hole={holes.some(h => h[0] === r && h[1] === c)}
                    class:agent={r === currentAgentPosition[0] && c === currentAgentPosition[1]}
                >
                    {cell}
                </div>
            {/each}
        {/each}
    </div>

    {#if currentQTableForArrows}
        <QTableArrows
            qTable={currentQTableForArrows}
            world_width={world_width}
            world_height={world_height}
            start={start}
            goal={goal}
            holes={holes}
        />
    {:else}
        <p>Carregando visualização da Q-table...</p>
    {/if}

    {#if currentQTableForArrows}
        <QTableValues
            allQTables={q_tables_data}
            qTable={currentQTableForArrows}
            world_width={world_width}
            world_height={world_height}
            start={start}
            goal={goal}
            holes={holes}
        />
    {:else}
        <p>Carregando visualização da Q-table...</p>
    {/if}

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
        /* border: 1px solid #ccc; */
        margin-top: 20px;
    }

    .cell {
        width: 50px;
        height: 50px;
        border: 5px solid #3318e9;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        background-color: #000000;
        position: relative;
    }

    .cell.start {
        background-color: #000033; /* Light green */
    }

    .cell.goal {
        background-color: #b782ff; /* Light blue */
    }

    .cell.hole {
        background-color: #003366; /* Light red */
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