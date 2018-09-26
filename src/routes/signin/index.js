import { route } from 'preact-router'

import style from './style'

const state = {}

const hanndleInputChange = ev => {
	state[ev.target.id] = ev.target.value
}

const signin = () => {
	// firebase.auth().signInWithEmailAndPassword(state.email, state.password)
	// .then(() => route('/'))
	route('/')
}

const SignIn = () => {
	// if (firebase.auth().currentUser) route('/')
	return (
		<form class={style.signin}>
			<h2>Sign In</h2>
			<div class="row">
				<input class="u-full-width" type="email" placeholder="Email" id="email" onChange={hanndleInputChange} />
				<input class="u-full-width" type="password" placeholder="Password" id="password" onChange={hanndleInputChange} />
				<label>
					<input type="checkbox" />
					<span class="label-body"> Remember me</span>
				</label>
				<input class="button-primary u-full-width" type="button" value="Sign In" onClick={signin} />
			</div>
		</form>
	)
}

export default SignIn
