import { DotScale } from 'styled-loaders'

import style from './style'

const LoadingButton = ({ title, onClick, loading, disabled }) => {
  if (loading) {
    return <div class={style.loader + ' u-full-width button button-primary'}><DotScale color="white" /></div>
  } else if (disabled) {
    return <input class="u-full-width button" disabled="disabled" type="button" value={title} />
  } else {
    return <input class="u-full-width button-primary" type="button" value={title} onClick={onClick} />
  }
}

export default LoadingButton
