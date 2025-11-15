import { ref, set, get, update, remove, push, query, orderByChild, onValue, off } from 'firebase/database';
import { db } from '../firebase/config';

export interface ReservaSync {
  id: string;
  userId: string;
  bookId: string;
  status: 'pending' | 'approved' | 'rejected' | 'waiting' | 'returned';
  createdAt: number;
  approvedAt?: number;
  returnedAt?: number;
  usuario?: string;
  emailUsuario?: string;
  titulo?: string;
  autor?: string;
  capa?: string;
}

interface UserData {
  nome?: string;
  displayName?: string;
  email?: string;
}

interface BookData {
  titulo?: string;
  autor?: string;
  capa?: string;
  isbn?: string;
}

class ReservaSyncService {
  // Sincronizar reservas do mobile para o formato do web
  async syncReservaFromMobile(reservaId: string) {
    try {
      // Buscar a reserva do mobile
      const reservaRef = ref(db, `reservations/${reservaId}`);
      const reservaSnap = await get(reservaRef);
      
      if (!reservaSnap.exists()) {
        console.log('Reserva não encontrada no mobile:', reservaId);
        return;
      }

      const reservaMobile = reservaSnap.val();
      console.log('Reserva do mobile:', reservaMobile);

      // Buscar dados do usuário usando a função auxiliar
      const userInfo = await this.buscarDadosUsuario(reservaMobile.userId);
      const userName = userInfo.nome;
      const userEmail = userInfo.email;
      
      // Buscar dados do livro
      let bookData: BookData = {};
      try {
        const bookSnap = await get(ref(db, `livros/${reservaMobile.bookId}`));
        bookData = bookSnap.val() || {};
      } catch (bookError) {
        console.log('Erro ao buscar livro, usando dados padrão:', bookError);
        bookData = {
          titulo: 'Livro não encontrado',
          autor: 'Autor desconhecido',
          capa: ''
        };
      }

      // Converter para o formato do web
      const reservaWeb = {
        titulo: bookData.titulo || 'Livro não encontrado',
        capa: bookData.capa || '',
        usuario: userName,
        emailUsuario: userEmail,
        dataReserva: new Date(reservaMobile.createdAt).toISOString().split('T')[0],
        status: this.mapStatus(reservaMobile.status),
        isbn: bookData.isbn || '',
        autor: bookData.autor || 'Autor desconhecido',
        // Mantemos referência ao ID original
        mobileReservaId: reservaId,
        userId: reservaMobile.userId,
        bookId: reservaMobile.bookId,
        createdAt: reservaMobile.createdAt
      };

      console.log('Reserva convertida para web:', reservaWeb);

      // Salvar no caminho que o web espera
      const webReservaRef = ref(db, `reservas/${reservaId}`);
      await set(webReservaRef, reservaWeb);

      console.log('Reserva sincronizada com sucesso:', reservaId);
      
    } catch (error) {
      console.error('Erro ao sincronizar reserva:', error);
      throw error;
    }
  }

  // Função auxiliar para buscar dados do usuário em diferentes locais
  private async buscarDadosUsuario(userId: string): Promise<{ nome: string; email: string }> {
    try {
      // Tentar buscar do caminho principal de usuários
      const userSnap = await get(ref(db, `users/${userId}`));
      if (userSnap.exists()) {
        const userData = userSnap.val();
        return {
          nome: userData.nome || userData.displayName || userData.name || 'Usuário',
          email: userData.email || 'email@indisponivel.com'
        };
      }
      
      // Tentar buscar do caminho de autenticação
      const authUserSnap = await get(ref(db, `authUsers/${userId}`));
      if (authUserSnap.exists()) {
        const authUserData = authUserSnap.val();
        return {
          nome: authUserData.displayName || authUserData.name || 'Usuário',
          email: authUserData.email || 'email@indisponivel.com'
        };
      }
      
      // Tentar buscar de outros caminhos comuns
      const commonPaths = ['usuarios', 'profiles', 'userProfiles'];
      for (const path of commonPaths) {
        const commonSnap = await get(ref(db, `${path}/${userId}`));
        if (commonSnap.exists()) {
          const commonData = commonSnap.val();
          return {
            nome: commonData.nome || commonData.displayName || commonData.name || 'Usuário',
            email: commonData.email || 'email@indisponivel.com'
          };
        }
      }
      
      console.log('Usuário não encontrado em nenhum caminho:', userId);
      return { nome: 'Usuário', email: 'email@indisponivel.com' };
      
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return { nome: 'Usuário', email: 'email@indisponivel.com' };
    }
  }

  // Mapear status do mobile para o web
  private mapStatus(mobileStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'pendente',
      'approved': 'aprovada', 
      'rejected': 'rejeitada',
      'waiting': 'pendente',
      'returned': 'devolvida'
    };
    
    return statusMap[mobileStatus] || 'pendente';
  }

  // Ouvir novas reservas do mobile e sincronizar automaticamente
  listenNewReservas() {
    const reservationsRef = query(ref(db, 'reservations'), orderByChild('createdAt'));
    
    const handler = onValue(reservationsRef, async (snapshot) => {
      const promises: Promise<void>[] = [];
      
      snapshot.forEach((child) => {
        const reservaId = child.key;
        const reserva = child.val();
        
        // Verificar se já existe sincronização
        const promise = get(ref(db, `reservas/${reservaId}`)).then(async (webReservaSnap) => {
          if (!webReservaSnap.exists()) {
            console.log('Nova reserva detectada, sincronizando:', reservaId);
            await this.syncReservaFromMobile(reservaId!);
          }
        });
        
        promises.push(promise);
      });

      Promise.all(promises).catch(error => {
        console.error('Erro ao processar reservas:', error);
      });
    });

    return () => off(reservationsRef, 'value', handler);
  }

  // Buscar todas as reservas sincronizadas
  async getReservas(): Promise<any[]> {
    try {
      const reservasRef = ref(db, 'reservas');
      const snapshot = await get(reservasRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const reservas = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        
        console.log('Reservas encontradas:', reservas.length);
        return reservas.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      }
      
      console.log('Nenhuma reserva encontrada');
      return [];
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      throw error;
    }
  }

  // Atualizar status da reserva (do web para mobile)
  async atualizarStatusReserva(reservaId: string, novoStatus: string) {
    try {
      // Atualizar no web
      const webReservaRef = ref(db, `reservas/${reservaId}`);
      await update(webReservaRef, { status: novoStatus });

      // Atualizar no mobile também
      const mobileStatus = this.reverseMapStatus(novoStatus);
      const updates: any = { status: mobileStatus };
      
      if (novoStatus === 'aprovada') {
        updates.approvedAt = Date.now();
      } else if (novoStatus === 'devolvida') {
        updates.returnedAt = Date.now();
      }
      
      const mobileReservaRef = ref(db, `reservations/${reservaId}`);
      await update(mobileReservaRef, updates);

      console.log('Status atualizado em ambos os sistemas:', reservaId, novoStatus);
      
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  }

  private reverseMapStatus(webStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'pendente': 'pending',
      'aprovada': 'approved',
      'rejeitada': 'rejected',
      'devolvida': 'returned'
    };
    
    return statusMap[webStatus] || 'pending';
  }

  // Sincronizar todas as reservas existentes
  async syncAllReservas() {
    try {
      console.log('Sincronizando todas as reservas...');
      
      const reservationsRef = ref(db, 'reservations');
      const snapshot = await get(reservationsRef);
      
      if (!snapshot.exists()) {
        console.log('Nenhuma reserva encontrada para sincronizar');
        return { total: 0, sincronizadas: 0 };
      }

      const reservas = snapshot.val();
      let sincronizadas = 0;
      const total = Object.keys(reservas).length;
      
      for (const reservaId of Object.keys(reservas)) {
        try {
          await this.syncReservaFromMobile(reservaId);
          sincronizadas++;
          console.log(`Reserva ${reservaId} sincronizada (${sincronizadas}/${total})`);
        } catch (error) {
          console.error(`Erro ao sincronizar reserva ${reservaId}:`, error);
        }
      }
      
      console.log(`Sincronização concluída: ${sincronizadas}/${total} reservas sincronizadas`);
      return { total, sincronizadas };
      
    } catch (error) {
      console.error('Erro na sincronização geral:', error);
      throw error;
    }
  }
}

export const reservaSyncService = new ReservaSyncService();