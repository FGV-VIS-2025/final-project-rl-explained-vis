<script>
    import { createEventDispatcher } from 'svelte';

    export let world_width;
    export let world_height;
    export let hole_positions;
    export let start_position;
    export let goal_position;
    export let showconfig;
    const dispatch = createEventDispatcher();

    // === Component State Variables ===
    // For grid size selection
    let tempWorldWidth = world_width;
    let tempWorldHeight = world_height;

    // Start and Goal are now derived from grid dimensions
    $: tempStart = [0, 0];
    $: tempGoal = [tempWorldHeight - 1, tempWorldWidth - 1];

    // For hole selection
    let tempHoles = JSON.parse(JSON.stringify(hole_positions)); // Deep copy to avoid direct mutation

    // Auxiliary variables for grid interface
    let hoveredCell = null; // [r, c] of the cell under the mouse

    // Error or feedback messages
    let errorMessage = '';

    // === Utility Functions ===

    // Function to check if a cell is Start, Goal or Hole
    function isStart(r, c) {
        return tempStart[0] === r && tempStart[1] === c;
    }

    function isGoal(r, c) {
        return tempGoal[0] === r && tempGoal[1] === c;
    }

    function isHole(r, c) {
        return tempHoles.some(hole => hole[0] === r && hole[1] === c);
    }

    // BFS algorithm to check if a path exists
    function hasPath(start, goal, holes, width, height) {
        const queue = [[start[0], start[1]]];
        const visited = new Set();
        visited.add(`${start[0]},${start[1]}`);

        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // right, left, down, up

        while (queue.length > 0) {
            const [r, c] = queue.shift();

            if (r === goal[0] && c === goal[1]) {
                return true; // Path found!
            }

            for (const [dr, dc] of directions) {
                const nr = r + dr;
                const nc = c + dc;

                // Check grid boundaries
                if (nr >= 0 && nr < height && nc >= 0 && nc < width) {
                    const nextStateKey = `${nr},${nc}`;
                    // Check if it's not a hole and has not been visited
                    if (!isHoleInPathCheck(nr, nc, holes) && !visited.has(nextStateKey)) {
                        visited.add(nextStateKey);
                        queue.push([nr, nc]);
                    }
                }
            }
        }
        return false; // No path found
    }

    // Auxiliary function for hasPath, to check holes in the path verification context
    function isHoleInPathCheck(r, c, holesArray) {
        return holesArray.some(hole => hole[0] === r && hole[1] === c);
    }

    // === Event Handling Logic ===

    function handleCellClick(r, c) {
        errorMessage = ''; // Clear previous error messages

        if (isStart(r, c) || isGoal(r, c)) {
            errorMessage = "Cannot place holes on Start or Goal positions.";
            return;
        }

        if (isHole(r, c)) {
            // If it's already a hole, remove it
            tempHoles = tempHoles.filter(hole => !(hole[0] === r && hole[1] === c));
        } else {
            // If it's not a hole, add it
            tempHoles = [...tempHoles, [r, c]];
        }
    }

    function handleRightClick(r, c) {
        // Remove holes when right-clicking
        if (isHole(r, c)) {
            tempHoles = tempHoles.filter(hole => !(hole[0] === r && hole[1] === c));
            errorMessage = ''; // Clear any hole error, as one was removed
        }
    }

    function handleMouseEnter(r, c) {
        hoveredCell = [r, c];
    }

    function handleMouseLeave() {
        hoveredCell = null;
    }

    // === Apply Configuration Logic ===

    async function applyConfiguration() {
        errorMessage = ''; // Clear error messages on applying

        if (tempWorldWidth < 2 || tempWorldHeight < 2) {
            errorMessage = "Grid size must be at least 2x2.";
            return;
        }

        // Validate path before applying
        if (!hasPath(tempStart, tempGoal, tempHoles, tempWorldWidth, tempWorldHeight)) {
            errorMessage = "Impossible path! Remove some holes to ensure a path from Start to Goal exists.";
            return;
        }

        // Update stores with new values
        world_width = tempWorldWidth;
        world_height = tempWorldHeight;
        start_position = tempStart;
        goal_position = tempGoal;
        hole_positions = tempHoles;

        // Dispatch an event so the parent component knows the configuration has been updated
        dispatch('configUpdated');
        showconfig = false;
    }

    function resetConfiguration() {
        errorMessage = '';
        tempWorldWidth = world_width;
        tempWorldHeight = world_height;
        tempHoles = JSON.parse(JSON.stringify(hole_positions)); // Reset holes to the last applied state
    }

    // === Dynamic CSS Classes ===
    function getCellClass(r, c) {
        let classes = '';

        if (isStart(r, c)) classes += ' is-start';
        if (isGoal(r, c)) classes += ' is-goal';
        if (isHole(r, c)) classes += ' is-hole';

        // Prevent Start/Goal from being styled as hovered holes
        if (hoveredCell && hoveredCell[0] === r && hoveredCell[1] === c && !isStart(r,c) && !isGoal(r,c)) {
            classes += ' hovered-cell';
        }

        return classes;
    }

     function unShowParamSetter(){
        console.log(showconfig)
        showconfig = false;
    }

</script>

<div class="overlay">
    <div class="change-container">
        <div class="header-section">
            <h2>Configuração do Mundo</h2>
            <button class="close-button" on:click={unShowParamSetter} aria-label="Fechar configurações">X</button>

            <p class="info-message">Defina o tamanho do grid, e clique nas células para adicionar/remover buracos. O Ponto de Início (S) é sempre no canto superior esquerdo e o Ponto de Fim (G) é sempre no canto inferior direito.</p>
        </div>

        {#if errorMessage}
            <div class="error-message">{errorMessage}</div>
        {/if}

        <div class="controls-and-grid">
            <div class="grid-size-inputs">
                <label for="width">Largura:</label>
                <input type="number" id="width" bind:value={tempWorldWidth} min="2" max="10" />

                <label for="height">Altura:</label>
                <input type="number" id="height" bind:value={tempWorldHeight} min="2" max="10"  />
            </div>

            <div class="grid-display-area">
                <div class="grid-container"
                    style="grid-template-columns: repeat({tempWorldWidth}, 1fr);">
                    {#key tempWorldWidth + tempWorldHeight + JSON.stringify(tempHoles) + JSON.stringify(tempStart) + JSON.stringify(tempGoal) + JSON.stringify(hoveredCell)}
                        {#each Array(tempWorldHeight) as _, r}
                            {#each Array(tempWorldWidth) as __, c}
                                <div
                                    class="grid-cell {getCellClass(r, c)}"
                                    role="button"
                                    tabindex="0"
                                    on:click={() => handleCellClick(r, c)}
                                    on:keydown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            handleCellClick(r, c);
                                            e.preventDefault();
                                        }
                                        if (e.key === 'Delete' || e.key === 'Backspace') {
                                            handleRightClick(r, c);
                                            e.preventDefault();
                                        }
                                    }}
                                    on:contextmenu|preventDefault={() => handleRightClick(r, c)}
                                    on:mouseenter={() => handleMouseEnter(r, c)}
                                    on:mouseleave={handleMouseLeave}
                                    on:focus={() => handleMouseEnter(r, c)}
                                >
                                    {#if isStart(r, c)}S{/if}
                                    {#if isGoal(r, c)}G{/if}
                                    {#if isHole(r, c)}H{/if}
                                </div>
                            {/each}
                        {/each}
                    {/key}
                </div>

              
            </div>
        </div>

        <div class="action-buttons">
            <button on:click={resetConfiguration} class="reset-button">Reiniciar</button>
            <button on:click={applyConfiguration}>Aplicar Configurações</button>
        </div>
    </div>
</div>

<style>
    /* Overlay Styles */
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(5px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .change-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        background-color: #f0f0f0;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        font-family: sans-serif;
        width: 80vw;
        max-width: 900px;
        height: 70vh; /* Adjust height to give more space */
        max-height: 800px;
        overflow-y: auto;
        box-sizing: border-box;
    }

    .header-section {
        text-align: center;
        margin-bottom: 20px;
    }

    h2 {
        font-size: 1.8em;
        color: #333;
        margin-bottom: 10px;
    }

    .info-message {
        color: #3f51b5;
        margin-top: 10px;
        font-size: 0.9em;
    }

    .error-message {
        color: #d32f2f;
        margin-bottom: 15px;
        font-weight: bold;
        text-align: center;
    }

    .controls-and-grid {
        display: flex;
        flex-direction: row; /* Arrange inputs and grid side-by-side */
        gap: 30px; /* Space between them */
        width: 100%;
        justify-content: center;
        flex-grow: 1; /* Allow this section to take available space */
    }

    .grid-size-inputs {
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
        padding: 10px;
        border-radius: 5px;
        background-color: #e8e8e8;
    }

    .grid-size-inputs label {
        font-weight: bold;
        color: #555;
    }

    .grid-size-inputs input {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        width: 80px; /* Fixed width for inputs */
        text-align: center;
    }

    .grid-display-area {
        display: flex;
        flex-direction: column;
        align-items: center; /* Center the grid and values */
        flex-grow: 1;
        gap: 15px;
    }

    .grid-container {
        display: grid;
        border: 1px solid #ccc;
        background-color: #fff;
        box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
        /* Ensure the grid doesn't grow too large */
        max-width: 100%;
        max-height: 100%;
        overflow: auto; /* Add scrollbars if grid is too big */
    }

    .grid-cell {
        width: 10px; /* Cell size */
        height: 10px;
        border: 1px solid #eee;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.8em;
        cursor: pointer;
        transition: background-color 0.1s ease;
        box-sizing: border-box; /* Include padding/border in width/height */
    }

    .grid-cell:hover:not(.is-start):not(.is-goal) {
        background-color: #e0e0e0;
    }

    /* Cell States */
    .grid-cell.is-start {
        background-color: #4CAF50; /* Green */
        color: white;
        font-weight: bold;
    }

    .grid-cell.is-goal {
        background-color: #F44336; /* Red */
        color: white;
        font-weight: bold;
    }

    .grid-cell.is-hole {
        background-color: #607D8B; /* Blue-gray */
        color: white;
        font-weight: bold;
    }

    .grid-cell.hovered-cell {
        background-color: #bbdefb; /* Light blue for hovering */
    }

    .current-values {
        background-color: #e0e0e0;
        padding: 10px;
        border-radius: 5px;
        font-size: 0.8em;
        color: #333;
        width: 100%;
        text-align: center;
    }



    .action-buttons {
        display: flex;
        gap: 15px;
        margin-top: 25px;
    }

    button {
        padding: 10px 25px;
        border: none;
        border-radius: 5px;
        background-color: #007bff;
        color: white;
        cursor: pointer;
        font-size: 1em;
        transition: background-color 0.2s ease;
    }

    button:hover {
        background-color: #0056b3;
    }

    button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }

    .reset-button {
        background-color: #ff9800;
    }

    .reset-button:hover {
        background-color: #e68a00;
    }
</style>