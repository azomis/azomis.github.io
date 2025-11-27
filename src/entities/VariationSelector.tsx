import Checkbox from '@/entities/Checkbox';
import { COLORS } from '@/shared/colors';
import styles from './VariationSelector.module.css';

interface VariationSelectorProps {
	variations: string[];
	selectedVariations: string[];
	onToggle: (variation: string) => void;
}

export default function VariationSelector({
	variations,
	selectedVariations,
	onToggle,
}: VariationSelectorProps) {
	const handleToggle = (variation: string) => {
		if (selectedVariations.length === 1 && selectedVariations.includes(variation)) {
			return;
		}
		onToggle(variation);
	};

	return (
		<div className={styles.container}>
			{variations.map((variation) => {
				const isChecked = selectedVariations.includes(variation);
				const isDisabled = selectedVariations.length === 1 && isChecked;

				return (
					<div key={variation} className={styles.item}>
						<Checkbox
							id={`variation-${variation}`}
							checked={isChecked}
							onCheckedChange={() => handleToggle(variation)}
							disabled={isDisabled}
						/>
						<label htmlFor={`variation-${variation}`} className={styles.label}>
							<span className={styles.colorDot} style={{ backgroundColor: COLORS[variation] }} />
							{variation}
						</label>
					</div>
				);
			})}
		</div>
	);
}
