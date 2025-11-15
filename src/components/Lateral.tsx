import estilos from './Lateral.module.css';
import Logo from '../assets/images/logo-branco.png';

import { BiSolidAddToQueue } from "react-icons/bi";
import { PiBookBookmarkFill } from "react-icons/pi";
import { MdBookmarkAdded } from "react-icons/md";
import { Link, useLocation } from 'react-router-dom';

export function Lateral() {
    const location = useLocation();
    const currentPath = location.pathname;

    const pathAfterInicial = currentPath.startsWith('/inicial/') 
        ? currentPath.substring('/inicial/'.length) 
        : '';

    const activePage = (() => {
        if (pathAfterInicial.startsWith('livro')) return 'livro';
        if (pathAfterInicial.startsWith('catalogo')) return 'catalogo';
        if (pathAfterInicial.startsWith('emprestimo')) return 'emprestimo';
        return '';
    })();

    const getPositionClass = (pageName: string) => {
        const order = {
            cima: 1,
            livro: 2,
            catalogo: 3,
            emprestimo: 4,
            baixo: 5 
        };

        const activeOrder = order[activePage as keyof typeof order];
        const currentOrder = order[pageName as keyof typeof order];

        if (currentOrder === activeOrder - 1) return estilos.opcCima;
        if (currentOrder === activeOrder + 1) return estilos.opcBaixo;
        return estilos.opc;
    };

    const getLinkClass = (pageName: string) =>
        activePage === pageName ? `${estilos.input} ${estilos.active}` : estilos.input;

    return (
        <div className={estilos.section}>
            <div className={estilos.top}>
                <img 
                    className={estilos.logoImg}
                    src={Logo}
                    alt="Logo do Sistema"
                />
            </div>

            <div className={estilos.menu}>
                <div className={getPositionClass('cima')}>
                    <div className={getLinkClass('cima')}></div>   
                </div>

                <div className={getPositionClass('livro')}>
                    <Link to="livro" className={getLinkClass('livro')}>
                        <BiSolidAddToQueue className={estilos.icon} />
                        Adicionar Livro
                    </Link>   
                </div>

                <div className={getPositionClass('catalogo')}>
                    <Link to="catalogo" className={getLinkClass('catalogo')}>
                        <PiBookBookmarkFill className={estilos.icon} />
                        Catálogo
                    </Link>
                </div>

                <div className={getPositionClass('emprestimo')}>
                    <Link to="emprestimo" className={getLinkClass('emprestimo')}>
                        <MdBookmarkAdded className={estilos.icon} />
                        Empréstimos
                    </Link>
                </div>

                <div className={getPositionClass('baixo')}>
                    <div className={getLinkClass('baixo')}></div>   
                </div>
            </div>
        </div>
    );
}
