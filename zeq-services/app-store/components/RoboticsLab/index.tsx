import React, { useState, useCallback } from 'react';
import { Bot } from 'lucide-react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { EntropyVerifier } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';
import { RobotArm2D } from './RobotArm2D';
import {
  KinematicsSolver,
  JointAngles,
  LinkLengths,
  KinematicsMode,
  inverseKinematics2Link,
} from './KinematicsSolver';
import { JointControls } from './JointControls';

const DEFAULT_ANGLES: JointAngles = { theta1: 45, theta2: 30, theta3: -20 };
const DEFAULT_LINKS: LinkLengths = { L1: 2.0, L2: 1.5, L3: 1.0 };

const RoboticsLab: React.FC = () => {
  const [angles, setAngles] = useState<JointAngles>(DEFAULT_ANGLES);
  const [links, setLinks] = useState<LinkLengths>(DEFAULT_LINKS);
  const [mode, setMode] = useState<KinematicsMode>('forward');
  const [targetX, setTargetX] = useState(3.0);
  const [targetY, setTargetY] = useState(2.0);

  // When switching to IK mode, solve IK and apply to angles
  const handleModeChange = useCallback((newMode: KinematicsMode) => {
    setMode(newMode);
    if (newMode === 'inverse') {
      const ik = inverseKinematics2Link(targetX, targetY, links.L1, links.L2);
      if (ik.reachable) {
        setAngles({ theta1: ik.theta1, theta2: ik.theta2, theta3: 0 });
      }
    }
  }, [targetX, targetY, links]);

  const handleTargetChange = useCallback((x: number, y: number) => {
    setTargetX(x);
    setTargetY(y);
    // Auto-solve IK when in inverse mode
    if (mode === 'inverse') {
      const ik = inverseKinematics2Link(x, y, links.L1, links.L2);
      if (ik.reachable) {
        setAngles({ theta1: ik.theta1, theta2: ik.theta2, theta3: 0 });
      }
    }
  }, [mode, links]);

  const handleReset = useCallback(() => {
    setAngles(DEFAULT_ANGLES);
    setLinks(DEFAULT_LINKS);
    setMode('forward');
    setTargetX(3.0);
    setTargetY(2.0);
  }, []);

  const entropyData = [
    angles.theta1, angles.theta2, angles.theta3,
    links.L1, links.L2, links.L3,
    targetX, targetY,
  ];

  const sidebar = (
    <div className="space-y-4">
      <JointControls
        angles={angles}
        links={links}
        mode={mode}
        targetX={targetX}
        targetY={targetY}
        onAnglesChange={setAngles}
        onLinksChange={setLinks}
        onModeChange={handleModeChange}
        onTargetChange={handleTargetChange}
        onReset={handleReset}
      />
      <EntropyVerifier data={entropyData} label="Joint Config Entropy" />
      <KolmogorovChecker
        data={JSON.stringify({ angles, links, mode })}
        label="Config Complexity"
      />
    </div>
  );

  return (
    <AppPageLayout
      title="Robotics Kinematics Lab"
      description="3-link planar robot arm with forward and inverse kinematics"
      domain="Robotics"
      sidebar={sidebar}
    >
      <RobotArm2D
        angles={angles}
        links={links}
        mode={mode}
        targetX={targetX}
        targetY={targetY}
      />
      <KinematicsSolver
        angles={angles}
        links={links}
        mode={mode}
        targetX={targetX}
        targetY={targetY}
      />
    </AppPageLayout>
  );
};

export default RoboticsLab;
