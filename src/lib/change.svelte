<script>
    import { createEventDispatcher } from 'svelte';
    import { tick } from 'svelte'; // Para garantir que o DOM seja atualizado antes de algumas verificações
    import {
        world_width,
        world_height,
        start_position,
        goal_position,
        hole_positions
    } from './stores.js'; // Assumindo que você tem stores para os estados

    export let showconfig;
    const dispatch = createEventDispatcher();

    // === Variáveis de Estado do Componente ===
    let currentStep = 1; // 1: Tamanho do Grid, 2: Start/Goal, 3: Buracos, 4: Confirmação

    // Para a seleção do tamanho do grid
    let tempWorldWidth = $world_width;
    let tempWorldHeight = $world_height;

    // Para a seleção de start/goal
    let tempStart = [...$start_position];
    let tempGoal = [...$goal_position];

    // Para a seleção dos buracos
    let tempHoles = JSON.parse(JSON.stringify($hole_positions)); // Deep copy para evitar mutação direta
    let selectingHole = false; // Flag para indicar se estamos selecionando buracos
    let startHoleSelection = null; // [r, c] do primeiro clique para buracos
    let endHoleSelection = null; // [r, c] do segundo clique para buracos

    // Variáveis auxiliares para a interface do grid
    let hoveredCell = null; // [r, c] da célula sob o mouse
    const startSelection = [0,0]; // [r, c] do clique inicial para retângulo
    let endSelection = null; // [r, c] do clique final para retângulo

    // Mensagens de erro ou feedback
    let errorMessage = '';

    // === Funções de Utilidade ===

    // Função para verificar se uma célula está dentro da seleção retangular
    function isWithinRect(r, c, startRect, endRect) {
        if (!startRect || !endRect) return false;
        const [r1, c1] = startRect;
        const [r2, c2] = endRect;
        const minR = Math.min(r1, r2);
        const maxR = Math.max(r1, r2);
        const minC = Math.min(c1, c2);
        const maxC = Math.max(c1, c2); // This was previously maxC, changed to maxR. Assuming this was a typo and should be maxC.
        return r >= minR && r <= maxR && c >= minC && c <= maxC;
    }

    // Função para verificar se é Start, Goal ou Hole
    function isStart(r, c) {
        return tempStart[0] === r && tempStart[1] === c;
    }

    function isGoal(r, c) {
        return tempGoal[0] === r && tempGoal[1] === c;
    }

    function isHole(r, c) {
        return tempHoles.some(hole => hole[0] === r && hole[1] === c);
    }

    // Algoritmo BFS para verificar se existe um caminho
    function hasPath(grid, start, goal, holes, width, height) {
        const queue = [[start[0], start[1]]];
        const visited = new Set();
        visited.add(`${start[0]},${start[1]}`);

        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // right, left, down, up

        while (queue.length > 0) {
            const [r, c] = queue.shift();

            if (r === goal[0] && c === goal[1]) {
                return true; // Caminho encontrado!
            }

            for (const [dr, dc] of directions) {
                const nr = r + dr;
                const nc = c + dc;

                // Verifica limites do grid
                if (nr >= 0 && nr < height && nc >= 0 && nc < width) {
                    const nextStateKey = `${nr},${nc}`;
                    // Verifica se não é um buraco e não foi visitado
                    if (!isHoleInPathCheck(nr, nc, holes) && !visited.has(nextStateKey)) {
                        visited.add(nextStateKey);
                        queue.push([nr, nc]);
                    }
                }
            }
        }
        return false; // Nenhum caminho encontrado
    }

    // Função auxiliar para hasPath, para verificar buracos no contexto de verificação de caminho
    function isHoleInPathCheck(r, c, holesArray) {
        return holesArray.some(hole => hole[0] === r && hole[1] === c);
    }

    // === Lógica de Manipulação de Eventos ===

    function handleCellClick(r, c) {
        errorMessage = ''; // Limpa mensagens de erro anteriores

        if (currentStep === 1) { // Seleção do Tamanho do Grid
            endSelection = [r, c];
            

        } else if (currentStep === 2) { // Seleção de Start/Goal
            if (!isStart(r, c)) { // Se não for o start
                tempGoal = [r, c];
            }


        } else if (currentStep === 3) { // Seleção de Buracos
            if (isStart(r, c) || isGoal(r, c)) {
                errorMessage = "Não é possível colocar buracos nas posições de Início ou Fim.";
                return;
            }

            if (isHole(r, c)) {
                // Se já é um buraco, remove
                tempHoles = tempHoles.filter(hole => !(hole[0] === r && hole[1] === c));
            } else {
                // Se não é um buraco, adiciona
                tempHoles = [...tempHoles, [r, c]];
            }
        }
    }

    function handleRightClick(r, c) {
        if (currentStep === 3) {
            // Remove buracos ao clicar com o botão direito
            if (isHole(r, c)) {
                tempHoles = tempHoles.filter(hole => !(hole[0] === r && hole[1] === c));
                errorMessage = ''; // Limpa qualquer erro de buraco, pois um foi removido
            }
        }
    }

    function handleMouseEnter(r, c) {
        hoveredCell = [r, c];
    }

    function handleMouseLeave() {
        hoveredCell = null;
    }

    // === Lógica de Navegação entre Etapas ===

    async function nextStep() {
        errorMessage = ''; // Limpa mensagens de erro ao avançar

        if (currentStep === 1) { // Do Tamanho do Grid para Start/Goal
            if (tempWorldWidth < 2 || tempWorldHeight < 2) {
                errorMessage = "O tamanho do grid deve ser no mínimo 2x2.";
                return;
            }
            // Resetar Start/Goal/Holes se o tamanho do grid mudou drasticamente
            // Isso evita que posições antigas fiquem fora dos novos limites
            if (tempWorldWidth !== $world_width || tempWorldHeight !== $world_height) {
                tempStart = [0, 0];
                tempGoal = [tempWorldHeight - 1, tempWorldWidth - 1];
                tempHoles = [];
            }
            currentStep = 2;
        } else if (currentStep === 2) { // De Start/Goal para Buracos
            if (tempStart[0] === -1 || tempGoal[0] === -1) {
                errorMessage = "Por favor, selecione as posições de Início e Fim.";
                return;
            }
            if (isStart(tempGoal[0], tempGoal[1]) && isGoal(tempStart[0], tempStart[1])) {
                // Isso acontecerá se start e goal estiverem no mesmo ponto
                errorMessage = "Start e Goal não podem ser o mesmo ponto.";
                return;
            }
            currentStep = 3;
        } else if (currentStep === 3) { // De Buracos para Confirmação
            // Validação de caminho antes de continuar
            if (!hasPath(null, tempStart, tempGoal, tempHoles, tempWorldWidth, tempWorldHeight)) {
                errorMessage = "Caminho impossível! Remova alguns buracos para garantir que um caminho de Início ao Fim exista.";
                return;
            }
            currentStep = 4;
        } else if (currentStep === 4) { // Confirmação -> Aplicar
            // Atualiza os stores com os novos valores
            $world_width = tempWorldWidth;
            $world_height = tempWorldHeight;
            $start_position = tempStart;
            $goal_position = tempGoal;
            $hole_positions = tempHoles;

            // Dispara um evento para que o componente pai saiba que a configuração foi atualizada
            dispatch('configUpdated');
            // Opcionalmente, pode fechar este componente ou voltar ao estado inicial
            currentStep = 1; // Volta ao início para uma nova configuração
            showconfig = false;
        }
    }

    function prevStep() {
        errorMessage = '';
        if (currentStep > 1) {
            currentStep--;
        }
    }

    function resetCurrentStep() {
        errorMessage = '';
        if (currentStep === 1) {
            tempWorldWidth = $world_width;
            tempWorldHeight = $world_height;
            endSelection = null;
        } else if (currentStep === 2) {
            tempStart = [0, 0]; // Valores padrão
            tempGoal = [tempWorldHeight - 1, tempWorldWidth - 1]; // Valores padrão
        } else if (currentStep === 3) {
            tempHoles = [];
            selectingHole = false;
            startHoleSelection = null;
            endHoleSelection = null;
        }
    }

    // === Classes CSS Dinâmicas ===
    function getCellClass(r, c) {
        let classes = '';

        if (currentStep === 1) {
            console.log(startSelection, endSelection)
        if (startSelection && endSelection && isWithinRect(r, c, startSelection, endSelection)) {
            
            classes += ' selected-rect-confirmed';
        } else if (startSelection && hoveredCell && isWithinRect(r, c, startSelection, hoveredCell)) {
            classes += ' selected-rect-hover';
        } else if (!startSelection && hoveredCell && r <= hoveredCell[0] && c <= hoveredCell[1]) {
            // This is the relevant part
            classes += ' hovered-purple';
        }
    } else if (currentStep === 2) {
            if (isStart(r, c)) classes += ' is-start';
            if (isGoal(r, c)) classes += ' is-goal';
        } else if (currentStep === 3) {
            if (isHole(r, c)) classes += ' is-hole';
            if (isStart(r, c)) classes += ' is-start-fixed'; // Para não ser selecionável como buraco
            if (isGoal(r, c)) classes += ' is-goal-fixed'; // Para não ser selecionável como buraco

            if (selectingHole && startHoleSelection && hoveredCell && isWithinRect(r, c, startHoleSelection, hoveredCell)) {
                classes += ' selecting-hole-rect';
            }
        }
        return classes;
    }

    function handleMouseOver(r, c){
        // This function will now simply set the hoveredCell,
        // and the styling logic will be handled by getCellClass.
        hoveredCell = [r, c];
    }
</script>

<div class="overlay">
    <div class="change-container">
        <div class="step-indicator">
            {#if currentStep === 1}
                <h2>Passo 1: Definir o Tamanho do Grid</h2>
                <p class="info-message">Clique na primeira célula para iniciar a seleção e clique na segunda célula (diagonalmente oposta) para definir o tamanho do grid. O retângulo roxo mostrará a seleção.</p>
            {:else if currentStep === 2}
                <h2>Passo 2: Selecionar Posições de Início (S) e Fim (G)</h2>
                <p class="info-message">Clique para selecionar a posição de Início (verde) e, em seguida, a posição de Fim (vermelho).</p>
            {:else if currentStep === 3}
                <h2>Passo 3: Definir Posições dos Buracos (H)</h2>
                <p class="info-message">Clique na primeira célula para iniciar a seleção de um retângulo de buracos, e na segunda célula para finalizar. Clique com o botão direito para remover buracos. Buracos não podem ser Início ou Fim.</p>
            {:else if currentStep === 4}
                <h2>Passo 4: Confirmar Configurações</h2>
                <p class="info-message">Revise as configurações antes de aplicar.</p>
            {/if}
        </div>

        {#if errorMessage}
            <div class="error-message">{errorMessage}</div>
        {/if}
    
    <div class="grid-values">
        <div class="grid-container"
    style="grid-template-columns: repeat({currentStep === 1 ? 10 : tempWorldWidth}, 1fr);">
    {#key currentStep + JSON.stringify(startSelection) + JSON.stringify(endSelection) + JSON.stringify(hoveredCell) + JSON.stringify(tempStart) + JSON.stringify(tempGoal) + JSON.stringify(tempHoles)}
        {#each Array(currentStep === 1 ? 10 : tempWorldHeight) as _, r}
            {#each Array(currentStep === 1 ? 10 : tempWorldWidth) as __, c}
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
                    on:mouseover={() => handleMouseOver(r, c)}
                    on:focus={() => handleMouseOver(r, c)}
                >

                    {#if currentStep !== 1}
                        {#if isStart(r, c)}S{/if}
                        {#if isGoal(r, c)}G{/if}
                        {#if isHole(r, c)}H{/if}
                    {/if}
                </div>
            {/each}
        {/each}
    {/key} </div>

        <div class="current-values">
            <p>Largura Atual: {currentStep === 1 ? tempWorldWidth : tempWorldWidth}</p>
            <p>Altura Atual: {currentStep === 1 ? tempWorldHeight : tempWorldHeight}</p>
            <p>Início: [{tempStart}]</p>
            <p>Fim: [{tempGoal}]</p>
            <p>Buracos: {JSON.stringify(tempHoles)}</p>
        </div>
    </div>

        <div class="controls">
            <button on:click={prevStep} disabled={currentStep === 1}>Anterior</button>
            <button on:click={resetCurrentStep} class="reset-button">Reiniciar Passo</button>
            <button on:click={nextStep}>
                {#if currentStep < 4}
                    Próximo
                {:else}
                    Aplicar Novas Configurações
                {/if}
            </button>
        </div>
    </div>
</div>

<style>
    /* Estilos para o Overlay */
    .overlay {
        position: fixed; /* Fixa o overlay na tela */
        top: 0;
        left: 0;
        width: 100vw; /* Ocupa toda a largura da viewport */
        height: 100vh; /* Ocupa toda a altura da viewport */
        background-color: rgba(0, 0, 0, 0.4); /* Fundo semi-transparente para escurecer */
        backdrop-filter: blur(5px); /* Efeito de desfoque */
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
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Sombra mais pronunciada para destaque */
        font-family: sans-serif;
        /* Novas propriedades para o tamanho */
        width: 80vw; /* 80% da largura da viewport */
        max-width: 900px; /* Limite máximo para grids muito grandes */
        height: 60vh; /* 60% da altura da viewport */
        max-height: 700px; /* Limite máximo para grids muito grandes */
        overflow-y: auto; /* Adiciona scroll se o conteúdo for maior que a altura definida */
        box-sizing: border-box; /* Garante que padding e border sejam incluídos no width/height */
    }

    .step-indicator {
        font-size: 0.7em;
        font-weight: bold;
        color: #333;
    }

    .grid-container {
        display: grid;
        border: 1px solid #ccc;
        background-color: #fff;
        box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
    }

    .grid-cell {
        width: 10px; /* Tamanho da célula */
        height: 10px;
        border: 1px solid #eee;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.8em;
        cursor: pointer;
        transition: background-color 0.1s ease;
    }
    /* Add this to your <style> block */
.grid-values {
    display: flex; /* Makes children flex items */
    
    gap: 40px; /* Adds space between grid and values (adjust as needed) */
    align-items: flex-end; /* Aligns items to the start of the cross-axis (top) */
    /* You might want to control the width of the parent grid-values if it's too wide */
    width: 50%; /* Or a specific max-width, e.g., max-width: 1200px; */
    box-sizing: border-box; /* Ensures padding/border are included in the width */
}

.grid-container {
    flex-shrink: 0; /* Prevents the grid from shrinking if there's not enough space */
    margin: 0;

}

.current-values {
    flex-grow: 1; /* Allows the current-values to grow and take up remaining space */
}

/* Adjust the .change-container if necessary to make space for .grid-values */
.change-container {
    display: flex; /* Make it a flex container */
    flex-direction: column; /* Keep its children (step-indicator, grid-values, controls) stacked vertically */
    align-items: center; /* Center horizontally */
}
    .grid-cell{
        gap:0;
        padding: 0;
    }
    .grid-cell:hover {
        background-color: #e0e0e0;
    }

    /* Estilos para o Passo 1 (Tamanho do Grid) */
    .grid-cell.selected-rect-hover {
        background-color: #d1c4e9; /* Roxo claro */
        border: 1px dashed #7b1fa2; /* Roxo mais escuro */
    }

    .grid-cell.selected-rect-confirmed {
        background-color: #7b1fa2; /* Roxo */
        border: 1px solid #4a148c; /* Roxo escuro */
    }

    /* New style for the "hovered-purple" class */
    .grid-cell.hovered-purple {
        background-color: #e0b0ff; /* A lighter purple for hovering */
    }

    /* Estilos para o Passo 2 (Start/Goal) */
    .grid-cell.is-start {
        background-color: #4CAF50; /* Verde */
        color: black;
        font-weight: bold;
    }

    .grid-cell.is-goal {
        background-color: #F44336; /* Vermelho */
        color: white;
        font-weight: bold;
    }

    /* Estilos para o Passo 3 (Buracos) */
    .grid-cell.is-hole {
        background-color: #607D8B; /* Cinza azulado */
        color: white;
        font-weight: bold;
    }

    .grid-cell.is-start-fixed, .grid-cell.is-goal-fixed {
        cursor: not-allowed; /* Indica que não pode selecionar buraco aqui */
        opacity: 0.7;
    }
    .grid-cell.is-start-fixed{
        background-color: #4CAF50;
    }
    .grid-cell.is-goal-fixed {
        background-color: #F44336;
    }

    .grid-cell.selecting-hole-rect {
        background-color: #bbdefb; /* Azul claro */
        border: 1px dashed #2196F3; /* Azul */
    }

    .controls {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }

    button {
        padding: 10px 20px;
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

    .error-message {
        color: #d32f2f;
        margin-top: 10px;
        font-weight: bold;
    }

    .info-message {
        color: #3f51b5;
        margin-top: 10px;
    }

    .current-values {
        margin-top: 15px;
        background-color: #e0e0e0;
        padding-left: 10px;
        border-radius: 5px;
        font-size: 0.6em;
        color: #000;
    }
</style>