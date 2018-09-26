import { route } from 'preact-router'

import style from './style'

const state = {}

const hanndleInputChange = ev => {
	state[ev.target.id] = ev.target.value
}

const signup = () => {
	if (state.password !== state.password2) {
		alert('Passwords don\'t match!')
		return
	}
	// firebase.auth().createUserWithEmailAndPassword(state.email, state.password)
	// .then(() => route('/'))
	route('/')
}

const SignUp = () => {
	// if (firebase.auth().currentUser) route('/')
	return (
		<form class={style.signup}>
			<h2>Sign Up</h2>
			<div class="row">
				<label for="username">Username</label>
				<input class="u-full-width" type="text" id="username" onChange={hanndleInputChange} />
			</div>
			<div class="row">
				<label for="email">Email</label>
				<input class="u-full-width" type="email" id="email" onChange={hanndleInputChange} />
			</div>
			<div class="row">
				<label for="password">Create Password</label>
				<input class="u-full-width" type="password" id="password" onChange={hanndleInputChange} />
			</div>
			<div class="row">
				<label for="confirm-password">Confirm Password</label>
				<input class="u-full-width" type="password" id="confirm-password" onChange={hanndleInputChange} />
			</div>
			<div class="row">
				<input class="button-primary u-full-width" type="button" value="Sign Up" onClick={signup} />
			</div>
		</form>
	)
}

export default SignUp
