# Instruções para Commits Convencionais (Conventional Commits)

Utilize o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/) para todas as mensagens de commit. Isso facilita o entendimento das mudanças, automação de changelogs e integração contínua.

## Formato da mensagem

```
tipo(escopo opcional): descrição breve

[corpo opcional]

[rodapé opcional]
```

### Exemplos
- `feat: adicionar página de login`
- `fix(api): corrigir bug na autenticação`
- `docs: atualizar README`
- `refactor(core): melhorar performance do agendamento`

### Tipos mais comuns
- **feat**: nova funcionalidade
- **fix**: correção de bug
- **docs**: apenas documentação
- **style**: formatação, sem alteração de código
- **refactor**: refatoração de código
- **test**: testes
- **chore**: tarefas de build, dependências, etc.

### Dicas
- Use o imperativo na descrição (ex: "adicionar", "corrigir").
- Seja sucinto e claro.
- Utilize escopo quando fizer sentido (ex: `fix(api): ...`).
