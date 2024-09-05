import * as CANNON from 'cannon-es'

export default class RobotController {

    

    constructor(robot) {
        this.robot = robot
        this.KP = 2;
        this.KD = 5;
    }

    *actionGenerator(command) {
        if (command === undefined) {
            yield null
        }
        switch (command.command) {
            case 'navigate':
                yield *this.navigate(...Object.values(command.args))
                break
            case 'turn':
                yield *this.turn(...Object.values(command.args))
                break
            case 'arm':
                yield *this.moveArm(...Object.values(command.args))
                break
            case 'forward':
                yield *this.forward(...Object.values(command.args))
                break
            case 'backward':
                yield *this.backward(...Object.values(command.args))
                break
            case 'brake':
                yield *this.brake()
                break
            case 'wait':
                yield *this.wait()
                break
            case 'magnetize':
                yield *this.magnetize()
                break
            case 'demagnetize':
                yield *this.demagnetize()
                break
            default:
                yield null
                break
        }
    }

    *navigate(position, orientation) {
        while (this._distance2d(this.robot.position, position) > 0.1) {
            // console.log(this._distance2d(this.robot.position, position))
            let navigateOrientation = position.vsub(this.robot.position)
            navigateOrientation = -Math.atan2(navigateOrientation.z, navigateOrientation.x)
            if (Math.abs(this._angleRobotFrame(navigateOrientation)) >= 0.02) {
                yield *this.turn(navigateOrientation)
            }
            else {
                const direction = Math.sign(this.robot.chassisBody.pointToLocalFrame(position).x)
                const error = this._distance2d(this.robot.position, position)
                const vel = this.robot.velocity.length()
                let F = this.KP * direction * error + this.KD * (-vel)
                F = this._bounds(15, 1, F)
                yield [[F, F, F, F], true]
            }
        }
        yield *this.brake()
        if (orientation !== null) {
            yield *this.turn(orientation, 0.001, true) 
            yield *this.brake()
        }
    }
    
    *turn(orientation, precision=0.01, cheat=false) {
        while (Math.abs(this._angleRobotFrame(orientation)) >= precision) {
            const error = Math.abs(this._angleRobotFrame(orientation)) 
            const direction = Math.sign(this._angleRobotFrame(orientation))
            let P = this.KP * direction * error
            P = this._bounds(2, 0.2, P)
            // Left if P positive, right if P negative
            yield [[P*50, -P*50, P*50, -P*50], true]
        }
        if (cheat) {
            this.robot.yaw = orientation
        }
    }

    *forward(distance) {
        const startPosition = this.robot.position.clone()
        while (Math.abs(this._distance2d(this.robot.position, startPosition) - distance) > 0.1) {
            const error = distance - this._distance2d(this.robot.position, startPosition)
            const vel = this.robot.velocity.length()
            let F = this.KP * error + this.KD * (-vel)
            F = this._bounds(15, 2, F)
            yield [[F, F, F, F], true]
        }
        this.robot.completeStop()
    }

    *backward(distance) {
        const startPosition = this.robot.position.clone()
        while (Math.abs(this._distance2d(this.robot.position, startPosition) - distance) > 0.1) {
            const error = this._distance2d(this.robot.position, startPosition) - distance
            const vel = this.robot.velocity.length()
            let F = this.KP * error + this.KD * (-vel)
            F = this._bounds(15, 2, F)
            yield [[F, F, F, F], true]
        }
        this.robot.completeStop()
    }

    *magnetize() {
        yield [7, false]
    }

    *demagnetize() {
        yield [8, false]
    }

    *wait() {
        for (let i = 0; i<50; i++) {
            yield [4, false]
        }
    }

    *brake() {
        // while (this.robot.velocity.length() > 0.1 || this.robot.angularVelocity.length() > 0.05) {
        //     yield [9, false]
        // }
        // yield [10, false]
        this.robot.completeStop()
    }

    _bounds(outer, inner, value) {
        const outerMin = -outer
        const outerMax = outer
        let temp;
        temp = Math.max(outerMin, Math.min(value, outerMax))
        return Math.abs(temp) < inner ? Math.sign(temp) * inner : temp
    }

    _angleRobotFrame(orientation) {
        const quat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), orientation)
        const transformedQuat = quat.mult(this.robot.quaternion.inverse())
        const target = new CANNON.Vec3(0, 0, 0)
        transformedQuat.toEuler(target)
        return target.y
    }

    _armRobotFrame() {
        const transformedQuat = this.robot.arm.quaternion.inverse().mult(this.robot.quaternion)
        const target = new CANNON.Vec3(0, 0, 0)
        transformedQuat.toEuler(target)
        return -1 * target.z

    }

    *moveArm(orientation) {
        while (Math.abs(orientation - this._armRobotFrame()) >= 0.017) {
            if (orientation - this._armRobotFrame() > 0) {
                yield [5, false]
            }
            else {
                yield [6, false]
            }
        }
        yield [4, false]
    }

    _distance2d(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.z - p2.z, 2))
    }
}

