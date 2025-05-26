<script>
    export let qTable; // A Q-table para renderizar
    export let world_width;
    export let world_height;
    export let start;
    export let goal;
    export let holes;

    // Mapeamento de ações para caracteres de seta ou ícones (você pode usar ícones SVG reais ou unicode)
    const arrowMap = {
        'up': '↑',
        'down': '↓',
        'left': '←',
        'right': '→',
        '': '·',
        'undefined': '?'
    };

    // Função para determinar a melhor ação (seta) para uma dada célula
    function calculateBestAction(row, col, currentQTable) {
        const stateKey = `${row},${col}`;
        const actions = currentQTable[stateKey];

        if (!actions) return ''; // Caso a célula não esteja na Q-table (pode acontecer com estados terminais)

        let bestActions = [];
        let maxValue = -Infinity;

        for (const action of ['up', 'down', 'left', 'right']) { // Iterar sobre ACTIONS explicitamente
            if (actions[action] > maxValue) {
                maxValue = actions[action];
                bestActions = [action];
            } else if (actions[action] === maxValue) {
                bestActions.push(action);
            }
        }

        if (bestActions.length > 1)
        {
            return "undefined";
        }
        else
        {
            return bestActions.length > 0 ? bestActions[Math.floor(Math.random() * bestActions.length)] : '';
        }
    }

    $: bestActionsGrid = (() => {
        const gridData = [];
        for (let r = 0; r < world_height; r++) {
            const rowData = [];
            for (let c = 0; c < world_width; c++) {
                rowData.push(calculateBestAction(r, c, qTable));
            }
            gridData.push(rowData);
        }
        return gridData;
    })();

    // Função para verificar se a célula é o início, objetivo ou buraco
    function getCellType(row, col) {
        if (row === start[0] && col === start[1]) return 'start';
        if (row === goal[0] && col === goal[1]) return 'goal';
        if (holes.some(hole => hole[0] === row && hole[1] === col)) return 'hole';
        return '';
    }
</script>

<div class="q-grid-wrapper">
    <h3>Policy</h3>
    <div class="q-grid" style="grid-template-columns: repeat({world_width}, 1fr);">
        {#each Array(world_height) as _, r}
            {#each Array(world_width) as __, c}
                <div
                    class="q-grid-cell {getCellType(r, c)}"
                >
                    {#if getCellType(r,c) === 'goal'}
                        G
                    {:else if getCellType(r,c) === 'hole'}
                        H
                    {:else}
                        {arrowMap[bestActionsGrid[r][c]]} {/if}
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
        width: 35px;
        height: 35px;   
        border-right: 5px solid #3318e9;
        border-bottom: 5px solid #3318e9;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.5em;
        font-weight: bold;
        background-color: #000000;
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