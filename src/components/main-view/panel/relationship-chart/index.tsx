import * as echarts from 'echarts/core';
import { useRef } from 'react';

export default function RelationshipChart(){
    const chartRef = useRef<HTMLDivElement>(null);
    if (chartRef.current !== null) {
        chart = init(chartRef.current, theme);
      }
    return (
        <div ref={chartRef}>

        </div>
    );
}