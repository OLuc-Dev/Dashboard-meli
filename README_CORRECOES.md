# Atelie D'Lissa - versao refatorada

Esta entrega reorganiza o projeto como uma landing page estatica, responsiva e fluida.

## O que foi corrigido e ajustado

- CSS refeito com variaveis, grid fluido, `clamp()`, responsividade real e estados de foco.
- Menu mobile revisado com `aria-expanded`, fechamento por clique externo e tecla ESC.
- Cursor customizado para desktop com dot, outline e estados de hover/clique.
- Cursor Menu: clique com botao direito abre um menu rapido com atalhos para Inicio, Produtos, Pedido e Topo.
- Modal de produtos consolidado em um unico componente, sem duplicacao criada via JavaScript.
- Galeria com lightbox acessivel e fechamento por ESC/clique.
- Formulario validado em tempo real e envio direto para WhatsApp.
- Imagens SVG locais para evitar layout quebrado caso as imagens originais nao estejam disponiveis.
- Fallback automatico de imagem via JavaScript.
- Footer com ano dinamico.
- `prefers-reduced-motion` respeitado para acessibilidade.

## Como usar

Abra `index.html` no navegador ou publique a pasta inteira em qualquer hospedagem estatica.

## Arquivos principais

- `index.html`: estrutura semantica da pagina.
- `styles.css`: visual completo, layout, responsividade, cursor e menu.
- `script.js`: interacoes, modal, menu mobile, cursor menu, galeria e formulario.
- `images/`: imagens SVG ilustrativas usadas pela interface.

## Ajuste importante

Troque o numero em `WHATSAPP_NUMBER` dentro de `script.js` pelo numero real do atelie antes de publicar.
