'use client';

import { TypeAnimation } from 'react-type-animation';
import AOS from 'aos';
import { useEffect, useRef } from 'react';
import 'aos/dist/aos.css';

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const NODE_COUNT = 100;
  const CONNECT_RADIUS = 140;
  const HOP_DELAY = 100;
  const ANIMATION_DURATION = 1000;

  useEffect(() => {
    AOS.init({ duration: 700, once: true });

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    resizeCanvas();  // Set initial canvas size

    // Update canvas size on window resize
    window.addEventListener('resize', resizeCanvas);

    // Define node type
    type Node = {
      x: number;
      y: number;
      radius: number;
      neighbors: Node[];
      delay?: number;
    };

    // Generate random nodes with radius
    const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 2, // radius between 2 and 4
      neighbors: [],
    }));

    // Connect nodes within CONNECT_RADIUS
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < CONNECT_RADIUS) {
          nodes[i].neighbors.push(nodes[j]);
          nodes[j].neighbors.push(nodes[i]);
        }
      }
    }

    // Pick center node (closest to canvas center)
    const centerNode = nodes.reduce((closest, node) => {
      const d1 = Math.hypot(closest.x - canvas.width / 2, closest.y - canvas.height / 2);
      const d2 = Math.hypot(node.x - canvas.width / 2, node.y - canvas.height / 2);
      return d2 < d1 ? node : closest;
    });

    // BFS to assign delay per node based on graph distance
    const visited = new Set<Node>();
    const queue: { node: Node; depth: number }[] = [{ node: centerNode, depth: 0 }];
    visited.add(centerNode);
    centerNode.delay = 0;

    while (queue.length > 0) {
      const { node, depth } = queue.shift()!;
      node.delay = depth * HOP_DELAY;

      for (const neighbor of node.neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ node: neighbor, depth: depth + 1 });
        }
      }
    }

    const start = performance.now();

    const draw = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw edges with varying opacity and capped maximum opacity
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (const node of nodes) {
        for (const neighbor of node.neighbors) {
          const dx = node.x - neighbor.x;
          const dy = node.y - neighbor.y;
          const dist = Math.hypot(dx, dy);
          const edgeOpacity = Math.max(0.1, 1 - dist / CONNECT_RADIUS); // Vary opacity based on distance
          const clampedOpacity = Math.min(edgeOpacity, 0.7);

          ctx.strokeStyle = `rgba(147, 197, 253, ${clampedOpacity})`; // Adjust edge opacity
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(neighbor.x, neighbor.y);
        }
      }
      ctx.stroke();

      // Draw nodes with soft glow, pulsing, and edge emphasis
      for (const node of nodes) {
        const delay = node.delay ?? 0;
        const progress = Math.min(1, Math.max(0, (elapsed - delay) / ANIMATION_DURATION));

        // Pulsing effect: adjust node size based on progress
        const pulseFactor = 1 + 0.2 * Math.sin(progress * Math.PI * 2); // Smooth pulse
        const nodeRadius = node.radius * pulseFactor;

        // Highlight edge nodes by making them pulse more
        const isEdgeNode = node.neighbors.length <= 2; // Nodes with fewer neighbors are edges
        const glowIntensity = isEdgeNode ? 0.4 : 0.2; // Edge nodes glow more

        // Soft glow: draw a larger, semi-transparent circle behind the node
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius + 3, 0, Math.PI * 2); // Glowing effect
        ctx.fillStyle = `rgba(59, 130, 246, ${progress * glowIntensity})`; // Glowing soft blue
        ctx.fill();

        // Main node
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${progress})`; // Bright blue
        ctx.fill();
      }

      if (elapsed < Math.max(...nodes.map(n => n.delay ?? 0)) + ANIMATION_DURATION) {
        requestAnimationFrame(draw);
      }
    };

    requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <section className="relative px-4">
      {/* Hero text */}
      <div className="h-screen w-full flex flex-col items-center justify-center relative z-10 text-white text-center px-4 py-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-3 drop-shadow-lg">
          Hi, I'm Thái Hòa
        </h1>

        <TypeAnimation
          sequence={[
            'Web Developer 👨‍💻', 2000,
            'UI/UX Enthusiast 🎨', 2000,
            'React & Next.js Fan ⚛️', 2000,
          ]}
          wrapper="span"
          speed={50}
          repeat={Infinity}
          className="text-sm md:text-base max-w-lg drop-shadow-md mx-auto"
        />
      </div>

      {/* About Section */}
      <section
        id="about"
        className="py-12 px-4 z-10 relative flex flex-col items-center justify-center w-full"
      >
        <div className="max-w-6xl mx-auto space-y-20 px-25">
          {/* About - Left image, right text */}
          <div className="flex items-center justify-between gap-12" data-aos="fade-right">
            <div className="flex-shrink-0">
              <img
                src="/network-icon.png"
                alt="network-icon"
                className="w-auto h-auto max-w-[90px] max-h-[90px] object-contain"
              />
            </div>
            <div className="flex-1 text-left">
              <h2 className="text-xl font-semibold mb-3">About Me</h2>
              <p className="text-sm text-gray-300 mb-3">
                I am a passionate web developer with a focus on modern front-end technologies like React and Next.js.
              </p>
              <p className="text-sm text-gray-300 mb-3">
                I enjoy creating user-friendly interfaces and building intuitive, responsive websites.
              </p>
            </div>
          </div>

          {/* Skills - Right image, left text */}
          <div className="flex items-center justify-between gap-12" data-aos="fade-left">
            <div className="flex-1 text-left">
              <h2 className="text-xl font-semibold mb-3">My Skills</h2>
              <p className="text-sm text-gray-300 mb-3">
                I specialize in building scalable web applications, focusing on performance and seamless user experience.
              </p>
            </div>
            <div className="flex-shrink-0">
              <img
                src="/computer.png"
                alt="Skills"
                className="w-auto h-auto max-w-[90px] max-h-[90px] object-contain"
              />
            </div>
          </div>

          {/* Projects */}
          <div className="flex flex-col items-center space-y-6" data-aos="fade-up">
            <h2 className="text-xl font-semibold mb-3">My Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <img
                  src="/project.png"
                  alt="Project 1"
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
                <h3 className="text-base font-semibold mb-1">Project One</h3>
                <p className="text-gray-300 text-xs">
                  A modern e-commerce platform built with Next.js and Tailwind CSS.
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <img
                  src="/project.png"
                  alt="Project 2"
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
                <h3 className="text-base font-semibold mb-1">Project Two</h3>
                <p className="text-gray-300 text-xs">
                  A real-time chat application using React, Firebase, and WebSocket.
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <img
                  src="/project.png"
                  alt="Project 3"
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
                <h3 className="text-base font-semibold mb-1">Project Three</h3>
                <p className="text-gray-300 text-xs">
                  A portfolio website showcasing my skills and projects, built with Next.js.
                </p>
              </div>
            </div>
            <a
              href="/projects"
              className="mt-5 inline-block transition rounded-full text-white font-medium text-sm"
            >
              View All Projects
            </a>
          </div>
        </div>
      </section>

      {/* Canvas Animation */}
      <canvas ref={canvasRef} className="absolute top-0 left-0 z-0 w-full"></canvas>
    </section>
  );
}
  