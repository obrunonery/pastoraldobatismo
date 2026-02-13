1. Arquitetura de Dados (Drizzle + Turso)

Para suportar os novos requisitos de finanças e evolução, o schema deve incluir:

    Tabela batismos: ID, data, status (Solicitado, Em Triagem, Agendado, Concluído), celebrante_id.

    Tabela escalas: Relacionamento entre users e batismos.

    Tabela financeiro: ID, tipo (entrada/saída), valor, descrição, data, categoria.

    Tabela atas: Vinculada a reuniões, com campo de texto rico para registro de decisões.

2. Lógica de Permissões (Clerk Roles)

    Role: ADMIN (Secretário, Coordenadora, Vice-Coordenador, Financeiro).

        Acesso total (CRUD) em todas as tabelas.

    Role: MEMBER (Equipe).

        CREATE/UPDATE: Eventos, Solicitações, Tarefas, Comunicação.

        READ ONLY: Escalas, Atas Oficiais, Financeiro (opcional).

        DELETE: Bloqueado para todos os módulos.

3. Regras de Validação (Backend)

    Lock de Conclusão: O status de um batismo só pode mudar para "Concluído" se os campos data_curso e docs_ok (boolean) forem verdadeiros.

    Alerta Automático: Query que verifica batismos sem escala definida (Membros = "Não atribuído") para exibição no Painel Geral.

4. Componentes de Interface (UI)

    Aproveitar os componentes Shadcn/UI da pasta client do Manus para manter o visual da Paróquia São João Paulo II.

    Implementar tabelas de dados com filtros por período para gerar os relatórios de "evolução".