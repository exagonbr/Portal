# Scripts de Correção de Erros

Este diretório contém scripts para corrigir erros comuns no projeto.

## Visão Geral

Os scripts foram criados para corrigir erros relacionados à incompatibilidade entre classes base e classes filhas, especialmente em controllers e repositórios.

## Scripts Disponíveis

### 1. `fix-errors.sh`

Script principal que executa todos os outros scripts de correção. Este é o script que você deve executar primeiro.

```bash
# Tornar o script executável
chmod +x scripts/fix-errors.sh

# Executar o script
./scripts/fix-errors.sh
```

### 2. `fix-repository-errors.js`

Este script corrige erros nos repositórios:

1. Cria a interface ExtendedRepository
2. Modifica os repositórios para estender ExtendedRepository
3. Implementa o método findAllPaginated
4. Modifica os controllers para usar findAllPaginated

```bash
node scripts/fix-repository-errors.js
```

### 3. `fix-controller-errors.js`

Este script corrige erros nos controllers:

1. Passa o repositório correto no construtor
2. Corrige os tipos dos métodos
3. Usa os métodos corretos do repositório

```bash
node scripts/fix-controller-errors.js
```

## Como Funciona

1. O script `fix-errors.sh` cria o arquivo `ExtendedRepository.ts` se ele não existir
2. Em seguida, executa os scripts `fix-repository-errors.js` e `fix-controller-errors.js`
3. Por fim, verifica se há erros de compilação executando `npx tsc --noEmit`

## Problemas Corrigidos

Os scripts corrigem os seguintes problemas:

1. Incompatibilidade entre BaseController e classes filhas
2. Incompatibilidade entre BaseRepository e classes filhas
3. Problemas com métodos findAll que têm assinaturas diferentes
4. Problemas com métodos que retornam Promise<void> em vez de Promise<Response>
5. Problemas com métodos que usam this.success/this.error em vez de return res.status()
6. Problemas com result.affected possivelmente nulo

## Após a Execução

Após executar os scripts, você deve verificar se há erros de compilação executando:

```bash
npx tsc --noEmit
```

Se ainda houver erros, você pode precisar fazer algumas correções manuais em casos específicos.