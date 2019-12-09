import React, {useState, useEffect} from 'react';
import api from '../../services/api';
import {Container, Owner, Loading, BackButton, IssuesList, Filters, PageActions} from './styles';
import { FaArrowLeft } from 'react-icons/fa';

export default function Repositorio({match}) {

    //states repositorio. Como é o resultado de apenas um repositório, o que ele recebe é um objeto vazio
    const [repositorio, setRepositorio] = useState({});
    //state issues, como mais de um recebe a array
    const [issues, setIssues] =useState([]);
    //state load para carregar as informações
    const [loading, setLoading] = useState(true);
    //state de paginação de issues. começa em 1 porque estou na página 1
    const [page, setPage] = useState(1);
    //state de filtro
    const [issueFilter, setIssueFilter] = useState('all');

    useEffect(()=>{
        async function load(){

            const nomeRepo = decodeURIComponent(match.params.repositorio);
            
            //Array de promise. Faz as duas requisições que precisamos ao mesmo tempo e coloca dentro de um array
            //Desconstruindo o Array: pimeira posisao do array recebe a primeira e assim por diante
            const [repositorioData, issueData] = await Promise.all([
                api.get(`/repos/${nomeRepo}`),
                api.get(`/repos/${nomeRepo}/issues`, {
                    //Isso é algo do axis: Limita apenas por issue aberto e 5 registros por página
                    params: {
                        state: issueFilter,
                        per_page: 5
                    }
                }),
            ]);

            setRepositorio(repositorioData.data);
            setIssues(issueData.data);
            //É true até terminar de carregar essas informações
            setLoading(false);

            //Nesse caso o .data é porque onde o axis armazena a informação da requisição
            //console.log(repositorioData.data);
            //console.log(issueData.data);

        }

        load();

    },[match.params.repositorio, issueFilter]);


    //Monitora o state de paginação
    useEffect(() =>{

        async function loadIssue() {
            const nomeRepo = decodeURIComponent(match.params.repositorio);

            const response = await api.get(`/repos/${nomeRepo}/issues`, {
                params:{
                    state: issueFilter,
                    page: page,
                    per_page: 5,
                },
            });

            setIssues(response.data)
        }

        loadIssue();

    }, [page, match.params.repositorio, issueFilter]);

    //Ações de navegação entre páginas. Essa função apenas muda o state. Precisa de useEffect para rodar a ação
    function handlePage(action){
        setPage(action === 'back' ? page - 1 : page + 1 );
    }


    //Filtro:
    function handleFilter(action){
        console.log(action)
        setIssueFilter(action);
    }


    //Mostrar durente o carregamento:
    if(loading){
        return(
            <Loading>
                <h1>
                    Carregando...
                </h1>
            </Loading>
        )
    }
    return(
        <Container>
            <BackButton to='/'>
                <FaArrowLeft color="#0d2636" size={24} />
            </BackButton>
            <Owner>
                <img 
                    src={repositorio.owner.avatar_url} 
                    alt={repositorio.owner.login}
                />
                <h1>{repositorio.name}</h1>
                <p>{repositorio.description}</p>
            </Owner>

            <IssuesList>
                <Filters>
                    <button type='button' onClick={()=> handleFilter('all')} disabled={issueFilter === 'all'}>Todas</button> | 
                    <button type='button' onClick={()=> handleFilter('open')} disabled={issueFilter === 'open'}>Abertas</button> | 
                    <button type='button' onClick={()=> handleFilter('closed')} disabled={issueFilter === 'closed'}>Fechadas</button>
                </Filters>
                {issues.map(issue => (
                    <li key={String(issue.id)} >
                        <img src={issue.user.avatar_url} alt={issue.user.login} />

                        <div>
                            <strong>
                                <a href={issue.html_url}>{issue.title}</a>
                                {issue.labels.map(label => (
                                    <span key={String(label.id)}>
                                       {label.name}
                                    </span>
                                ))}
                            </strong>

                            <p>
                                {issue.user.login}
                            </p>
                        </div>
                    </li>
                ))}
            </IssuesList>

            <PageActions>
                <button 
                    type='button' 
                    onClick={()=> handlePage('back')}
                    disabled={ page < 2 }
                >
                    Voltar
                </button>
                <button type='button' onClick={()=> handlePage('next') }>
                    Próxima
                </button>
            </PageActions>

        </Container>
    )
}
