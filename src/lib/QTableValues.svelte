<script>
    export let allQTables;
    export let qTable;
    export let world_width;
    export let world_height;
    export let start;
    export let goal;
    export let holes;
    export let maxAbsVal;
    import { base } from '$app/paths';

    import InfoTooltip from "./InfoTooltip.svelte";

    // Função para encontrar o valor absoluto máximo entre todas as Q-tables
    function getGlobalMaxAbsoluteQValue(allQTables) {
        maxAbsVal = 0;

        allQTables.forEach(qTable => {
            for (const stateKey in qTable) {
                const cells = qTable[stateKey];
                for (const cell in cells) {
                    const actions = cells[cell];
                    for (const action in actions)
                    {
                        const qValue = actions[action];
                        if (qValue !== -Infinity) {
                            const absQValue = Math.abs(qValue);
                            if (absQValue > maxAbsVal) {
                                maxAbsVal = absQValue;
                            }
                        }
                    }
                }
            }
        });
        return maxAbsVal;
    }

    // Calcula o valor absoluto máximo global de forma reativa
    $: globalMaxAbsQValue = getGlobalMaxAbsoluteQValue(allQTables);
    
    $: maxQValue = globalMaxAbsQValue;
    $: minQValue = -globalMaxAbsQValue;
    
    // Variáveis reativas para os valores min/max para a legenda
    $: legendMinQValue = -globalMaxAbsQValue.toFixed(0);
    $: legendMaxQValue = globalMaxAbsQValue.toFixed(0);
    $: legendZeroValue = 0;

    // Função para determinar a cor do gradiente
    function getGradientColor(qValue) {
        if (maxQValue === 0 && minQValue === 0) {
            return `hsl(0, 0%, 15%)`;
        }

        const normalizedValue = (qValue - minQValue) / (maxQValue - minQValue);

        let hue;
        let saturation = 100;
        let lightness;

        const colorNegExtreme = { hue: 10, saturation: 100, lightness: 10 };
        const colorZero = { hue: 260, saturation: 20, lightness: 15 };
        const colorPosExtreme = { hue: 190, saturation: 100, lightness: 70 };

        if (normalizedValue <= 0.5) {
            const localNorm = normalizedValue / 0.5;

            hue = colorNegExtreme.hue + (colorZero.hue - colorNegExtreme.hue) * localNorm;
            saturation = colorNegExtreme.saturation + (colorZero.saturation - colorNegExtreme.saturation) * localNorm;
            lightness = colorNegExtreme.lightness + (colorZero.lightness - colorNegExtreme.lightness) * localNorm;

        } else {
            const localNorm = (normalizedValue - 0.5) / 0.5;

            hue = colorZero.hue + (colorPosExtreme.hue - colorZero.hue) * localNorm;
            saturation = colorZero.saturation + (colorPosExtreme.saturation - colorZero.saturation) * localNorm;
            lightness = colorZero.lightness + (colorPosExtreme.lightness - colorZero.lightness) * localNorm;
        }

        hue = Math.round(hue);
        saturation = Math.round(saturation);
        lightness = Math.round(lightness);

        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    
    // Gera o gradiente para a legenda (agora vertical)
    $: legendGradient = `linear-gradient(to top,
        ${getGradientColor(-globalMaxAbsQValue)},
        ${getGradientColor(0)},
        ${getGradientColor(globalMaxAbsQValue)})`;


    // Função para determinar a melhor ação para uma dada célula e seu Q-value
    function getBestActionAndValue(row, col, currentQTable) {
        const stateKey = `${row},${col}`;
        const actions = currentQTable[stateKey];

        if (!actions) return { bestAction: '', bestQValue: 0 };

        let bestAction = '';
        let maxValue = -Infinity;

        for (const action of ['up', 'down', 'left', 'right']) {
            if (actions[action] > maxValue) {
                maxValue = actions[action];
                bestAction = action;
            }
        }
        return { bestAction, bestQValue: maxValue };
    }

    // Matriz reativa para armazenar o Q-value da melhor ação para cada célula
    $: bestQValuesGrid = (() => {
        const gridData = [];
        for (let r = 0; r < world_height; r++) {
            const rowData = [];
            for (let c = 0; c < world_width; c++) {
                rowData.push(getBestActionAndValue(r, c, qTable).bestQValue);
            }
            gridData.push(rowData);
        }
        return gridData;
    })();

    function getCellType(row, col) {
        if (row === start[0] && col === start[1]) return 'start';
        if (row === goal[0] && col === goal[1]) return 'goal';
        if (holes.some(hole => hole[0] === row && hole[1] === col)) return 'hole';
        return '';
    }

</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DotGothic16&family=Pixelify+Sans:wght@400..700&family=Press+Start+2P&family=Tiny5&family=VT323&display=swap" rel="stylesheet">

<div class="main-container">
    <div class="q-grid-wrapper">
        <h3>Q-values
            <InfoTooltip>
                <div slot = "tooltipContent">
                    This grid displays the current maximum Q-value<br>
                    for each cell, representing the estimated<br>
                    long-term reward an agent can expect by<br>
                    following the optimal policy from that state.
                </div>
            </InfoTooltip>
        </h3>
        <div class="q-grid" style="grid-template-columns: repeat({world_width}, 1fr);">
            {#key world_width + world_height + JSON.stringify(holes) + JSON.stringify(start) + JSON.stringify(goal)}
            {#each Array(world_height) as _, r}
                {#each Array(world_width) as __, c}
                    <div
                        class="q-grid-cell {getCellType(r, c)}"
                        style="background-color: {getCellType(r,c) === '' ? getGradientColor(bestQValuesGrid[r][c]) : ''};"
                    >
                        {#if getCellType(r,c) === 'goal'}
                            <img
                                    src={base + "/coin.png"}
                                    alt="Coin"
                                    style="width: 24px; height: 24px;"
                                />
                        {:else if getCellType(r,c) === 'hole'}
                            <img
                                    src={base + "/fantasma.png"}
                                    alt="Hole"
                                    style="width: 24px; height: 24px;"
                                />
                        {/if}
                    </div>
                {/each}
            {/each}
            {/key}
        </div>
    </div>

    <div class="color-legend">
        <div class="gradient-bar" style="background: {legendGradient};"></div>
        <div class="labels">
            <span>{legendMaxQValue}</span>
            <span>{legendZeroValue}</span>
            <span>{legendMinQValue}</span>
        </div>
        </div>
</div>

<style>
    :root {
        --color-border: #9f96d8;
        --size-border: 3px
    }

    .main-container {
        display: flex;
        align-items: flex-start;
        gap: 20px;
    }

    .q-grid-wrapper h3 {
        text-align: center;
        font-family: "Press Start 2P";
        font-weight: normal;
        font-size: 14px;
    }

    .q-grid {
        display: grid;
        border-top: var(--size-border) solid var(--color-border);
        border-left: var(--size-border) solid var(--color-border);
        width: fit-content;
        margin: 0 auto;
    }

    .q-grid-cell {
        width: 35px;
        height: 35px;
        border-right: var(--size-border) solid var(--color-border);
        border-bottom: var(--size-border) solid var(--color-border);
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.5em;
        font-weight: normal;
        color: #ffffff;
        position: relative;
    }

    .q-grid-cell.start {
        background-color: #000033;
    }

    .q-grid-cell.goal {
        background-color: #b782ff;
    }

    /* Estilos da Legenda Vertical */
    .color-legend {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 180px;
        width: 50px;
        margin-top: 50px;
        font-family: Arial, sans-serif;
        color: #ffffff;
        font-size: 0.5em;
    }

    .gradient-bar {
        width: 15px;
        height: 100%;
        border-radius: 3px;
    }

    .labels {
        display: flex;
        margin-top: -200px;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        font-family: "Press Start 2P";
        margin-left: 20px; /* Espaço entre a barra e os rótulos */
    }

    .labels span:nth-child(2) {
        align-self: center;
    }
    
    .labels span:nth-child(1) {
        align-self: flex-start;
    }

    .labels span:nth-child(3) {
        align-self: flex-end;
    }
</style>