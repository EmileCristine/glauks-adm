// import { ref, get, set, update, remove, push, query, orderByChild } from 'firebase/database';
// import { db } from '../firebase/config';
// import { reservaSyncService } from './reservaSyncService';

// export interface LivroEmprestimo {
//   id: string;
//   titulo: string;
//   usuario: string;
//   emailUsuario: string;
//   capa: string;
//   dataEmprestimo: string;
//   dataDevolucao: string;
//   dataDevolucaoEsperada: string;
//   status: 'emprestado' | 'devolvido' | 'atrasado';
//   isbn?: string;
//   autor?: string;
// }

// export interface Reserva {
//   id: string;
//   titulo: string;
//   capa: string;
//   usuario: string;
//   emailUsuario: string;
//   dataReserva: string;
//   status: 'pendente' | 'aprovada' | 'rejeitada' | 'disponivel' | 'cancelada' | 'devolvida';
//   isbn?: string;
//   autor?: string;
//   mobileReservaId?: string;
//   userId?: string;
//   bookId?: string;
//   createdAt?: number;
// }

// class EmprestimoService {
//   // Buscar todos os empréstimos
//   async getEmprestimos(): Promise<LivroEmprestimo[]> {
//     try {
//       const emprestimosRef = ref(db, 'emprestimos');
//       const snapshot = await get(emprestimosRef);
      
//       if (snapshot.exists()) {
//         const data = snapshot.val();
//         return Object.keys(data).map(key => ({
//           id: key,
//           ...data[key]
//         }));
//       }
//       return [];
//     } catch (error) {
//       console.error('Erro ao buscar empréstimos:', error);
//       throw error;
//     }
//   }

//   // Buscar todas as reservas
//   async getReservas(): Promise<Reserva[]> {
//     try {
//       return await reservaSyncService.getReservas();
//     } catch (error) {
//       console.error('Erro ao buscar reservas:', error);
//       throw error;
//     }
//   }

//   // Adicionar novo empréstimo
//   async adicionarEmprestimo(emprestimo: Omit<LivroEmprestimo, 'id'>): Promise<LivroEmprestimo> {
//     try {
//       const emprestimosRef = ref(db, 'emprestimos');
//       const newRef = push(emprestimosRef);
//       await set(newRef, emprestimo);
      
//       return {
//         id: newRef.key!,
//         ...emprestimo
//       };
//     } catch (error) {
//       console.error('Erro ao adicionar empréstimo:', error);
//       throw error;
//     }
//   }

//   // Atualizar empréstimo (devolver livro)
//   async atualizarEmprestimo(id: string, dados: Partial<LivroEmprestimo>): Promise<void> {
//     try {
//       const emprestimoRef = ref(db, `emprestimos/${id}`);
//       await update(emprestimoRef, dados);
//     } catch (error) {
//       console.error('Erro ao atualizar empréstimo:', error);
//       throw error;
//     }
//   }

//   // Devolver livro
//   async devolverLivro(id: string): Promise<void> {
//     return this.atualizarEmprestimo(id, {
//       status: 'devolvido',
//       dataDevolucao: new Date().toISOString().split('T')[0]
//     });
//   }

//   // Adicionar nova reserva
//   async adicionarReserva(reserva: Omit<Reserva, 'id'>): Promise<Reserva> {
//     try {
//       const reservasRef = ref(db, 'reservas');
//       const newRef = push(reservasRef);
//       await set(newRef, reserva);
      
//       return {
//         id: newRef.key!,
//         ...reserva
//       };
//     } catch (error) {
//       console.error('Erro ao adicionar reserva:', error);
//       throw error;
//     }
//   }

//   // Atualizar reserva
//   async atualizarReserva(id: string, dados: Partial<Reserva>): Promise<void> {
//     try {
//       const reservaRef = ref(db, `reservas/${id}`);
//       await update(reservaRef, dados);
//     } catch (error) {
//       console.error('Erro ao atualizar reserva:', error);
//       throw error;
//     }
//   }

//   // Aprovar reserva
//   async aprovarReserva(id: string): Promise<void> {
//     try {
//       await reservaSyncService.atualizarStatusReserva(id, 'aprovada');
//     } catch (error) {
//       console.error('Erro ao aprovar reserva:', error);
//       throw error;
//     }
//   }

//   // Rejeitar reserva
//   async rejeitarReserva(id: string): Promise<void> {
//     try {
//       await reservaSyncService.atualizarStatusReserva(id, 'rejeitada');
//     } catch (error) {
//       console.error('Erro ao rejeitar reserva:', error);
//       throw error;
//     }
//   }

//   // Cancelar reserva
//   async cancelarReserva(id: string): Promise<void> {
//     try {
//       await reservaSyncService.atualizarStatusReserva(id, 'cancelada');
//     } catch (error) {
//       console.error('Erro ao cancelar reserva:', error);
//       throw error;
//     }
//   }

//   // Marcar reserva como devolvida
//   async marcarReservaDevolvida(id: string): Promise<void> {
//     try {
//       await reservaSyncService.atualizarStatusReserva(id, 'devolvida');
//     } catch (error) {
//       console.error('Erro ao marcar reserva como devolvida:', error);
//       throw error;
//     }
//   }

//   // Buscar empréstimos por usuário
//   async buscarEmprestimosPorUsuario(termo: string): Promise<LivroEmprestimo[]> {
//     try {
//       const emprestimos = await this.getEmprestimos();
//       const termoLower = termo.toLowerCase();
//       return emprestimos.filter(emprestimo => 
//         emprestimo.usuario.toLowerCase().includes(termoLower) ||
//         emprestimo.emailUsuario.toLowerCase().includes(termoLower) ||
//         emprestimo.titulo.toLowerCase().includes(termoLower) ||
//         (emprestimo.autor && emprestimo.autor.toLowerCase().includes(termoLower))
//       );
//     } catch (error) {
//       console.error('Erro ao buscar empréstimos por usuário:', error);
//       throw error;
//     }
//   }

//   // Buscar reservas por usuário
//   async buscarReservasPorUsuario(termo: string): Promise<Reserva[]> {
//     try {
//       const reservas = await this.getReservas();
//       const termoLower = termo.toLowerCase();
//       return reservas.filter(reserva => 
//         reserva.usuario.toLowerCase().includes(termoLower) ||
//         reserva.emailUsuario.toLowerCase().includes(termoLower) ||
//         reserva.titulo.toLowerCase().includes(termoLower) ||
//         (reserva.autor && reserva.autor.toLowerCase().includes(termoLower))
//       );
//     } catch (error) {
//       console.error('Erro ao buscar reservas por usuário:', error);
//       throw error;
//     }
//   }

//   // Método adicional: remover empréstimo (se necessário)
//   async removerEmprestimo(id: string): Promise<void> {
//     try {
//       const emprestimoRef = ref(db, `emprestimos/${id}`);
//       await remove(emprestimoRef);
//     } catch (error) {
//       console.error('Erro ao remover empréstimo:', error);
//       throw error;
//     }
//   }

//   // Método adicional: remover reserva (se necessário)
//   async removerReserva(id: string): Promise<void> {
//     try {
//       const reservaRef = ref(db, `reservas/${id}`);
//       await remove(reservaRef);
//     } catch (error) {
//       console.error('Erro ao remover reserva:', error);
//       throw error;
//     }
//   }

//   // Sincronizar todas as reservas do mobile
//   async sincronizarTodasReservas(): Promise<{ total: number; sincronizadas: number }> {
//     return await reservaSyncService.syncAllReservas();
//   }

//   // Emprestimos/Devoluções em atraso
// async verificarEAtualizarAtrasados(): Promise<void> {
//   try {
//     const emprestimos = await this.getEmprestimos();
//     const hoje = new Date();
    
//     for (const emprestimo of emprestimos) {
//       if (emprestimo.status === 'emprestado') {
//         const dataDevolucao = new Date(emprestimo.dataDevolucaoEsperada);
//         if (dataDevolucao < hoje) {
//           await this.atualizarEmprestimo(emprestimo.id, { status: 'atrasado' });
//         }
//       }
//     }
//   } catch (error) {
//     console.error('Erro ao verificar empréstimos atrasados:', error);
//   }
// }
// }

// export const emprestimoService = new EmprestimoService();

import { ref, get, set, update, remove, push, query, orderByChild } from 'firebase/database';
import { db } from '../firebase/config';
import { reservaSyncService } from './reservaSyncService';

export interface LivroEmprestimo {
  id: string;
  titulo: string;
  usuario: string;
  emailUsuario: string;
  capa: string;
  dataEmprestimo: string;
  dataDevolucao: string;
  dataDevolucaoEsperada: string;
  status: 'emprestado' | 'devolvido' | 'atrasado';
  isbn?: string;
  autor?: string;
  livroId?: string; // Novo campo para associar ao livro no acervo
}

export interface Reserva {
  id: string;
  titulo: string;
  capa: string;
  usuario: string;
  emailUsuario: string;
  dataReserva: string;
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'disponivel' | 'cancelada' | 'devolvida';
  isbn?: string;
  autor?: string;
  mobileReservaId?: string;
  userId?: string;
  bookId?: string;
  createdAt?: number;
}

// Interface para controle de disponibilidade
export interface ControleDisponibilidade {
  livroId: string;
  isbn?: string;
  titulo: string;
  autor: string;
  capa: string;
  disponivel: boolean;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  emprestimosAtivos: number;
  ultimaAtualizacao: string;
}

class EmprestimoService {
  // Buscar todos os empréstimos
  async getEmprestimos(): Promise<LivroEmprestimo[]> {
    try {
      const emprestimosRef = ref(db, 'emprestimos');
      const snapshot = await get(emprestimosRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar empréstimos:', error);
      throw error;
    }
  }

  // Buscar todas as reservas
  async getReservas(): Promise<Reserva[]> {
    try {
      return await reservaSyncService.getReservas();
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      throw error;
    }
  }

  // Buscar controle de disponibilidade
  async getControleDisponibilidade(): Promise<ControleDisponibilidade[]> {
    try {
      const controleRef = ref(db, 'controleDisponibilidade');
      const snapshot = await get(controleRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({
          livroId: key,
          ...data[key]
        }));
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar controle de disponibilidade:', error);
      throw error;
    }
  }

  // Atualizar controle de disponibilidade para um livro
  async atualizarDisponibilidadeLivro(livroId: string, dados: Partial<ControleDisponibilidade>): Promise<void> {
    try {
      const controleRef = ref(db, `controleDisponibilidade/${livroId}`);
      await update(controleRef, {
        ...dados,
        ultimaAtualizacao: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
      throw error;
    }
  }

  // Inicializar controle para um livro
  async inicializarControleLivro(livroId: string, titulo: string, isbn?: string, quantidadeTotal: number = 1): Promise<void> {
    try {
      const controleRef = ref(db, `controleDisponibilidade/${livroId}`);
      const snapshot = await get(controleRef);
      
      if (!snapshot.exists()) {
        await set(controleRef, {
          titulo,
          isbn,
          disponivel: true,
          quantidadeTotal,
          quantidadeDisponivel: quantidadeTotal,
          emprestimosAtivos: 0,
          ultimaAtualizacao: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Erro ao inicializar controle do livro:', error);
      throw error;
    }
  }

  // Adicionar novo empréstimo com controle de disponibilidade
  async adicionarEmprestimo(emprestimo: Omit<LivroEmprestimo, 'id'>): Promise<LivroEmprestimo> {
    try {
      // Verificar disponibilidade
      if (emprestimo.livroId) {
        const controle = await this.getControleDisponibilidadePorLivro(emprestimo.livroId);
        if (controle && !controle.disponivel && controle.quantidadeDisponivel <= 0) {
          throw new Error('Livro não disponível para empréstimo');
        }
      }

      const emprestimosRef = ref(db, 'emprestimos');
      const newRef = push(emprestimosRef);
      
      const novoEmprestimo = {
        ...emprestimo,
        status: 'emprestado' as const
      };
      
      await set(newRef, novoEmprestimo);
      
      // Atualizar disponibilidade
      if (emprestimo.livroId) {
        await this.decrementarDisponibilidade(emprestimo.livroId);
      }

      return {
        id: newRef.key!,
        ...novoEmprestimo
      };
    } catch (error) {
      console.error('Erro ao adicionar empréstimo:', error);
      throw error;
    }
  }

  // Devolver livro com atualização de disponibilidade
  async devolverLivro(id: string): Promise<void> {
    try {
      const emprestimoRef = ref(db, `emprestimos/${id}`);
      const snapshot = await get(emprestimoRef);
      
      if (!snapshot.exists()) {
        throw new Error('Empréstimo não encontrado');
      }

      const emprestimo = snapshot.val();
      
      // Atualizar o empréstimo
      await update(emprestimoRef, {
        status: 'devolvido',
        dataDevolucao: new Date().toISOString().split('T')[0]
      });

      // Atualizar disponibilidade se tiver livroId
      if (emprestimo.livroId) {
        await this.incrementarDisponibilidade(emprestimo.livroId);
      }
    } catch (error) {
      console.error('Erro ao devolver livro:', error);
      throw error;
    }
  }

  // Métodos auxiliares para controle de disponibilidade
  private async getControleDisponibilidadePorLivro(livroId: string): Promise<ControleDisponibilidade | null> {
    try {
      const controleRef = ref(db, `controleDisponibilidade/${livroId}`);
      const snapshot = await get(controleRef);
      
      if (snapshot.exists()) {
        return {
          livroId,
          ...snapshot.val()
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar controle por livro:', error);
      return null;
    }
  }

  private async decrementarDisponibilidade(livroId: string): Promise<void> {
    try {
      const controle = await this.getControleDisponibilidadePorLivro(livroId);
      if (controle) {
        const novaQuantidade = Math.max(0, controle.quantidadeDisponivel - 1);
        const novosEmprestimos = controle.emprestimosAtivos + 1;
        
        await this.atualizarDisponibilidadeLivro(livroId, {
          quantidadeDisponivel: novaQuantidade,
          emprestimosAtivos: novosEmprestimos,
          disponivel: novaQuantidade > 0
        });
      }
    } catch (error) {
      console.error('Erro ao decrementar disponibilidade:', error);
      throw error;
    }
  }

  private async incrementarDisponibilidade(livroId: string): Promise<void> {
    try {
      const controle = await this.getControleDisponibilidadePorLivro(livroId);
      if (controle) {
        const novaQuantidade = Math.min(controle.quantidadeTotal, controle.quantidadeDisponivel + 1);
        const novosEmprestimos = Math.max(0, controle.emprestimosAtivos - 1);
        
        await this.atualizarDisponibilidadeLivro(livroId, {
          quantidadeDisponivel: novaQuantidade,
          emprestimosAtivos: novosEmprestimos,
          disponivel: novaQuantidade > 0
        });
      }
    } catch (error) {
      console.error('Erro ao incrementar disponibilidade:', error);
      throw error;
    }
  }

  // Sincronizar empréstimos e disponibilidade
  async sincronizarDisponibilidade(): Promise<void> {
    try {
      const emprestimos = await this.getEmprestimos();
      const controleAtual = await this.getControleDisponibilidade();
      
      // Para cada livro no controle, recalcular baseado nos empréstimos ativos
      for (const item of controleAtual) {
        const emprestimosAtivos = emprestimos.filter(e => 
          e.livroId === item.livroId && 
          (e.status === 'emprestado' || e.status === 'atrasado')
        );
        
        const quantidadeDisponivel = Math.max(0, item.quantidadeTotal - emprestimosAtivos.length);
        
        await this.atualizarDisponibilidadeLivro(item.livroId, {
          quantidadeDisponivel,
          emprestimosAtivos: emprestimosAtivos.length,
          disponivel: quantidadeDisponivel > 0
        });
      }
      
      console.log('Disponibilidade sincronizada com sucesso');
    } catch (error) {
      console.error('Erro ao sincronizar disponibilidade:', error);
      throw error;
    }
  }

  // Verificar e atualizar status de atraso
  async verificarEAtualizarAtrasados(): Promise<void> {
    try {
      const emprestimos = await this.getEmprestimos();
      const hoje = new Date();
      
      for (const emprestimo of emprestimos) {
        if (emprestimo.status === 'emprestado') {
          const dataDevolucao = new Date(emprestimo.dataDevolucaoEsperada);
          if (dataDevolucao < hoje) {
            await this.atualizarEmprestimo(emprestimo.id, { status: 'atrasado' });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar empréstimos atrasados:', error);
    }
  }

  // Buscar livros disponíveis
  async getLivrosDisponiveis(): Promise<ControleDisponibilidade[]> {
    try {
      const controle = await this.getControleDisponibilidade();
      return controle.filter(item => item.disponivel);
    } catch (error) {
      console.error('Erro ao buscar livros disponíveis:', error);
      throw error;
    }
  }

  // Buscar livros emprestados
  async getLivrosEmprestados(): Promise<ControleDisponibilidade[]> {
    try {
      const controle = await this.getControleDisponibilidade();
      return controle.filter(item => item.emprestimosAtivos > 0);
    } catch (error) {
      console.error('Erro ao buscar livros emprestados:', error);
      throw error;
    }
  }

  // Restante dos métodos permanecem iguais...
  async atualizarEmprestimo(id: string, dados: Partial<LivroEmprestimo>): Promise<void> {
    try {
      const emprestimoRef = ref(db, `emprestimos/${id}`);
      await update(emprestimoRef, dados);
    } catch (error) {
      console.error('Erro ao atualizar empréstimo:', error);
      throw error;
    }
  }

  async adicionarReserva(reserva: Omit<Reserva, 'id'>): Promise<Reserva> {
    try {
      const reservasRef = ref(db, 'reservas');
      const newRef = push(reservasRef);
      await set(newRef, reserva);
      
      return {
        id: newRef.key!,
        ...reserva
      };
    } catch (error) {
      console.error('Erro ao adicionar reserva:', error);
      throw error;
    }
  }

  async atualizarReserva(id: string, dados: Partial<Reserva>): Promise<void> {
    try {
      const reservaRef = ref(db, `reservas/${id}`);
      await update(reservaRef, dados);
    } catch (error) {
      console.error('Erro ao atualizar reserva:', error);
      throw error;
    }
  }

  async aprovarReserva(id: string): Promise<void> {
    try {
      await reservaSyncService.atualizarStatusReserva(id, 'aprovada');
    } catch (error) {
      console.error('Erro ao aprovar reserva:', error);
      throw error;
    }
  }

  async rejeitarReserva(id: string): Promise<void> {
    try {
      await reservaSyncService.atualizarStatusReserva(id, 'rejeitada');
    } catch (error) {
      console.error('Erro ao rejeitar reserva:', error);
      throw error;
    }
  }

  async cancelarReserva(id: string): Promise<void> {
    try {
      await reservaSyncService.atualizarStatusReserva(id, 'cancelada');
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      throw error;
    }
  }

  async marcarReservaDevolvida(id: string): Promise<void> {
    try {
      await reservaSyncService.atualizarStatusReserva(id, 'devolvida');
    } catch (error) {
      console.error('Erro ao marcar reserva como devolvida:', error);
      throw error;
    }
  }

  async buscarEmprestimosPorUsuario(termo: string): Promise<LivroEmprestimo[]> {
    try {
      const emprestimos = await this.getEmprestimos();
      const termoLower = termo.toLowerCase();
      return emprestimos.filter(emprestimo => 
        emprestimo.usuario.toLowerCase().includes(termoLower) ||
        emprestimo.emailUsuario.toLowerCase().includes(termoLower) ||
        emprestimo.titulo.toLowerCase().includes(termoLower) ||
        (emprestimo.autor && emprestimo.autor.toLowerCase().includes(termoLower))
      );
    } catch (error) {
      console.error('Erro ao buscar empréstimos por usuário:', error);
      throw error;
    }
  }

  async buscarReservasPorUsuario(termo: string): Promise<Reserva[]> {
    try {
      const reservas = await this.getReservas();
      const termoLower = termo.toLowerCase();
      return reservas.filter(reserva => 
        reserva.usuario.toLowerCase().includes(termoLower) ||
        reserva.emailUsuario.toLowerCase().includes(termoLower) ||
        reserva.titulo.toLowerCase().includes(termoLower) ||
        (reserva.autor && reserva.autor.toLowerCase().includes(termoLower))
      );
    } catch (error) {
      console.error('Erro ao buscar reservas por usuário:', error);
      throw error;
    }
  }

  async removerEmprestimo(id: string): Promise<void> {
    try {
      const emprestimoRef = ref(db, `emprestimos/${id}`);
      await remove(emprestimoRef);
    } catch (error) {
      console.error('Erro ao remover empréstimo:', error);
      throw error;
    }
  }

  async removerReserva(id: string): Promise<void> {
    try {
      const reservaRef = ref(db, `reservas/${id}`);
      await remove(reservaRef);
    } catch (error) {
      console.error('Erro ao remover reserva:', error);
      throw error;
    }
  }

  async sincronizarTodasReservas(): Promise<{ total: number; sincronizadas: number }> {
    return await reservaSyncService.syncAllReservas();
  }
}

export const emprestimoService = new EmprestimoService();