import tf, { step } from '@tensorflow/tfjs-node-gpu';
import Environment from '../environment.js';
import fs from 'fs';

class ReplayBuffer {

    constructor(buffer_size) {
        this.buffer_size = buffer_size
        this.buffer = [];
    }

    add(state, action, reward, nextState, done) {
        const experience = { state, action, reward, nextState, done };
        if (this.buffer.length < this.buffer_size) {
            this.buffer.push(experience);
        } else {
            this.buffer.shift();
            this.buffer.push(experience);
        }
    }

    // async sample(batch_size) {
    //     const batch = tf.data.array(this.buffer).shuffle(this.buffer.length).batch(batch_size);
    //     let vals = [];
    //     await batch.forEachAsync(e => {
    //         vals.push(e);
    //     })
    //     // console.log(vals)
    //     return vals[0]
    // }

    sample(batchSize) {
        let nums = new Set();
        let minibatch = {
            state: [],
            action: [],
            reward: [],
            nextState: [],
            done: []
        }
        let index = 0;
        while (nums.size < batchSize) {
            // let val = Math.floor(Math.random() * batchSize);
            let val = index
            if (!nums.has(val)) {
                nums.add(val);
                minibatch.state.push(this.buffer[val].state);
                minibatch.action.push([index, this.buffer[val].action]);
                minibatch.reward.push(this.buffer[val].reward);
                minibatch.nextState.push(this.buffer[val].nextState);
                minibatch.done.push(this.buffer[val].done);
                index += 1;
            }
        }
        minibatch.state = tf.tensor2d(minibatch.state, [batchSize, this.buffer[0].state.length], 'float32');
        minibatch.action = tf.tensor2d(minibatch.action, [batchSize, 2], 'int32');
        minibatch.reward = tf.tensor1d(minibatch.reward, 'float32');
        minibatch.nextState = tf.tensor2d(minibatch.nextState, [batchSize, this.buffer[0].nextState.length], 'float32');
        minibatch.done = tf.tensor1d(minibatch.done, 'bool');
        return minibatch
    }

    get length() {
        return this.buffer.length;
    }

}

class DQNAgent {
    constructor(model, actionSpaceSize, obsSpaceSize, nEpisodes) {
        this.actionSpaceSize = actionSpaceSize;
        this.obsSpaceSize = obsSpaceSize;
        this.memory = new ReplayBuffer(2000);

        this.gamma = 0.95;  // discount rate
        this.epsilon = 1.0;
        this.epsilonMin = 0.01;
        this.epsilonDecay = Math.pow(this.epsilonMin / this.epsilon, 1 / nEpisodes);

        this.learningRate = 0.001;
        this.model = model;
    }

    act(state, evalMode = false) {
        if (!evalMode && Math.random() <= this.epsilon) {
            return Math.floor(Math.random() * this.actionSpaceSize);
        }
        const data = tf.tensor2d([state], [1, this.obsSpaceSize], 'float32');
        const actValues = this.model.predict(data);
        return tf.argMax(actValues, 1).dataSync()[0];
    }

    remember(state, action, reward, nextState, done) {
        this.memory.add(state, action, reward, nextState, done);
    }

    async learn(batchSize) {
        const minibatch = this.memory.sample(batchSize);
        const states = minibatch.state;
        const actions = minibatch.action;
        const rewards = minibatch.reward;
        const nextStates = minibatch.nextState;
        const dones = minibatch.done;

        const outputs = this.model.predict(nextStates);
        let updates = tf.mul(tf.max(outputs, 1), tf.scalar(this.gamma))
        updates = tf.add(rewards, updates)
        const targets = rewards.where(dones, updates);
        let output = this.model.predict(states);

        output = tf.tensorScatterUpdate(output, actions, targets);
        // output.scatterUpdate(actions, targets);

        await this.model.fit(states, output, { epochs: 1, verbose: 0 });
    }

    updateEpsilon() {     
        if (this.epsilon > this.epsilonMin) {
            this.epsilon *= this.epsilonDecay;
        }
    }
}

function createModel(obsSpaceSize, actionSpaceSize) {
    // Create a sequential model
    const model = tf.sequential();

    // Add a single input layer
    model.add(tf.layers.dense({ inputShape: [obsSpaceSize], units: 64, useBias: true, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 128, useBias: true, activation: 'relu' }));
    model.add(tf.layers.dense({ units: actionSpaceSize, useBias: true }));
    model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });
    return model;
}

function evaluate(env, agent) {
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
            let action = agent.act(state, true);
            env.applyAction(action);
            // Environment steps with the action and returns next state, reward, and done flag
            for (let i = 0; i < 12; i++) {
                let stepResult = env.step();
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

    return [meanEpisodeLength, meanEpisodeReward];
}


async function train(agent, env, eval_env, nEpisodes, batchSize) {
    // let bestReward = -Infinity;\
    let bestReward = -Infinity;
    let eval_lens = [];
    let eval_rewards = [];
    let state;
    let eps_reward;
    let eps_len;
    let done;
    // Training loop
    for (let e = 1; e <= nEpisodes; e++) {
        state = env.reset();
        eps_len = 0;
        eps_reward = 0;
        done = false;
        while (true) {
            const action = agent.act(state);
            env.applyAction(action);
            let stepResult;
            let nextState;
            let reward = 0;
            for (let i = 0; i < 12; i++) {
                stepResult = env.step();
                nextState = stepResult[0];
                reward += stepResult[1];
                done = stepResult[2];
            }
            agent.remember(state, action, reward, nextState, done);
            state = nextState;
            eps_len += 1;
            eps_reward += reward;

            if (done) {
                // console.log(`episode: ${e}/${nEpisodes}, eps_reward: ${eps_reward}, eps_len: ${eps_len} e: ${agent.epsilon}`);
                break;
            }

            // if (agent.memory.length > batchSize) {
            //     await agent.learn(batchSize);
            // }
        }
        if (agent.memory.length >= batchSize) {
            // console.log('Learning.....................................');
            await agent.learn(batchSize);
        }

        agent.updateEpsilon()

        if (e % 10 === 0) {
            const [eps_len_eval, eps_reward_eval] = evaluate(eval_env, agent); // Assuming eval is a function that evaluates the agent
            eval_lens.push(eps_len_eval);
            eval_rewards.push(eps_reward_eval);
            console.log(`episode: ${e}/${nEpisodes}, eval score: ${eps_len_eval}, eval reward: ${eps_reward_eval}`);
            if (eps_reward_eval > bestReward) {
                bestReward = eps_reward_eval;
                const data = await agent.model.save('file://./navigation_policy');
                console.log('Model saved');
            }
        }
    }

    let data = [
        {
            x: Array.from({ length: eval_rewards.length }, (_, i) => i),
            y: eval_rewards,
            mode: 'lines+markers',
            type: 'scatter',
            name: 'Episode Reward'
        }
    ]
    fs.writeFile('data.json', JSON.stringify(data), (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('File has been saved.');
        }
    });

}

const batchSize = 2000;
const nEpisodes = 10000;

const env = new Environment();
const eval_env = new Environment();
const model = createModel(env.observationSpace, env.actionSpace, batchSize);
const agent = new DQNAgent(model, env.actionSpace, env.observationSpace, nEpisodes);
const backend = tf.getBackend();
console.log('Backend:', backend);
train(agent, env, eval_env, nEpisodes, batchSize);

