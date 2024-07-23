// const tf = require('@tensorflow/tfjs-node');
import tf from '@tensorflow/tfjs-node';
// const Environment = require('./environment');
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

    async sample(batch_size) {
        const batch = tf.data.array(this.buffer).shuffle(this.buffer.length).batch(batch_size);
        let vals = [];
        await batch.forEachAsync(e => {
            vals.push(e);
        })
        // console.log(vals)
        return vals[0]
    }

    get length() {
        return this.buffer.length;
    }

}

class DQNAgent {
    constructor(model, actionSpaceSize) {
        this.actionSpaceSize = actionSpaceSize;
        this.memory = new ReplayBuffer(2000);

        this.gamma = 0.95;  // discount rate
        this.epsilon = 1.0;
        this.epsilonMin = 0.01;
        this.epsilonDecay = Math.pow(this.epsilonMin / this.epsilon, 1 / nEpisodes);

        this.learningRate = 0.001;
        this.model = model;
    }

    async act(state, evalMode = false) {
        if (!evalMode && Math.random() <= this.epsilon) {
            return Math.floor(Math.random() * this.actionSpaceSize);
        }
        const actValues = await this.model.predict(tf.tensor2d([state], [1, this.actionSpaceSize]));
        return tf.argMax(actValues, 1);
    }

    remember(state, action, reward, nextState, done) {
        this.memory.add(state, action, reward, nextState, done);
    }

    async learn() {
        const minibatch = await this.memory.sample(batchSize);
        console.log(minibatch.state.print())
        const states = minibatch.state;
        const actions = minibatch.action;
        const rewards = minibatch.reward;
        const nextStates = minibatch.nextState;
        const dones = minibatch.done;
        // console.log(minibatch)

        // nextStates.print();
        // console.log(nextStates.shape)
        // const outputs = await this.model.predict(nextStates);
        // const targets = rewards.where(dones, rewards + this.gamma * tf.max(outputs, 1))
        // const output = await this.model.predict(states);

        // actions.expandDims(1);
        // tf.tensorScatterUpdate(output, actions, targets);
        // output.scatterUpdate(actions, targets);

        // await this.model.fit(states, output, { epochs: 1, verbose: 0 });

        if (this.epsilon > this.epsilonMin) {
            this.epsilon *= this.epsilonDecay;
        }
    }
}

function createModel(obsSpaceSize, actionSpaceSize, batchSize) {
    // Create a sequential model
    const model = tf.sequential();

    // Add a single input layer
    model.add(tf.layers.dense({ inputShape: [obsSpaceSize], units: 64, useBias: true, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 128, useBias: true, activation: 'relu' }));
    model.add(tf.layers.dense({ units: actionSpaceSize, useBias: true }));

    return model;
}

async function evaluate(env, agent) {
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
            let action = await agent.act(state, true);

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
    await tf.ready();
    let eval_lens = [];
    let eval_rewards = [];
    // Training loop
    for (let e = 1; e <= nEpisodes; e++) {
        let state = env.reset();
        let eps_len = 0;
        let eps_reward = 0;

        while (true) {
            const action = await agent.act(state);
            const [nextState, reward, done] = env.step(action);
            agent.remember(state, action, reward, nextState, done);
            state = nextState;
            eps_len += 1;
            eps_reward += reward;

            if (done) {
                console.log(`episode: ${e}/${nEpisodes}, eps_reward: ${eps_reward}, eps_len, ${eps_len} e: ${agent.epsilon}`);
                break;
            }

            if (agent.memory.length > batchSize) {
                await agent.learn(batchSize);
            }
        }

        if (e % 100 === 0) {
            const [eps_len, eps_reward] = await evaluate(env, agent); // Assuming eval is a function that evaluates the agent
            eval_lens.push(eps_len);
            eval_rewards.push(eps_reward);
            console.log(`episode: ${e}/${nEpisodes}, eval score: ${eps_len}, eval reward: ${eps_reward}`);

            if (eps_len > 2000) {
                break;
            }
        }
    }
}

const batchSize = 32;
const nEpisodes = 1000;

const env = new Environment();
const model = createModel(env.observationSpace, env.actionSpace, batchSize);
const agent = new DQNAgent(model, env.actionSpace);
train(agent, env, nEpisodes, batchSize);

