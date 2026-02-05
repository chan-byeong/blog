import { useRef, useCallback } from 'react';

interface UseDragProps {
  clamp?: boolean;
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

/**
 *
 * @param param0
 * - clamp: 클램프 여부 (기본값: true)
 * - padding: 패딩 (기본값: { top: 0, right: 0, bottom: 0, left: 0 })
 * @returns
 * - containerRef: 이동되는 컨테이너 참조
 * - handleProps: 이동되는 컨테이너의 이벤트 핸들러
 *  - onPointerDown: 포인터 다운 이벤트 핸들러
 *  - onPointerMove: 포인터 모션 이벤트 핸들러
 *  - onPointerUp: 포인터 업 이벤트 핸들러
 */
export const useDrag = ({
  clamp = true,
  padding = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
}: UseDragProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const state = useRef({
    offset: { x: 0, y: 0 },
    startMouse: { x: 0, y: 0 },
    startOffset: { x: 0, y: 0 },
    bounds: {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    },
    dragging: false,
  });

  const applyTransform = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const { x, y } = state.current.offset;
    el.style.transform = `translate(${x}px, ${y}px)`;
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;

      e.currentTarget.setPointerCapture(e.pointerId); // 포인터 캡처 설정

      const s = state.current;
      s.dragging = true;
      s.startMouse = { x: e.clientX, y: e.clientY };
      s.startOffset = { x: s.offset.x, y: s.offset.y };

      if (clamp) {
        const vw = document.documentElement.clientWidth;
        const vh = document.documentElement.clientHeight;
        const { width, height } = el.getBoundingClientRect();

        s.bounds = {
          minX: width + padding.left - vw,
          maxX: padding.right,
          minY: height + padding.top - vh,
          maxY: padding.bottom,
        };
      }
    },
    [clamp, padding]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const s = state.current;
      if (!s.dragging) return;

      let nextX = s.startOffset.x + (e.clientX - s.startMouse.x);
      let nextY = s.startOffset.y + (e.clientY - s.startMouse.y);

      if (clamp) {
        const { minX, maxX, minY, maxY } = s.bounds;
        nextX = Math.min(maxX, Math.max(minX, nextX));
        nextY = Math.min(maxY, Math.max(minY, nextY));
      }

      s.offset = { x: nextX, y: nextY };
      applyTransform();
    },
    [clamp, applyTransform]
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    state.current.dragging = false;
    containerRef.current?.releasePointerCapture(e.pointerId); // 포인터 캡처 해제
  }, []);

  return {
    containerRef,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
    },
  };
};
