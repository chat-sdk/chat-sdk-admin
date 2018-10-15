import { Link } from 'preact-router/match'

import style from './style'
import LoadingButton from '../loading-button'

const filterState = {
	user: null,
	message: null
}

const handleFilterInput = filterMessages => ev => {
	filterState[ev.target.dataset.filter] = ev.target.value
	filterMessages(filterState.user, filterState.message)
}

const renderMessages = (messages, users, unflagMessage, deleteMessage, refresh, loading) => {
	const mids = Object.keys(messages || {})
	if (mids.length > 0) {
		return mids.map(mid => {
			const message = messages[mid]

			const renderAvatar = uid => {
				if (users[uid]) {
					const avatar = users[uid].meta.pictureURL
					return (
						<Link class={style.user_avatar_link} href={'/users/' + uid}>
							{avatar ? <img class={style.user_avatar} src={avatar} /> : <div class={style.user_avatar} />}
						</Link>
					)
				} else {
					return <b style="color: darkred">Deleted User</b>
				}
			}
			
			return (
				<tr class={style.flagged_list_row}>
					<td class={style.sender_cell}>
						{renderAvatar(message['sender-entity-id'])}
					</td>
					<td class={style.message_cell}>{message.message}</td>
					<td class={style.buttons_cell}>
						<Link href="#" onClick={ev => unflagMessage(mid).then(refresh)}>unflag</Link>
						<Link href="#" onClick={ev => deleteMessage(mid).then(refresh)}>delete</Link>
					</td>
				</tr>
			)
		})
	} else if (loading) {
		return <div>Loading...</div>
	} else {
		return <div class={style.no_messages_found}>No flagged messages found</div>
	}
}

const Moderation = ({ messages, filterMessages, users, unflagMessage, deleteMessage, refresh, loading }) => (
	<div>
		<div class="row">
			<div class="columns four">
				<input class="u-full-width" data-filter="user" type="text" placeholder="Any User" value={filterState.user} onInput={handleFilterInput(filterMessages)} />
			</div>
			<div class="columns five">
				<input class="u-full-width" data-filter="message" type="text" placeholder="Any Message" value={filterState.message} onInput={handleFilterInput(filterMessages)} />
			</div>
			<div class="columns three">
				<LoadingButton title="Refresh" onClick={refresh} loading={loading} />
			</div>
		</div>
		<div class={style.flagged_list}>
			<table class={style.flagged_list_content}>
				<tbody>
					{renderMessages(messages, users, unflagMessage, deleteMessage, refresh, loading)}
				</tbody>
			</table>
		</div>
	</div>
)

export default Moderation
