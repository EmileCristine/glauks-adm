import { useState, useEffect } from 'react';
import { useEmprestimo } from '../context/EmprestimoContext';
import { ref, get } from 'firebase/database';
import { db } from '../firebase/config';
import estilos from '../pages/Emprestimo.module.css'

interface AdicionarEmprestimoProps {
  onClose: () => void;
}

export function AdicionarEmprestimo({ onClose }: AdicionarEmprestimoProps) {
  const { adicionarEmprestimo } = useEmprestimo();
  const [livrosDisponiveis, setLivrosDisponiveis] = useState<any[]>([]);
  const [carregandoLivros, setCarregandoLivros] = useState(true);
  const [livroSelecionado, setLivroSelecionado] = useState<any>(null);
  const [buscaLivro, setBuscaLivro] = useState('');

  const [formData, setFormData] = useState({
    usuario: '',
    emailUsuario: '',
    dataDevolucaoEsperada: ''
  });

  // Buscar livros diretamente do Firebase
  useEffect(() => {
    const buscarLivrosFirebase = async () => {
      try {
        setCarregandoLivros(true);
        
        // Tenta buscar de diferentes coleções/tabelas
        const colecoes = ['livros', 'acervo', 'catalogo', 'books'];
        
        for (const colecao of colecoes) {
          try {
            const colecaoRef = ref(db, colecao);
            const snapshot = await get(colecaoRef);
            
            if (snapshot.exists()) {
              const data = snapshot.val();
              const livros = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
              }));
              
              console.log(`Livros encontrados em ${colecao}:`, livros);
              setLivrosDisponiveis(livros);
              break;
            }
          } catch (error) {
            console.log(`Coleção ${colecao} não encontrada`);
          }
        }
        
        if (livrosDisponiveis.length === 0) {
          console.log('Nenhuma coleção de livros encontrada');
        }
        
      } catch (error) {
        console.error('Erro ao buscar livros:', error);
      } finally {
        setCarregandoLivros(false);
      }
    };

    buscarLivrosFirebase();
  }, []);

  const livrosFiltrados = livrosDisponiveis.filter(livro =>
    livro.titulo?.toLowerCase().includes(buscaLivro.toLowerCase()) ||
    livro.nome?.toLowerCase().includes(buscaLivro.toLowerCase()) ||
    livro.title?.toLowerCase().includes(buscaLivro.toLowerCase())
  );

  const handleSelecionarLivro = (livro: any) => {
    setLivroSelecionado(livro);
    setBuscaLivro(livro.titulo || livro.nome || livro.title || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!livroSelecionado) {
      alert('Por favor, selecione um livro');
      return;
    }

    try {
      const emprestimoData = {
        titulo: livroSelecionado.titulo || livroSelecionado.nome || livroSelecionado.title,
        usuario: formData.usuario,
        emailUsuario: formData.emailUsuario,
        capa: livroSelecionado.capa || livroSelecionado.imagem || livroSelecionado.cover || 'https://via.placeholder.com/150x200?text=Sem+Capa',
        dataDevolucao: '',
        dataDevolucaoEsperada: formData.dataDevolucaoEsperada,
        isbn: livroSelecionado.isbn || '',
        livroId: livroSelecionado.id || livroSelecionado.livroId
      };

      console.log('Criando empréstimo:', emprestimoData);
      await adicionarEmprestimo(emprestimoData);
      
      alert('Empréstimo criado com sucesso!');
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar empréstimo:', error);
      alert(`Erro: ${error.message || 'Não foi possível criar o empréstimo'}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  const dataMinima = amanha.toISOString().split('T')[0];

  return (
    <div className={estilos.modalOverlay}>
      <div className={estilos.modal}>
        <div className={estilos.modalHeader}>
          <h2>Novo Empréstimo</h2>
          <button className={estilos.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={estilos.form}>
          <div className={estilos.formGroup}>
            <label>Selecionar Livro *</label>
            <input
              type="text"
              value={buscaLivro}
              onChange={(e) => setBuscaLivro(e.target.value)}
              placeholder="Buscar livro..."
              className={estilos.buscaInput}
            />
            
            {buscaLivro && !livroSelecionado && (
              <div className={estilos.listaLivros}>
                {carregandoLivros ? (
                  <div className={estilos.carregando}>Carregando livros...</div>
                ) : livrosFiltrados.length === 0 ? (
                  <div className={estilos.semResultados}>Nenhum livro encontrado</div>
                ) : (
                  livrosFiltrados.map((livro) => (
                    <div
                      key={livro.id}
                      onClick={() => handleSelecionarLivro(livro)}
                      className={estilos.itemLivro}
                    >
                      <img 
                        src={livro.capa || livro.imagem || livro.cover || 'https://via.placeholder.com/40x50?text=Livro'} 
                        alt="Capa"
                        className={estilos.capaPequena}
                      />
                      <div className={estilos.infoLivro}>
                        <div className={estilos.tituloLivro}>
                          {livro.titulo || livro.nome || livro.title}
                        </div>
                        {livro.autor && <div className={estilos.autorLivro}>por {livro.autor}</div>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {livroSelecionado && (
              <div className={estilos.livroSelecionado}>
                <img 
                  src={livroSelecionado.capa || livroSelecionado.imagem || livroSelecionado.cover || 'https://via.placeholder.com/40x50?text=Livro'} 
                  alt="Capa"
                  className={estilos.capaPequena}
                />
                <div className={estilos.infoLivroSelecionado}>
                  <strong>{livroSelecionado.titulo || livroSelecionado.nome || livroSelecionado.title}</strong>
                  {livroSelecionado.autor && <div>por {livroSelecionado.autor}</div>}
                </div>
                <button 
                  type="button"
                  onClick={() => setLivroSelecionado(null)}
                  className={estilos.btnRemover}
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className={estilos.formGroup}>
            <label>Nome do Usuário *</label>
            <input
              type="text"
              name="usuario"
              value={formData.usuario}
              onChange={handleChange}
              required
            />
          </div>

          <div className={estilos.formGroup}>
            <label>Email *</label>
            <input
              type="email"
              name="emailUsuario"
              value={formData.emailUsuario}
              onChange={handleChange}
              required
            />
          </div>

          <div className={estilos.formGroup}>
            <label>Data Devolução *</label>
            <input
              type="date"
              id="dataDevolucaoEsperada"
              name="dataDevolucaoEsperada"
              value={formData.dataDevolucaoEsperada}
              onChange={handleChange}
              min={dataMinima}
              required
              className={estilos.dataInput}
            />
          </div>

          <div className={estilos.formActions}>
            <button type="button" onClick={onClose} className={estilos.btnCancelar}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className={estilos.btnConfirmar}
              disabled={!livroSelecionado}
            >
              Adicionar Empréstimo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}