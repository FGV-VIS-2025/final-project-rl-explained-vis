<script>
    import InfoTooltip from "./InfoTooltip.svelte";

    export let qValuesForCell;
    export let globalMaxAbsQValue;
    export let inspectedRow;
    export let inspectedCol;

    // Funções para determinar a cor do gradiente
    function getGradientColor(qValue) {
    if (globalMaxAbsQValue === 0) {
        return `rgb(230, 230, 230)`; // fallback: light gray
    }

    const maxQValue = globalMaxAbsQValue;
    const minQValue = -globalMaxAbsQValue;
    const normalizedValue = (qValue - minQValue) / (maxQValue - minQValue);

    // "Blues" palette from dark to light
    const blues = [
        [8, 81, 156],     // dark blue
        [49, 130, 189],
        [107, 174, 214],
        [158, 202, 225],
        [198, 219, 239],
        [239, 243, 255]   // very light blue
    ];

    const scaled = normalizedValue * (blues.length - 1);
    const i = Math.floor(scaled);
    const t = scaled - i;

    const i1 = Math.min(i + 1, blues.length - 1);

    const r = Math.round(blues[i][0] + (blues[i1][0] - blues[i][0]) * t);
    const g = Math.round(blues[i][1] + (blues[i1][1] - blues[i][1]) * t);
    const b = Math.round(blues[i][2] + (blues[i1][2] - blues[i][2]) * t);

    return `rgb(${r}, ${g}, ${b})`;
}





    // Calcula as cores para cada triângulo
    $: upColor = qValuesForCell ? getGradientColor(qValuesForCell.up) : 'transparent';
    $: downColor = qValuesForCell ? getGradientColor(qValuesForCell.down) : 'transparent';
    $: leftColor = qValuesForCell ? getGradientColor(qValuesForCell.left) : 'transparent';
    $: rightColor = qValuesForCell ? getGradientColor(qValuesForCell.right) : 'transparent';

    // Para exibir os valores no tooltip
    let hoveredValue = null;
    let hoveredAction = '';

    function handleMouseEnter(action, value) {
        hoveredAction = action;
        hoveredValue = value !== -Infinity ? value.toFixed(2) : '-∞';
    }

    function handleMouseLeave() {
        hoveredAction = '';
        hoveredValue = null;
    }

    // Variáveis reativas para os valores min/max para a legenda
    $: legendMinQValue = -globalMaxAbsQValue.toFixed(0);
    $: legendMaxQValue = globalMaxAbsQValue.toFixed(0);
    $: legendZeroValue = 0;

    // Gera o gradiente para a legenda
    $: legendGradient = `linear-gradient(to right,
        ${getGradientColor(-globalMaxAbsQValue)},
        ${getGradientColor(0)},
        ${getGradientColor(globalMaxAbsQValue)})`;
</script>

<div class="q-cell-actions-wrapper">
    <h3>Q-Values for Cell ({inspectedRow},{inspectedCol})
        <InfoTooltip>
            <div slot="tooltipContent">
                This cell shows the Q-value for each<br>
                possible action (Up, Down, Left, Right)<br>
                from this state. Each triangle's color represents<br>
                the estimated long-term reward for that action.
            </div>
        </InfoTooltip>
    </h3>

    <div class="q-cell-actions-container">
        <div
            class="triangle up"
            style="border-bottom-color: {upColor};"
            on:mouseenter={() => handleMouseEnter('Up', qValuesForCell.up)}
            on:mouseleave={handleMouseLeave}
        ></div>
        <div
            class="triangle down"
            style="border-top-color: {downColor};"
            on:mouseenter={() => handleMouseEnter('Down', qValuesForCell.down)}
            on:mouseleave={handleMouseLeave}
        ></div>
        <div
            class="triangle left"
            style="border-right-color: {leftColor};"
            on:mouseenter={() => handleMouseEnter('Left', qValuesForCell.left)}
            on:mouseleave={handleMouseLeave}
        ></div>
        <div
            class="triangle right"
            style="border-left-color: {rightColor};"
            on:mouseenter={() => handleMouseEnter('Right', qValuesForCell.right)}
            on:mouseleave={handleMouseLeave}
        ></div>

        {#if hoveredValue !== null}
            <div class="tooltip">
                {hoveredAction}: {hoveredValue}
            </div>
        {/if}
    </div>

    <div class="color-legend">
        <div class="gradient-bar" style="background: {legendGradient};"></div>
        <div class="labels">
            <span>{legendMinQValue}</span>
            <span>{legendZeroValue}</span>
            <span>{legendMaxQValue}</span>
        </div>
        <div class="legend-title">
            <span>Q-value</span>
        </div>
    </div>
</div>

<style>
    .q-cell-actions-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    .q-cell-actions-wrapper h3 {
        text-align: center;
        font-family: "Press Start 2P";
        font-weight: normal;
        font-size: 14px;
        margin-bottom: 5px;
    }

    .q-cell-actions-container {
        --cell-size: 150px;
        --border-thickness: 2px;

        position: relative;
        width: var(--cell-size);
        height: var(--cell-size);
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr;
        grid-template-areas:
            "up"
            "left center"
            "down";
        background-color: #1e1e1e;
        border: var(--border-thickness) solid #9f96d8;
        box-sizing: border-box;
        overflow: hidden;
    }

    .triangle {
        position: absolute;
        width: 0;
        height: 0;
        border-style: solid;
        z-index: 1;
        --border-color: #555; /* Cor da borda */
        --border-thickness: 2px; /* Espessura da borda */
    }

    .up {
        grid-area: up;
        border-width: 0 calc(var(--cell-size) / 4) calc(var(--cell-size) / 4) calc(var(--cell-size) / 4);
        border-color: transparent transparent var(--up-color) transparent;
        border-left-color: var(--border-color);
        border-right-color: var(--border-color);
        top: 0;
        left: 50%;
        transform: translateX(-50%);
    }

    .down {
        grid-area: down;
        border-width: calc(var(--cell-size) / 4) calc(var(--cell-size) / 4) 0 calc(var(--cell-size) / 4);
        border-color: var(--down-color) transparent transparent transparent;
        border-left-color: var(--border-color);
        border-right-color: var(--border-color);
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
    }

    .left {
        grid-area: left;
        border-width: calc(var(--cell-size) / 4) calc(var(--cell-size) / 4) calc(var(--cell-size) / 4) 0;
        border-color: transparent var(--left-color) transparent transparent;
        border-top-color: var(--border-color);
        border-bottom-color: var(--border-color);
        left: 0;
        top: 50%;
        transform: translateY(-50%);
    }

    .right {
        grid-area: right;
        border-width: calc(var(--cell-size) / 4) 0 calc(var(--cell-size) / 4) calc(var(--cell-size) / 4);
        border-color: transparent transparent transparent var(--right-color);
        border-top-color: var(--border-color);
        border-bottom-color: var(--border-color);
        right: 0;
        top: 50%;
        transform: translateY(-50%);
    }

    .q-cell-actions-container {
        --up-color: var(--upColor, transparent);
        --down-color: var(--downColor, transparent);
        --left-color: var(--leftColor, transparent);
        --right-color: var(--rightColor, transparent);
    }

    .tooltip {
        position: absolute;
        background-color: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 5px 8px;
        border-radius: 4px;
        font-size: 0.8em;
        pointer-events: none;
        white-space: nowrap;
        transform: translate(-50%, -100%);
        top: -10px;
        left: 50%;
        z-index: 10;
    }

    .color-legend {
        width: 200px;
        margin-top: 10px;
        font-family: Arial, sans-serif;
        color: #ffffff;
        font-size: 0.5em;
    }

    .gradient-bar {
        height: 15px;
        width: 200px;
        border-radius: 3px;
        margin-bottom: 5px;
    }

    .labels {
        display: flex;
        justify-content: space-between;
        font-family: "Press Start 2P";
    }

    .legend-title {
        margin-top: 10px;
        display: flex;
        justify-content: center;
        font-family: "Press Start 2P";
        font-weight: normal;
        font-size: 10px;
    }
</style>