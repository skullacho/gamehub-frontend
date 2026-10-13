# GameHub — Interface Frontend

Interface web moderna e responsiva para o sistema de gerenciamento de jogos **GameHub**, desenvolvida como atividade escolar de Desenvolvimento de Sistemas.

## Integrantes
- Arthur Nunes de Souza Possato
- Enzo Marques Cardona
- Pedro Sante Maria Bueno Silva

## Tecnologias Utilizadas
- **HTML5** (Semântica estruturada, acessibilidade e modais)
- **CSS3** (Tema Dark Gamer, CSS Grid, Flexbox, efeitos Glassmorphism, animações suaves e design 100% responsivo)
- **JavaScript Puro (Vanilla JS)** (ES6+, manipulação dinâmica do DOM, consumo de API assíncrona com `fetch`, debounce e toasts)
- **Vercel** (Hospedagem estática de alta velocidade)

## Funcionalidades
- **Cadastro (CREATE):** Formulário interativo com validação de campos obrigatórios, tipos e limites antes do envio.
- **Listagem (READ):** Cards estilizados com capa, badges de gênero/plataforma, desenvolvedora, preço em reais e ano.
- **Edição (UPDATE):** Preenchimento automático do formulário com dados prévios para rápida atualização.
- **Exclusão (DELETE):** Modal de confirmação segura antes de remover qualquer item do catálogo.
- **Busca em Tempo Real:** Pesquisa dinâmica por título do jogo ou estúdio desenvolvedor com debounce.
- **Filtros e Ordenação:** Filtre por 8 gêneros, 5 plataformas e ordene por nome, preço e ano de lançamento.
- **Feedback Visual:** Indicador de status da API (Health Check), loading spinner, estado vazio e notificações toast elegantes.
- **Fallback de Imagem:** Exibição automática de capa padrão em SVG temático caso a imagem esteja indisponível.

## Como Executar Localmente
Você pode abrir o arquivo `index.html` diretamente no navegador ou utilizar qualquer servidor estático local, como Live Server (VS Code) ou `npx serve`:

```bash
# Opção 1: Usando npx serve
npx serve frontend

# Opção 2: Usando Python
python -m http.server 3000 --directory frontend
```

Por padrão, quando executado em `localhost` ou `127.0.0.1`, a aplicação tentará se comunicar com a API em `http://localhost:5000/api`. Em produção, pode ser configurada via script ou pela variável global `window.GAMEHUB_API_URL`.
