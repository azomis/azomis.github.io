import { useState, useMemo, useEffect } from 'react';
import rawData from '@/shared/data/data.json';
import { COLORS } from '@/shared/colors';
import LineChart from '@/entities/LineChart';
import VariationSelector from '@/entities/VariationSelector';
import TimeRangeSelector from '@/entities/TimeRangeSelector';
import StatCard from '@/entities/StatCard';
import styles from './Index.module.css';

interface DataPoint {
	date: string;
	variation: string;
	visits: number;
	conversions: number;
	conversionRate: number;
}

const Index = () => {
	const [selectedVariations, setSelectedVariations] = useState<string[]>([]);
	const [timeRange, setTimeRange] = useState<'day' | 'week'>('day');
	const [chartDimensions, setChartDimensions] = useState({ width: 800, height: 400 });

	const variations = useMemo(() => rawData.variations, []);

	useEffect(() => {
		if (variations.length > 0 && selectedVariations.length === 0) {
			setSelectedVariations(variations.map((v) => v.name));
		}
	}, [variations, selectedVariations.length]);

	const transformedData = useMemo((): DataPoint[] => {
		const result: DataPoint[] = [];

		rawData.data.forEach((item) => {
			variations.forEach(({ id, name }) => {
				const visitsKey = String(id) as keyof typeof item.visits;
				const conversionsKey = String(id) as keyof typeof item.conversions;
				const visits = item.visits[visitsKey];
				const conversions = item.conversions[conversionsKey];

				if (visits !== undefined && conversions !== undefined && visits > 0) {
					result.push({
						date: item.date,
						variation: name,
						visits,
						conversions,
						conversionRate: Number(((conversions / visits) * 100).toFixed(2)),
					});
				}
			});
		});

		return result;
	}, [variations]);

	const processedData = useMemo((): DataPoint[] => {
		if (timeRange === 'day') {
			return transformedData;
		}
		const weekMap = new Map<string, Map<string, { visits: number; conversions: number }>>();

		transformedData.forEach((item) => {
			const date = new Date(item.date);
			const sunday = new Date(date);
			sunday.setDate(date.getDate() - date.getDay());
			const weekKey = sunday.toISOString().split('T')[0];

			if (!weekMap.has(weekKey)) {
				weekMap.set(weekKey, new Map());
			}

			const weekData = weekMap.get(weekKey)!;
			if (!weekData.has(item.variation)) {
				weekData.set(item.variation, { visits: 0, conversions: 0 });
			}

			const varData = weekData.get(item.variation)!;
			varData.visits += item.visits;
			varData.conversions += item.conversions;
		});

		const result: DataPoint[] = [];
		weekMap.forEach((varMap, weekKey) => {
			varMap.forEach((data, variation) => {
				result.push({
					date: weekKey,
					variation,
					visits: data.visits,
					conversions: data.conversions,
					conversionRate: Number(((data.conversions / data.visits) * 100).toFixed(2)),
				});
			});
		});

		return result.sort((a, b) => a.date.localeCompare(b.date));
	}, [transformedData, timeRange]);

	const handleVariationToggle = (variation: string) => {
		setSelectedVariations((prev) => {
			if (prev.includes(variation)) {
				if (prev.length === 1) return prev;
				return prev.filter((v) => v !== variation);
			}
			return [...prev, variation];
		});
	};

	const stats = useMemo(() => {
		return selectedVariations
			.map((variationName) => {
				const variation = variations.find((v) => v.name === variationName);
				if (!variation) return null;

				const varData = transformedData.filter((d) => d.variation === variationName);
				const totalVisits = varData.reduce((sum, d) => sum + d.visits, 0);
				const totalConversions = varData.reduce((sum, d) => sum + d.conversions, 0);
				const avgRate = totalVisits > 0 ? (totalConversions / totalVisits) * 100 : 0;

				return {
					name: variationName,
					avgRate,
					totalConversions,
					color: COLORS[variationName],
				};
			})
			.filter(Boolean);
	}, [selectedVariations, transformedData, variations]);

	useEffect(() => {
		const handleResize = () => {
			const container = document.querySelector(`.${styles.chartWrapper}`) as HTMLElement;
			if (container) {
				setChartDimensions({
					width: container.offsetWidth,
					height: container.offsetHeight,
				});
			}
		};

		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<div className={styles.container}>
			<div className={styles.wrapper}>
				<div className={styles.header}>
					<h1 className={styles.title}>A/B Test Analytics</h1>
					<p className={styles.subtitle}>Track conversion rates across test variations</p>
				</div>

				<div className={styles.chartCard}>
					<div className={styles.cardHeader}>
						<div className={styles.cardHeaderContent}>
							<h2>Conversion Rate Over Time</h2>
							<p>{timeRange === 'day' ? 'Daily' : 'Weekly'} performance comparison</p>
						</div>
						<TimeRangeSelector selectedRange={timeRange} onSelect={setTimeRange} />
					</div>

					<div className={styles.controls}>
						<VariationSelector
							variations={variations.map((v) => v.name)}
							selectedVariations={selectedVariations}
							onToggle={handleVariationToggle}
						/>
					</div>

					<div className={styles.chartWrapper}>
						<LineChart
							data={processedData}
							selectedVariations={selectedVariations}
							width={chartDimensions.width}
							height={chartDimensions.height}
						/>
					</div>
				</div>

				<div className={styles.statsGrid}>
					{stats.map((stat) => (
						<StatCard
							key={stat!.name}
							name={stat!.name}
							color={stat!.color}
							avgRate={stat!.avgRate}
							totalConversions={stat!.totalConversions}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default Index;
