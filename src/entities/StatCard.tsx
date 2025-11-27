import styles from './StatCard.module.css';

interface StatCardProps {
	name: string;
	color: string;
	avgRate: number;
	totalConversions: number;
}

export default function StatCard({ name, color, avgRate, totalConversions }: StatCardProps) {
	return (
		<div key={name} className={styles.statCard}>
			<div className={styles.statHeader}>
				<div className={styles.colorIndicator} style={{ backgroundColor: color }} />
				<h3 className={styles.statTitle}>{name}</h3>
			</div>
			<div>
				<div className={styles.statValue}>{avgRate.toFixed(2)}%</div>
				<p className={styles.statDescription}>
					{totalConversions.toLocaleString()} total conversions
				</p>
			</div>
		</div>
	);
}

StatCard.displayName = 'StatCard';
