import estilos from './Catalogo.module.css';
import { useState, useEffect } from 'react';
import { Livro } from '../components/Livro';
import { useBusca } from '../context/BuscaContext';
import { ref, get } from 'firebase/database';
import { db } from '../firebase/config'

interface LivroData {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: {
      thumbnail: string;
    };
    publisher?: string;
  };
  editora?: string;
  autor?: string;
  genero?: string;
}

export function Catalogo() {
  const [livros, setLivros] = useState<LivroData[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [carregando, setCarregando] = useState<boolean>(false);
  const { termoBusca } = useBusca();

  const buscarTodosLivros = async () => {
    setError(null);
    setCarregando(true);

    try {
      const livrosRef = ref(db, 'livros');
      const snapshot = await get(livrosRef);
      
      if (snapshot.exists()) {
        const dados = snapshot.val();
        
        const livrosArray: LivroData[] = Object.keys(dados).map(key => ({
          id: key,
          volumeInfo: {
            title: dados[key].titulo,
            authors: dados[key].autor ? [dados[key].autor] : [],
            imageLinks: {
              thumbnail: dados[key].capa
            },
            publisher: dados[key].editora
          },
          editora: dados[key].editora,
          autor: dados[key].autor,
          genero: dados[key].genero
        }));

        setLivros(livrosArray);
      } else {
        setLivros([]);
        setError(new Error("Nenhum livro cadastrado no sistema."));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao buscar livros'));
    } finally {
      setCarregando(false);
    }
  };

  const buscarLivrosFirebase = async (termo: string = "") => {
    setError(null);
    setCarregando(true);

    try {
      const livrosRef = ref(db, 'livros');
      const snapshot = await get(livrosRef);
      
      if (snapshot.exists()) {
        const dados = snapshot.val();
        const livrosArray: LivroData[] = Object.keys(dados).map(key => ({
          id: key,
          volumeInfo: {
            title: dados[key].titulo,
            authors: dados[key].autor ? [dados[key].autor] : [],
            imageLinks: {
              thumbnail: dados[key].capa
            },
            publisher: dados[key].editora
          },
          editora: dados[key].editora,
          autor: dados[key].autor,
          genero: dados[key].genero
        }));

        const termoLower = termo.toLowerCase().trim();
        
        const livrosFiltrados = termoLower 
          ? livrosArray.filter(livro => {
              const tituloMatch = livro.volumeInfo.title.toLowerCase().includes(termoLower);
              const autorMatch = livro.volumeInfo.authors?.some(autor => 
                autor.toLowerCase().includes(termoLower)
              ) || livro.autor?.toLowerCase().includes(termoLower);
              const editoraMatch = livro.volumeInfo.publisher?.toLowerCase().includes(termoLower) ||
                                 livro.editora?.toLowerCase().includes(termoLower);
              const generoMatch = livro.genero?.toLowerCase().includes(termoLower);

              return tituloMatch || autorMatch || editoraMatch || generoMatch;
            })
          : livrosArray;

        setLivros(livrosFiltrados);
      } else {
        setLivros([]);
        setError(new Error("Nenhum livro encontrado no banco de dados."));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao buscar livros'));
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarTodosLivros();
  }, []);

  useEffect(() => {
    if (termoBusca) {
      buscarLivrosFirebase(termoBusca);
    } else {
      buscarTodosLivros();
    }
  }, [termoBusca]);

  return (
    <main className={estilos.section}>
      <span className={estilos.title}>Catálogo Geral</span>

      {error && <p style={{ color: 'red' }}>{error.message}</p>}
      
      {!carregando && livros.length === 0 && !error && termoBusca && (
        <p>Nenhum livro encontrado para "{termoBusca}"</p>
      )}
      
      {!carregando && livros.length === 0 && !error && !termoBusca && (
        <p>Nenhum livro cadastrado no sistema.</p>
      )}

      <div className={estilos.listaLivros}>
        {carregando
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={estilos.skeletonCard}></div>
            ))
          : livros.map((umLivro) => (
              <Livro key={umLivro.id} propsLivro={umLivro} />
            ))
        }
      </div>
    </main>
  );
}