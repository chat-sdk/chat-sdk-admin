import style from './style';

const SplashScreen = ({ active }) => active ? (
	<div class={style.splashscreen}>
		<h1>Loading...</h1>
	</div>
) : <div />

export default SplashScreen;
