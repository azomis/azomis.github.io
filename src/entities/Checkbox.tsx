import { InputHTMLAttributes, forwardRef } from 'react';
import styles from './Checkbox.module.css';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', onCheckedChange, checked, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={`${styles.checkbox} ${className}`}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
