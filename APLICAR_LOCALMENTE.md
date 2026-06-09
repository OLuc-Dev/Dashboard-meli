# Como aplicar no repositório Dashboard-meli

1. Baixe o ZIP `dashboard-meli-refatorado.zip` enviado na conversa.
2. Extraia o conteúdo na raiz do repositório `Dashboard-meli`, substituindo os arquivos existentes.
3. Rode:

```bash
pnpm install
pnpm build
python -m py_compile main.py auth.py
```

4. Faça commit e push:

```bash
git add .
git commit -m "refactor: ajustar dashboard meli e adicionar cursor menu"
git push origin master
```
