'use client'

import { useEffect, useRef } from 'react'

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const NODE_COUNT = 100
  const CONNECT_RADIUS = 150
  const HOP_DELAY = 100
  const ANIMATION_DURATION = 1000

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = window.innerWidth
    const height = window.innerHeight
    canvas.width = width
    canvas.height = height

    // Define node type
    type Node = {
      x: number
      y: number
      radius: number
      neighbors: Node[]
      delay?: number
    }

    // Generate random nodes with radius
    const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 2, // radius between 2 and 4
      neighbors: [],
    }))

    // Connect nodes within CONNECT_RADIUS
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = nodes[i].x - nodes[j].x
        const dy = nodes[i].y - nodes[j].y
        const dist = Math.hypot(dx, dy)
        if (dist < CONNECT_RADIUS) {
          nodes[i].neighbors.push(nodes[j])
          nodes[j].neighbors.push(nodes[i])
        }
      }
    }

    // Pick center node (closest to canvas center)
    const centerNode = nodes.reduce((closest, node) => {
      const d1 = Math.hypot(closest.x - width / 2, closest.y - height / 2)
      const d2 = Math.hypot(node.x - width / 2, node.y - height / 2)
      return d2 < d1 ? node : closest
    })

    // BFS to assign delay per node based on graph distance
    const visited = new Set<Node>()
    const queue: { node: Node; depth: number }[] = [{ node: centerNode, depth: 0 }]
    visited.add(centerNode)
    centerNode.delay = 0

    while (queue.length > 0) {
      const { node, depth } = queue.shift()!
      node.delay = depth * HOP_DELAY

      for (const neighbor of node.neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push({ node: neighbor, depth: depth + 1 })
        }
      }
    }

    const start = performance.now()

    const draw = (now: number) => {
      const elapsed = now - start
      ctx.clearRect(0, 0, width, height)

      // Draw edges with varying opacity and capped maximum opacity
      ctx.lineWidth = 0.3 // Keep the line width the same
      ctx.beginPath()
      for (const node of nodes) {
        for (const neighbor of node.neighbors) {
          const dx = node.x - neighbor.x
          const dy = node.y - neighbor.y
          const dist = Math.hypot(dx, dy)
          const edgeOpacity = Math.max(0.1, 1 - (dist / CONNECT_RADIUS)) // Vary opacity based on distance
          
          // Cap the maximum opacity to avoid overly bold edges
          const clampedOpacity = Math.min(edgeOpacity, 0.7)

          ctx.strokeStyle = `rgba(147, 197, 253, ${clampedOpacity})` // Adjust edge opacity
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(neighbor.x, neighbor.y)
        }
      }
      ctx.stroke()

      // Draw nodes with soft glow, pulsing, and edge emphasis
      for (const node of nodes) {
        const delay = node.delay ?? 0
        const progress = Math.min(
          1,
          Math.max(0, (elapsed - delay) / ANIMATION_DURATION)
        )

        // Pulsing effect: adjust node size based on progress
        const pulseFactor = 1 + 0.2 * Math.sin(progress * Math.PI * 2) // Smooth pulse
        const nodeRadius = node.radius * pulseFactor

        // Highlight edge nodes by making them pulse more
        const isEdgeNode = node.neighbors.length <= 2 // Nodes with fewer neighbors are edges
        const glowIntensity = isEdgeNode ? 0.4 : 0.2 // Edge nodes glow more

        // Soft glow: draw a larger, semi-transparent circle behind the node
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeRadius + 3, 0, Math.PI * 2) // Glowing effect
        ctx.fillStyle = `rgba(59, 130, 246, ${progress * glowIntensity})` // Glowing soft blue
        ctx.fill()

        // Main node
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${progress})` // Bright blue
        ctx.fill()
      }

      if (elapsed < Math.max(...nodes.map(n => (n.delay ?? 0))) + ANIMATION_DURATION) {
        requestAnimationFrame(draw)
      }
    }

    requestAnimationFrame(draw)
  }, [])

  return (
    <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full" />
  )
}
