<script>
    export let world_width;
    export let world_height;
    export let start;
    export let goal;
    export let holes;
    export let currentAgentPosition;

    import InfoTooltip from "./InfoTooltip.svelte";

    // Função para determinar o tipo da célula
    function getCellType(row, col) {
        if (row === start[0] && col === start[1]) return 'start';
        if (row === goal[0] && col === goal[1]) return 'goal';
        if (holes.some(hole => hole[0] === row && hole[1] === col)) return 'hole';
        return '';
    }

    // Função para obter o conteúdo da célula
    function getCellContent(row, col) {
        const type = getCellType(row, col);
        if (type === 'start') return 'S';
        if (type === 'goal') return 'G';
        if (type === 'hole') return 'H';
        return '';
    }
    $: goal = goal
</script>

<div class="q-grid-wrapper">
    <h3>Environment
        <InfoTooltip>
            <div slot = "tooltipContent">
                This grid represents the environment,<br>
                showing the agent's current position,<br>
                the start, the goal, and any dangerous holes.
            </div>
        </InfoTooltip>
    </h3>
    <div class="q-grid" style="grid-template-columns: repeat({world_width}, 1fr);">
        {#each Array(world_height) as _, r}
            {#each Array(world_width) as __, c}
                <div
                    class="q-grid-cell {getCellType(r, c)}"
                    class:agent={r === currentAgentPosition[0] && c === currentAgentPosition[1]}
                >
                    {getCellContent(r, c)}
                </div>
            {/each}
        {/each}
    </div>
</div>

<style>
    .q-grid-wrapper {
        margin-top: 30px;
        text-align: center;
    }

    .q-grid {
        display: grid;
        border-top: 3px solid #3318e9;
        border-left: 3px solid #3318e9;
        width: fit-content;
        margin: 0 auto;
    }

    .q-grid-cell {
        width: 35px;
        height: 35px;
        border-right: 3px solid #3318e9;
        border-bottom: 3px solid #3318e9;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        background-color: #000000;
        color: #ffffff;
        position: relative;
        font-size: 1.5em;
    }

    .q-grid-cell.start {
        background-color: #000033; /* Darker blue */
    }

    .q-grid-cell.goal {
        background-color: #b782ff; /* Light purple */
    }

    .q-grid-cell.hole {
        background-color: #003366; /* Darker red */
    }

    .q-grid-cell.agent {
        background-color: #ffeeba; /* Light yellow */
    }
</style>