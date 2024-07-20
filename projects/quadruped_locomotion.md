# Quaduped Locomotion

I worked on implementing locomotion for a quadruped in MATLAB. This proved to be far more involved and than I first imagined. I ended up implementing a walking gait and used that for forward, backward and lateral movement. Below, I elaborate on the math and coding required for the walking gait, which sets the foundation for more complicated locomotion like running and jumping.

## Background
The walking gait is a type of 

 $inline test$

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
