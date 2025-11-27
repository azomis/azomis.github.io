import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import styles from './NotFound.module.css';

const NotFound = () => {
	const location = useLocation();

	useEffect(() => {
		console.error('404 Error: User attempted to access non-existent route:', location.pathname);
	}, [location.pathname]);

	return (
		<div className={styles.container}>
			<div className={`${styles.decoration} ${styles.decorationTop}`} />
			<div className={`${styles.decoration} ${styles.decorationBottom}`} />

			<div className={styles.content}>
				<div className={styles.errorCode}>404</div>
				<h1 className={styles.title}>Page Not Found</h1>
				<p className={styles.description}>
					The page you're looking for doesn't exist or has been moved. Let's get you back on track.
				</p>
				<a href='/' className={styles.homeButton}>
					<svg
						width='20'
						height='20'
						viewBox='0 0 20 20'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M3 10L2.29289 9.29289L1.58579 10L2.29289 10.7071L3 10ZM17 11C17.5523 11 18 10.5523 18 10C18 9.44772 17.5523 9 17 9V11ZM7.29289 4.29289L2.29289 9.29289L3.70711 10.7071L8.70711 5.70711L7.29289 4.29289ZM2.29289 10.7071L7.29289 15.7071L8.70711 14.2929L3.70711 9.29289L2.29289 10.7071ZM3 11H17V9H3V11Z'
							fill='currentColor'
						/>
					</svg>
					Return Home
				</a>
			</div>
		</div>
	);
};

export default NotFound;
