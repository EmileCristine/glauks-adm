import { useState, useEffect, useCallback } from 'react';
import { ref, push, set } from 'firebase/database';
import { db } from '../firebase/config'
import estilos from './AddLivro.module.css';
import { CiImageOn } from "react-icons/ci";
import { MdClose } from "react-icons/md";

interface Livro {
  titulo: string;
  autor: string;
  genero: string;
  paginas: string;
  isbn: string;
  sinopse: string;
  capa: string;
  editora?: string;
  dataPublicacao?: string;
  dataAdicao: string;
}

export function AddLivro() {
  const [livro, setLivro] = useState<Livro>({
    titulo: '',
    autor: '',
    genero: '',
    paginas: '',
    isbn: '',
    sinopse: '',
    capa: '',
    dataAdicao: new Date().toISOString()
  });
  
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [isbnDigitado, setIsbnDigitado] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [mostrarPopupImagem, setMostrarPopupImagem] = useState(false);
  const [urlImagem, setUrlImagem] = useState('');

  // Debounce para evitar muitas chamadas à API
  useEffect(() => {
    if (isbnDigitado.length < 10) return;
    
    const handler = setTimeout(() => {
      buscarPorISBN(isbnDigitado);
    }, 800);
    
    return () => clearTimeout(handler);
  }, [isbnDigitado]);

  // Função para buscar informações do livro por ISBN usando Google Books API
  const buscarPorISBN = async (isbn: string) => {
    setCarregando(true);
    setErro('');
    
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar livro');
      }
      
      const data = await response.json();
      
      if (data.totalItems === 0) {
        setErro('Nenhum livro encontrado para este ISBN. Preencha os dados manualmente.');
        setCarregando(false);
        return;
      }
      
      const livroData = data.items[0].volumeInfo;
      
      // Mapear os dados da API para nosso formato
      const livroFormatado: Partial<Livro> = {
        titulo: livroData.title || '',
        autor: livroData.authors ? livroData.authors.join(', ') : '',
        genero: livroData.categories ? livroData.categories[0] : '',
        paginas: livroData.pageCount ? livroData.pageCount.toString() : '',
        sinopse: livroData.description || '',
        capa: livroData.imageLinks ? livroData.imageLinks.thumbnail.replace('http:', 'https:') : '',
        editora: livroData.publisher || '',
        dataPublicacao: livroData.publishedDate || ''
      };
      
      setLivro(prev => ({
        ...prev,
        ...livroFormatado,
        isbn: isbn
      }));
      
    } catch (error) {
      console.error('Erro na busca por ISBN:', error);
      setErro('Erro ao buscar informações do livro. Verifique o ISBN ou tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  // Função para salvar livro no Firebase
  const salvarLivroNoBanco = async (livroData: Livro) => {
    try {
      setCarregando(true);
      setErro('');
      setSucesso('');

      // Criar uma referência para a coleção 'livros'
      const livrosRef = ref(db, 'livros');
      
      // Criar um novo nó com ID automático
      const novoLivroRef = push(livrosRef);
      
      // Salvar os dados do livro
      await set(novoLivroRef, {
        ...livroData,
        dataAdicao: new Date().toISOString()
      });

      setSucesso('Livro salvo com sucesso!');
      return true;
      
    } catch (error) {
      console.error('Erro ao salvar livro:', error);
      setErro('Erro ao salvar livro. Tente novamente.');
      return false;
    } finally {
      setCarregando(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'isbn') {
      setIsbnDigitado(value);
    }
    
    setLivro(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!livro.titulo.trim() || !livro.autor.trim() || !livro.isbn.trim()) {
      setErro('Título, autor e ISBN são obrigatórios.');
      return;
    }

    // Salvar no banco de dados
    const sucesso = await salvarLivroNoBanco(livro);
    
    if (sucesso) {
      // Limpar formulário após sucesso
      setLivro({
        titulo: '',
        autor: '',
        genero: '',
        paginas: '',
        isbn: '',
        sinopse: '',
        capa: '',
        dataAdicao: new Date().toISOString()
      });
      setIsbnDigitado('');
      setUrlImagem('');
      setMostrarPopupImagem(false);
    }
  };

  const handleCancelar = () => {
    if (confirm('Tem certeza que deseja cancelar? Todos os dados preenchidos serão perdidos.')) {
      setLivro({
        titulo: '',
        autor: '',
        genero: '',
        paginas: '',
        isbn: '',
        sinopse: '',
        capa: '',
        dataAdicao: new Date().toISOString()
      });
      setIsbnDigitado('');
      setErro('');
      setSucesso('');
      setUrlImagem('');
      setMostrarPopupImagem(false);
    }
  };

  const handleCapaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLivro(prev => ({ ...prev, capa: event.target?.result as string }));
        setMostrarPopupImagem(false);
        setUrlImagem('');
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlImagem(e.target.value);
  };

  const aplicarUrl = () => {
    if (urlImagem.trim()) {
      setLivro(prev => ({ ...prev, capa: urlImagem }));
      setMostrarPopupImagem(false);
      setUrlImagem('');
    }
  };

  const togglePopupImagem = () => {
    setMostrarPopupImagem(!mostrarPopupImagem);
    setUrlImagem('');
  };

  return (
    <main className={estilos.section}>
      <span className={estilos.title}>Adicionar Livro</span>
      
      <div className={estilos.container}>
        {/* Lado esquerdo - Capa */}
        <div className={estilos.ladoEsquerdo}>
          <div className={estilos.capa}>
            <div className={estilos.capaCover}>
              <img 
                src={livro.capa || "/placeholder-capa.png"} 
              />
            </div>
            <div className={estilos.carregarImg}>
              <button 
                type="button" 
                onClick={togglePopupImagem}
                className={estilos.btnAlterarImg}
              >
                <CiImageOn style={{ fontSize: '24px' }}/>
                Alterar Imagem
              </button>
              <input 
                id="capa-input"
                type="file" 
                accept="image/*" 
                onChange={handleCapaChange}
                className={estilos.capaInput}
              />

              {/* Popup de seleção de imagem */}
              {mostrarPopupImagem && (
                <div className={estilos.popupOverlay}>
                  <div className={estilos.popupContent}>
                    <div className={estilos.popupHeader}>
                      <h3>Selecionar Imagem</h3>
                      <button 
                        onClick={togglePopupImagem}
                        className={estilos.popupClose}
                      >
                        <MdClose size={20} />
                      </button>
                    </div>
                    
                    <div className={estilos.popupOptions}>
                      {/* Opção 1: Carregar do dispositivo */}
                      <label htmlFor="capa-input" className={estilos.popupOption}>
                        <CiImageOn size={24} />
                        <span>Carregar do dispositivo</span>
                      </label>

                      {/* Opção 2: Inserir por URL */}
                      <div className={estilos.popupOption}>
                        <CiImageOn size={24} />
                        <span>Inserir por URL</span>
                        <div className={estilos.urlInputContainer}>
                          <input
                            type="url"
                            placeholder="Cole a URL da imagem aqui"
                            value={urlImagem}
                            onChange={handleUrlChange}
                            className={estilos.urlInput}
                          />
                          <button 
                            onClick={aplicarUrl}
                            className={estilos.btnAplicarUrl}
                            disabled={!urlImagem.trim()}
                          >
                            Aplicar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lado direito - Detalhes do Livro */}
        <div className={estilos.ladoDireito}>          
          <form id="form-livro" className={estilos.form} onSubmit={handleSubmit}>
            <div className={estilos.formGroup}>
              <label htmlFor="titulo">
                Título <span className={estilos.obrigatorio}>*</span>
              </label>
              <input
                id="titulo"
                name="titulo"
                value={livro.titulo}
                onChange={handleChange}
                required
              />
            </div>

            <div className={estilos.linha}>
              <div className={estilos.formGroup}>
                <label htmlFor="autor">
                  Autor <span className={estilos.obrigatorio}>*</span>
                </label>
                <input
                  id="autor"
                  name="autor"
                  value={livro.autor}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={estilos.formGroup}>
                <label htmlFor="genero">Gênero</label>
                <input
                  id="genero"
                  name="genero"
                  value={livro.genero}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={estilos.linha}>
              <div className={estilos.formGroup}>
                <label htmlFor="editora">Editora</label>
                <input
                  id="editora"
                  name="editora"
                  value={livro.editora || ''}
                  onChange={handleChange}
                />
              </div>

              <div className={estilos.formGroup}>
                <label htmlFor="paginas">Nº de páginas</label>
                <input
                  id="paginas"
                  name="paginas"
                  type="number"
                  value={livro.paginas}
                  onChange={handleChange}
                  min="1"
                />
              </div>

              <div className={estilos.formGroup}>
                <label htmlFor="isbn">
                  ISBN <span className={estilos.obrigatorio}>*</span>
                  <span className={estilos.infoBusca}></span>
                </label>
                <input
                  id="isbn"
                  name="isbn"
                  value={livro.isbn}
                  onChange={handleChange}
                  placeholder="Ex: 8533613377"
                  required
                />
                {carregando && <div className={estilos.buscaInfo}>Buscando livro...</div>}
              </div>
            </div>

            <div className={estilos.formGroup}>
              <label htmlFor="sinopse">Sinopse</label>
              <textarea
                id="sinopse"
                name="sinopse"
                value={livro.sinopse}
                onChange={handleChange}
                rows={5}
              />
            </div>

            {erro && <div className={estilos.erroInfo}>{erro}</div>}
            {sucesso && <div className={estilos.sucessoInfo}>{sucesso}</div>}
          </form>

          <div className={estilos.formActions}>
            <button type="button" onClick={handleCancelar} className={estilos.btnCancelar}>
              Cancelar
            </button>
            <button 
              type="submit" 
              form="form-livro" 
              className={estilos.btnAdicionar}
              disabled={carregando}
            >
              {carregando ? 'Salvando...' : 'Salvar Livro'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}