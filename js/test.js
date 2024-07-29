import tf from '@tensorflow/tfjs-node-gpu';
import Environment from './environment.js';
import fs from 'fs';

async function evaluate(env, model) {
    let episodeLengths = [];
    let episodeRewards = [];

    for (let e = 0; e < 10; e++) {
        // Reset the environment and get the initial state
        let state = env.reset();
        let done = false;
        let counter = 0;
        let totalReward = 0;
        while (!done) {
            // Agent takes an action
            state = tf.tensor2d([state], [1, env.observationSpace], 'float32');
            const output = model.predict(state)
            let action = await tf.argMax(output, 1).data();
            action = action[0]
            env.applyAction(action);
            // Environment steps with the action and returns next state, reward, and done flag
            let stepResult;
            for (let i = 0; i < 12; i++) {
                stepResult = env.step();
                let nextState = stepResult[0];
                let reward = stepResult[1];
                done = stepResult[2];

                state = nextState;
                counter += 1;
                totalReward += reward;
            }
        }

        episodeRewards.push(totalReward);
        episodeLengths.push(counter);
    }

    let meanEpisodeLength = episodeLengths.reduce((a, b) => a + b, 0) / episodeLengths.length;
    let meanEpisodeReward = episodeRewards.reduce((a, b) => a + b, 0) / episodeRewards.length;
    console.log(meanEpisodeReward)
    return [meanEpisodeLength, meanEpisodeReward];
}

const eval_env = new Environment();
tf.loadLayersModel("http://localhost:8080/js/navigation_policy/model.json").then((model) => {
    evaluate(eval_env, model);
});


