
export interface Funcionario {
  id: string;
  nome: string;
  matricula: string;
  telefone: string;
  funcao: string;
  email?: string;
}

export interface ART {
  id: string;
  nome: string;
  numero: string;
  pdfDataUrl: string;
}

export interface Assinatura {
  funcionarioId: string;
  nome: string;
  funcao: string;
  data: string;
  hora: string;
}

export interface RiscoIdentificadoItem {
  selected: boolean;
  control: string; // Manual control description for risks 1-19
}

export interface RiscoIdentificado {
  [key: number]: RiscoIdentificadoItem;
}

export interface OutroRiscoEmergencialItem {
  description: string; // Description for risks 20-23
  control: string; // Manual control description for risks 20-23
}

export interface MapaRisco {
  frente: string;
  atras: string;
  esquerda: string;
  direita: string;
}

export interface ArtEmergencial {
  id: string;
  numeroPro: string;
  data: string;
  hora: string;
  tag: string; // Added TAG field
  om: string;  // Added OM field
  analise360: string;
  riscosIdentificados: RiscoIdentificado; // For items 1-19
  mapaDiagnostico: MapaRisco;
  possuiARTPlanejamento: 'sim' | 'nao' | null;
  mapaExecucao: MapaRisco;
  outrosRiscos: { [key: number]: OutroRiscoEmergencialItem }; // For items 20-23
  equipe: Assinatura[];
}

export interface ChecklistItemDetails {
  itemId: number; // Added itemId property
  system: string; // e.g., MOTOR, HIDRÁULICO
  description: string; // e.g., Vazamento de óleo em general...
  atende: 'sim' | 'nao' | null;
  observacao: string;
  conforme: 'sim' | 'nao' | null;
}

export interface Checklist {
  id: string;
  ativo: string;
  om: string;
  data: string; // Auto-filled current date
  hora: string; // New field for checklist time
  itens: { [key: number]: ChecklistItemDetails }; // Keyed by item number (1-34)
  tecnicoAssinatura: { // Only "Nome e Matrícula Técnico do Turno Manutenção"
    funcionarioId: string; // Link to Funcionario
    nome: string;
    matricula: string;
  } | null;
}

// Updated ArtAtividade interface to match the detailed "ART - Análise de Risco da Tarefa" document
export interface ArtAtividade {
  id: string;
  empresa: string; // "Vale" (pre-filled)
  tarefaExecutada: string; // "REALIZAR DIAGNÓSTIVO DE FALHA EM MOTOR DIESEL EM CAMINHÕES DE GRANDE PORTE" (pre-filled)
  gerencia: string; // "GER MANUT EQUIP TRANSPORTE - BENTO MOREIRA DA SILVA" (pre-filled)
  codigoArt: string; // "155574" (pre-filled)
  omveNao: boolean; // OMVE - Risco: Não
  omveCilindro: boolean; // Cilindro
  omveGradesDePiso: boolean; // Grades de Piso
  localAtividade: string;
  dataEmissao: string; // Auto-filled "31/10/2025 10:40:20 (UTC-3)"

  resumoMedidasControle: string; // Large text block for MÉDIA and BAIXA risks
  
  mapaRisco: MapaRisco; // Map for 'Após a equipe conversar...'

  medidasControleAdicionais: string; // Large text area on the right

  riscosCircunstanciaisChecklist: { [key: number]: boolean }; // Checkbox list 1-19
  outrasSituacoesRisco20: string; // Description for item 20, as it's a specific text input

  // New fields for linking an existing ART
  linkedArtId?: string;
  linkedArtNumero?: string;
  linkedArtPdfDataUrl?: string;

  // Passo da Tarefa table
  passosDaTarefa: Array<{
    itemId: string; // Unique ID for each step, for adding/removing
    descricao: string;
    risco: 'MÉDIA' | 'BAIXA' | 'ALTA' | ''; // Allowing empty for new rows
  }>;

  equipeAssinaturas: Assinatura[]; // Team members and their signatures
}

export interface MatrizBloqueio {
  id: string;
  empresa: string; // "Vale" (pre-filled)
  tarefaExecutada: string;
  gerencia: string; // "GER MANUT EQUIP TRANSPORTE - BENTO MOREIRA DA SILVA" (pre-filled)
  codigoArt: string;
  localAtividade: string;
  dataEmissao: string; // Auto-filled current date and time
  om: string;
  tag: string;
  areas: {
    roda: boolean;
    direcao: boolean;
    bascula: boolean;
    geral: boolean;
  };
  energias: {
    eletrica: boolean;
    mecanica: boolean;
    hidraulica: boolean;
    pneumatica: boolean;
    termica: boolean;
    quimica: boolean;
    gravitacional: boolean;
    residual: boolean;
  };
  testeEfetividade: 'sim' | 'nao' | null; // New field for effectiveness test
  equipe: Assinatura[];
}

export type Page = 
  | 'dashboard'
  | 'cadastrar-art'
  | 'cadastrar-funcionario'
  | 'art-emergencial'
  | 'art-atividade'
  | 'check-list'
  | 'matriz-de-bloqueio'
  | 'document-management';
