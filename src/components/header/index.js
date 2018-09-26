import { route } from 'preact-router'
import { Link } from 'preact-router/match'

import style from './style'

const signout = () => {
	// firebase.auth().signOut()
	// .then(() => route('/signin'))
	route('/signin')
}

const renderNavigation = () => {
	// if (firebase.auth().currentUser) {
		return (
			<nav>
				<Link activeClassName={style.active} href="/">Dashboard</Link>
				<Link href="#" onClick={signout}>Sign Out</Link>
				<Link activeClassName={style.active} href="/account">Account Settings</Link>
			</nav>
		)
	// } else {
	// 	return (
	// 		<nav>
	// 			<Link activeClassName={style.active} href="/signin">Sign In</Link>
	// 			<Link activeClassName={style.active} href="/signup">Sign Up</Link>
	// 		</nav>
	// 	)
	// }
}

const Header = () => (
	<header class={style.header}>
		<Link href="/">
			<h1>Admin Panel</h1>
		</Link>
		{renderNavigation()}
	</header>
)

export default Header
