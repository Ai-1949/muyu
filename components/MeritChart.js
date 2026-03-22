'use client';

import { useEffect, useRef } from 'react';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

// 注册 Chart.js 模块（柱状图 + 坐标轴 + 提示）
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

/**
 * 近 7 日功德柱状图（Chart.js）
 * @param {{ labels: string[], data: number[], className?: string }} props
 * - labels：横轴日期文案（已格式化为短字符串）
 * - data：与 labels 一一对应的次数
 */
export function MeritChart({ labels, data, className = '' }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !labels.length) return;

    // 销毁旧实例，避免热更新重复绑定
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: '当日功德',
            data,
            borderRadius: 8,
            backgroundColor: 'rgba(201, 162, 39, 0.45)',
            borderColor: 'rgba(201, 162, 39, 0.9)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => ` ${item.parsed.y} 次`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#8a8580', maxRotation: 0 },
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, color: '#8a8580' },
            grid: { color: 'rgba(44, 40, 37, 0.06)' },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [labels, data]);

  return (
    <div className={`relative h-56 w-full ${className}`}>
      <canvas ref={canvasRef} aria-label="近七日功德柱状图" />
    </div>
  );
}
