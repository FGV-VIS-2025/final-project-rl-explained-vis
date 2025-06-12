<script>
    export let alpha = 0.1;
    export let gamma = 0.9;
    export let epsilon = 0.1;
    export let epsilon_decay = 0.003;
    export let n_of_episodes = 1000;
    export let max_steps = 9;
    export let final_accuracy = 1;

    let texts_ids;

    function defineTexts(alpha, gamma, epsilon, epsilon_decay, final_accuracy) {
        let current_texts_ids = [];
        let n_texts = 0;
        
        if (final_accuracy < 10) {
            if (alpha < 0.01 && n_texts < 3) {
                current_texts_ids.push("alpha_low");
                n_texts += 1;
            }
            if (gamma < 0.1 && n_texts < 3) {
                current_texts_ids.push("gamma_low");
                n_texts += 1;
            }
            if (epsilon > 0.1 && epsilon_decay < 0.001) {
                current_texts_ids.push("epsilons_combination");
                n_texts += 1;
            }
            // CONSERTAR LÓGICA
            else {
                current_texts_ids.push("max_steps_low");
                n_texts += 1;
            }
        }
        else if (final_accuracy > 10 && final_accuracy < 90) {
            if (epsilon > 0.1 && n_texts < 3) {
                current_texts_ids.push("epsilon_high");
                n_texts += 1;
            }
            else if (epsilon_decay < 0.001 && n_texts < 3) {
                current_texts_ids.push("epsilon_decay_low");
                n_texts += 1;
            }
            else if (n_texts < 3) {
                current_texts_ids.push("num_episodes_low");
                n_texts += 1;
            }
        }
        else if (epsilon < 0.01 && n_texts < 3) {
            current_texts_ids.push("epsilon_low");
            n_texts += 1;
        }
        else if (alpha > 0.9 && n_texts < 3) {
            current_texts_ids.push("alpha_high");
            n_texts += 1;
        }
        else if (gamma > 0.99 && n_texts < 3) {
            current_texts_ids.push("gamma_high");
            n_texts += 1;
        }

        return current_texts_ids;
    }

    $: texts_ids = defineTexts(alpha, gamma, epsilon, epsilon_decay, final_accuracy);
</script>

<ul>
    {#if texts_ids.length > 0}
        <li>{texts_ids}</li>
    {/if}
</ul>