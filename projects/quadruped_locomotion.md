# Quaduped Locomotion

I worked on implementing locomotion for a quadruped in MATLAB. This proved to be far more involved than I first imagined. I ended up implementing a walking gait and used that for forward, backward and lateral movement. Below, I elaborate on the math and coding required for the walking gait, which sets the foundation for more complicated locomotion like running and jumping.

## Background
The walking gait is a coordinated movement between the legs of the robot that allow it move forward along the x-axis. The gait consists of two operating modes. The first is the **leg swing** where the robot moves two diagonally opposite front and rear legs forward in an arc. This is shown in the animation below. The second is **standing**, which is when other two diagonally opposite front and rear legs balance and push the body forward. Both operating modes exist at every timestep and each calculate the torques required for the legs differently. Below I outline some of the math involved to generate the motor torques in each mode.

- Leg Swing
- Standing

## Leg Swing

For the leg swing, the only goal is to move the feet of the quadruped in an arc forward. The diagram below illustrates this.

The steps for doing the above are the following:
1. Calculate the final foot position for each leg
2. Get the trajectory for the foot for the final position
3. Calculate the torques to move the foot along that trajectory


### Step 1
For the first step, the final foot position is calculated using the equation below (1). The terms in the equation below are the following:

$T_{stance}$ - The desired time it takes for a single step.

$V_{COM}$ - The velocity of the center of mass of the quadruped in the x-direction

$V_{desired}$ - The desired velocity of the center of mass of the quadruped in the x-direction

$Z_{COM}$ - The desired height for the center of mass of the robot

$g$ - The acceleration due to gravity

$P_{hip}$ - The location of the hip of a leg along the x-axis

$P_{foot}^{d}$ - The calculated x-position for the foot

$$
\begin{equation}
P_{foot}^{d} = P_{hip} + \frac{T_{stance} \cdot V_{COM}}{2}  + K_{step} \cdot (V_{COM} - V_{desired})
\hspace{1cm}
\end{equation}
\\
\begin{equation}
K_{step} = \sqrt{\frac{Z_{COM}^{d}}{g}}
\hspace{1cm}
\end{equation}
$$

The two terms to note in the equation above are $\frac{T_{stance} \cdot V_{COM}}{2}$, which is the feedforward term and $K_{step} \cdot (V_{COM} - V_{desired})$, which is the feedback term. The feedback term is important to either add or subtract to the feedforward term to increase or decrease the speed of the robot. This term is positive when $V_{COM}$ is greater than the desired velocity and consequently the next foot position goes further in front to act as a brake. When $V_{COM}$ is lower an the desired velocity of the body, the next foot position is shorter, resulting in a speed up.

### Step 2
The next step is to get a trajectory for the foot from the current position to the desired position. I chose a parabolic trajectory for the foot to move along like in the image below. Since the robot is moving along the x-axis, the trajectory is in the x-z plane. I use the equation below (3) with the total time the foot arc should take ($T_{swing}$) as a root to get a parabolic equation between 0 and $T_{swing}$ and multiply by a scaling constant to change the max height for the z coordinate. The x coordinate is simply $\Delta P_{foot} \cdot \frac{t}{T_{swing}}$

$$
\begin{equation}
z = Height \cdot t \cdot (t - T_{swing})
\hspace{1cm}
\end{equation}
\\
$$

### Step 3

The last step is more involved and requires getting the forces applied to each foot of the leg to get a point along the parabola, and use that to calculate the joint torques. 

To get the forces for the foot of each leg, I use a PD controller that is applied at every timestep. The PD controller equation is below (4).

$P_{foot}$ - This is the cartesian coordinates of the foot at the current timestep.

$P_{foot}^{d}$ - This is the cartesian coordinates of the desired foot position along the calculated parabola for the current timestep. The x and z coordinates are updated while the y coordinate is the same as for $P_{foot}$

$\dot P_{foot}$ - This is the velocity of the foot at the current timestep.

$\dot P_{foot}^{d}$ - This is the desired velocity of the foot. The x velocity is constant at $\Delta P_{foot} / T_{swing}$. The y velocity is 0 and the z velocity is the time derivative of equation 3.

$$
F = K_{p} \cdot (P_{foot}^{d}(t) - P_{foot}) + K_{d} \cdot (\dot P_{foot}^{d}(t) - \dot P_{foot}) \tag{1}
$$


Once the forces for the foot are calculated, they need to be converted to torques because that control input for the quadruped. The torques can be calculated using the equation below (5).

$J_{i}(q)^{T}$ - This is the transpose of the jacobian of the forward kinematics for a leg. The forward kinematics is simply an equation mapping the 3 joint angles of a leg to cartesian coordinate in the robot's frame.

$R^{T}$ - This is the transpose of the rotation matrix for the robot

$F_{i}$ - The calculated force for the foot.

$$
\begin{equation}
\tau_{i} = -J_{i}(q)^{T} \cdot R^{T} \cdot F_{i}
\hspace{1cm}
\end{equation}
\\
$$

The Matlab code for computing the Jacobian can be found below. The function takes in angular velocities for the joints of a leg as well as an index representing the leg and returns the Jacobian for that leg.

```matlab
function J=computeLegJacobian(q,leg)
    l1=0.045; % hip length
    l2=0.2; % thigh length
    l3=0.2; % calf length
    if leg==1 || leg==3 % left leg has sideSign 1
        sideSign=1;
    else
        sideSign=-1; % right leg has sideSign -1
    end
    J = zeros(3,3);

    s1=sin(q(1)); % for hip joint
    s2=sin(q(2)); % for thigh joint
    s3=sin(q(3)); % for calf joint
    
    c1=cos(q(1)); % for hip joint
    c2=cos(q(2)); % for thigh joint
    c3=cos(q(3)); % for calf joint
    
    c23=c2*c3-s2*s3;
    s23=s2*c3+c2*s3;
    
    J(1,1)=0;
    J(2,1)=-sideSign*l1*s1+l2*c2*c1+l3*c23*c1;
    J(3,1)=sideSign*l1*c1+l2*c2*s1+l3*c23*s1;
    
    J(1,2)=-l3*c23-l2*c2;
    J(2,2)=-l2*s2*s1-l3*s23*s1;
    J(3,2)=l2*s2*c1+l3*s23*c1;
    
    J(1,3)=-l3*c23;
    J(2,3)=-l3*s23*s1;
    J(3,3)=l3*s23*c1;
 end


```

$$
\begin{bmatrix}
O_{3 \times 3} & O_{3 \times 3} & O_{3 \times 3} & I_{3 \times 3} & O_{3 \times 3} & O_{3 \times 3} & O_{3 \times 1} & O_{3 \times 1} & O_{3 \times 1} \\
O_{3 \times 3} & O_{3 \times 3} & I_{3 \times 3} & O_{3 \times 3} & O_{3 \times 3} & R_z(\phi)^T & O_{3 \times 1} & O_{3 \times 1} & \begin{bmatrix} 0 \\ 0 \\ 1 \end{bmatrix} \\
O_{3 \times 3} & O_{3 \times 3} & O_{3 \times 3} & O_{3 \times 3} & O_{3 \times 3} & O_{3 \times 3} & O_{3 \times 1} & O_{3 \times 1} & O_{3 \times 1} \\
O_{3 \times 3} & O_{3 \times 3} & O_{3 \times 3} & O_{3 \times 3} & O_{3 \times 3} & O_{3 \times 3} & O_{3 \times 1} & O_{3 \times 1} & O_{3 \times 1} \\
O_{3 \times 3} & O_{3 \times 3} & O_{3 \times 3} & O_{3 \times 3} & O_{3 \times 3} & O_{3 \times 3} & O_{3 \times 1} & O_{3 \times 1} & O_{3 \times 1} \\
O_{1 \times 3} & O_{1 \times 3} & O_{1 \times 3} & O_{1 \times 3} & O_{1 \times 3} & O_{1 \times 3} & O_{1 \times 1} & O_{1 \times 1} & O_{1 \times 1}
\end{bmatrix}
$$
