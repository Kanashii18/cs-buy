import { useEffect, useRef } from "react";

export default function GeometricBackground({ children }) {
  const backgroundRef = useRef(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    const shapeTypes = ["square", "circle", "triangle", "rectangle"];

    for (let i = 0; i < 40; i++) {
      const shape = document.createElement("div");
      const shapeClass = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];

      shape.className = `absolute opacity-20 shape-${shapeClass}`;

      shape.style.left = `${Math.random() * 100}%`;
      shape.style.top = `${Math.random() * 100}%`;
      shape.style.animationDelay = `${Math.random() * 10}s`;
      shape.style.animationDuration = `${Math.random() * 10 + 10}s`;

      backgroundRef.current.appendChild(shape);
    }

    for (let i = 0; i < 100; i++) {
      const particle = document.createElement("div");

      particle.className =
        "absolute w-[2px] h-[2px] bg-white opacity-50 animate-sparkle";

      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 8}s`;
      particle.style.animationDuration = `${Math.random() * 4 + 4}s`;

      particlesRef.current.appendChild(particle);
    }
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#1a1a2e]">
      {/* shapes */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 z-[1] overflow-hidden"
      />

      {/* particles */}
      <div
        ref={particlesRef}
        className="absolute inset-0 z-0"
      />

      {/* overlay */}
      <div className="absolute inset-0 z-[5] bg-[radial-gradient(circle_at_center,transparent_0%,#1a1a2e_80%)] animate-overlay" />

      {/* content */}
      <div className="relative z-10 flex items-center justify-center h-screen">
        {children}
      </div>
    </div>
  );
}
