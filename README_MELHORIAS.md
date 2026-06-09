# Dashboard MELI - melhorias aplicadas

Esta branch refatora a experiência do dashboard sem alterar credenciais reais.

## Principais mudanças

- Interface redesenhada com cards, filtros, navegação responsiva e estados vazios.
- Login e cadastro com layout novo, validações mais claras e feedback visual.
- AuthContext memoizado para evitar recarregamentos repetidos e loops de fetch.
- Backend com segredos via variáveis de ambiente, rota de health check e erros JWT tratados.
- Correção do identity do JWT para string, evitando falhas em versões recentes do Flask-JWT-Extended.
- Configuração do Vite com proxy para `/api` e build direcionado para `static`.
- Inclusão de `requirements.txt` para facilitar instalação do backend.

## Como validar localmente

```bash
pnpm install
pnpm build
python -m pip install -r requirements.txt
python -m py_compile main.py auth.py models.py mercadolivre_api.py
python main.py
```

Em desenvolvimento, rode o Flask na porta 5000 e o Vite com:

```bash
pnpm dev
```

## Segurança

Configure as variáveis `SECRET_KEY`, `JWT_SECRET_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `MELI_ACCESS_TOKEN` e `MELI_USER_ID` no ambiente antes de publicar.
