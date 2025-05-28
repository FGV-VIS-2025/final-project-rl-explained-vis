<script>
    import InfoTooltip from "./InfoTooltip.svelte";

    export let qValuesForCell;
    export let globalMaxAbsQValue;
    export let inspectedRow;
    export let inspectedCol;

    // Funções para determinar a cor do gradiente
    function getGradientColor(qValue) {
        if (globalMaxAbsQValue === 0) {
            return `hsl(0, 0%, 15%)`;
        }

        const maxQValue = globalMaxAbsQValue;
        const minQValue = -globalMaxAbsQValue;

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
</script>

<h3>Q-Values of cell {inspectedRow},{inspectedCol}</h3>
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

<style>
    .q-cell-actions-container {
        position: relative;
        width: 200px;
        height: 200px;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr;
        grid-template-areas:
            ". up ."
            "left center right"
            ". down .";
        background-color: #1e1e1e;
        border: 2px solid var(--color-border);
        box-sizing: border-box;
        overflow: hidden;
        margin-top: -35px;
    }

    .triangle {
        position: absolute;
        width: 0;
        height: 0;
        border-style: solid;
        z-index: 1;
    }

    .up {
        grid-area: up;
        border-width: 0 50px 50px 50px;
        border-color: transparent transparent var(--triangle-color) transparent;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
    }

    .down {
        grid-area: down;
        border-width: 50px 50px 0 50px;
        border-color: var(--triangle-color) transparent transparent transparent;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
    }

    .left {
        grid-area: left;
        border-width: 50px 50px 50px 0;
        border-color: transparent var(--triangle-color) transparent transparent;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
    }

    .right {
        grid-area: right;
        border-width: 50px 0 50px 50px;
        border-color: transparent transparent transparent var(--triangle-color);
        right: 0;
        top: 50%;
        transform: translateY(-50%);
    }

    .up { --triangle-color: var(--up-color); }
    .down { --triangle-color: var(--down-color); }
    .left { --triangle-color: var(--left-color); }
    .right { --triangle-color: var(--right-color); }

    .q-cell-actions-container {
        --up-color: var(--upColor, transparent);
        --down-color: var(--downColor, transparent);
        --left-color: var(--leftColor, transparent);
        --right-color: var(--rightColor, transparent);
    }

    .tooltip {
        position: absolute;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 5px 8px;
        border-radius: 4px;
        font-size: 0.8em;
        pointer-events: none;
        white-space: nowrap;
        transform: translate(-50%, -100%);
        top: -10px;
        left: 50%;
    }
</style>