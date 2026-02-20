'use client';

// Função para gerar uma cor com base no nome do aluno para o avatar
const generateColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 60%, 80%)`; // Usamos HSL para cores pastel agradáveis
};

// Função para extrair as iniciais do nome
const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

interface AvatarProps {
  name: string;
}

export function StudentAvatar({ name }: AvatarProps) {
  const initials = getInitials(name);
  const bgColor = generateColor(name);

  return (
    <div 
      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-700"
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  );
}
