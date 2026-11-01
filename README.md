# Sistema de Oficina — Front-end

**Autor:** Deusley Diego

Aplicação web administrativa para gerenciamento de uma oficina, desenvolvida com Angular 17, TypeScript, SCSS e PrimeNG. O sistema permite autenticar usuários e administrar clientes, veículos, ordens de serviço e usuários administrativos por meio da API REST do projeto.

> Este é um front-end SPA (Single Page Application). A autenticação e a persistência dos dados são responsabilidade da API REST.

## Sumário

- [Visão geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e execução](#instalação-e-execução)
- [Scripts disponíveis](#scripts-disponíveis)
- [Rotas](#rotas)
- [Integração com a API](#integração-com-a-api)
- [Autenticação e autorização](#autenticação-e-autorização)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Padrões de interface e acessibilidade](#padrões-de-interface-e-acessibilidade)
- [Testes e build](#testes-e-build)
- [Configuração para outros ambientes](#configuração-para-outros-ambientes)
- [Solução de problemas](#solução-de-problemas)
- [Limitações conhecidas](#limitações-conhecidas)

## Visão geral

O front-end utiliza componentes standalone e carregamento sob demanda das páginas protegidas. O layout administrativo possui navegação lateral, área de conteúdo responsiva, tabelas com busca e paginação e diálogos para criação, edição e confirmação de operações.

As páginas seguem a identidade visual escura do sistema e foram ajustadas para uso em desktops, tablets e celulares, com foco visível, navegação por teclado e controles compatíveis com leitores de tela.

## Tecnologias

- Angular `17.3.x` e Angular CLI `17.3.x`.
- TypeScript `5.4.x`.
- RxJS `7.8.x`.
- PrimeNG `17.18.x`.
- PrimeFlex `4.x`.
- PrimeIcons `8.x`.
- SCSS para estilos locais e globais.
- Karma/Jasmine para testes unitários.

Não há framework adicional de estado global. O fluxo utiliza serviços Angular, `HttpClient`, observables RxJS e guards/interceptors funcionais.

## Funcionalidades

### Autenticação

- Login com e-mail e senha.
- Validação de campos no formulário.
- Alternância de visibilidade da senha.
- Persistência do token, nome e perfil no `localStorage`.
- Redirecionamento para `/login` quando não há sessão.
- Inclusão automática do token Bearer nas requisições HTTP.
- Logout com limpeza dos dados de sessão.

### Clientes

- Listagem com busca por nome, e-mail ou CPF.
- Paginação e estado de carregamento.
- Criação, edição e exclusão.
- Confirmação de exclusão em português.
- Mensagens de sucesso e erro por toast.

### Veículos

- Listagem com busca por marca, modelo, placa ou cliente.
- Criação, edição e exclusão.
- Seleção de cliente com dropdown pesquisável.
- Paginação, confirmações e mensagens de operação.

### Ordens de serviço

- Listagem com busca por descrição, cliente, placa ou status.
- Criação e edição de ordens.
- Descrição em campo multilinha para textos longos.
- Associação com cliente e veículo.
- Controle de valor e status da ordem.
- Visualização de detalhes.
- Cancelamento com confirmação.
- Paginação e estados de carregamento.

### Usuários

- Listagem protegida para administradores.
- Busca por nome ou e-mail.
- Criação de usuários com nome, e-mail, senha e perfil.
- Perfis `ADMIN` e `USUARIO`.
- Validação do formulário e feedback visual.

## Pré-requisitos

- Node.js compatível com Angular 17.
- npm.
- API REST do Sistema de Oficina em execução.
- Porta `8080` disponível para a API, conforme a configuração atual dos serviços.

## Instalação e execução

```bash
git clone <URL_DO_REPOSITORIO>
cd oficina-frontend
npm install
npm start
```

Depois, acesse:

```text
http://localhost:4200
```

A API deve estar disponível em:

```text
http://localhost:8080
```

O Angular CLI recarrega automaticamente a aplicação durante o desenvolvimento.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm start` | Inicia o servidor de desenvolvimento em `localhost:4200`. |
| `npm run build` | Gera o build de produção em `dist/oficina-frontend`. |
| `npm run watch` | Compila continuamente usando a configuração de desenvolvimento. |
| `npm test` | Executa os testes unitários com Karma e Jasmine. |
| `npx ng generate ...` | Gera componentes, serviços, guards e outros artefatos Angular. |

## Rotas

| Rota | Acesso | Descrição |
| --- | --- | --- |
| `/login` | Público | Autenticação do usuário. |
| `/dashboard` | Autenticado | Painel inicial do sistema. |
| `/clientes` | Autenticado | Gerenciamento de clientes. |
| `/veiculos` | Autenticado | Gerenciamento de veículos. |
| `/ordens-servico` | Autenticado | Gerenciamento de ordens de serviço. |
| `/usuarios` | Administrador | Cadastro e consulta de usuários. |

Rotas desconhecidas são redirecionadas para `/login`. A rota raiz redireciona para `/dashboard` depois que a autenticação é validada.

## Integração com a API

Os serviços usam atualmente a base `http://localhost:8080/api/v1`.

| Serviço | Endpoint base | Operações principais |
| --- | --- | --- |
| Autenticação | `/auth` | `POST /login` |
| Clientes | `/cliente` | `GET`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}` |
| Veículos | `/veiculo` | `GET`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}` |
| Ordens | `/ordem-servico` | `GET`, `GET /{id}`, `POST`, `PUT /{id}`, `PATCH /{id}/cancelar` |
| Usuários | `/usuario` | `GET`, `POST` |

### Contratos principais

- Login: `{ email, senha }`.
- Resposta de login: `token`, `tipo`, `nome` e `perfil`.
- Perfil administrativo: `ADMIN`.
- Status de ordem: `ABERTA`, `EM_ANDAMENTO`, `CONCLUIDA` ou `CANCELADA`.

O front-end não simula autenticação quando a API está disponível e não registra senhas em logs.

## Autenticação e autorização

O fluxo é composto por três mecanismos:

1. `AuthService` chama `POST /api/v1/auth/login` e armazena os dados mínimos da sessão.
2. `authGuard` protege o layout administrativo e redireciona usuários não autenticados.
3. `adminGuard` restringe `/usuarios` a perfis `ADMIN`.
4. `authInterceptor` envia `Authorization: Bearer <token>` nas requisições quando existe token salvo.

Ao sair, o serviço remove `token`, `nome` e `perfil` do `localStorage`.

## Estrutura do projeto

```text
src/
├── app/
│   ├── components/layout/       # Layout, barra lateral e navbar
│   ├── guards/                  # Guards de autenticação e administrador
│   ├── interceptors/            # Interceptor do token Bearer
│   ├── models/                  # Interfaces dos contratos da API
│   ├── pages/                   # Login, dashboard e telas administrativas
│   ├── services/                # Comunicação HTTP com a API
│   ├── app.config.ts            # Providers globais
│   └── app.routes.ts            # Rotas e lazy loading
├── index.html
├── main.ts
└── styles.scss                 # Tema PrimeNG e estilos globais
```

Cada página mantém seus arquivos `.ts`, `.html`, `.scss` e `.spec.ts` separados. O dashboard permanece como a implementação original do projeto.

## Padrões de interface e acessibilidade

- HTML semântico e labels associados aos campos.
- Foco visível e navegação por teclado.
- Layout mobile-first e media queries para telas pequenas.
- Áreas de toque adequadas em botões e controles.
- Mensagens de erro e estados de carregamento claros.
- Contraste e estados de hover, foco, erro, desabilitado e sucesso.
- Diálogos de confirmação compactos e padronizados em português.
- Dropdowns com painel pesquisável e espaçamento confortável.
- Tabelas com busca, paginação e linhas visualmente consistentes.
- Respeito à separação entre regras de negócio, componentes e serviços HTTP.

## Testes e build

Executar os testes:

```bash
npm test
```

Executar uma compilação de validação:

```bash
npm run build
```

O build gera os arquivos em `dist/oficina-frontend`. O Angular pode emitir um aviso de orçamento de bundle; isso não impede a geração quando o processo termina com sucesso.

## Configuração para outros ambientes

Os endereços da API estão definidos diretamente nos serviços em `src/app/services`. Para apontar para homologação ou produção, centralize a URL em arquivos de ambiente do Angular antes do deploy e substitua as referências individuais.

Ao alterar a origem da API, verifique também:

- CORS no back-end.
- Porta e protocolo (`http`/`https`).
- Formato do token e do cabeçalho de autorização.
- Contratos de resposta usados pelos modelos TypeScript.
- Regras de perfil e permissões.

## Solução de problemas

### A tela não carrega dados

1. Confirme se a API está em execução na porta `8080`.
2. Verifique as requisições no DevTools do navegador.
3. Confira erros de CORS no console.
4. Valide se o token salvo ainda é válido.

### A rota `/usuarios` redireciona para o dashboard

O usuário autenticado precisa ter o perfil `ADMIN`. O guard bloqueia perfis comuns por regra de autorização.

### O login retorna erro

Confirme o payload de e-mail e senha, o endpoint `/api/v1/auth/login` e o formato da resposta (`token`, `nome` e `perfil`).

### Alterações visuais não aparecem

Reinicie o `ng serve`, limpe o cache do navegador e confirme se o arquivo SCSS alterado pertence ao componente exibido.

## Limitações conhecidas

- A URL da API ainda está fixa em `localhost:8080` nos serviços.
- O cadastro de usuários disponibiliza listagem e criação; edição e exclusão não estão implementadas no contrato atual do serviço.
- O front-end depende da API REST para autenticação, autorização e persistência.
- O build atual pode emitir aviso de tamanho do bundle inicial.

## Contribuição

1. Crie uma branch para a alteração.
2. Preserve os contratos existentes da API.
3. Mantenha HTML, SCSS e TypeScript formatados e separados.
4. Execute `npm test` e `npm run build` antes de abrir o pull request.
5. Descreva mudanças visuais, impactos em regras de negócio e endpoints envolvidos.

## Licença

Defina aqui a licença adotada pelo projeto antes da publicação no GitHub.


