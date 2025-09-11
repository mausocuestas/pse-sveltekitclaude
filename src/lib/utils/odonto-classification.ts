// src/lib/utils/odonto-classification.ts

export interface ClassificacaoRisco {
  categoria: string;
  nivel: 'Baixo' | 'Moderado' | 'Alto' | 'Muito Alto';
  cor: string;
  descricao: string;
  recomendacao: string;
}

// Mapear riscos odontológicos (A+ a G-)
export function classificarRiscoOdonto(risco: string): ClassificacaoRisco {
  const riscoUpper = risco.toUpperCase();
  
  // Separar letra e sinal
  const letra = riscoUpper.charAt(0);
  const sinal = riscoUpper.charAt(1);
  
  const classificacoes: Record<string, ClassificacaoRisco> = {
    'A+': {
      categoria: 'A+',
      nivel: 'Baixo',
      cor: 'bg-green-100 text-green-800 border-green-200',
      descricao: 'Risco muito baixo - Saúde bucal excelente',
      recomendacao: 'Manter higiene regular, consulta anual'
    },
    'A-': {
      categoria: 'A-',
      nivel: 'Baixo',
      cor: 'bg-green-100 text-green-800 border-green-200',
      descricao: 'Risco baixo - Boa saúde bucal',
      recomendacao: 'Manter cuidados, consulta anual'
    },
    'B+': {
      categoria: 'B+',
      nivel: 'Baixo',
      cor: 'bg-lime-100 text-lime-800 border-lime-200',
      descricao: 'Risco baixo - Pequenas necessidades preventivas',
      recomendacao: 'Reforçar higiene, consulta em 8-12 meses'
    },
    'B-': {
      categoria: 'B-',
      nivel: 'Moderado',
      cor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      descricao: 'Risco moderado - Necessita atenção preventiva',
      recomendacao: 'Intensificar cuidados, consulta em 6 meses'
    },
    'C+': {
      categoria: 'C+',
      nivel: 'Moderado',
      cor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      descricao: 'Risco moderado - Cáries iniciais ou gengivite',
      recomendacao: 'Tratamento preventivo, consulta em 6 meses'
    },
    'C-': {
      categoria: 'C-',
      nivel: 'Moderado',
      cor: 'bg-orange-100 text-orange-800 border-orange-200',
      descricao: 'Risco moderado-alto - Problemas estabelecidos',
      recomendacao: 'Tratamento necessário, consulta em 4-6 meses'
    },
    'D+': {
      categoria: 'D+',
      nivel: 'Alto',
      cor: 'bg-orange-100 text-orange-800 border-orange-200',
      descricao: 'Risco alto - Múltiplas cáries ou gengivite avançada',
      recomendacao: 'Tratamento urgente, consulta em 3-4 meses'
    },
    'D-': {
      categoria: 'D-',
      nivel: 'Alto',
      cor: 'bg-red-100 text-red-800 border-red-200',
      descricao: 'Risco alto - Lesões avançadas',
      recomendacao: 'Tratamento imediato, acompanhamento mensal'
    },
    'E+': {
      categoria: 'E+',
      nivel: 'Alto',
      cor: 'bg-red-100 text-red-800 border-red-200',
      descricao: 'Risco alto - Comprometimento severo',
      recomendacao: 'Tratamento complexo, acompanhamento frequente'
    },
    'E-': {
      categoria: 'E-',
      nivel: 'Muito Alto',
      cor: 'bg-red-200 text-red-900 border-red-300',
      descricao: 'Risco muito alto - Condição crítica',
      recomendacao: 'Intervenção imediata, acompanhamento semanal'
    },
    'F+': {
      categoria: 'F+',
      nivel: 'Muito Alto',
      cor: 'bg-red-200 text-red-900 border-red-300',
      descricao: 'Risco muito alto - Estado crítico avançado',
      recomendacao: 'Tratamento de emergência, monitoramento contínuo'
    },
    'F-': {
      categoria: 'F-',
      nivel: 'Muito Alto',
      cor: 'bg-red-300 text-red-950 border-red-400',
      descricao: 'Risco crítico - Comprometimento severo generalizado',
      recomendacao: 'Intervenção emergencial, acompanhamento intensivo'
    },
    'G+': {
      categoria: 'G+',
      nivel: 'Muito Alto',
      cor: 'bg-red-300 text-red-950 border-red-400',
      descricao: 'Risco crítico - Estado terminal',
      recomendacao: 'Tratamento paliativo, cuidados especiais'
    },
    'G-': {
      categoria: 'G-',
      nivel: 'Muito Alto',
      cor: 'bg-red-400 text-red-950 border-red-500',
      descricao: 'Risco crítico máximo - Comprometimento total',
      recomendacao: 'Cuidados paliativos, suporte especializado'
    }
  };

  return classificacoes[riscoUpper] || {
    categoria: risco,
    nivel: 'Moderado',
    cor: 'bg-gray-100 text-gray-800 border-gray-200',
    descricao: 'Classificação não reconhecida',
    recomendacao: 'Avaliação odontológica necessária'
  };
}

// Função para obter cor do nível de risco
export function getCorNivelRisco(nivel: string): string {
  const cores = {
    'Baixo': 'bg-green-500',
    'Moderado': 'bg-yellow-500',
    'Alto': 'bg-orange-500',
    'Muito Alto': 'bg-red-500'
  };
  return cores[nivel as keyof typeof cores] || 'bg-gray-500';
}

// Função para calcular prioridade de atendimento
export function calcularPrioridadeAtendimento(risco: string): {
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  diasProximaConsulta: number;
  cor: string;
} {
  const letra = risco.charAt(0);
  
  if (['A', 'B'].includes(letra)) {
    return {
      prioridade: 'Baixa',
      diasProximaConsulta: 365,
      cor: 'bg-green-100 text-green-800'
    };
  }
  
  if (letra === 'C') {
    return {
      prioridade: 'Média',
      diasProximaConsulta: 180,
      cor: 'bg-yellow-100 text-yellow-800'
    };
  }
  
  if (['D', 'E'].includes(letra)) {
    return {
      prioridade: 'Alta',
      diasProximaConsulta: 90,
      cor: 'bg-orange-100 text-orange-800'
    };
  }
  
  return {
    prioridade: 'Urgente',
    diasProximaConsulta: 30,
    cor: 'bg-red-100 text-red-800'
  };
}
