**PLANO DE AÇÃO**

| Integrantes |
| :---- |
| LUIZ ANTONIO LOPES DOS SANTOS JUNIOR, 24201879ISABELI CLARICE CAJE DE CAMPOS, RA 24200700 MARCO DE AMICIS, RA 24216963 ELVIS DE SOUZA BATISTA, 24213628 ELIZABETH HAINNA SILVA, RA 24226855 ELITHA LAISA FREITAS PADIAL, RA 2205001 VITORIA MIRANDA DA SILVA, 24215645 BIANCA SCARPELINI PAVIA HUK, RA 2218816 |

| Disciplina | Projeto Integrador II |
| :---- | :---- |
| **Tema escolhido pelo grupo com base no tema norteador da Univesp** | Desenvolvimento de um Sistema de Onboarding Digital com Tecnologias de Rede e Interfaces Inteligentes para Automação Comercial com IoT (Eixo Computação). |
| **Título provisório do trabalho** | Self Install: Sistema de Onboarding Web para Instalação e Conexão de Controladoras IoT de Lavanderia |
| **Problema** | Como auxiliar o cliente de lavanderia automatizada de forma autônoma na instalação e conexão lógica de controladoras de hardware existentes com o sistema, mitigando erros de setup sem a necessidade de suporte técnico presencial? |
| **Objetivo** | Desenvolver uma interface web responsiva (ReactJS/JS) acessível que guie o cliente no passo a passo de instalação da controladora, integrando-a a um ambiente simulado via Docker (API, Banco de Dados, Cloud simulada) que valida a integridade da conexão física, Wi-Fi e status lógico em tempo real. |
| **Polo(s)** | Polo Mogi das Cruzes, Ferraz de Vasconcelos, São Bernardo do Campo, Santo André, Santana de Parnaíba |
| **Orientador do PI** | Ana Luzia Gomes de O. Ispada |

**Descreva o processo de escolha do local de realização do PI.**

*Orientação para o preenchimento: É esperado que o grupo descreva o processo de escolha do local, identificando as seguintes ações: quais outras opções de comunidades externas existiam ou se existiam; como chegaram até essas comunidades; quais ações e decisões tomaram em grupo para a escolha da comunidade participante do projeto.*

| O grupo realizou discussões virtuais para selecionar o local ideal para o Projeto Integrador. Inicialmente, identificamos duas opções de comunidades externas viáveis para a nossa atuação: (1) uma empresa de vistorias em imóveis. O projeto consistia na implementação de um sistema para a geração automatizada de relatórios técnicos padronizados. (2) uma empresa em expansão que presta serviços para franquias de lavanderia self-service que utiliza um sistema de automação comercial e controle por meio de controladoras de hardware IoT. A aproximação com a lavanderia ocorreu porque um dos integrantes do grupo possuía contato prévio com a empresa. Após avaliarmos coletivamente as opções, o grupo escolheu de forma unânime a empresa de automação de lavanderias. A decisão foi motivada pela excelente adequação do desafio técnico aos requisitos obrigatórios do eixo de Computação (que envolvem o desenvolvimento de software web com banco de dados, scripts, APIs, controle de versão, acessibilidade e simulação de rede e infraestrutura de nuvem). |
| :---- |

**Descreva como foi a conversa com a comunidade externa que participará do projeto e que acolheu o grupo.**

*Orientação para o preenchimento: É esperado que o grupo descreva a primeira visita à comunidade externa, identificando as seguintes ações: com qual(is) pessoa(s) conversou(ram) e sua posição na empresa/escola/etc.; descrição do local da visita; percepções do grupo quanto ao seu primeiro contato.*

| O contato técnico ocorreu de forma direta e remota com a equipe de engenharia e suporte da própria empresa de automação de autoatendimento parceira (onde o integrante do grupo atua). O sistema de controle elétrico e acionamento físico das máquinas de lavar e secadoras industriais já é existente, homologado e totalmente operacional. Contudo, a equipe técnica nos explicou detalhadamente que a grande dor reside no suporte de pós-venda: após o técnico homologado realizar a interposição física e elétrica das máquinas com a controladora, a responsabilidade de ligar a controladora à tomada, configurar o roteador local e conectar o dispositivo ao sistema existente é do próprio cliente da lavanderia (proprietário/franqueado). Por não possuírem perfil técnico, esses clientes cometem erros frequentes nessa instalação física de cabos e conexão lógica, gerando um volume expressivo de chamados de suporte técnico. O grupo percebeu uma excelente oportunidade de aplicar a engenharia de software criando um protótipo web de onboarding focado estritamente em guiar esse cliente de forma autônoma e simples na conexão e instalação física dos cabos. Por ser uma solução interna para a empresa de automação mitigar seus chamados de suporte, não há contato direto do grupo com os clientes finais. |
| :---- |
|  |

**Descreva, a partir da conversa com a comunidade externa, quais problemas podem ser pesquisados e que se relacionam com o tema norteador definido pela Univesp.**

*Orientação para o preenchimento: É esperado que o grupo descreva ao menos um problema e sua relação com o tema norteador definido pela Univesp.*

| O principal problema identificado é a sobrecarga e alto custo operacional de suporte técnico enfrentado pela empresa de automação devido à falta de autonomia e incidência de erros cometidos pelos seus clientes na instalação física de cabos e na conexão lógica das controladoras de hardware existentes com o sistema. Este problema está fortemente relacionado com os temas norteadores exigidos nos eixo de Computação da Univesp: 1\. Framework Web e Scripts (JavaScript): O passo a passo interativo de onboarding necessita de uma interface responsiva, dinâmica e altamente acessível construída em ReactJS (JavaScript) para garantir excelente Interação Humano-Computador (IHC). 2\. Uso de API e Banco de Dados: Para verificar em tempo real se a instalação lógica foi feita de forma correta, o sistema precisa se comunicar com uma API e registrar as tentativas de conexão em um banco de dados SQL. 3\. Simulação Segura e Sem Custos via Docker: Para preservar caminhos de acesso confidenciais da API interna da empresa e eliminar os custos de contratação de um servidor de nuvem pago, o grupo simulará localmente a API, o banco de dados e o ambiente de nuvem utilizando contêineres Docker, o que permite realizar testes de integração em tempo real de forma totalmente segura, robusta e gratuita. |
| :---- |

**Frente ao tema norteador e aos problemas levantados junto à comunidade externa, descreva qual o tema específico a ser trabalhado pelo grupo no PI.** 

*Orientação para o preenchimento: É esperado que o grupo descreva o tema que será trabalhado no Projeto Integrador e sua relação com o tema norteador definido pela Univesp.*

| O tema específico do trabalho é o 'Desenvolvimento de uma Interface de Onboarding Web responsiva (ReactJS) com Simulação de Integração em Tempo Real via Docker para Instalação e Conexão de Controladoras IoT de Lavanderia'. A relação com o tema norteador é direta: desenvolvemos um software web responsivo em ReactJS (JavaScript) com foco em acessibilidade e facilidade de uso, exibindo um passo a passo ilustrado de conexão da controladora física (tomada, cabos e pareamento de rede). Em paralelo, para validar a conexão lógica em tempo real, desenvolvemos um ambiente local simulado em Docker que contém um banco de dados e uma API simulada (representando a nuvem e a telemetria da controladora). Isso permite testar exaustivamente a conformidade do fluxo de setup sem expor credenciais confidenciais do servidor de produção e sem custos operacionais de hospedagem. |
| :---- |

**Plano de Ação**

*Orientação para o preenchimento: É esperado que o grupo identifique em todas as quinzenas: as atividades de maneira detalhada; os integrantes do grupo responsáveis por elas (todos os integrantes precisam ser listados); as datas de início e de finalização (conclusão da atividade) para cada uma delas. Além disso, ao descrever a atividade, note se há relação com o objetivo proposto para cada quinzena.*

| Quinzena 1 Objetivo: Analisar o cenário do projeto e iniciar o levantamento bibliográfico para abordar o problema. |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- |
| Atividade | Responsável | Data de início | Data de finalização | Observação |
|   Mapeamento técnico do processo de instalação física e lógica das controladoras e erros recorrentes de conexão de rede. | Luiz Antonio Lopes dos Santos Junior, Isabeli Clarice Caje de Campos | 03/08/2026 | 10/08/2026 | Mapear as dores reais do cliente no setup com o sistema existente. |
|   Pesquisa bibliográfica sobre frameworks web (ReactJS), scripts JavaScript e acessibilidade WCAG. | Marco De Amicis, Elvis de Souza Batista | 03/08/2026 | 14/08/2026 | Fundamentar a escolha tecnológica e acessibilidade. |
|   Estudo e planejamento de infraestrutura de simulação local via contêineres Docker. | Elizabeth Hainna Silva, Elitha Laisa Freitas Padial | 05/08/2026 | 14/08/2026 | Garantir simulação de rede e API local de forma gratuita. |
|   Definição da estrutura inicial de controle de versão (Git/GitHub) e divisão de papéis operacionais do grupo. | Vitoria Miranda da Silva, Bianca Scarpelini Pavia Huk | 03/08/2026 | 10/08/2026 | Estabelecer o repositório oficial e controle de branches. |

| Quinzena 2 Objetivo: Interagir com a comunidade externa, definir o problema e organizar o plano de ação. |  |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- | ----- |
| Atividade | Responsável | Data de início | Data de finalização | Observação |  |
| Reunião remota com a equipe técnica da empresa de automação para alinhamento de requisitos de hardware e rede. | Luiz Antonio Lopes dos Santos Junior, Marco De Amicis | 17/08/2026 | 22/08/2026 | Coleta de insumos práticos sobre erros na instalação lógica. |  |
| Formalização do escopo do onboarding web focado estritamente na facilitação da instalação lógica e de cabos. | Vitoria Miranda da Silva, Isabeli Clarice Caje de Campos | 17/08/2026 | 24/08/2026 | Consolidar que o hardware é existente e o foco é apenas o onboarding. |  |
| Modelagem inicial da arquitetura da simulação Docker (contêineres de banco SQL e API Node/Python). | Elizabeth Hainna Silva, Elvis de Souza Batista | 19/08/2026 | 26/08/2026 | Planejar os contêineres que representarão a nuvem simulada. |  |
| Redação, revisão ortográfica e formatação final do documento do Plano de Ação para postagem no AVA. | Elitha Laisa Freitas Padial, Bianca Scarpelini Pavia Huk | 24/08/2026 | 30/08/2026 | Revisão ortográfica e postagem por um integrante no portal. |  |

| Quinzena 3 Objetivo: Definir título do trabalho, visitar o local de pesquisa, dar continuidade ao desenvolvimento do trabalho. |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- |
| Atividade | Responsável | Data de início | Data de finalização | Observação |
| Definição do título oficial do projeto e redação da Introdução do Relatório Parcial do PI. | Isabeli Clarice Caje de Campos, Marco De Amicis | 31/08/2026 | 05/09/2026 | Iniciar a escrita formal da documentação do PI II. |
| Desenho do protótipo de telas no Figma do passo a passo visual (tomada, cabos, rede e maquininha). | Vitoria Miranda da Silva, Bianca Scarpelini Pavia Huk | 01/09/2026 | 10/09/2026 | Desenho do fluxo do usuário para guiar a conexão lógica. |
| Configuração do repositório Git, branches e esqueleto do ambiente web ReactJS. | Luiz Antonio Lopes dos Santos Junior, Elvis de Souza Batista | 31/08/2026 | 08/09/2026 | Configurar repositório e ambiente de codificação do frontend. |
| Desenvolvimento do script SQL (banco local) e desenvolvimento inicial da API simulada em contêiner Docker. | Elizabeth Hainna Silva, Elitha Laisa Freitas Padial | 02/09/2026 | 11/09/2026 | Criar endpoints que simulam o comportamento real da nuvem. |

| Quinzena 4 Objetivo: Construir e apresentar a solução inicial (Relatório Parcial); coletar sugestões com a comunidade externa; entregar o Relatório Parcial (conforme modelos disponíveis no AVA). |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- |
| Atividade | Responsável | Data de início | Data de finalização | Observação |
| Construção do frontend inicial das telas de onboarding usando ReactJS e scripts JavaScript. | Luiz Antonio Lopes dos Santos Junior, Marco De Amicis | 14/09/2026 | 22/09/2026 | Materializar as telas baseadas no Figma de forma interativa. |
| Integração do frontend ReactJS com a API e banco SQL simulados via Docker. | Elizabeth Hainna Silva, Elvis de Souza Batista | 15/09/2026 | 23/09/2026 | Unir o passo a passo com a simulação para validação em tempo real. |
| Reunião remota com engenheiros da empresa para validação preliminar do protótipo e colheita de feedbacks. | Vitoria Miranda da Silva, Isabeli Clarice Caje de Campos | 21/09/2026 | 25/09/2026 | Reunião de validação do onboarding com a comunidade técnica. |
| Consolidação, revisão, formatação ABNT e postagem oficial do Relatório Parcial em PDF no AVA. | Elitha Laisa Freitas Padial, Bianca Scarpelini Pavia Huk | 14/09/2026 | 26/09/2026 | Reunir Introdução, Metodologia, Teoria e Solução Inicial. |

| Quinzena 5 Objetivo: Construir a solução final, com base nas sugestões do Relatório Parcial. |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- |
| Atividade | Responsável | Data de início | Data de finalização | Observação |
| Ajustes visuais e melhorias de IHC no portal de onboarding ReactJS com base nos feedbacks coletados. | Isabeli Clarice Caje de Campos, Bianca Scarpelini Pavia Huk | 28/09/2026 | 04/10/2026 | Melhorar a clareza e usabilidade do passo a passo. |
| Implementação das rotinas de acessibilidade (propriedades ARIA, contraste e navegação por teclado). | Vitoria Miranda da Silva, Marco De Amicis | 28/09/2026 | 06/10/2026 | Garantir conformidade com as rubricas de acessibilidade. |
| Aprimoramento da API simulada no Docker para emular as respostas dos LEDs e status físico da controladora. | Luiz Antonio Lopes dos Santos Junior, Elizabeth Hainna Silva | 30/09/2026 | 08/10/2026 | Aumentar a fidelidade da simulação de integração. |
| Otimização das chamadas do banco SQL, rotas Docker e escrita de testes unitários no frontend. | Elvis de Souza Batista, Elitha Laisa Freitas Padial | 01/10/2026 | 09/10/2026 | Refatorar scripts de banco de dados e controle de versão Git. |

| Quinzena 6 Objetivo: Analisar os resultados, finalizar o protótipo e preparar o Vídeo de apresentação. |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- |
| Atividade | Responsável | Data de início | Data de finalização | Observação |
| Execução dos testes finais de usabilidade, tempo de resposta e integração da simulação Docker local. | Isabeli Clarice Caje de Campos, Elvis de Souza Batista | 12/10/2026 | 18/10/2026 | Validar o correto funcionamento end-to-end do protótipo. |
| Escrita formal do capítulo de Resultados e Análise dos Resultados do Relatório Final do PI. | Luiz Antonio Lopes dos Santos Junior, Vitoria Miranda da Silva | 13/10/2026 | 20/10/2026 | Documentar a validação científica das simulações. |
| Elaboração do roteiro e captação de áudios/telas do portal web e da simulação Docker rodando em tempo real. | Marco De Amicis, Elitha Laisa Freitas Padial | 14/10/2026 | 22/10/2026 | Planejar a gravação demonstrativa exigida pela Univesp. |
| Gravação das funcionalidades de acessibilidade e edição preliminar do vídeo de apresentação (5 a 10 min). | Elizabeth Hainna Silva, Bianca Scarpelini Pavia Huk | 16/10/2026 | 25/10/2026 | Unificar a demonstração prática e explicações do código. |

| Quinzena 7 Objetivo: Concluir e entregar o Relatório Final e o Vídeo de apresentação. |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- |
| Atividade | Responsável | Data de início | Data de finalização | Observação |
| Upload do vídeo editado no YouTube (público) e inserção do respectivo link na capa do relatório final. | Elizabeth Hainna Silva, Elitha Laisa Freitas Padial | 26/10/2026 | 02/11/2026 | Garantir o link ativo e público do vídeo para avaliação. |
| Preenchimento da Ficha de Prototipagem técnica da Univesp detalhando o ReactJS e a simulação Docker. | Luiz Antonio Lopes dos Santos Junior, Elvis de Souza Batista | 27/10/2026 | 06/11/2026 | Preencher o anexo obrigatório sobre o protótipo. |
| Agendamento e participação na reunião virtual de Avaliação Colaborativa do grupo com a Orientadora. | Vitoria Miranda da Silva, Marco De Amicis | 28/10/2026 | 08/11/2026 | Cumprir o rito de autoavaliação e definição de indicadores. |
| Revisão ortográfica geral do Relatório Final, padronização ABNT, geração do PDF e postagem final no AVA. | Isabeli Clarice Caje de Campos, Bianca Scarpelini Pavia Huk | 26/10/2026 | 10/11/2026 | Submissão final do documento por apenas um integrante. |

