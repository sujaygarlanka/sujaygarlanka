import * as CANNON from 'cannon-es'

export default class RobotController {
    constructor(robot) {
        this.robot = robot
    }

    *actionGenerator(command) {
        switch (command.command) {
            case 'navigate':
                yield *this.navigate(command.position, command.orientation)
                break
            case 'magnetize':
                yield *this.magnetize()
                break
            case 'demagnetize':
                yield *this.demagnetize()
                break
            case 'arm':
                yield *this.moveArm(command.orientation)
                break
            case 'brake':
                yield *this.brake()
                break
            case 'backup':
                yield *this.backup(command.time)
                break
            case 'wait':
                yield *this.wait()
                break
            default:
                yield null
                break
        }
    }

    *navigate(position, orientation) {
        const Kp = 2
        const Kd = 5
        while (this.distance2d(this.robot.position, position) > 0.1) {
            // console.log(this.distance2d(this.robot.position, position))
            let navigateOrientation = position.vsub(this.robot.position)
            navigateOrientation = -Math.atan2(navigateOrientation.z, navigateOrientation.x)
            if (Math.abs(this._angleRobotFrame(navigateOrientation)) >= 0.02) {
                yield *this.turn(navigateOrientation)
            }
            else {
                const direction = Math.sign(this.robot.chassisBody.pointToLocalFrame(position).x)
                const error = this.distance2d(this.robot.position, position)
                const vel = this.robot.velocity.length()
                let F = Kp * direction * error + Kd * (-vel)
                F = this.clipNumber(F, -15, 15)
                F = Math.abs(F) < 1 ? 1 : F
                yield [[F, F, F, F], true]
            }
        }
        yield *this.brake()
        if (orientation !== null) {
            yield *this.turn(orientation, 0.001, false) 
            yield *this.brake()
        }
    }
    
    *turn(orientation, precision=0.01, cheat=false) {
        // console.log(orientation) 
        while (Math.abs(this._angleRobotFrame(orientation)) >= precision) {
            if (this._angleRobotFrame(orientation) > 0) {
                if (cheat) {
                    this.robot.orientation = 0.1
                    yield [4, true]
                } else {
                    yield [2, false]
                }
                
            }
            else {
                if (cheat) {
                    this.robot.orientation = -0.01
                    yield [4, true]
                } else {
                    yield [3, false]
                }
                
            }
        }
    }

    *backup(time) {
        for (let i = 0; i < time*60; i++) {
            yield [1, false]
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
        for (let i = 0; i<100; i++) {
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

    _angleRobotFrame(orientation) {
        const quat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), orientation)
        const transformedQuat = quat.mult(this.robot.quaternion.inverse())
        const target = new CANNON.Vec3(0, 0, 0)
        transformedQuat.toEuler(target)
        // console.log(this.robot.orientation)
        // console.log(target.y)
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

    clipNumber(value, min, max) {
        return Math.max(min, Math.min(value, max));
      }

    distance2d(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.z - p2.z, 2))
    }
}

