import React, { useEffect, useRef } from 'react';
import styles from './HeroNodes.module.css';

// Slowly drifting nodes joined by thin lines, drawn on a canvas behind the home page header.
// The canvas fades out toward the center (CSS mask) so the headline and the signup card stay in focus.
// It draws one still frame when the visitor prefers reduced motion, and pauses when the header is
// off screen or the tab is hidden.
const COLORS = ['41,146,254', '157,132,248', '45,196,178', '232,150,240'];
const LINK_DISTANCE = 150;

export default function HeroNodes() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas && canvas.getContext('2d');
    if (!ctx) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let nodes = [];
    let frame = 0;
    let visible = true;

    const seed = () => {
      const count = Math.max(22, Math.min(72, Math.round(width / 22)));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: i % 9 === 0 ? 4.5 : 1.8 + Math.random() * 2,
        color: COLORS[i % COLORS.length],
      }));
    };

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      seed();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.hypot(dx, dy);
          if (distance < LINK_DISTANCE) {
            ctx.strokeStyle = `rgba(120,135,175,${(1 - distance / LINK_DISTANCE) * 0.45})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      for (const node of nodes) {
        if (node.r > 4) {
          ctx.fillStyle = `rgba(${node.color},0.15)`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.r * 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(${node.color},0.85)`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        if (node.y > height + 20) node.y = -20;
      }
      draw();
      frame = visible && !document.hidden ? requestAnimationFrame(step) : 0;
    };

    const start = () => {
      if (!reduceMotion && !frame && visible && !document.hidden) frame = requestAnimationFrame(step);
    };

    resize();
    draw();
    start();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizeObserver.observe(canvas.parentElement);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    intersection.observe(canvas.parentElement);
    document.addEventListener('visibilitychange', start);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', start);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
