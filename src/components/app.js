import { h, Component } from 'preact'
import { Router, route } from 'preact-router'

import Header from './header'
import SplashScreen from './splashscreen'

import Dashboard from '../routes/dashboard'
import SignIn from '../routes/signin'
import SignUp from '../routes/signup'

export default class App extends Component {
	state = {
		loading: true
	}

	handleRoute = e => {
		this.currentUrl = e.url
	}

	componentDidMount() {
		// firebase.auth().onAuthStateChanged(user => {
		// 	if (user) {
		// 		this.setState({ user, loading: false })
		// 	} else {
				this.setState({ user: null, loading: false })
		// 	}
		// })
	}

	render() {
		return (
			<div id="app">
				<Header />
				<Router onChange={this.handleRoute}>
					<Dashboard path="/:tab?/:data?" />
					<SignIn path="/signin" />
					<SignUp path="/signup" />
				</Router>
				<SplashScreen active={this.state.loading} />
			</div>
		)
	}
}
