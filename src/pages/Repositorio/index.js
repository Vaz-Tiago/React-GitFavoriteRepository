import React, {useState, useEffect} from 'react';
import api from '../../services/api';
import {Container, Owner, Loading, BackButton} from './styles';
import { FaArrowLeft } from 'react-icons/fa';

export default function Repositorio({match}) {

    //states repositorio. Como é o resultado de apenas um repositório, o que ele recebe é um objeto vazio
    const [repositorio, setRepositorio] = useState({});
    //state issues, como mais de um recebe a array
    const [issues, setIssues] =useState([]);
    //state load para carregar as informações
    const [loading, setLoading] = useState(true);

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
                        state: 'open',
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

    },[match.params.repositorio]);


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

        </Container>
    )
}
