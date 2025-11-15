import { useState, useMemo } from 'react';
import estilos from './Emprestimo.module.css';
import { useEmprestimo } from '../context/EmprestimoContext';
import { useBusca } from '../context/BuscaContext';
import { EmprestimoCard, ReservaCard } from '../components/EmprestimoCard';
import { AdicionarEmprestimo } from '../components/AdicionarEmprestimo';

export function Emprestimo() {
  const { emprestimos, reservas, carregando, erro } = useEmprestimo();
  const { termoBusca } = useBusca();
  const [mostrarAdicionar, setMostrarAdicionar] = useState(false);

  // Função para verificar se uma data está atrasada
  const isAtrasado = (dataDevolucaoEsperada: string) => {
    const hoje = new Date();
    const dataDevolucao = new Date(dataDevolucaoEsperada);
    return dataDevolucao < hoje;
  };

  // Filtrar empréstimos ativos (não devolvidos)
  const emprestimosAtivos = emprestimos.filter(e => 
    e.status === 'emprestado' || e.status === 'atrasado'
  );
  
  const emprestimosAtrasados = emprestimos.filter(e => 
    (e.status === 'emprestado' || e.status === 'atrasado') && 
    isAtrasado(e.dataDevolucaoEsperada)
  );
  // Filtrar reservas
  const reservasPendentes = reservas.filter(r => 
    r.status === 'pendente'
  );
  
  const reservasAprovadas = reservas.filter(r => 
    r.status === 'aprovada'
  );

  const todosOsEmprestimosAtivos = useMemo(() => [
    ...emprestimosAtivos,
    ...reservasAprovadas.map(reserva => ({
      id: reserva.id,
      titulo: reserva.titulo,
      usuario: reserva.usuario,
      emailUsuario: reserva.emailUsuario,
      capa: reserva.capa,
      autor: reserva.autor,
      dataEmprestimo: reserva.dataReserva,
      dataDevolucao: '',
      dataDevolucaoEsperada: new Date(new Date(reserva.dataReserva).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'emprestado' as const,
      isbn: reserva.isbn,
      isReservaAprovada: true
    }))
  ], [emprestimosAtivos, reservasAprovadas]);

  const todasAsDevolucoesAtrasadas = useMemo(() => [
    ...emprestimosAtrasados,
    ...reservasAprovadas
      .map(reserva => {
        const dataDevolucaoEsperada = new Date(new Date(reserva.dataReserva).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return {
          id: reserva.id,
          titulo: reserva.titulo,
          usuario: reserva.usuario,
          emailUsuario: reserva.emailUsuario,
          capa: reserva.capa,
          autor: reserva.autor,
          dataEmprestimo: reserva.dataReserva,
          dataDevolucao: '',
          dataDevolucaoEsperada,
          status: 'atrasado' as const,
          isbn: reserva.isbn,
          isReservaAprovada: true
        };
      })
      .filter(item => isAtrasado(item.dataDevolucaoEsperada))
  ], [emprestimosAtrasados, reservasAprovadas]);

  const filtrarPorBusca = (lista: any[]) => {
    if (!termoBusca.trim()) return lista;
    const termo = termoBusca.toLowerCase();
    return lista.filter(item => 
      item.usuario?.toLowerCase().includes(termo) ||
      item.emailUsuario?.toLowerCase().includes(termo) ||
      item.titulo?.toLowerCase().includes(termo) ||
      (item.autor && item.autor.toLowerCase().includes(termo))
    );
  };

  return (
    <main className={estilos.section}>
      {/* Empréstimos Ativos */}
      <span className={estilos.title}>
        <p>Empréstimos Pendentes</p>
        
        <button 
          className={estilos.btnNVEmprestimo}
          onClick={() => setMostrarAdicionar(true)}
          disabled={carregando}
        >
          {carregando ? 'Carregando...' : '+ Novo Empréstimo'}
        </button>

      </span>
      <div className={estilos.livros}>
        {filtrarPorBusca(todosOsEmprestimosAtivos).length === 0 ? (
          <p className={estilos.semDados}>
            {termoBusca ? `Nenhum empréstimo ativo encontrado para "${termoBusca}".` : 'Nenhum empréstimo ativo no momento.'}
          </p>
        ) : (
          filtrarPorBusca(todosOsEmprestimosAtivos).map((item) => (
            <EmprestimoCard 
              key={item.id} 
              emprestimo={item} 
              isReservaAprovada={item.isReservaAprovada}
            />
          ))
        )}
      </div>

      {/* Devoluções Atrasadas */}
      <span className={estilos.title}>
        Devoluções Atrasadas
      </span>
      <div className={estilos.livros}>
        {filtrarPorBusca(todasAsDevolucoesAtrasadas).length === 0 ? (
          <p className={estilos.semDados}>
            {termoBusca ? `Nenhuma devolução atrasada encontrada para "${termoBusca}".` : 'Nenhuma devolução atrasada no momento.'}
          </p>
        ) : (
          filtrarPorBusca(todasAsDevolucoesAtrasadas).map((item) => (
            <EmprestimoCard 
              key={item.id} 
              emprestimo={item} 
              isReservaAprovada={item.isReservaAprovada}
              destaqueAtrasado={true}
            />
          ))
        )}
      </div>

      {/* Reservas Pendentes */}
      <span className={estilos.title}>Reservas Recentes</span>
      <div className={estilos.livros}>
        {filtrarPorBusca(reservasPendentes).length === 0 ? (
          <p className={estilos.semDados}>
            {termoBusca ? `Nenhuma reserva encontrada para "${termoBusca}".` : 'Nenhuma reserva pendente no momento.'}
          </p>
        ) : (
          filtrarPorBusca(reservasPendentes).map((reserva) => (
            <ReservaCard key={reserva.id} reserva={reserva} />
          ))
        )}
      </div>

      {/* Modal para adicionar empréstimo */}
      {mostrarAdicionar && (
        <AdicionarEmprestimo onClose={() => setMostrarAdicionar(false)} />
      )}
    </main>
  );
}