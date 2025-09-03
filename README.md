# Lp_converto

Configuração de API externa
- Defina a URL base da API via variável de ambiente `NEXT_PUBLIC_API_URL`.
- Exemplos:
  - Ambiente local: `NEXT_PUBLIC_API_URL=http://localhost:4000`
  - Produção: `NEXT_PUBLIC_API_URL=https://api.seu-dominio.com`

Como definir
- Crie um arquivo `.env.local` na raiz do projeto com:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Observação
- Componentes client-side usam `NEXT_PUBLIC_API_URL` em tempo de execução para chamar a API externa.

deploy IIII
