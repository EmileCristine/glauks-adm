import { Rotas } from './routes/Rotas'
import { GlobalStyles } from './styles/GlobalStyles'
import { ThemeProvider } from 'styled-components'
import { theme } from './styles/theme'

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Rotas />
    </ThemeProvider>
  )
}