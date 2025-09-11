// src/lib/utils/cdc-classification.ts

interface CDCReference {
  age: number;
  male: { percentile5: number; percentile85: number; percentile95: number };
  female: { percentile5: number; percentile85: number; percentile95: number };
}

// Tabela CDC simplificada (5-18 anos) - Percentis 5, 85 e 95 de IMC
const CDC_BMI_REFERENCES: CDCReference[] = [
  { age: 5, male: { percentile5: 13.4, percentile85: 16.8, percentile95: 18.4 }, female: { percentile5: 13.2, percentile85: 16.8, percentile95: 18.8 } },
  { age: 6, male: { percentile5: 13.6, percentile85: 17.4, percentile95: 19.3 }, female: { percentile5: 13.4, percentile85: 17.3, percentile95: 19.7 } },
  { age: 7, male: { percentile5: 13.8, percentile85: 18.0, percentile95: 20.6 }, female: { percentile5: 13.6, percentile85: 17.9, percentile95: 20.9 } },
  { age: 8, male: { percentile5: 14.0, percentile85: 18.7, percentile95: 22.0 }, female: { percentile5: 13.8, percentile85: 18.7, percentile95: 22.3 } },
  { age: 9, male: { percentile5: 14.2, percentile85: 19.4, percentile95: 23.4 }, female: { percentile5: 14.0, percentile85: 19.5, percentile95: 23.8 } },
  { age: 10, male: { percentile5: 14.4, percentile85: 20.1, percentile95: 24.8 }, female: { percentile5: 14.2, percentile85: 20.3, percentile95: 25.4 } },
  { age: 11, male: { percentile5: 14.7, percentile85: 20.9, percentile95: 26.2 }, female: { percentile5: 14.5, percentile85: 21.2, percentile95: 27.0 } },
  { age: 12, male: { percentile5: 15.0, percentile85: 21.7, percentile95: 27.6 }, female: { percentile5: 14.8, percentile85: 22.1, percentile95: 28.6 } },
  { age: 13, male: { percentile5: 15.2, percentile85: 22.5, percentile95: 29.1 }, female: { percentile5: 15.1, percentile85: 22.9, percentile95: 30.1 } },
  { age: 14, male: { percentile5: 15.6, percentile85: 23.3, percentile95: 30.4 }, female: { percentile5: 15.4, percentile85: 23.7, percentile95: 31.4 } },
  { age: 15, male: { percentile5: 16.0, percentile85: 24.1, percentile95: 31.5 }, female: { percentile5: 15.7, percentile85: 24.3, percentile95: 32.4 } },
  { age: 16, male: { percentile5: 16.4, percentile85: 24.8, percentile95: 32.4 }, female: { percentile5: 16.0, percentile85: 24.8, percentile95: 33.1 } },
  { age: 17, male: { percentile5: 16.7, percentile85: 25.4, percentile95: 33.1 }, female: { percentile5: 16.2, percentile85: 25.2, percentile95: 33.6 } },
  { age: 18, male: { percentile5: 17.0, percentile85: 25.9, percentile95: 33.6 }, female: { percentile5: 16.4, percentile85: 25.5, percentile95: 34.0 } }
];

export function calcularIMC(peso: number, altura: number): number {
  return peso / (altura * altura);
}

export function classificarIMC(imc: number, idade: number, sexo: 'M' | 'F'): {
  categoria: 'Abaixo' | 'Saudável' | 'Sobrepeso' | 'Obeso' | 'Obesidade grave';
  percentil: string;
  corClass: string;
  descricao: string;
} {
  // Para idades fora da faixa CDC, usar classificação adulta simplificada
  if (idade < 5 || idade > 18) {
    if (imc < 18.5) return {
      categoria: 'Abaixo',
      percentil: 'N/A',
      corClass: 'bg-blue-100 text-blue-800',
      descricao: 'Abaixo do peso (fora faixa CDC)'
    };
    if (imc < 25) return {
      categoria: 'Saudável',
      percentil: 'N/A',
      corClass: 'bg-green-100 text-green-800',
      descricao: 'Peso saudável (fora faixa CDC)'
    };
    if (imc < 30) return {
      categoria: 'Sobrepeso',
      percentil: 'N/A',
      corClass: 'bg-yellow-100 text-yellow-800',
      descricao: 'Sobrepeso (fora faixa CDC)'
    };
    return {
      categoria: 'Obeso',
      percentil: 'N/A',
      corClass: 'bg-red-100 text-red-800',
      descricao: 'Obesidade (fora faixa CDC)'
    };
  }

  // Buscar dados CDC para idade específica
  const referencia = CDC_BMI_REFERENCES.find(ref => ref.age === idade);
  if (!referencia) {
    // Interpolar entre idades próximas se necessário
    const idadeMenor = Math.floor(idade);
    const idadeMaior = Math.ceil(idade);
    const refMenor = CDC_BMI_REFERENCES.find(ref => ref.age === idadeMenor);
    const refMaior = CDC_BMI_REFERENCES.find(ref => ref.age === idadeMaior);
    
    if (refMenor && refMaior && idadeMenor !== idadeMaior) {
      // Interpolação linear simples
      const fator = idade - idadeMenor;
      const dados = sexo === 'M' ? {
        percentile5: refMenor.male.percentile5 + (refMaior.male.percentile5 - refMenor.male.percentile5) * fator,
        percentile85: refMenor.male.percentile85 + (refMaior.male.percentile85 - refMenor.male.percentile85) * fator,
        percentile95: refMenor.male.percentile95 + (refMaior.male.percentile95 - refMenor.male.percentile95) * fator
      } : {
        percentile5: refMenor.female.percentile5 + (refMaior.female.percentile5 - refMenor.female.percentile5) * fator,
        percentile85: refMenor.female.percentile85 + (refMaior.female.percentile85 - refMenor.female.percentile85) * fator,
        percentile95: refMenor.female.percentile95 + (refMaior.female.percentile95 - refMenor.female.percentile95) * fator
      };
      
      return classificarPorPercentis(imc, dados);
    }
    
    // Fallback para idade mais próxima
    const idadeProxima = CDC_BMI_REFERENCES.reduce((prev, curr) => 
      Math.abs(curr.age - idade) < Math.abs(prev.age - idade) ? curr : prev
    );
    referencia = idadeProxima;
  }

  const dados = sexo === 'M' ? referencia.male : referencia.female;
  return classificarPorPercentis(imc, dados);
}

function classificarPorPercentis(imc: number, dados: { percentile5: number; percentile85: number; percentile95: number }) {
  if (imc < dados.percentile5) {
    return {
      categoria: 'Abaixo' as const,
      percentil: '< P5',
      corClass: 'bg-blue-100 text-blue-800',
      descricao: 'Abaixo do peso (< percentil 5)'
    };
  }
  
  if (imc < dados.percentile85) {
    return {
      categoria: 'Saudável' as const,
      percentil: 'P5-P85',
      corClass: 'bg-green-100 text-green-800',
      descricao: 'Peso saudável (percentil 5-85)'
    };
  }
  
  if (imc < dados.percentile95) {
    return {
      categoria: 'Sobrepeso' as const,
      percentil: 'P85-P95',
      corClass: 'bg-yellow-100 text-yellow-800',
      descricao: 'Sobrepeso (percentil 85-95)'
    };
  }
  
  return {
    categoria: 'Obeso' as const,
    percentil: '≥ P95',
    corClass: 'bg-red-100 text-red-800',
    descricao: 'Obesidade (≥ percentil 95)'
  };
}
