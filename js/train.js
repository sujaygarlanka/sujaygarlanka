import tf from '@tensorflow/tfjs-node-gpu';
import Environment from './environment.js';

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
            let val = Math.floor(Math.random() * batchSize);
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
    constructor(model, actionSpaceSize, nEpisodes) {
        this.actionSpaceSize = actionSpaceSize;
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
        const data = tf.tensor2d([state], [1, this.actionSpaceSize], 'float32');
        const actValues = this.model.predict(data);
        return tf.argMax(actValues, 1).dataSync()[0];
    }

    remember(state, action, reward, nextState, done) {
        this.memory.add(state, action, reward, nextState, done);
    }

    async learn() {
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

            // Environment steps with the action and returns next state, reward, and done flag
            let stepResult = env.step(action);
            let nextState = stepResult[0];
            let reward = stepResult[1];
            done = stepResult[2];

            state = nextState;
            counter += 1;
            totalReward += reward;
        }

        episodeRewards.push(totalReward);
        episodeLengths.push(counter);
    }

    let meanEpisodeLength = episodeLengths.reduce((a, b) => a + b, 0) / episodeLengths.length;
    let meanEpisodeReward = episodeRewards.reduce((a, b) => a + b, 0) / episodeRewards.length;

    return [meanEpisodeLength, meanEpisodeReward];
}


async function train(agent, env, nEpisodes, batchSize) {
    let bestReward = -Infinity;
    let eval_lens = [];
    let eval_rewards = [];
    let state;
    let eps_reward;
    let eps_len;
    // Training loop
    for (let e = 1; e <= nEpisodes; e++) {
        state = env.reset();
        eps_len = 0;
        eps_reward = 0;
        console.log(state)
        console.log(env.task.getReward())
        while (true) {
            const action = agent.act(state);
            env.applyAction(action);
            const [nextState, reward, done] = env.step();
            agent.remember(state, action, reward, nextState, done);
            state = nextState;
            eps_len += 1;
            eps_reward += reward;

            if (done) {
                console.log(`episode: ${e}/${nEpisodes}, eps_reward: ${eps_reward}, eps_len: ${eps_len} e: ${agent.epsilon}`);
                break;
            }

            if (agent.memory.length > batchSize) {
                await agent.learn(batchSize);
            }
        }
        agent.updateEpsilon()

        if (e % 10 === 0) {
            const [eps_len_eval, eps_reward_eval] = evaluate(env, agent); // Assuming eval is a function that evaluates the agent
            eval_lens.push(eps_len_eval);
            eval_rewards.push(eps_reward_eval);
            console.log(`episode: ${e}/${nEpisodes}, eval score: ${eps_len_eval}, eval reward: ${eps_reward_eval}`);
            if (eps_reward_eval > bestReward) {
                bestReward = eps_reward_eval;
                await agent.model.save('file://./navigation_policy');
                console.log('Model saved');
            }
        }
    }
}

const batchSize = 32;
const nEpisodes = 100;

const env = new Environment();
const model = createModel(env.observationSpace, env.actionSpace, batchSize);
const agent = new DQNAgent(model, env.actionSpace, nEpisodes);
train(agent, env, nEpisodes, batchSize);

