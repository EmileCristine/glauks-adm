import estilos from './Header.module.css';
import { PiMagnifyingGlassBold } from "react-icons/pi";
import { LuBell } from "react-icons/lu";
import { IoIosArrowDown } from "react-icons/io";
import { IoLogOutOutline } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import ImgPerfil from '../assets/images/icon-white.png';
import { useBusca } from '../context/BuscaContext';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const { termoBusca, setTermoBusca } = useBusca();
  const { user, logout } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleLogout = async () => {
    try {
      await logout();
      setMenuAberto(false);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const handleEditarPerfil = () => {
    // Implementar lógica de edição de perfil
    alert('Funcionalidade de editar perfil em desenvolvimento');
    setMenuAberto(false);
  };

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickFora = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAberto(false);
      }
    };

    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const toggleMenu = () => {
    setMenuAberto(!menuAberto);
  };

  return (
    <header className={estilos.section}>
      <div className={estilos.pesquisa}>
        <form className={estilos.input} onSubmit={handleSubmit}>
          <div className={estilos.icon}>
            <PiMagnifyingGlassBold />
          </div>
          <input 
            type="text" 
            placeholder='Pesquisar' 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
        </form> 
      </div>

      <div className={estilos.abaPerfil}>
        <div className={estilos.notificacao}>
          <div className={estilos.icon}><LuBell /></div>
          <div className={estilos.img}>
            <img 
              className={estilos.perfilImg}
              src={ImgPerfil}
              alt="Perfil"
            /> 
          </div>
          
          <div 
            className={`${estilos.adm} ${menuAberto ? estilos.menuAberto : ''}`} 
            onClick={toggleMenu} 
            ref={menuRef}
          >
            <h1>{user?.displayName || user?.email || 'Admin'}</h1>
            <div className={`${estilos.icon} ${menuAberto ? estilos.rotacionado : ''}`}>
              <IoIosArrowDown />
            </div>

            {/* Sub-menu */}
            {menuAberto && (
              <div className={estilos.subMenu}>
                <div className={estilos.menuItem} onClick={handleEditarPerfil}>
                  <IoSettingsOutline className={estilos.menuIcon} />
                  <span>Editar Perfil</span>
                </div>
                <div className={estilos.menuItem} onClick={handleLogout}>
                  <IoLogOutOutline className={estilos.menuIcon} />
                  <span>Sair</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}