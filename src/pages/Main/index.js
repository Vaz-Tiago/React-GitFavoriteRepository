import React, {useState, useCallback, useEffect} from 'react';
import { FaGithub, FaPlus, FaSpinner, FaBars, FaTrash } from 'react-icons/fa';
import {Link} from 'react-router-dom';

import { Container, Form, SubmitButton, List, DeleteButton } from './styles';

import api from '../../services/api';

export default function Main() {

    //state do repositório com o hook useState
    const [newRepo, setNewRepo] = useState('');
    //state para armazenar os repositórios adicionados
    const [repositorios, setRepositorios] = useState([]);
    //state ilustrar para o usuario que está sendo feita a busca
    const [loading, setLoading] = useState(false);
    //state alert para erros
    const [alert, setAlert] = useState(null);


    //didMount - Buscar
    useEffect(()=> {
        const repoStorage = localStorage.getItem('repos');

        if(repoStorage){
            setRepositorios(JSON.parse(repoStorage));
        }
    }, []);

    //didupdate - Salvar Alterações
    useEffect(()=> {
        localStorage.setItem('repos', JSON.stringify(repositorios))
    }, [repositorios]);


    //Setando o state do repositório
    function handleInputChange (e){
        setNewRepo(e.target.value);
        setAlert(null);
    }
    

    //Por estar pegando informações que já existem e adicionando mais coisas, usa-se o useCallback
    //Segundo parametro são as states que vai chamar a função sempre que forem atualizadas
    const handleSubmit = useCallback ((e) => {
        e.preventDefault();
        

        //Por ser uma consulta assincrona é necessário criar uma função para isso e depois chama-la
        async function submit(){
            setLoading(true);
            setAlert(null);
            try{
                //Fazendo verificação se tem algo digitado:
                if(newRepo === ''){
                    throw new Error ('Você precisa indicar um repositório!');
                }

                //o endereço api é o github, ai passamos as informações do repositório que queremos acessar
                const response = await api.get(`repos/${newRepo}`)

                //Verificando se já existe o repositório pesquisado na lista do usuário:
                const hasRepo = repositorios.find(repo=> repo.name === newRepo);
                if (hasRepo){
                    throw new Error('Repositório duplicado');
                }
        
                //Filtrando o conteudo recuperado para um objeto, pois a api retorna muita informação.
                const data = {
                    name: response.data.full_name,
                }
        
                setRepositorios([...repositorios, data]);
                setNewRepo('');
            }catch(error){
                setAlert(true);
                console.log(error);
            }finally{
                setLoading(false);
            }
        }

        submit();

    }, [newRepo, repositorios]);


    //Como estamos manipulando um state callback nele
    const handleDelete = useCallback((repo) => {
        //faz a busca pelos repositórios e retrona todos que forem diferentes do que clicamos
        const find = repositorios.filter(r => r.name !== repo);
        setRepositorios(find);
    }, [repositorios]);

    return(
        //Ate os atributos podem ser definidos no styledComponent
        <div>
            <Container>
                <h1>
                    <FaGithub size={25} />
                    Meus Repositórios
                </h1>

                <Form onSubmit={handleSubmit} error={alert}>
                    <input 
                        type='text' placeholder='Adicionar repositórios' 
                        value={newRepo}
                        onChange={handleInputChange}
                    />
                    <SubmitButton Loading={loading ? 1 : 0}>
                        {loading ? (
                            <FaSpinner color='#fff' size={14} />
                        ) : (
                            <FaPlus color='#fff' size={14} />
                        )}
                    </SubmitButton>
                </Form>

                <List>

                    {repositorios.map(repo => (
                        <li key={repo.name}>
                            <span>
                                <DeleteButton onClick={()=> handleDelete(repo.name)}>
                                    <FaTrash size={14} />
                                </DeleteButton>
                                {repo.name}
                            </span>
                            <Link to={`/repositorio/${encodeURIComponent(repo.name)}`}>
                                <FaBars size={20} />
                            </Link>
                        </li>
                    ))}
                </List>
            </Container>
        </div>
    )
}
