<script>
    import { createEventDispatcher } from "svelte";

    // Props for two-way binding
    export let alpha;
    export let gamma;
    export let epsilon;
    export let epsilon_decay;
    export let num_episodes;
    export let max_steps;
    export let showParamRL;

    const dispatch = createEventDispatcher();

    // Internal temporary variables to hold changes before applying
    let tempAlpha = alpha;
    let tempGamma = gamma;
    let tempEpsilon = epsilon;
    let tempEpsilonDecay = epsilon_decay;
    let tempNumEpisodes = num_episodes;
    let tempMaxSteps = max_steps;

    // Error or feedback messages
    let errorMessage = "";

    function applyParameters() {
        errorMessage = ""; // Clear previous error messages

        // Basic validation (you can add more robust validation if needed)
        if (tempAlpha < 0 || tempAlpha > 1 || isNaN(tempAlpha)) {
            errorMessage = "Alpha deve ser entre 0 e 1.";
            return;
        }
        if (tempGamma < 0 || tempGamma > 1 || isNaN(tempGamma)) {
            errorMessage = "Gamma deve ser entre 0 e 1.";
            return;
        }
        if (tempEpsilon < 0 || tempEpsilon > 1 || isNaN(tempEpsilon)) {
            errorMessage = "Epsilon deve ser entre 0 e 1.";
            return;
        }
        if (tempEpsilonDecay < 0 || isNaN(tempEpsilonDecay)) {
            errorMessage = "Epsilon Decay deve ser um número não negativo.";
            return;
        }
        if (tempNumEpisodes < 1 || isNaN(tempNumEpisodes)) {
            errorMessage = "Número de Episódios deve ser pelo menos 1.";
            return;
        }
        if (tempMaxSteps < 1 || isNaN(tempMaxSteps)) {
            errorMessage = "Máximo de Passos deve ser pelo menos 1.";
            return;
        }

        // Update the bound variables
        alpha = tempAlpha;
        gamma = tempGamma;
        epsilon = tempEpsilon;
        epsilon_decay = tempEpsilonDecay;
        num_episodes = tempNumEpisodes;
        max_steps = tempMaxSteps;
        showParamRL = false;

        // Dispatch an event to notify the parent component that parameters are updated
        dispatch("paramsUpdated");
        // Optionally, you might want to hide this component after applying
        // This component doesn't manage its own visibility, the parent does.
    }

    function resetParameters() {
        errorMessage = "";
        tempAlpha = alpha;
        tempGamma = gamma;
        tempEpsilon = epsilon;
        tempEpsilonDecay = epsilon_decay;
        tempNumEpisodes = num_episodes;
        tempMaxSteps = max_steps;
    }

    $: console.log(alpha, gamma);
</script>

<div class="overlay">
    <div class="change-params-container">
        <div class="header-section">
            <h2>Configuração de Parâmetros do Q-Learning</h2>
        </div>

        {#if errorMessage}
            <div class="error-message">{errorMessage}</div>
        {/if}

        <div class="param-grid">
            <div class="param-group">
                <label for="alpha">Alpha (Taxa de Aprendizagem):</label>
                <div class="slider-wrapper">
                    <span class="slider-value" style="--value: {tempAlpha};"
                        >{tempAlpha.toFixed(3)}</span
                    >
                    <input
                        type="range"
                        id="alpha"
                        bind:value={tempAlpha}
                        min="0"
                        max="1"
                        step="0.001"
                    />
                </div>
            </div>

            <div class="param-group">
                <label for="gamma">Gamma (Fator de Desconto):</label>
                <div class="slider-wrapper">
                    <span class="slider-value" style="--value: {tempGamma};"
                        >{tempGamma.toFixed(3)}</span
                    >
                    <input
                        type="range"
                        id="gamma"
                        bind:value={tempGamma}
                        min="0"
                        max="1"
                        step="0.001"
                    />
                </div>
            </div>

            <div class="param-group">
                <label for="epsilon">Epsilon (Exploração):</label>
                <div class="slider-wrapper">
                    <span class="slider-value" style="--value: {tempEpsilon};"
                        >{tempEpsilon.toFixed(3)}</span
                    >
                    <input
                        type="range"
                        id="epsilon"
                        bind:value={tempEpsilon}
                        min="0"
                        max="1"
                        step="0.001"
                    />
                </div>
            </div>

            <div class="param-group">
                <label for="epsilon_decay">Epsilon Decay:</label>
                <div class="slider-wrapper">
                    <span
                        class="slider-value"
                        style="--value: {tempEpsilonDecay};"
                        >{tempEpsilonDecay.toFixed(4)}</span
                    >
                    <input
                        type="range"
                        id="epsilon_decay"
                        bind:value={tempEpsilonDecay}
                        min="0"
                        max="0.01"
                        step="0.0001"
                    />
                </div>
            </div>

            <div class="param-group">
                <label for="num_episodes">Número de Episódios:</label>
                <div class="slider-wrapper">
                    <span
                        class="slider-value"
                        style="--value: {tempNumEpisodes};"
                        >{tempNumEpisodes}</span
                    >
                    <input
                        type="range"
                        id="num_episodes"
                        bind:value={tempNumEpisodes}
                        min="1000"
                        max="3500"
                        step="100"
                    />
                </div>
            </div>

            <div class="param-group">
                <label for="max_steps">Máximo de Passos por Episódio:</label>
                <div class="slider-wrapper">
                    <span class="slider-value" style="--value: {tempMaxSteps};"
                        >{tempMaxSteps}</span
                    >
                    <input
                        type="range"
                        id="max_steps"
                        bind:value={tempMaxSteps}
                        min="1"
                        max="100"
                        step="1"
                    />
                </div>
            </div>
        </div>

        <div class="action-buttons">
            <button on:click={resetParameters} class="reset-button"
                >Reiniciar</button
            >
            <button on:click={applyParameters}>Aplicar Parâmetros</button>
        </div>
    </div>
</div>

<style>
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
    .change-params-container {
    display: flex;
    flex-direction: column;
    align-items: center; /* Centers items horizontally in a column flex container */
    justify-content: center; /* Centers items vertically in a column flex container */
    padding: 20px;
    background-color: #000000;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    font-family: sans-serif;
    width: 80vw;
    max-width: 1000px;
    height: 80vh;
    max-height: 800px;
    overflow-y: auto;
    box-sizing: border-box;
}

.param-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    align-items: start;
    width: 100%; /* Ensure the grid takes full available width to allow centering */
    max-width: 900px; /* Optional: set a max-width for the grid itself */
    margin: 0 auto; /* This is crucial for centering the grid horizontally */
}
    .header-section {
        text-align: center;
        margin-bottom: 10px;
    }

    h2 {
        font-size: 1em; /* Slightly larger title */
        color: #e0e0e0; /* Lighter color for readability on dark background */
        margin-bottom: 5px;
    }

    .error-message {
        color: #ff6666; /* Redder error message */
        font-weight: bold;
        text-align: center;
        margin-bottom: 15px;
    }



    @media (max-width: 768px) {
        .param-grid {
            grid-template-columns: repeat(
                2,
                1fr
            ); /* Two columns on smaller screens */
        }
    }

    @media (max-width: 480px) {
        .param-grid {
            grid-template-columns: 1fr; /* Single column on very small screens */
        }
    }
    /* --- End Grid Layout --- */

    .param-group {
        font-size: 0.7em;
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding: 10px;
        border: 1px solid #444; /* Subtle border for each group */
        border-radius: 5px;
        background-color: #3a3a3a; /* Slightly lighter background for param groups */
    }

    .param-group label {
        font-weight: bold;
        color: #ffffff; /* White text for labels */
        font-size: 0.95em;
        margin-bottom: 5px; /* Space between label and input */
    }

    /* Override the default number input styling to match the dark theme */

    .param-group input[type="range"] {
        width: 100%;
        height: 8px;
        background: #555; /* Darker track for range input */
        border-radius: 5px;
        outline: none;
        opacity: 0.9;
        transition: opacity 0.2s;
        margin-top: 5px; /* Space below label */
    }

    .param-group input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #6697cb; /* Blue thumb */
        cursor: pointer;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.3); /* Subtle shadow for thumb */
    }

    .param-group input[type="range"]::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #6697cb;
        cursor: pointer;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    }

    .action-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
    }

    button {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        background-color: #6697cb;
        color: white;
        cursor: pointer;
        font-size: 1em;
        transition: background-color 0.2s ease;
    }

    button:hover {
        background-color: #4a74a1; /* Darker blue on hover */
    }

    .reset-button {
        background-color: #ff9800; /* Orange reset button */
    }

    .reset-button:hover {
        background-color: #e68a00; /* Darker orange on hover */
    }
</style>
