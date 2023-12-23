import * as echarts from 'echarts/core';
import { useRef } from 'react';
import { useTheme } from '../../../../contexts/theme/theme-context';
import { EChartsOption } from 'echarts';
import { usePaperContext } from '../../../../contexts/papers/paper-context';

export default function RelationshipChart() {
    const chartRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const papers = usePaperContext();
    const paperData = papers.filteredPapers.map(paper => ({
        name: paper.title,
        id: paper.id,
        symbolSize: 10
    }));
    const chart = echarts.init(chartRef.current, theme);
    chart.setOption<EChartsOption>({
        serise: [
            {
                type: 'graph',
                layout: 'force',
                data: paperData,
                force: {
                    repulsion: 50,
                    edgeLength: 10
                },
            }
        ]

    });

    return (
        <div ref={chartRef}>

        </div>
    );
}