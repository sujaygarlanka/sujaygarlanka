# Stanford Vision Lab (May 2023 - Today)

<img style="max-width: 400px" width="100%" src="https://raw.githubusercontent.com/sujaygarlanka/sujaygarlanka/master/experience/media/grasping.gif"/>

I was a student researcher at SVL developing motion primitives for a robot in a simulation environment. These motion primitives are Python functionality that execute robotic actions to accomplish basic tasks. These tasks consist of grasping and placing an object, open and closing doors/drawers and navigating. The purpose of developing these primitives is to aid researchers in accomplishing the [BEHAVIOR-1K benchmark](https://openreview.net/pdf?id=_8DoIe8G3t) using the [OmniGibson](https://behavior.stanford.edu/omnigibson/) simulation environment built on NVIDIA Omniverse and Isaac Sim. 

I, along with a few others, took two approaches to building out these primitives. Our first approach was using the full observability of the environment to develop algorithmic primitives. After completing our first approach, we were dissatisfied with its ability generalize to the significantly varied tasks in the BEHAVIOR-1K benchmark. So, we then used some of the fundamental functionality developed in our first approach to aid our second approach. This approach is using reinforcement learning to learn a selection of robotic actions.  

## Algorithmic Primitives

The algorithmic implementation for the motion primitives follow a common logical flow. The steps of flow are the following and are illustrated in the diagram below:
1. Sample among valid end effector (EEF) poses generated
2. Test whether the sampled pose is within the robot’s reach by checking whether Omniverse’s IK solver returns a valid arm configuration for that pose
3. If it returns an invalid configuration, we then execute our navigation flow. Otherwise, execute the manipulation flow.
    - Navigation or Manipulation flow
      
<img style="max-width: 400px" width="100%" src="https://raw.githubusercontent.com/sujaygarlanka/sujaygarlanka/master/experience/media/primitive_flow.png"/>

### Navigation Flow

The navigation flow consists of first sampling base poses in SE(2) near the proposed EEF pose. Every pose is checked to be collision free and within the robot’s reach. Once a valid base position is found, we pass it to the motion planner. We use OMPL for motion planning with a custom motion validator ([code](https://github.com/StanfordVL/OmniGibson/blob/og-develop/omnigibson/utils/motion_planning_utils.py#L49)). The motion planner uses RRT to explore the search space and find a path. The custom motion validator checks for validity between two points in RRT by validating a motion where the robot turns to face the goal from the initial orientation, moves in a line to the goal, and turns to face the goal’s final orientation is collision free. This custom motion validator needed to be implemented because the default motion checking in RRT is having the robot translate and rotate simultaneously to a goal, which is not how the robot moves in our primitives implementation. Finally, once a valid path is found, the robot executes this path.

### Manipulation Flow

The manipulation phase of the primitives consists similarly of three steps. 
1. Use IK to find a valid arm configuration to reach the EEF pose
2. Use the arm configuration into a default OMPL motion planner bounded by the joint limits of the robot to find a path in configuration space.
3. Execute the computed path using our joint controller. 

After this manipulation phase, every primitive has its own custom execution of grasping, closing, opening, etc. Below is an example of opening a door.

<img style="max-width: 500px" width="100%" src="https://raw.githubusercontent.com/sujaygarlanka/sujaygarlanka/master/experience/media/open_revolute.gif"/>

### Collision Detection

The main technical feature in our algorithmic primitives implementation is the collision detection, specifically during planning where the robot is moved around the environment to check for collisions. Using the simplest simulation option of saving the current simulator state, setting the robot at a specific arm configuration or 2d pose, taking a simulator step, then have the simulator check for collisions and finally resetting the original saved state proved to be prohibitively slow. We chose to implement a method that used a copy of the collision meshes of the robot and check for overlaps with the collision meshes of other objects in the environment to detect a collision WITHOUT taking a simulation step. This increased planning speed by 20x. Our collision detection method is implemented separately for navigation and manipulation.

**Navigation**

When the simulation environment spawns, we create copies of the robot’s collision meshes and store their transforms relative to the base of the robot. Then for collision detection in navigation, we reassemble the robot at a specified location by using the relative transforms for the meshes to calculate the poses for the meshes in the world frame to construct the robot as shown in the image below. Once this is completed, we then check to see if the meshes overlap with the meshes of other objects in the scene. However, an additional complication is introduced when the robot is holding an object. In this case, we ignore overlaps between the end effector of the robot and the object. Lastly, we also copy the meshes of the object in the hand and check that it does not overlap with any other invalid objects in the scene, because the object in the hand should function as part of the robot.

<img style="max-width: 500px" width="100%" src="https://raw.githubusercontent.com/sujaygarlanka/sujaygarlanka/master/experience/media/collision.png"/>

**Manipulation**

For manipulation, collision detection gets additionally complicated. This is because manipulation requires setting different arm configurations for the arm, then checking for overlap. To address this, we use a forward kinematics solver in Omniverse that when given the joint configurations, will return the relative poses of the meshes of the robot to create that configuration. We then compute the world pose for the meshes using the relative poses and the pose of the robot, set the meshes to those poses and finally check for overlap in a similar manner described above. The only difference is that we add the robot meshes to the list of invalid meshes. This is because invalid arm configurations include those where the robot collides with itself. 

## Reinforcement Learning

Our second approach is using reinforcement learning to develop the primitives. Since RL is sample inefficient, it requires high frames per second (FPS) from our simulation to collect enough data in a reasonable time. To get this high FPS, we engineered two solutions. The first is using GRPC to allow for running multiple environments in parallel on a distributed cluster and the second is running multiple scenes in a single environment on a single node.

### GRPC Parallel Environments

In RL, parallelizable environments are wrapped in a vector environment that allows an RL library step them simultaneously to speed up training. We created a custom environment wrapper that communicates via gRPC between the multiple environments we manually spin up (code). The overall architecture is that we have a learner script (code) that spins up a registration server and waits for workers to connect. We then run a worker script that spins up multiple RL environments that have an associated IP, accept an action to run and return an observation (code). The worker script sends the IPs to the registration server. Now the learner script can create our vectorized environment that can accept an array of actions, send them via a client-server connection to the environment workers and return an array of observations from the environment workers.

### OmniGibson Parallel Environments

The GRPC set up can have some network delays and is cumbersome to work with, so we later implemented a native version of multiple environments in OmniGibson. Since OmniGibson is built on IsaacSim, it allows for the creation of multiple scenes in a single environment. We refactored OmniGibson to be vectorized to suppor this. The graphic below shows the result and the PR can be found [here](https://github.com/StanfordVL/OmniGibson/pull/699). The result is an 5-10x increase in FPS to around 250 FPS.

<img style="max-width: 500px" width="100%" src="https://raw.githubusercontent.com/sujaygarlanka/sujaygarlanka/master/experience/media/multiple_environments.gif"/>

### RL Environment

In addition to our engineering efforts, we setup a simple RL environment to learn grasping. Key aspects of this environment are the following:

**Observations Space**
    - Joint positions of the robot arm
    - Relative position of the center of the robot base the the centroid of the object to grasp
    - Relative position of the center of the bounding box for the end effector (EEF) and the centroid fo the object to grasp

**Action Space**
    - Delta joint positions for the robot arm that are fed to our joint controller

**Reward**
The reward function for grasping is the sum of a **distance reward**,  **regularization reward** and a **collision penalty**.

The distance reward is defined by 4 cases that are determined by the state before an action and the following state (i.e. current state). The table below outlines these states:

| Previous State             | Current State (After action)                 | Reward                                                                                  |
|----------------------------|----------------------------------------------|-----------------------------------------------------------------------------------------|
| Not grasping object        | Not grasping object                          | e^(distance between EEF and object * -1) * DIST_COEFF                                   |
| Not grasping object        | Grasping object (picked object)              | e^(distance between robot center and object * -1) * DIST_COEFF + GRASP_REWARD           |
| Grasping object            | Not grasping object (dropped object)         | e^(distance between EEF and object * -1) * DIST_COEFF                                   |
| Grasping object            | Grasping object                              | e^(distance between robot center and object * -1) * DIST_COEFF + GRASP_REWARD           |

The reward function is shaped in a way where the closer the end effector is to the object when it is not holding an object, the higher the reward. Once the robot grasps the object, the lower the moment of inertia for the robot object pair, the higher the reward. A graph of the reward per frame and cumulative distance reward for a robot grasping, then dropping the desired object is shown below.

<img style="max-width: 500px" width="100%" src="https://raw.githubusercontent.com/sujaygarlanka/sujaygarlanka/master/experience/media/grasp_reward.png"/>

The regularization reward is a penalty that subtracts an amount proportional to the applied joint efforts and the amount the EEF moves during a step. This will discourage unnecessary movements.

The collision penality is an amount subtracted everytime the robot collides with something in the environment to discourage collisions.

**Termination Condition**
The termination condition is when the object is in the grasp of the end effector or 400 timesteps have passed.

**Resetting Condition**
To learn general grasping, we reset the robot to randomized arm configurations and robot base poses around the object. To randomize the arm configuration, we generate random configurations and use our collision checking functionality to find a valid starting configuration. We do the same for the base pose where we sample around the object to grasp and find a pose that places the robot within the reach of the object and is collision free. 

### Results
So far we have gotten mediocre results in grasping where the arm does grasp the object, but is jittery and takes a circuitous route to the object. We need to run more experiments, which is only tractable with higher frames per second. To achieve this, we plan on tensorizing as much as we can in OmniGibson so it is taking advantage of the GPU as much as possible.



