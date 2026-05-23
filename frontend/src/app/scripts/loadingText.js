import { useState, useEffect } from "react";

function LoadingText({text, color = "[#9c76cd]", checkout = false, size = "24", speed = 200}) {
  const [dots, setDots] = useState(".");

useEffect(() => {
  const interval = setInterval(() => {
    setDots(prev => (prev.length === 3 ? "." : prev + "."));
  }, speed);

  // cambio inmediato sin esperar speed
  setDots(prev => (prev.length === 3 ? "." : prev + "."));

  return () => clearInterval(interval);
}, [speed]);

  return <span className={`justify-center items-center ${checkout ?  "" : "font-content" } text-${color}`}>
     {text}
     <span className={`inline-block !text-[${size}] w-4 text-center w-auto h-auto`}>
      {dots}
    </span></span>;
}

export default LoadingText;
