# AUREXIS Robot Interactions Update

This patch changes only the global 3D robot interaction/animation system.

Changed files:
- frontend/src/components/robot-guide/robot-guide.types.ts
- frontend/src/components/robot-guide/RobotInteractionArea.tsx
- frontend/src/components/robot-guide/RobotCanvas.tsx
- frontend/src/components/robot-guide/RobotScene.tsx
- frontend/src/components/robot-guide/GlobalRobotGuide.tsx
- frontend/src/components/robot-guide/GlobalRobotGuide.module.css

Behavior included:
- WebGL blue hover/tap halo rendered behind the robot.
- Safe click/tap and keyboard chat activation.
- Two-second stop messages with cooldown and timer cleanup.
- Wider smooth head tracking.
- Random low-frequency idle actions.
- Message-synchronized arm pointing based on the real DOM target direction.
- Explicit animation state priority.
- Reduced-motion support preserved.

No robot stop positions, geometry, size, core palette, backend, auth, chat route, or page layout were changed.
