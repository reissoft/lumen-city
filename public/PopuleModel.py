#!/usr/bin/env python3
"""
Script para varrer pastas e gerar JSON com arquivos GLB encontrados.
Mantém o padrão do JSON fornecido.
"""

import os
import json
from pathlib import Path
from typing import Dict, Any


def sanitize_key(filename: str) -> str:
    """
    Converte o nome do arquivo em uma chave válida.
    Remove extensão e caracteres especiais.
    """
    # Remove a extensão .glb
    key = filename.replace('.glb', '')
    # Substitui caracteres especiais por underscore
    key = key.replace('-', '_').replace(' ', '_')
    # Remove caracteres não alfanuméricos (exceto underscore)
    key = ''.join(c for c in key if c.isalnum() or c == '_')
    # Converte para minúsculas
    key = key.lower()
    return key


def get_category_from_path(filepath: str) -> str:
    """
    Determina a categoria baseada no caminho do arquivo.
    """
    path_lower = filepath.lower()
    
    if 'special' in path_lower:
        return 'special'
    elif 'infra' in path_lower or 'infrastructure' in path_lower:
        return 'infrastructure'
    elif 'nature' in path_lower or 'park' in path_lower or 'tree' in path_lower:
        return 'nature'
    else:
        return 'construction'


def get_icon_from_category(category: str) -> str:
    """
    Retorna o ícone padrão baseado na categoria.
    """
    icons = {
        'construction': 'Home',
        'nature': 'TreeDeciduous',
        'infrastructure': 'Route',
        'special': 'Star'
    }
    return icons.get(category, 'Home')


def get_cost_from_category(category: str) -> int:
    """
    Retorna o custo padrão baseado na categoria.
    """
    costs = {
        'construction': 10,
        'nature': 25,
        'infrastructure': 1,
        'special': 1000
    }
    return costs.get(category, 10)


def scan_glb_files(base_path: str) -> Dict[str, Any]:
    """
    Varre a pasta base e suas subpastas em busca de arquivos .glb
    e retorna um dicionário no formato especificado.
    """
    glb_data = {}
    base_path_obj = Path(base_path)
    
    # Busca recursivamente por arquivos .glb
    for glb_file in base_path_obj.rglob('*.glb'):
        # Pega o caminho relativo ao diretório base
        relative_path = glb_file.relative_to(base_path_obj)
        
        # Gera a chave única
        key = sanitize_key(glb_file.stem)
        
        # Se a chave já existe, adiciona um sufixo numérico
        original_key = key
        counter = 1
        while key in glb_data:
            key = f"{original_key}_{counter}"
            counter += 1
        
        # Determina a categoria baseada no caminho
        category = get_category_from_path(str(relative_path))
        
        # Cria a URL (mantém a estrutura de pastas)
        url = f"/models/{relative_path.as_posix()}"
        
        # Cria o nome legível (capitaliza o nome do arquivo)
        name = glb_file.stem.replace('-', ' ').replace('_', ' ').title()
        
        # Adiciona ao dicionário
        glb_data[key] = {
            "name": name,
            "description": "Descrição Placeholder.",
            "category": category,
            "cost": get_cost_from_category(category),
            "url": url,
            "icon": get_icon_from_category(category),
            "scale": 2
        }
    
    return glb_data


def main():
    """
    Função principal do script.
    """
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Varre pastas em busca de arquivos GLB e gera JSON'
    )
    parser.add_argument(
        'pasta',
        help='Caminho da pasta a ser varrida'
    )
    parser.add_argument(
        '-o', '--output',
        default='glb_models.json',
        help='Nome do arquivo JSON de saída (padrão: glb_models.json)'
    )
    parser.add_argument(
        '--indent',
        type=int,
        default=2,
        help='Indentação do JSON (padrão: 2)'
    )
    
    args = parser.parse_args()
    
    # Verifica se a pasta existe
    if not os.path.exists(args.pasta):
        print(f"❌ Erro: A pasta '{args.pasta}' não existe!")
        return 1
    
    if not os.path.isdir(args.pasta):
        print(f"❌ Erro: '{args.pasta}' não é uma pasta!")
        return 1
    
    print(f"🔍 Varrendo a pasta: {args.pasta}")
    
    # Varre os arquivos
    glb_data = scan_glb_files(args.pasta)
    
    if not glb_data:
        print("⚠️  Nenhum arquivo .glb encontrado!")
        return 0
    
    print(f"✅ Encontrados {len(glb_data)} arquivos .glb")
    
    # Salva o JSON
    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(glb_data, f, indent=args.indent, ensure_ascii=False)
    
    print(f"💾 JSON salvo em: {args.output}")
    
    # Mostra preview dos primeiros itens
    print("\n📋 Preview (primeiros 3 itens):")
    for i, (key, value) in enumerate(list(glb_data.items())[:3]):
        print(f"\n  {key}:")
        print(f"    - Nome: {value['name']}")
        print(f"    - URL: {value['url']}")
        print(f"    - Categoria: {value['category']}")
    
    if len(glb_data) > 3:
        print(f"\n  ... e mais {len(glb_data) - 3} itens")
    
    return 0


if __name__ == '__main__':
    exit(main())
