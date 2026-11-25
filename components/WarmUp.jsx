"use client";

// Put this last inside a <Canvas>. It asks the graphics card to prepare every
// material in the background, then says when the scene can be drawn without a hitch.
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

export default function WarmUp({ onReady }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    let gone = false;
    // Hidden things are skipped when compiling, so show everything for a moment.
    const hidden = [];
    scene.traverse((o) => {
      if (!o.visible) {
        hidden.push(o);
        o.visible = true;
      }
    });
    const done = () => !gone && onReady?.();
    gl.compileAsync(scene, camera).then(done, done);
    hidden.forEach((o) => (o.visible = false));
    return () => {
      gone = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);
  return null;
}
