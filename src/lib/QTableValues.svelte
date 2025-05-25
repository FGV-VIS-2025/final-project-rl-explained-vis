<script>
    export let allQTables;
    export let qTable;
    export let world_width;
    export let world_height;
    export let start;
    export let goal;
    export let holes;

    // Função para encontrar o valor absoluto máximo entre todas as Q-tables
    function getGlobalMaxAbsoluteQValue(allQTables) {
        let maxAbsVal = 0;

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
    $: console.log(maxQValue, minQValue);
    
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

    function getCellType(row, col) {
        if (row === start[0] && col === start[1]) return 'start';
        if (row === goal[0] && col === goal[1]) return 'goal';
        if (holes.some(hole => hole[0] === row && hole[1] === col)) return 'hole';
        return '';
    }
</script>

<div class="q-grid-wrapper">
    <h3>Q-values</h3>
    <div class="q-grid" style="grid-template-columns: repeat({world_width}, 1fr);">
        {#each Array(world_height) as _, r}
            {#each Array(world_width) as __, c}
                <div
                    class="q-grid-cell {getCellType(r, c)}"
                    style="background-color: {getCellType(r,c) === '' ? getGradientColor(bestQValuesGrid[r][c]) : ''};"
                >
                    {#if getCellType(r,c) === 'goal'}
                        G
                    {:else if getCellType(r,c) === 'hole'}
                        H
                    {:else if getCellType(r,c) === 'start'}
                        S
                    {:else}
                        {bestQValuesGrid[r][c].toFixed(1)}
                    {/if}
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
        border-top: 5px solid #3318e9;
        border-left: 5px solid #3318e9;
        width: fit-content;
        margin: 0 auto;
    }

    .q-grid-cell {
        width: 40px;
        height: 40px;
        border-right: 5px solid #3318e9;
        border-bottom: 5px solid #3318e9;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1em;
        font-weight: bold;
        color: #ffffff;
        position: relative;
    }

    .q-grid-cell.start {
        background-color: #000033;
    }

    .q-grid-cell.goal {
        background-color: #b782ff;
    }

    .q-grid-cell.hole {
        background-color: #003366;
    }
</style>