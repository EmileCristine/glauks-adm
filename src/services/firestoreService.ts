import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where 
} from "firebase/firestore";
import { db } from "../firebase/config";

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
  userId?: string; // Para associar ao usuário logado
}

export interface Reserva {
  id: string;
  titulo: string;
  capa: string;
  usuario: string;
  emailUsuario: string;
  dataReserva: string;
  status: 'pendente' | 'disponivel' | 'cancelada';
  isbn?: string;
  autor?: string;
  userId?: string; // Para associar ao usuário logado
}

class FirestoreService {
  // Empréstimos
  async getEmprestimos(): Promise<LivroEmprestimo[]> {
    try {
      const emprestimosRef = collection(db, "emprestimos");
      const q = query(emprestimosRef, orderBy("dataEmprestimo", "desc"));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LivroEmprestimo[];
    } catch (error) {
      console.error("Erro ao buscar empréstimos:", error);
      throw error;
    }
  }

  async adicionarEmprestimo(emprestimo: Omit<LivroEmprestimo, 'id'>): Promise<LivroEmprestimo> {
    try {
      const emprestimosRef = collection(db, "emprestimos");
      const docRef = await addDoc(emprestimosRef, emprestimo);
      
      return {
        id: docRef.id,
        ...emprestimo
      };
    } catch (error) {
      console.error("Erro ao adicionar empréstimo:", error);
      throw error;
    }
  }

  async atualizarEmprestimo(id: string, dados: Partial<LivroEmprestimo>): Promise<void> {
    try {
      const emprestimoRef = doc(db, "emprestimos", id);
      await updateDoc(emprestimoRef, dados);
    } catch (error) {
      console.error("Erro ao atualizar empréstimo:", error);
      throw error;
    }
  }

  async devolverLivro(id: string): Promise<void> {
    return this.atualizarEmprestimo(id, {
      status: 'devolvido',
      dataDevolucao: new Date().toISOString().split('T')[0]
    });
  }

  // Reservas
  async getReservas(): Promise<Reserva[]> {
    try {
      const reservasRef = collection(db, "reservas");
      const q = query(reservasRef, orderBy("dataReserva", "desc"));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reserva[];
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
      throw error;
    }
  }

  async adicionarReserva(reserva: Omit<Reserva, 'id'>): Promise<Reserva> {
    try {
      const reservasRef = collection(db, "reservas");
      const docRef = await addDoc(reservasRef, reserva);
      
      return {
        id: docRef.id,
        ...reserva
      };
    } catch (error) {
      console.error("Erro ao adicionar reserva:", error);
      throw error;
    }
  }

  async atualizarReserva(id: string, dados: Partial<Reserva>): Promise<void> {
    try {
      const reservaRef = doc(db, "reservas", id);
      await updateDoc(reservaRef, dados);
    } catch (error) {
      console.error("Erro ao atualizar reserva:", error);
      throw error;
    }
  }

  async cancelarReserva(id: string): Promise<void> {
    return this.atualizarReserva(id, { status: 'cancelada' });
  }

  // Busca
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
      console.error("Erro ao buscar empréstimos por usuário:", error);
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
      console.error("Erro ao buscar reservas por usuário:", error);
      throw error;
    }
  }
}

export const firestoreService = new FirestoreService();
