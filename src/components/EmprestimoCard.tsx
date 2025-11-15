import estilos from '../pages/Emprestimo.module.css';
import { useEmprestimo } from '../context/EmprestimoContext';
import type { LivroEmprestimo, Reserva } from '../context/EmprestimoContext';
import { emprestimoService, type ControleDisponibilidade } from '../services/emprestimoService';
import { useCallback, useState } from 'react';

interface EmprestimoCardProps {
  emprestimo: LivroEmprestimo & { isReservaAprovada?: boolean };
  isReservaAprovada?: boolean;
  destaqueAtrasado?: boolean;
}

interface ReservaCardProps {
  reserva: Reserva;
}

export function EmprestimoCard({ 
  emprestimo, 
  isReservaAprovada = false, 
  destaqueAtrasado = false 
}: EmprestimoCardProps) {
  const { devolverLivro, notificarAtraso, marcarReservaDevolvida } = useEmprestimo();

  const formatarData = (data: string) => {
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const calcularDiasAtraso = (): number => {
    try {
      const hoje = new Date();
      const dataDevolucao = new Date(emprestimo.dataDevolucaoEsperada);
      
      hoje.setHours(0, 0, 0, 0);
      dataDevolucao.setHours(0, 0, 0, 0);
      
      const diferenca = hoje.getTime() - dataDevolucao.getTime();
      const dias = Math.ceil(diferenca / (1000 * 60 * 60 * 24));
      
      return Math.max(0, dias);
    } catch {
      return 0;
    }
  };

  const handleDevolver = async () => {
    if (window.confirm(`Confirmar devolução do livro "${emprestimo.titulo}"?`)) {
      try {
        if (isReservaAprovada) {
          await marcarReservaDevolvida(emprestimo.id);
        } else {
          await devolverLivro(emprestimo.id);
        }
      } catch (error) {
        alert('Erro ao devolver livro. Tente novamente.');
      }
    }
  };

  const handleNotificar = () => {
    if (window.confirm(`Enviar notificação de atraso para ${emprestimo.usuario}?`)) {
      notificarAtraso(emprestimo.id);
    }
  };

  const diasAtraso = calcularDiasAtraso();
  const estaAtrasado = diasAtraso > 0 && 
    (emprestimo.status === 'emprestado' || emprestimo.status === 'atrasado' || isReservaAprovada);
  
  const podeDevolver = (emprestimo.status === 'emprestado' || emprestimo.status === 'atrasado' || isReservaAprovada);

const [controleDisponibilidade, setControleDisponibilidade] = useState<ControleDisponibilidade[]>([]);

const sincronizarDisponibilidade = useCallback(async () => {
  try {
    await emprestimoService.sincronizarDisponibilidade();
    const controle = await emprestimoService.getControleDisponibilidade();
    setControleDisponibilidade(controle);
  } catch (error) {
    console.error('Erro ao sincronizar disponibilidade:', error);
  }
}, []);

const getLivroDisponivel = useCallback((livroId: string) => {
  return controleDisponibilidade.find(item => item.livroId === livroId);
}, [controleDisponibilidade]);


  return (
    <div className={`
      ${estilos.card} 
      ${isReservaAprovada ? estilos.reservaAprovada : ''}
      ${destaqueAtrasado ? estilos.atrasado : ''}
      ${estaAtrasado ? estilos.atrasado : ''}
    `}>
      <img 
        src={emprestimo.capa} 
        alt={emprestimo.titulo} 
        className={estilos.capa}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/placeholder-capa.png';
        }}
      />
      <div className={estilos.cardContent}>
        <h3 className={estilos.titulo}>{emprestimo.titulo}</h3>
        
        <p className={estilos.info}>
          <strong>Email:</strong> {emprestimo.emailUsuario}
        </p>
        
        <div className={estilos.datas}>
          <p className={estilos.data}>
            <strong>Empréstimo:</strong> {formatarData(emprestimo.dataEmprestimo)}
          </p>
          
          <p className={estilos.data}>
            <strong>Devolução esperada:</strong> {formatarData(emprestimo.dataDevolucaoEsperada)}
          </p>

        </div>

        {/* Status e ações */}
        <div className={estilos.acoes}>
          {estaAtrasado && (
            <div className={estilos.atrasoContainer}>
              <p className={estilos.atrasoTexto}>
                <strong>Atrasado há {diasAtraso} dia{diasAtraso !== 1 ? 's' : ''}</strong>
              </p>
              <button 
                className={estilos.btnNotificar} 
                onClick={handleNotificar}
                title="Enviar notificação por email"
              >
                Notificar
              </button>
            </div>
          )}


          {podeDevolver && (
            <button 
              className={`
                ${estilos.btnDevolver} 
                ${estaAtrasado ? estilos.btnDevolverAtrasado : ''}
              `}
              onClick={handleDevolver}
            >
              {estaAtrasado ? 'Devolver Livro Atrasado' : 'Marcar como Devolvido'}
            </button>
          )}

          {emprestimo.status === 'devolvido' && (
            <div className={estilos.devolvidoContainer}>
              <p className={estilos.devolvidoTexto}>
                Devolvido em {formatarData(emprestimo.dataDevolucao || '')}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export function ReservaCard({ reserva }: ReservaCardProps) {
  const { cancelarReserva, aprovarReserva, rejeitarReserva } = useEmprestimo();

  const formatarData = (data: string) => {
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const handleCancelar = async () => {
    if (window.confirm(`Confirmar cancelamento da reserva do livro "${reserva.titulo}"?`)) {
      try {
        await cancelarReserva(reserva.id);
      } catch (error) {
        alert('Erro ao cancelar reserva. Tente novamente.');
      }
    }
  };

  const handleAprovar = async () => {
    if (window.confirm(`Aprovar reserva do livro "${reserva.titulo}" para ${reserva.usuario}?`)) {
      try {
        await aprovarReserva(reserva.id);
      } catch (error) {
        alert('Erro ao aprovar reserva. Tente novamente.');
      }
    }
  };

  return (
    <div className={`
      ${estilos.card} 
      ${reserva.status === 'aprovada' ? estilos.reservaAprovada : ''}
      ${reserva.status === 'rejeitada' ? estilos.reservaRejeitada : ''}
    `}>
      <img 
        src={reserva.capa} 
        alt={reserva.titulo} 
        className={estilos.capa}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/placeholder-capa.png';
        }}
      />
      <div className={estilos.cardContent}>
        <h3 className={estilos.titulo}>{reserva.titulo}</h3>
        
        <p className={estilos.info}>
          <strong>Email:</strong> {reserva.emailUsuario}
        </p>
        
        <p className={estilos.data}>
          <strong>Reservado em:</strong> {formatarData(reserva.dataReserva)}
        </p>

        <div className={estilos.acoesReserva}>
          {reserva.status === 'pendente' && (
             <>
               <button 
                 className={estilos.btnConfirmar}
                 onClick={handleAprovar}
               >
                 Aprovar
               </button>
         
               <button 
                 className={estilos.btnCancelar}
                 onClick={handleCancelar}
               >
                 Cancelar
               </button>
             </>
          )}
          
          {(reserva.status === 'aprovada' || reserva.status === 'disponivel') && (
            <button 
              className={estilos.btnCancelar}
              onClick={handleCancelar}
            >
              Cancelar Reserva
            </button>
          )}

          {reserva.status === 'rejeitada' && (
            <button 
              className={estilos.btnConfirmar}
              onClick={handleAprovar}
            >
              Reaprovar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}