import { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { emprestimoService } from "../services/emprestimoService";
import type { LivroEmprestimo, Reserva } from "../services/emprestimoService";
import { reservaSyncService } from "../services/reservaSyncService";

export type { LivroEmprestimo, Reserva };

interface EmprestimoContextType {
  emprestimos: LivroEmprestimo[];
  reservas: Reserva[];
  carregando: boolean;
  erro: string | null;
  adicionarEmprestimo: (livro: Omit<LivroEmprestimo, 'id' | 'dataEmprestimo' | 'status'>) => Promise<void>;
  devolverLivro: (id: string) => Promise<void>;
  adicionarReserva: (reserva: Omit<Reserva, 'id' | 'dataReserva' | 'status'>) => Promise<void>;
  cancelarReserva: (id: string) => Promise<void>;
  aprovarReserva: (id: string) => Promise<void>;
  rejeitarReserva: (id: string) => Promise<void>;
  marcarReservaDevolvida: (id: string) => Promise<void>;
  notificarAtraso: (id: string) => void;
  buscarEmprestimosPorUsuario: (usuario: string) => LivroEmprestimo[];
  buscarReservasPorUsuario: (usuario: string) => Reserva[];
  recarregarDados: () => Promise<void>;
}

const EmprestimoContext = createContext<EmprestimoContextType | undefined>(undefined);

export function EmprestimoProvider({ children }: { children: ReactNode }) {
  const [emprestimos, setEmprestimos] = useState<LivroEmprestimo[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const inicializarDados = async () => {
      setCarregando(true);
      try {
        await reservaSyncService.syncAllReservas();
        
        const [emprestimosData, reservasData] = await Promise.all([
          emprestimoService.getEmprestimos(),
          emprestimoService.getReservas()
        ]);
        
        console.log('Dados carregados - Empréstimos:', emprestimosData.length, 'Reservas:', reservasData.length);
        setEmprestimos(emprestimosData || []);
        setReservas(reservasData || []);
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setErro('Erro ao carregar dados.');
      } finally {
        setCarregando(false);
      }
    };

    inicializarDados();
    
    const unsubscribeReservas = reservaSyncService.listenNewReservas();
    
    return () => {
      unsubscribeReservas();
    };
  }, []);

  const carregarDados = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [emprestimosData, reservasData] = await Promise.all([
        emprestimoService.getEmprestimos(),
        emprestimoService.getReservas()
      ]);
      
      console.log('Dados carregados - Empréstimos:', emprestimosData.length, 'Reservas:', reservasData.length);
      setEmprestimos(emprestimosData || []);
      setReservas(reservasData || []);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados.');
    } finally {
      setCarregando(false);
    }
  };

  const adicionarEmprestimo = async (livro: Omit<LivroEmprestimo, 'id' | 'dataEmprestimo' | 'status'>) => {
    try {
      const novoEmprestimo = {
        ...livro,
        dataEmprestimo: new Date().toISOString().split('T')[0],
        status: 'emprestado' as const
      };
      const emprestimoCriado = await emprestimoService.adicionarEmprestimo(novoEmprestimo);
      setEmprestimos(prev => [...prev, emprestimoCriado]);
    } catch (error) {
      console.error('Erro ao adicionar empréstimo:', error);
      throw error;
    }
  };

  const devolverLivro = async (id: string) => {
    try {
      await emprestimoService.devolverLivro(id);
      await carregarDados();
    } catch (error) {
      console.error('Erro ao devolver livro:', error);
      throw error;
    }
  };

  const adicionarReserva = async (reserva: Omit<Reserva, 'id' | 'dataReserva' | 'status'>) => {
    try {
      const novaReserva = {
        ...reserva,
        dataReserva: new Date().toISOString().split('T')[0],
        status: 'pendente' as const
      };
      const reservaCriada = await emprestimoService.adicionarReserva(novaReserva);
      setReservas(prev => [...prev, reservaCriada]);
    } catch (error) {
      console.error('Erro ao adicionar reserva:', error);
      throw error;
    }
  };

  const cancelarReserva = async (id: string) => {
    try {
      await emprestimoService.cancelarReserva(id);
      await carregarDados();
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      throw error;
    }
  };

  const aprovarReserva = async (id: string) => {
    try {
      await emprestimoService.aprovarReserva(id);
      await carregarDados();
    } catch (error) {
      console.error('Erro ao aprovar reserva:', error);
      throw error;
    }
  };

  const rejeitarReserva = async (id: string) => {
    try {
      await emprestimoService.rejeitarReserva(id);
      await carregarDados();
    } catch (error) {
      console.error('Erro ao rejeitar reserva:', error);
      throw error;
    }
  };

  const marcarReservaDevolvida = async (id: string) => {
    try {
      await emprestimoService.marcarReservaDevolvida(id);
      await carregarDados();
    } catch (error) {
      console.error('Erro ao marcar reserva como devolvida:', error);
      throw error;
    }
  };

  const notificarAtraso = (id: string) => {
    const emprestimo = emprestimos.find(e => e.id === id);
    if (emprestimo) {
      alert(`Notificação enviada para ${emprestimo.usuario} (${emprestimo.emailUsuario}) sobre o atraso do livro "${emprestimo.titulo}"`);
    }
  };

  const buscarEmprestimosPorUsuario = (usuario: string) => {
    return emprestimos.filter(emprestimo => 
      emprestimo.usuario.toLowerCase().includes(usuario.toLowerCase()) ||
      emprestimo.emailUsuario.toLowerCase().includes(usuario.toLowerCase())
    );
  };

  const buscarReservasPorUsuario = (usuario: string) => {
    return reservas.filter(reserva => 
      reserva.usuario.toLowerCase().includes(usuario.toLowerCase()) ||
      reserva.emailUsuario.toLowerCase().includes(usuario.toLowerCase())
    );
  };

  const recarregarDados = async () => {
    await carregarDados();
  };

  return (
    <EmprestimoContext.Provider value={{
      emprestimos,
      reservas,
      carregando,
      erro,
      adicionarEmprestimo,
      devolverLivro,
      adicionarReserva,
      cancelarReserva,
      aprovarReserva,
      rejeitarReserva,
      marcarReservaDevolvida,
      notificarAtraso,
      buscarEmprestimosPorUsuario,
      buscarReservasPorUsuario,
      recarregarDados
    }}>
      {children}
    </EmprestimoContext.Provider>
  );
}

export function useEmprestimo() {
  const context = useContext(EmprestimoContext);
  if (!context) {
    throw new Error('useEmprestimo deve ser usado dentro de EmprestimoProvider');
  }
  return context;
}