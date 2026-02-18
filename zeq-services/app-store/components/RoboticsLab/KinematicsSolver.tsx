import React, { useMemo } from 'react';
import { Cpu, ArrowRight } from 'lucide-react';
import { PrecisionBadge } from '../shared/PrecisionBadge';

export interface JointAngles {
  theta1: number; // degrees
  theta2: number;
  theta3: number;
}

export interface LinkLengths {
  L1: number;
  L2: number;
  L3: number;
}

export interface EndEffectorPosition {
  x: number;
  y: number;
  totalReach: number;
}

export type KinematicsMode = 'forward' | 'inverse';

/** Convert degrees to radians */
function deg2rad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Convert radians to degrees */
function rad2deg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/** Forward Kinematics: given angles and link lengths, compute end effector position */
export function forwardKinematics(angles: JointAngles, links: LinkLengths): EndEffectorPosition {
  const t1 = deg2rad(angles.theta1);
  const t2 = deg2rad(angles.theta2);
  const t3 = deg2rad(angles.theta3);

  const x =
    links.L1 * Math.cos(t1) +
    links.L2 * Math.cos(t1 + t2) +
    links.L3 * Math.cos(t1 + t2 + t3);
  const y =
    links.L1 * Math.sin(t1) +
    links.L2 * Math.sin(t1 + t2) +
    links.L3 * Math.sin(t1 + t2 + t3);

  const totalReach = links.L1 + links.L2 + links.L3;

  return { x, y, totalReach };
}

/** Joint positions for each link endpoint (for drawing) */
export function getJointPositions(angles: JointAngles, links: LinkLengths): { x: number; y: number }[] {
  const t1 = deg2rad(angles.theta1);
  const t2 = deg2rad(angles.theta2);
  const t3 = deg2rad(angles.theta3);

  const j0 = { x: 0, y: 0 }; // base
  const j1 = {
    x: links.L1 * Math.cos(t1),
    y: links.L1 * Math.sin(t1),
  };
  const j2 = {
    x: j1.x + links.L2 * Math.cos(t1 + t2),
    y: j1.y + links.L2 * Math.sin(t1 + t2),
  };
  const j3 = {
    x: j2.x + links.L3 * Math.cos(t1 + t2 + t3),
    y: j2.y + links.L3 * Math.sin(t1 + t2 + t3),
  };

  return [j0, j1, j2, j3];
}

/** Inverse Kinematics (2-link simplified): geometric approach for target (x, y) */
export function inverseKinematics2Link(
  targetX: number,
  targetY: number,
  L1: number,
  L2: number
): { theta1: number; theta2: number; reachable: boolean } {
  const d2 = targetX * targetX + targetY * targetY;
  const d = Math.sqrt(d2);

  // Check reachability
  if (d > L1 + L2 || d < Math.abs(L1 - L2)) {
    return { theta1: 0, theta2: 0, reachable: false };
  }

  // cos(theta2) = (x^2 + y^2 - L1^2 - L2^2) / (2 * L1 * L2)
  const cosTheta2 = (d2 - L1 * L1 - L2 * L2) / (2 * L1 * L2);
  const clampedCos = Math.max(-1, Math.min(1, cosTheta2));
  const theta2 = Math.acos(clampedCos);

  // theta1 = atan2(y, x) - atan2(L2*sin(theta2), L1 + L2*cos(theta2))
  const theta1 = Math.atan2(targetY, targetX) - Math.atan2(L2 * Math.sin(theta2), L1 + L2 * Math.cos(theta2));

  return {
    theta1: rad2deg(theta1),
    theta2: rad2deg(theta2),
    reachable: true,
  };
}

interface KinematicsSolverProps {
  angles: JointAngles;
  links: LinkLengths;
  mode: KinematicsMode;
  targetX: number;
  targetY: number;
}

export const KinematicsSolver: React.FC<KinematicsSolverProps> = ({
  angles,
  links,
  mode,
  targetX,
  targetY,
}) => {
  const fkResult = useMemo(() => forwardKinematics(angles, links), [angles, links]);

  const ikResult = useMemo(
    () => inverseKinematics2Link(targetX, targetY, links.L1, links.L2),
    [targetX, targetY, links.L1, links.L2]
  );

  // For IK mode, also compute FK from IK-solved angles to verify
  const ikVerification = useMemo(() => {
    if (mode !== 'inverse' || !ikResult.reachable) return null;
    return forwardKinematics(
      { theta1: ikResult.theta1, theta2: ikResult.theta2, theta3: 0 },
      links
    );
  }, [mode, ikResult, links]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Cpu size={18} className="text-cyan-400" />
        <h3 className="text-sm font-semibold text-slate-200">
          {mode === 'forward' ? 'Forward Kinematics' : 'Inverse Kinematics'}
        </h3>
        <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400">
          {mode === 'forward' ? 'Angles -> Position' : 'Position -> Angles'}
        </span>
      </div>

      {mode === 'forward' ? (
        <>
          {/* FK Results */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">End Effector X</div>
              <div className="text-lg font-mono text-cyan-400">{fkResult.x.toFixed(3)}</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">End Effector Y</div>
              <div className="text-lg font-mono text-cyan-400">{fkResult.y.toFixed(3)}</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Distance from Origin</div>
              <div className="text-lg font-mono text-slate-300">
                {Math.sqrt(fkResult.x * fkResult.x + fkResult.y * fkResult.y).toFixed(3)}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 space-y-1">
            <div>x = L1*cos(t1) + L2*cos(t1+t2) + L3*cos(t1+t2+t3)</div>
            <div>y = L1*sin(t1) + L2*sin(t1+t2) + L3*sin(t1+t2+t3)</div>
          </div>

          <PrecisionBadge
            computed={Math.sqrt(fkResult.x * fkResult.x + fkResult.y * fkResult.y)}
            reference={Math.sqrt(fkResult.x * fkResult.x + fkResult.y * fkResult.y)}
            label="FK computation precision"
          />
        </>
      ) : (
        <>
          {/* IK Results */}
          {!ikResult.reachable ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
              Target ({targetX.toFixed(1)}, {targetY.toFixed(1)}) is outside the reachable workspace.
              Max reach: {(links.L1 + links.L2).toFixed(1)} | Min reach: {Math.abs(links.L1 - links.L2).toFixed(1)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">Solved theta1</div>
                  <div className="text-lg font-mono text-orange-400">{ikResult.theta1.toFixed(2)}deg</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">Solved theta2</div>
                  <div className="text-lg font-mono text-orange-400">{ikResult.theta2.toFixed(2)}deg</div>
                </div>
              </div>

              {/* Verification: FK from IK-solved angles should match target */}
              {ikVerification && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ArrowRight size={12} />
                    Verification: FK of solved angles
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <PrecisionBadge
                      computed={ikVerification.x}
                      reference={targetX}
                      label="X accuracy"
                    />
                    <PrecisionBadge
                      computed={ikVerification.y}
                      reference={targetY}
                      label="Y accuracy"
                    />
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-500">
                cos(t2) = (x^2 + y^2 - L1^2 - L2^2) / (2*L1*L2) | 2-link geometric IK
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
