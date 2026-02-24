"use client";

import { useRef, useEffect } from 'react';

// Tipos
interface Building {
    type: string;
    x: number;
    y: number;
}

interface City2DCanvasProps {
    cityData: Building[];
    onTileClick?: (x: number, y: number) => void;
}

const ICON_PATHS: Record<string, string> = {
    house: '/assets/house.png',
    school: '/assets/school.png',
    park: '/assets/park.png',
    power: '/assets/power.png',
    // Adicione os outros ícones de construção referenciados em buildings.ts aqui
    // Exemplo: 'building_b': '/models/building-b_icon.png',
};

// Função para pré-carregar os caminhos dos ícones do building config
import { BUILDING_CONFIG } from '@/app/config/buildings';
Object.keys(BUILDING_CONFIG).forEach(key => {
    if (BUILDING_CONFIG[key].iconImage) {
        ICON_PATHS[key] = BUILDING_CONFIG[key].iconImage;
    }
});

const City2DCanvas = ({ cityData, onTileClick }: City2DCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // --- Configurações ---
    const TILE_SIZE = 40;
    const GRID_WIDTH = 30;
    const GRID_HEIGHT = 20;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = TILE_SIZE * GRID_WIDTH;
        canvas.height = TILE_SIZE * GRID_HEIGHT;

        // --- Carregamento de Imagens ---
        const buildingIcons: Record<string, HTMLImageElement> = {};
        const imageUrls = Array.from(new Set(cityData.map(b => ICON_PATHS[b.type]).filter(Boolean)));
        
        let imagesLoaded = 0;
        const totalImages = imageUrls.length;

        const render = () => {
            // Limpa e desenha o fundo
            ctx.fillStyle = '#2d3748'; // cinza-azulado escuro
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Desenha o grid
            drawGrid(ctx);
            // Desenha as construções
            drawBuildings(ctx);
        };

        if (totalImages === 0) {
            render();
        } else {
            imageUrls.forEach(url => {
                if (!buildingIcons[url]) { // Evita recarregar a mesma imagem
                    const img = new Image();
                    buildingIcons[url] = img;
                    img.onload = () => {
                        imagesLoaded++;
                        if (imagesLoaded === totalImages) {
                            render();
                        }
                    };
                    img.onerror = () => {
                         imagesLoaded++;
                        if (imagesLoaded === totalImages) {
                            render();
                        }
                        // console.error(`Erro ao carregar imagem: ${url}`);
                    }
                    img.src = url;
                }
            });
        }

        // --- Funções de Renderização ---
        const drawGrid = (context: CanvasRenderingContext2D) => {
            context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            for (let x = 0; x <= canvas.width; x += TILE_SIZE) {
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, canvas.height);
                context.stroke();
            }
            for (let y = 0; y <= canvas.height; y += TILE_SIZE) {
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(canvas.width, y);
                context.stroke();
            }
        }

        const drawBuildings = (context: CanvasRenderingContext2D) => {
            cityData.forEach(building => {
                const iconUrl = ICON_PATHS[building.type];
                if (iconUrl) {
                    const icon = buildingIcons[iconUrl];
                    if (icon && icon.complete) {
                        context.drawImage(icon, building.x * TILE_SIZE, building.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    } else {
                        // Fallback para o caso da imagem não carregar
                         context.fillStyle = '#ff0000'; // Vermelho para indicar erro
                         context.fillRect(building.x * TILE_SIZE, building.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    }
                }
            });
        }

        // Desenha tudo
        render();

    }, [cityData]); // Re-renderiza quando os dados da cidade mudam

    // --- Event Listener para Cliques ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !onTileClick) return;

        const handleClick = (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const tileX = Math.floor(x / TILE_SIZE);
            const tileY = Math.floor(y / TILE_SIZE);

            // Verifica se o clique foi dentro dos limites do grid
            if (tileX >= 0 && tileX < GRID_WIDTH && tileY >= 0 && tileY < GRID_HEIGHT) {
                onTileClick(tileX, tileY);
            }
        };

        canvas.addEventListener('click', handleClick);

        // Limpeza do listener
        return () => {
            canvas.removeEventListener('click', handleClick);
        };
    }, [onTileClick]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', backgroundColor: '#1a202c' }}>
            <canvas ref={canvasRef} style={{ cursor: onTileClick ? 'pointer' : 'default' }}/>
        </div>
    );
};

export default City2DCanvas;
