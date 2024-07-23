import tf from '@tensorflow/tfjs-node';

// Example buffer array
const buffer = [
    {
        state: [
            -0.4940644837801413,
            2.3257690177973416,
            -0.1305248817038711,
            -0.000020222126655508873,
            -0.10534113961017255,
            0.00014966111883097792,
            0.994436132437999
        ],
        action: 5,
        reward: -3.4178533177807977,
        nextState: [
            -0.5009567253146936,
            2.3256217323615562,
            -0.13572147190494488,
            -0.00005840305590235634,
            -0.1042974299404198,
            0.0005207287113017051,
            0.994546012780965
        ],
        done: false
    },
    {
        state: [
            -0.5009567253146936,
            2.3256217323615562,
            -0.13572147190494488,
            -0.00005840305590235634,
            -0.1042974299404198,
            0.0005207287113017051,
            0.994546012780965
        ],
        action: 3,
        reward: -3.42313728397016,
        nextState: [
            -0.5080210162945955,
            2.325528500418252,
            -0.14005941765431854,
            -0.000056199799869033355,
            -0.10597441733991478,
            0.0004676335147390169,
            0.9943687449985262
        ],
        done: false
    }
];

// Batch size
const batchSize = 2;

// Create a dataset from the buffer, shuffle it, and batch it
const dataset = tf.data.array(buffer)
    .shuffle(buffer.length)
    .batch(batchSize);

// Iterate through the dataset and print the batches
dataset.forEachAsync(data => {
    console.log('Batch:');
    console.log('State:', data.state.print());
    console.log('Action:', data.action.print());
    console.log('Reward:', data.reward.print());
    console.log('Next State:', data.nextState.print());
    console.log('Done:', data.done.print());
});
