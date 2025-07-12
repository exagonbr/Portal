#!/bin/bash

echo "🔄 Iniciando padronização dos controllers com base no InstitutionController..."

# Diretório dos controllers
CONTROLLERS_DIR="/var/www/portal/backend/src/controllers"

# Modelo de função getAll do InstitutionController
GET_ALL_TEMPLATE=$(cat <<'EOF'
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      // Adicionar timeout para evitar travamentos
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout na busca de registros')), 60000); // 60 segundos
      });

      const { 
        page = '1', 
        limit = '10', 
        search 
      } = req.query;
      
      // Limitar o número máximo de itens para evitar sobrecarga
      let limitValue = parseInt(limit as string, 10);
      if (limitValue > 1000) {
        limitValue = 1000;
      }
      
      const pageValue = parseInt(page as string, 10);
      
      console.log(`Buscando registros: página ${pageValue}, limite ${limitValue}, busca: ${search || 'nenhuma'}`);
      
      const repositoryName = this.constructor.name.replace('Controller', '').toLowerCase() + 'Repository';
      
      if (!this[repositoryName]) {
        throw new Error(`Repository '${repositoryName}' não encontrado no controller`);
      }
      
      const dataPromise = this[repositoryName].findAllPaginated({
        page: pageValue,
        limit: limitValue,
        search: search as string,
      });

      const result = await Promise.race([dataPromise, timeoutPromise]);
      
      if (!result) {
        return res.status(404).json({ 
          success: false, 
          message: 'Registros não encontrados' 
        });
      }
      
      // Transformar o formato para o que o frontend espera
      const responseData = {
        items: result.data || [],
        pagination: {
          page: result.page || 1,
          limit: result.limit || 10,
          total: result.total || 0,
          totalPages: Math.ceil(result.total / result.limit) || 1
        }
      };
      
      return res.status(200).json({ success: true, data: responseData });
    } catch (error) {
      console.error(`Error in getAll: ${error}`);
      
      // Se for timeout, retornar erro específico
      if (error instanceof Error && error.message.includes('Timeout')) {
        return res.status(504).json({ 
          success: false, 
          message: 'Timeout na busca - operação demorou muito',
          code: 'TIMEOUT_ERROR'
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor: ' + error,
        code: 'INTERNAL_ERROR'
      });
    }
  }
EOF
)

# Função para processar um arquivo controller
process_controller() {
  local file="$1"
  local filename=$(basename "$file")
  
  # Ignorar arquivos de backup
  if [[ "$filename" == *".backup"* || "$filename" == "BaseController.ts" || "$filename" == "index.ts" || "$filename" == "fix_controllers.sh" ]]; then
    echo "⏭️ Ignorando $filename"
    return
  fi
  
  echo "🔍 Processando $filename"
  
  # Fazer backup do arquivo original
  cp "$file" "${file}.backup_std"
  
  # Verificar se o arquivo já tem a função getAll
  if grep -q "public async getAll" "$file" || grep -q "async getAll" "$file"; then
    # Substituir a função getAll existente
    # Extrair o nome do repositório do arquivo
    local repo_name=$(grep -o "[a-zA-Z]*Repository" "$file" | head -1)
    local repo_var=$(grep -o "private [a-zA-Z]*Repository:" "$file" | head -1 | sed 's/private //g' | sed 's/://g')
    
    if [ -z "$repo_name" ] || [ -z "$repo_var" ]; then
      echo "⚠️ Não foi possível identificar o repositório em $filename"
      return
    fi
    
    # Substituir a função getAll existente
    sed -i "/public async getAll/,/}/c\\$(echo "$GET_ALL_TEMPLATE" | sed "s/repositoryName/$repo_var/g")" "$file"
    echo "✅ Função getAll substituída em $filename"
  else
    # Adicionar a função getAll após o construtor
    local repo_name=$(grep -o "[a-zA-Z]*Repository" "$file" | head -1)
    local repo_var=$(grep -o "private [a-zA-Z]*Repository:" "$file" | head -1 | sed 's/private //g' | sed 's/://g')
    
    if [ -z "$repo_name" ] || [ -z "$repo_var" ]; then
      echo "⚠️ Não foi possível identificar o repositório em $filename"
      return
    fi
    
    # Adicionar a função getAll após o construtor
    sed -i "/constructor()/,/}/a\\$(echo "$GET_ALL_TEMPLATE" | sed "s/repositoryName/$repo_var/g")" "$file"
    echo "✅ Função getAll adicionada a $filename"
  fi
}

# Processar todos os arquivos controller
for file in "$CONTROLLERS_DIR"/*Controller.ts; do
  process_controller "$file"
done

echo "✅ Padronização concluída!"
echo "🔄 Compilando o projeto..."
cd /var/www/portal/backend && npm run build

echo "🚀 Reiniciando o servidor..."
cd /var/www/portal/backend && pm2 restart all

echo "✅ Processo finalizado com sucesso!" 