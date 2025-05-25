// src/lib/stores.js
import { writable } from 'svelte/store';

export const world_width = writable(5);
export const world_height = writable(5);
export const start_position = writable([0, 0]);
export const goal_position = writable([4, 4]);
export const hole_positions = writable([[1, 2], [2, 3], [3, 1], [4, 0], [0, 2], [4, 3]]);

// Store para o Q-Learning (se quiser passar as configs para o algoritmo)
export const q_learning_params = writable({
    alpha: 0.1,
    gamma: 0.9,
    epsilon: 0.1,
    epsilon_decay: 0.003,
    num_episodes: 3000,
    max_steps: 20,
    step_punishment: -1,
    hole_punishment: -100,
    goal_reward: 100
});