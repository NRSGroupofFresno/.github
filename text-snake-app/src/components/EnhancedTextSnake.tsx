import { useRef, useEffect, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
}

interface EnhancedTextSnakeProps {
  text: string;
  fontSize?: number;
  fontColor?: string;
  backgroundColor?: string;
  letterSpacing?: number;
}

export function EnhancedTextSnake({
  text,
  fontSize = 96,
  fontColor = '#FFC9C1',
  backgroundColor = '#877A7A',
  letterSpacing = 0.5,
}: EnhancedTextSnakeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathRef = useRef<Point[]>([]);
  const animationRef = useRef<number>(0);
  const lastPointRef = useRef<Point | null>(null);

  // Calculate target path length based on text
  const getTargetPathLength = useCallback(() => {
    const textLength = text.length * fontSize * letterSpacing;
    return Math.max(4000, textLength * 2);
  }, [text, fontSize, letterSpacing]);

  // Calculate the total length of a path
  const calculatePathLength = useCallback((path: Point[]): number => {
    let length = 0;
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
  }, []);

  // Get distance along path from start to a specific index
  const getDistanceToIndex = useCallback((path: Point[], index: number): number => {
    let distance = 0;
    for (let i = 1; i <= index && i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      distance += Math.sqrt(dx * dx + dy * dy);
    }
    return distance;
  }, []);

  // Get point at specific distance along path
  const getPointAtDistance = useCallback((path: Point[], targetDistance: number): { point: Point; angle: number } | null => {
    if (path.length < 2) return null;

    let accumulatedDistance = 0;

    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);

      if (accumulatedDistance + segmentLength >= targetDistance) {
        const remainingDistance = targetDistance - accumulatedDistance;
        const ratio = segmentLength > 0 ? remainingDistance / segmentLength : 0;

        return {
          point: {
            x: path[i - 1].x + dx * ratio,
            y: path[i - 1].y + dy * ratio,
          },
          angle: Math.atan2(dy, dx),
        };
      }

      accumulatedDistance += segmentLength;
    }

    // Return last point if distance exceeds path length
    const lastIdx = path.length - 1;
    const dx = path[lastIdx].x - path[lastIdx - 1].x;
    const dy = path[lastIdx].y - path[lastIdx - 1].y;
    return {
      point: path[lastIdx],
      angle: Math.atan2(dy, dx),
    };
  }, []);

  // Trim path to maintain target length
  const trimPathToLength = useCallback((path: Point[], targetLength: number): Point[] => {
    const totalLength = calculatePathLength(path);
    if (totalLength <= targetLength) return path;

    const excessLength = totalLength - targetLength;
    let accumulatedLength = 0;
    let trimIndex = 0;

    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);

      if (accumulatedLength + segmentLength >= excessLength) {
        // Interpolate the new starting point
        const remainingToTrim = excessLength - accumulatedLength;
        const ratio = segmentLength > 0 ? remainingToTrim / segmentLength : 0;

        const newStartPoint: Point = {
          x: path[i - 1].x + dx * ratio,
          y: path[i - 1].y + dy * ratio,
        };

        return [newStartPoint, ...path.slice(i)];
      }

      accumulatedLength += segmentLength;
      trimIndex = i;
    }

    return path.slice(trimIndex);
  }, [calculatePathLength]);

  // Render the canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Set canvas size accounting for device pixel ratio
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, rect.width, rect.height);

    const path = pathRef.current;
    if (path.length < 2) {
      // Show instruction text when no path
      ctx.font = `${fontSize * 0.3}px Inter, system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = fontColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Move your cursor to create text trail', rect.width / 2, rect.height / 2);
      return;
    }

    const totalPathLength = calculatePathLength(path);
    const charSpacing = fontSize * letterSpacing;
    const textTotalLength = text.length * charSpacing;

    // Start text from the end of the path (cursor position) and work backwards
    const startDistance = Math.max(0, totalPathLength - textTotalLength);

    // Set up text rendering
    ctx.font = `${fontSize}px Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = fontColor;

    // Render each character along the path
    for (let i = 0; i < text.length; i++) {
      const charDistance = startDistance + i * charSpacing + charSpacing / 2;
      const result = getPointAtDistance(path, charDistance);

      if (result) {
        const { point, angle } = result;

        ctx.save();
        ctx.translate(point.x, point.y);
        ctx.rotate(angle);
        ctx.fillText(text[i], 0, 0);
        ctx.restore();
      }
    }
  }, [text, fontSize, fontColor, backgroundColor, letterSpacing, calculatePathLength, getPointAtDistance]);

  // Handle mouse movement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Only add point if it's sufficiently different from the last point
    const lastPoint = lastPointRef.current;
    const minDistance = 5;

    if (!lastPoint ||
        Math.abs(x - lastPoint.x) > minDistance ||
        Math.abs(y - lastPoint.y) > minDistance) {

      pathRef.current.push({ x, y });
      lastPointRef.current = { x, y };

      // Trim path to maintain target length
      const targetLength = getTargetPathLength();
      pathRef.current = trimPathToLength(pathRef.current, targetLength);
    }
  }, [getTargetPathLength, trimPathToLength]);

  // Handle touch movement
  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const lastPoint = lastPointRef.current;
    const minDistance = 5;

    if (!lastPoint ||
        Math.abs(x - lastPoint.x) > minDistance ||
        Math.abs(y - lastPoint.y) > minDistance) {

      pathRef.current.push({ x, y });
      lastPointRef.current = { x, y };

      const targetLength = getTargetPathLength();
      pathRef.current = trimPathToLength(pathRef.current, targetLength);
    }
  }, [getTargetPathLength, trimPathToLength]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      render();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [render]);

  // Set up event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleMouseMove, handleTouchMove]);

  // Reset path when text changes
  useEffect(() => {
    pathRef.current = [];
    lastPointRef.current = null;
  }, [text]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        cursor: 'crosshair',
        touchAction: 'none',
      }}
    />
  );
}
