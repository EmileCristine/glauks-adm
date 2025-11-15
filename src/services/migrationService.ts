// migrationService.ts
import { emprestimoService } from './emprestimoService';

class MigrationService {
  async migrarParaNovoSistema(): Promise<void> {
    try {
      console.log('Iniciando migração para novo sistema de disponibilidade...');
      
      // Sincronizar disponibilidade baseada nos empréstimos atuais
      await emprestimoService.sincronizarDisponibilidade();
      
      // Verificar e corrigir status de atraso
      await emprestimoService.verificarEAtualizarAtrasados();
      
      console.log('Migração concluída com sucesso!');
    } catch (error) {
      console.error('Erro durante a migração:', error);
      throw error;
    }
  }

  async verificarInconsistencias(): Promise<string[]> {
    const inconsistencias: string[] = [];
    
    try {
      const emprestimos = await emprestimoService.getEmprestimos();
      const controle = await emprestimoService.getControleDisponibilidade();
      
      // Verificar empréstimos marcados como devolvidos mas sem data de devolução
      const emprestimosInconsistentes = emprestimos.filter(e => 
        e.status === 'devolvido' && !e.dataDevolucao
      );
      
      if (emprestimosInconsistentes.length > 0) {
        inconsistencias.push(`${emprestimosInconsistentes.length} empréstimos marcados como devolvidos sem data de devolução`);
      }
      
      // Verificar controle de disponibilidade inconsistente
      for (const item of controle) {
        if (item.quantidadeDisponivel < 0) {
          inconsistencias.push(`Quantidade disponível negativa para ${item.titulo}`);
        }
        
        if (item.quantidadeDisponivel > item.quantidadeTotal) {
          inconsistencias.push(`Quantidade disponível maior que total para ${item.titulo}`);
        }
      }
      
    } catch (error) {
      console.error('Erro ao verificar inconsistências:', error);
    }
    
    return inconsistencias;
  }
}

export const migrationService = new MigrationService();