import styles from './TimeRangeSelector.module.css';

interface TimeRangeSelectorProps {
	selectedRange: 'day' | 'week';
	onSelect: (range: 'day' | 'week') => void;
}

export default function TimeRangeSelector({ selectedRange, onSelect }: TimeRangeSelectorProps) {
	return (
		<div className={styles.container}>
			<button
				className={`${styles.button} ${selectedRange === 'day' ? styles.active : ''}`}
				onClick={() => onSelect('day')}
			>
				Day
			</button>
			<button
				className={`${styles.button} ${selectedRange === 'week' ? styles.active : ''}`}
				onClick={() => onSelect('week')}
			>
				Week
			</button>
		</div>
	);
}
