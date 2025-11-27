import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { COLORS } from '@/shared/colors';
import styles from './LineChart.module.css';

interface DataPoint {
	date: string;
	variation: string;
	visits: number;
	conversions: number;
	conversionRate: number;
}

interface LineChartProps {
	data: DataPoint[];
	selectedVariations: string[];
	width: number;
	height: number;
}
const LABEL_WIDTH = 80;

export default function LineChart({ data, selectedVariations, width, height }: LineChartProps) {
	const svgRef = useRef<SVGSVGElement>(null);

	const [tooltip, setTooltip] = useState({
		visible: false,
		x: 0,
		y: 0,
		date: '',
		data: [] as { variation: string; rate: number; color: string }[],
	});

	const filteredData = useMemo(
		() => data.filter((d) => selectedVariations.includes(d.variation)),
		[data, selectedVariations]
	);

	const dates = useMemo(
		() => Array.from(new Set(filteredData.map((d) => d.date))).sort(),
		[filteredData]
	);

	const variations = useMemo(
		() => Array.from(new Set(filteredData.map((d) => d.variation))),
		[filteredData]
	);

	useEffect(() => {
		if (!svgRef.current || !filteredData.length) return;

		const margin = { top: 20, right: 20, bottom: 40, left: 50 };
		const chartWidth = width - margin.left - margin.right;
		const chartHeight = height - margin.top - margin.bottom;

		const svg = d3.select(svgRef.current);
		svg.selectAll('*').remove();

		const g = svg
			.attr('width', width)
			.attr('height', height)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		const xScale = d3.scalePoint().domain(dates).range([0, chartWidth]);

		const [minY, maxY] = d3.extent(filteredData, (d) => d.conversionRate) as [number, number];
		const yPadding = (maxY - minY) * 0.1;

		const yScale = d3
			.scaleLinear()
			.domain([Math.max(0, minY - yPadding), maxY + yPadding])
			.range([chartHeight, 0])
			.nice();

		g.append('g')
			.attr('class', styles.grid)
			.selectAll('line')
			.data(yScale.ticks(5))
			.enter()
			.append('line')
			.attr('class', styles.gridLine)
			.attr('x1', 0)
			.attr('x2', chartWidth)
			.attr('y1', (d) => yScale(d))
			.attr('y2', (d) => yScale(d));

		const maxTicks = Math.floor(chartWidth / LABEL_WIDTH);
		let xTicks: string[] = dates;
		if (dates.length > maxTicks) {
			const step = Math.ceil(dates.length / maxTicks);
			xTicks = dates.filter((_, i) => i % step === 0);
		}

		g.append('g')
			.attr('class', styles.axis)
			.attr('transform', `translate(0,${chartHeight})`)
			.call(d3.axisBottom(xScale).tickValues(xTicks).tickSize(0).tickPadding(10))
			.call((g) => g.select('.domain').attr('class', styles.axisLine));

		g.append('g')
			.attr('class', styles.axis)
			.call(
				d3
					.axisLeft(yScale)
					.tickFormat((d) => `${d}%`)
					.tickSize(0)
					.tickPadding(10)
			)
			.call((g) => g.select('.domain').attr('class', styles.axisLine));

		const line = d3
			.line<DataPoint>()
			.x((d) => xScale(d.date)!)
			.y((d) => yScale(d.conversionRate))
			.curve(d3.curveMonotoneX);

		variations.forEach((variation) => {
			const varData = filteredData
				.filter((d) => d.variation === variation)
				.sort((a, b) => a.date.localeCompare(b.date));

			g.append('path')
				.datum(varData)
				.attr('class', styles.line)
				.attr('d', line)
				.attr('stroke', COLORS[variation])
				.attr('stroke-width', 2.5);
		});

		const hoverLine = g
			.append('line')
			.attr('class', styles.hoverLine)
			.attr('y1', 0)
			.attr('y2', chartHeight)
			.style('opacity', 0);

		const xPixels = dates.map((d) => xScale(d) || 0);

		g.append('rect')
			.attr('width', chartWidth)
			.attr('height', chartHeight)
			.attr('fill', 'none')
			.attr('pointer-events', 'all')
			.on('mousemove', (event) => {
				const [mouseX] = d3.pointer(event);

				const i = d3.bisectCenter(xPixels, mouseX);
				const date = dates[i];
				if (!date) return;

				const x = xScale(date)!;

				hoverLine.attr('x1', x).attr('x2', x).style('opacity', 1);

				const dateData = filteredData
					.filter((d) => d.date === date)
					.map((d) => ({
						variation: d.variation,
						rate: d.conversionRate,
						color: COLORS[d.variation],
					}));

				setTooltip({
					visible: true,
					x: margin.left + x,
					y: margin.top,
					date: new Date(date).toLocaleDateString('en-US', {
						month: 'short',
						day: 'numeric',
						year: 'numeric',
					}),
					data: dateData,
				});
			})
			.on('mouseleave', () => {
				hoverLine.style('opacity', 0);
				setTooltip((t) => ({ ...t, visible: false }));
			});
	}, [filteredData, dates, variations, width, height]);

	if (!data.length || !selectedVariations.length) {
		return <div className={styles.emptyState}>Select at least one variation to view the chart</div>;
	}

	return (
		<div className={styles.chartContainer}>
			<svg ref={svgRef} className={styles.svg} />

			{tooltip.visible && (
				<div
					className={styles.tooltip}
					style={{
						left: tooltip.x,
						top: tooltip.y,
						transform:
							tooltip.x > width / 2 ? 'translateX(-100%) translateX(-10px)' : 'translateX(10px)',
					}}
				>
					<div className={styles.tooltipDate}>{tooltip.date}</div>

					{tooltip.data.map((item, i) => (
						<div key={i} className={styles.tooltipItem}>
							<span className={styles.tooltipLabel}>
								<span className={styles.tooltipDot} style={{ backgroundColor: item.color }} />
								{item.variation}
							</span>
							<span className={styles.tooltipValue}>{item.rate.toFixed(2)}%</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
