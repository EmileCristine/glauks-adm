import estilos from './Inicial.module.css'
import {Header} from '../components/Header'
import {Lateral} from '../components/Lateral'
import {Outlet} from 'react-router-dom'

export function Inicial(){
    return(
        <div className={estilos.gridConteiner}>
            <Header />
            <Lateral />
            <Outlet />
        </div>
    )
}