import {BrowserRouter, Routes, Route} from 'react-router-dom'
import {Login} from '../pages/Login'
import {Catalogo} from '../pages/Catalogo'
import { Cadastro } from '../pages/Cadastro'
import { AddLivro } from '../pages/AddLivro'
import { Emprestimo } from '../pages/Emprestimo'
import { Inicial } from '../pages/Inicial'
import { BuscaProvider } from '../context/BuscaContext'
import { EmprestimoProvider } from '../context/EmprestimoContext'
import { AuthProvider } from '../context/AuthContext'
import { ProtectedRoute } from '../components/ProtectedRoute'

export function Rotas(){
    return(
        <BrowserRouter>
            <AuthProvider>
            <BuscaProvider>
            <EmprestimoProvider>
                <Routes>
                    <Route path='/' element={<Login />} />
                    <Route path='cadastro' element={<Cadastro />} />
                    <Route path='inicial' element={
                        <ProtectedRoute>
                            <Inicial />
                        </ProtectedRoute>
                    }>
                        <Route index element={ <Catalogo /> } />
                        <Route path='catalogo' element={<Catalogo />}/>
                        <Route path='livro' element={<AddLivro />} />
                        <Route path='emprestimo' element={<Emprestimo />} />
                    </Route>  
                </Routes>
            </EmprestimoProvider>
            </BuscaProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}
