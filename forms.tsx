
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Page, Funcionario, ART, ArtEmergencial, Checklist, ArtAtividade, MatrizBloqueio, RiscoIdentificado, MapaRisco, Assinatura, ChecklistItemDetails, RiscoIdentificadoItem, OutroRiscoEmergencialItem } from './types';
import { PlusIcon, TrashIcon, EditIcon, DownloadIcon, EyeIcon } from './components'; // Import EyeIcon
import { RiskMap } from './components';
import ReactDOM from 'react-dom/client'; // Import ReactDOM for dynamic rendering

declare var html2canvas: any;
declare global {
    interface Window {
        jspdf: any;
    }
}


const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-white shadow-lg rounded-xl p-6 md:p-8 mb-8 ${className}`}>
        {children}
    </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <h2 className={`text-xl font-bold text-gray-800 border-b-2 border-yellow-400 pb-2 mb-6 ${className}`}>{children}</h2>
);

const Button: React.FC<{ children: React.ReactNode, onClick?: () => void, className?: string, type?: 'button' | 'submit', disabled?: boolean }> = ({ children, onClick, className = 'bg-gray-800 hover:bg-gray-700 text-white', type = 'button', disabled = false }) => (
    <button type={type} onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 ${className} disabled:bg-gray-400`}>
        {children}
    </button>
);

// --- Dashboard Component ---
export const Dashboard: React.FC<{ setPage: (page: Page) => void }> = ({ setPage }) => {
    const quickLinks: { page: Page; title: string; description: string }[] = [
        { page: 'art-emergencial', title: 'Nova ART Emergencial', description: 'Inicie uma nova análise de risco para tarefas emergenciais.' },
        { page: 'check-list', title: 'Novo Check List', description: 'Preencha um checklist de pós-manutenção.' },
        { page: 'matriz-de-bloqueio', title: 'Nova Matriz de Bloqueio', description: 'Crie uma matriz de bloqueio de energias.' },
        { page: 'cadastrar-funcionario', title: 'Gerenciar Funcionários', description: 'Adicione ou visualize os funcionários cadastrados.' },
        { page: 'document-management', title: 'Gerenciamento de Documentos', description: 'Visualize, edite e baixe todos os seus documentos salvos.' },
    ];

    return (
        <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Dashboard</h1>
            <p className="text-lg text-gray-600 mb-8">Bem-vindo ao sistema de Análise Preliminar da Tarefa (ART).</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickLinks.map(link => (
                    <button key={link.page} onClick={() => setPage(link.page)} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-left">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{link.title}</h3>
                        <p className="text-gray-600">{link.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- Employee Management Component ---
export const EmployeeManagement: React.FC<{ funcionarios: Funcionario[], setFuncionarios: React.Dispatch<React.SetStateAction<Funcionario[]>> }> = ({ funcionarios, setFuncionarios }) => {
    const [form, setForm] = useState<Omit<Funcionario, 'id'>>({ nome: '', matricula: '', telefone: '', funcao: '', email: '' });
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nome || !form.matricula || !form.funcao) {
            alert('Nome, Matrícula e Função são obrigatórios.');
            return;
        }

        if (editingId) {
            setFuncionarios(funcionarios.map(f => f.id === editingId ? { ...form, id: editingId } : f));
            setEditingId(null);
        } else {
            setFuncionarios([...funcionarios, { ...form, id: Date.now().toString() }]);
        }
        setForm({ nome: '', matricula: '', telefone: '', funcao: '', email: '' });
    };
    
    const handleEdit = (func: Funcionario) => {
        setEditingId(func.id);
        setForm(func);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
            setFuncionarios(funcionarios.filter(f => f.id !== id));
        }
    };

    return (
        <div>
            <Card>
                <SectionTitle>{editingId ? 'Editar Funcionário' : 'Cadastrar Funcionário'}</SectionTitle>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome Completo" className="p-2 border rounded-lg" required />
                    <input name="matricula" value={form.matricula} onChange={handleChange} placeholder="Matrícula" className="p-2 border rounded-lg" required />
                    <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="Telefone" className="p-2 border rounded-lg" />
                    <input name="funcao" value={form.funcao} onChange={handleChange} placeholder="Função" className="p-2 border rounded-lg" required />
                    <input name="email" value={form.email} onChange={handleChange} placeholder="Email (opcional)" className="p-2 border rounded-lg md:col-span-2" />
                    <div className="md:col-span-2 flex justify-end">
                       <Button type="submit">
                         <PlusIcon /> {editingId ? 'Atualizar' : 'Adicionar'}
                       </Button>
                    </div>
                </form>
            </Card>

            <Card>
                <SectionTitle>Funcionários Cadastrados</SectionTitle>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-2">Nome</th>
                                <th className="p-2">Matrícula</th>
                                <th className="p-2">Função</th>
                                <th className="p-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {funcionarios.map(func => (
                                <tr key={func.id} className="border-b">
                                    <td className="p-2">{func.nome}</td>
                                    <td className="p-2">{func.matricula}</td>
                                    <td className="p-2">{func.funcao}</td>
                                    <td className="p-2 flex gap-2">
                                        <button onClick={() => handleEdit(func)} className="text-blue-500"><EditIcon /></button>
                                        <button onClick={() => handleDelete(func.id)} className="text-red-500"><TrashIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// --- ART Management Component ---
export const ArtManagement: React.FC<{ arts: ART[], setArts: React.Dispatch<React.SetStateAction<ART[]>> }> = ({ arts, setArts }) => {
    const [numero, setNumero] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // Corrected: Initialized selectedFile as null
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && e.target.files[0].type === 'application/pdf') {
            setSelectedFile(e.target.files[0]);
        } else {
            alert('Por favor, selecione um arquivo PDF.');
            setSelectedFile(null);
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !numero) {
            alert("Por favor, selecione um arquivo PDF e insira o número da ART.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target && typeof event.target.result === 'string') {
                const newArt: ART = {
                    id: Date.now().toString(),
                    nome: selectedFile.name,
                    numero: numero,
                    pdfDataUrl: event.target.result
                };
                setArts(prevArts => [...prevArts, newArt]);
                // Reset form
                setNumero('');
                setSelectedFile(null);
                if(fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.onerror = () => {
            alert('Ocorreu um erro ao ler o arquivo.');
        }
        reader.readAsDataURL(selectedFile);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta ART?')) {
            setArts(arts.filter(art => art.id !== id));
        }
    };

    return (
        <div>
            <Card>
                <SectionTitle>Cadastrar Nova ART (via PDF)</SectionTitle>
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo PDF da ART</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                            required
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número da ART</label>
                        <input
                            value={numero}
                            onChange={e => setNumero(e.target.value)}
                            className="p-2 border rounded-lg w-full"
                            placeholder="Digite o número"
                            required
                        />
                    </div>
                    <Button type="submit" disabled={!selectedFile || !numero}><PlusIcon /> Salvar</Button>
                </form>
            </Card>

            <Card>
                <SectionTitle>ARTs Cadastradas</SectionTitle>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-2">Nome do Arquivo</th>
                                <th className="p-2">Número</th>
                                <th className="p-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {arts.map(art => (
                                <tr key={art.id} className="border-b">
                                    <td className="p-2 font-medium text-gray-700">{art.nome}</td>
                                    <td className="p-2">{art.numero}</td>
                                    <td className="p-2 flex items-center gap-4">
                                        <a href={art.pdfDataUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">Ver/Baixar</a>
                                        <button onClick={() => handleDelete(art.id)} className="text-red-500 hover:text-red-700"><TrashIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// --- Utility function for forms ---
const SignatureSection: React.FC<{
    funcionarios: Funcionario[];
    equipe: Assinatura[];
    setEquipe: (equipe: Assinatura[]) => void;
    editable?: boolean;
    minRows?: number; // New prop to specify minimum rows
}> = ({ funcionarios, equipe, setEquipe, editable = true, minRows = 5 }) => {
    const [selectedFuncionarioId, setSelectedFuncionarioId] = useState('');

    const handleAddEquipe = () => {
        const func = funcionarios.find(f => f.id === selectedFuncionarioId);
        if (func && !equipe.some(e => e.funcionarioId === func.id)) {
            const now = new Date();
            setEquipe([...equipe, {
                funcionarioId: func.id,
                nome: func.nome,
                funcao: func.funcao,
                data: now.toLocaleDateString('pt-BR'),
                hora: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            }]);
        }
    };
    
    const handleRemoveEquipe = (id: string) => {
        setEquipe(equipe.filter(e => e.funcionarioId !== id));
    };

    return (
        <div>
            {editable && (
                <div className="flex flex-col md:flex-row gap-2 items-end mb-4 no-print">
                    <div className="flex-grow w-full">
                        <label className="block text-sm font-medium text-gray-700">Selecionar Funcionário</label>
                        <select value={selectedFuncionarioId} onChange={e => setSelectedFuncionarioId(e.target.value)} className="p-2 border rounded-lg w-full">
                            <option value="">Selecione...</option>
                            {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                        </select>
                    </div>
                    <Button onClick={handleAddEquipe}><PlusIcon /> Adicionar à Equipe</Button>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-left table-fixed">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-2 w-1/6">Matrícula</th>
                            <th className="p-2 w-1/5">Nome</th>
                            <th className="p-2 w-1/6">Função</th>
                            <th className="p-2 w-1/6">Assinatura</th>
                            <th className="p-2 w-1/12">Data</th>
                            <th className="p-2 w-1/12">Hora</th>
                            {editable && <th className="p-2 w-auto no-print">Ação</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {equipe.map(membro => (
                            <tr key={membro.funcionarioId} className="border-b">
                                <td className="p-2 text-sm">{funcionarios.find(f => f.id === membro.funcionarioId)?.matricula || 'N/A'}</td>
                                <td className="p-2 text-sm">{membro.nome}</td>
                                <td className="p-2 text-sm">{membro.funcao}</td>
                                <td className="p-2 text-sm text-gray-500 italic">_________</td> {/* Placeholder for physical signature */}
                                <td className="p-2 text-sm">{membro.data}</td>
                                <td className="p-2 text-sm">{membro.hora}</td>
                                {editable && (
                                    <td className="p-2 no-print">
                                        <button onClick={() => handleRemoveEquipe(membro.funcionarioId)} className="text-red-500"><TrashIcon /></button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {/* Add empty rows for display if less than minRows members */}
                        {Array.from({ length: Math.max(0, minRows - equipe.length) }).map((_, index) => (
                            <tr key={`empty-${index}`} className="border-b h-10"> {/* Fixed height for empty rows */}
                                <td className="p-2"></td>
                                <td className="p-2"></td>
                                <td className="p-2"></td>
                                <td className="p-2"></td>
                                <td className="p-2"></td>
                                <td className="p-2"></td>
                                {editable && <td className="p-2 no-print"></td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- ART Emergencial View Modal Component ---
export const ArtEmergencialViewModal: React.FC<{
    art: ArtEmergencial;
    funcionarios: Funcionario[];
    onClose: () => void;
}> = ({ art, funcionarios, onClose }) => {
    // Determine if there are any custom outrosRiscos
    const hasCustomOutrosRiscos = Object.values(art.outrosRiscos).some(item => item.description && item.description !== OUTROS_RISCOS_EMERGENCIAL_DATA[0].defaultDescription);
    const selectedRisksCount = Object.values(art.riscosIdentificados).filter(item => item.selected).length;


    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative p-6">
                <h2 className="text-2xl font-bold mb-4 border-b pb-2">Detalhes da ART de Campo Emergencial</h2>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div><strong>Número PRO:</strong> {art.numeroPro}</div>
                    <div><strong>Data:</strong> {art.data}</div>
                    <div><strong>Hora:</strong> {art.hora}</div>
                    <div><strong>TAG:</strong> {art.tag}</div>
                    <div><strong>OM:</strong> {art.om}</div>
                </div>

                <h3 className="text-lg font-bold mt-4 mb-2">Análise 360º</h3>
                <p className="border p-2 rounded-md bg-gray-50 whitespace-pre-wrap">{art.analise360 || 'N/A'}</p>

                {/* New: Resumo de Riscos e Controles Chave */}
                <h3 className="text-lg font-bold mt-6 mb-2">Resumo dos Riscos e Controles Chave</h3>
                <div className="border border-blue-200 p-4 rounded-md bg-blue-50 text-blue-900 mb-4">
                    <p className="font-semibold mb-2">Análise Geral (360º):</p>
                    <p className="whitespace-pre-wrap text-sm">{art.analise360 || 'N/A'}</p>

                    <p className="font-semibold mt-4 mb-2">Principais Situações de Risco Identificadas ({selectedRisksCount} selecionados):</p>
                    <ul className="list-disc pl-5 text-sm">
                        {selectedRisksCount > 0 ? (
                            Object.entries(art.riscosIdentificados).map(([id, item]) => (
                                item.selected && (
                                    <li key={id} className="mb-1">
                                        <p className="font-medium">{id}. {RISCOS.find(r => r.id === parseInt(id))?.text}</p>
                                        {item.control && <p className="ml-2 text-blue-800">Controle: {item.control}</p>}
                                    </li>
                                )
                            ))
                        ) : (
                            <p className="italic text-gray-700">Nenhum risco identificado selecionado.</p>
                        )}
                    </ul>

                    {hasCustomOutrosRiscos && (
                        <>
                            <p className="font-semibold mt-4 mb-2">Outras Situações de Risco Relevantes:</p>
                            <ul className="list-disc pl-5 text-sm">
                                {Object.entries(art.outrosRiscos).map(([id, item]) => (
                                    item.description && item.description !== OUTROS_RISCOS_EMERGENCIAL_DATA[0].defaultDescription && (
                                        <li key={id} className="mb-1">
                                            <p className="font-medium">{id}. {item.description}</p>
                                            {item.control && <p className="ml-2 text-blue-800">Controle: {item.control}</p>}
                                        </li>
                                    )
                                ))}
                            </ul>
                        </>
                    )}
                </div>
                {/* End New: Resumo de Riscos e Controles Chave */}


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <h3 className="text-lg font-bold mb-2">Etapa de Diagnóstico</h3>
                        <div className="border p-2 rounded-md bg-gray-50">
                            <RiskMap mapa={art.mapaDiagnostico} setMapa={() => {}} disabled={true} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-2">Etapa de Execução</h3>
                        <div className="border p-2 rounded-md bg-gray-50">
                            <RiskMap mapa={art.mapaExecucao} setMapa={() => {}} disabled={true} />
                        </div>
                    </div>
                </div>

                <h3 className="text-lg font-bold mt-4 mb-2">Situações de Risco (Selecionadas)</h3>
                <ul className="list-disc pl-5 border p-2 rounded-md bg-gray-50">
                    {Object.entries(art.riscosIdentificados).map(([id, item]) => (
                        item.selected && (
                            <li key={id} className="mb-2">
                                <p><strong>{id}. {RISCOS.find(r => r.id === parseInt(id))?.text}</strong></p>
                                {item.control && <p className="text-gray-700 ml-2">CONTROLE (S): {item.control}</p>}
                            </li>
                        )
                    ))}
                    {Object.keys(art.riscosIdentificados).every(id => !art.riscosIdentificados[parseInt(id)].selected) && (
                        <p className="italic text-gray-600">Nenhum risco identificado selecionado.</p>
                    )}
                </ul>

                <h3 className="text-lg font-bold mt-4 mb-2">Outras Situações de Risco</h3>
                <ul className="list-disc pl-5 border p-2 rounded-md bg-gray-50">
                    {Object.entries(art.outrosRiscos).map(([id, item]) => (
                        <li key={id} className="mb-2">
                            <p><strong>{id}. {item.description}</strong></p>
                            {item.control && <p className="text-gray-700 ml-2">CONTROLE (S): {item.control}</p>}
                        </li>
                    ))}
                </ul>

                <h3 className="text-lg font-bold mt-4 mb-2">ART de Planejamento:</h3>
                <p className="border p-2 rounded-md bg-gray-50">{art.possuiARTPlanejamento === 'sim' ? 'Sim' : art.possuiARTPlanejamento === 'nao' ? 'Não' : 'N/A'}</p>

                <h3 className="text-lg font-bold mt-4 mb-2">Equipe Envolvida:</h3>
                <div className="overflow-x-auto border rounded-md bg-gray-50">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border-r border-b">Matrícula</th>
                                <th className="p-2 border-r border-b">Nome</th>
                                <th className="p-2 border-r border-b">Função</th>
                                <th className="p-2 border-r border-b">Data</th>
                                <th className="p-2 border-b">Hora</th>
                            </tr>
                        </thead>
                        <tbody>
                            {art.equipe.map(membro => (
                                <tr key={membro.funcionarioId} className="border-b last:border-b-0">
                                    <td className="p-2">{funcionarios.find(f => f.id === membro.funcionarioId)?.matricula || 'N/A'}</td>
                                    <td className="p-2">{membro.nome}</td>
                                    <td className="p-2">{membro.funcao}</td>
                                    <td className="p-2">{membro.data}</td>
                                    <td className="p-2">{membro.hora}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


// --- ART Emergencial Form Component ---
const RISCOS = [
    { id: 1, text: "Contato com superfícies cortantes/perfurante em ferramentas manuais ou em estruturas." },
    { id: 2, text: "Prensamento de dedos ou mãos." },
    { id: 3, text: "Queda de peças/estruturas/equipamentos." },
    { id: 4, text: "Prensamento ou agarramento do corpo." },
    { id: 5, text: "Atropelamento/esmagamento por veículos como em vias, pátios, cruzamentos e ferrovias." },
    { id: 6, text: "Queda, tropeço ou escorregão no acesso ou no local de trabalho." },
    { id: 7, text: "Animais peçonhentos/insetos/animal selvagem." },
    { id: 8, text: "Desmoronamentos de pilhas (minério, estéril, entre outros tipos de materiais)." },
    { id: 9, text: "Queda de plataforma ou de escadas durante o acesso (atenção para os possíveis pontos com corrosão)." },
    { id: 10, text: "Arco e/ou choque elétrico." },
    { id: 11, text: "Fontes de energia (hidráulica, pneumática, elétrica, etc)." },
    { id: 12, text: "Exposição a vapores, condensados ou superfícies quentes." },
    { id: 13, text: "Gases, vapores, poeiras ou fumos." },
    { id: 14, text: "Produtos químicos ou queimaduras." },
    { id: 15, text: "Projeção de materiais na face ou nos olhos." },
    { id: 16, text: "Condições climáticas adversas (sol, chuva, vento)." },
    { id: 17, text: "Queda de homem ao mar ou afogamento." },
    { id: 18, text: "Interferência entre equipes (traballho sobreposto, espaço restrito)." },
    { id: 19, text: "Excesso ou deficiência de iluminação." }
];

const OUTROS_RISCOS_EMERGENCIAL_DATA = [
    { id: 20, defaultDescription: 'Outras situações de risco:' },
    { id: 21, defaultDescription: 'Outras situações de risco:' },
    { id: 22, defaultDescription: 'Outras situações de risco:' },
    { id: 23, defaultDescription: 'Outras situações de risco:' },
];


const initialArtEmergencialState: Omit<ArtEmergencial, 'id'> = {
    numeroPro: 'PRO 0034346', data: '', hora: '', 
    tag: '', // Added TAG field
    om: '',  // Added OM field
    analise360: '',
    riscosIdentificados: RISCOS.reduce((acc, risk) => ({
        ...acc,
        [risk.id]: { selected: false, control: '' }
    }), {} as RiscoIdentificado),
    mapaDiagnostico: { frente: '', atras: '', esquerda: '', direita: '' },
    possuiARTPlanejamento: null,
    mapaExecucao: { frente: '', atras: '', esquerda: '', direita: '' },
    outrosRiscos: OUTROS_RISCOS_EMERGENCIAL_DATA.reduce((acc, item) => ({
        ...acc,
        [item.id]: { description: item.defaultDescription, control: '' }
    }), {} as { [key: number]: OutroRiscoEmergencialItem }),
    equipe: []
};

// Helper function to map risk ID to a quadrant
const getQuadrantForKey = (riskId: number): keyof MapaRisco => {
    if (riskId >= 1 && riskId <= 5) return 'frente';
    if (riskId >= 6 && riskId <= 10) return 'atras';
    if (riskId >= 11 && riskId <= 15) return 'esquerda';
    if (riskId >= 16 && riskId <= 19) return 'direita';
    return 'frente'; // Default, though 1-19 should cover it
};

// Helper function to update quadrant content cleanly
const updateQuadrantContent = (currentText: string, riskId: number, riskEntryToAdd: string, add: boolean): string => {
    // Split into lines, trim each, and filter out empty lines
    let lines = currentText.split('\n').map(line => line.trim()).filter(line => line !== '');

    // Filter out any existing entries for this specific risk ID,
    // regardless of their exact format (e.g., "1." or "1. Description")
    const filteredLines = lines.filter(line => 
        !line.startsWith(`${riskId}.`) && // Matches "1. Text"
        !line.startsWith(`${riskId}`) &&   // Matches "1"
        !(line.length === String(riskId).length && line === String(riskId)) // Exact match for just the number
    );

    const updatedLines = new Set(filteredLines);

    if (add) {
        updatedLines.add(riskEntryToAdd);
    }
    
    return Array.from(updatedLines).sort((a, b) => {
        const idA = parseInt(a.split('.')[0] || a);
        const idB = parseInt(b.split('.')[0] || b);
        return idA - idB;
    }).join('\n');
};

// Fix: Use React.forwardRef to allow `DocumentManagement` to pass a ref for PDF generation.
export const ArtEmergencialForm = React.forwardRef<HTMLDivElement, {
    funcionarios: Funcionario[],
    savedArts: ArtEmergencial[],
    setSavedArts: React.Dispatch<React.SetStateAction<ArtEmergencial[]>>
    editingId: string | null; // Added to control editing from outside
    setEditingId: React.Dispatch<React.SetStateAction<string | null>>; // Added to control editing from outside
    setPage: (page: Page) => void; // Added for navigation
}>(({ funcionarios, savedArts, setSavedArts, editingId, setEditingId, setPage }, ref) => { // Added ref parameter

    // Fix: Updated formState type to allow 'id' property when editing
    const [formState, setFormState] = useState<ArtEmergencial | Omit<ArtEmergencial, 'id'>>(initialArtEmergencialState);
    // Fix: Use an internal ref for the form's own download button, separate from the forwarded ref.
    const internalPdfRef = useRef<HTMLDivElement>(null); 
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedArtToView, setSelectedArtToView] = useState<ArtEmergencial | null>(null);


    useEffect(() => {
        if (editingId) {
            const artToEdit = savedArts.find(art => art.id === editingId);
            if (artToEdit) {
                setFormState(artToEdit);
            }
        } else {
            // Only reset to initial state if no editingId is provided
            // This allows DocumentManagement to load a form without clearing it if editingId is not null
            setFormState(initialArtEmergencialState);
        }
    }, [editingId, savedArts]);


    const handleSave = () => {
        if (!formState.data || !formState.hora || !formState.analise360) {
            alert('Por favor, preencha a Data, Hora e a Análise 360º.');
            return;
        }

        if (editingId) {
            setSavedArts(savedArts.map(art => art.id === editingId ? { ...formState, id: editingId } : art));
        } else {
            setSavedArts([...savedArts, { ...formState, id: Date.now().toString() }]);
        }
        setFormState(initialArtEmergencialState);
        setEditingId(null);
    };
    
    const handleEdit = (art: ArtEmergencial) => {
        setEditingId(art.id);
        setFormState(art);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Tem certeza?")) {
            setSavedArts(savedArts.filter(art => art.id !== id));
            if (editingId === id) { // If deleting the one currently being edited
                setEditingId(null);
                setFormState(initialArtEmergencialState);
            }
        }
    };

    const handleView = (art: ArtEmergencial) => {
        setSelectedArtToView(art);
        setShowViewModal(true);
    };

    // Fix: Ensure currentArt always has an 'id' when passed to setEditingId
    const handleDownloadPdf = (artToPrint?: ArtEmergencial) => {
        // Determine the actual ArtEmergencial object to print.
        const artContentToRender = artToPrint ? artToPrint : formState;

        // Temporarily store original states to revert after PDF generation
        const originalFormState = { ...formState };
        // Fix: Use the prop `editingId` which is correctly destructured.
        const originalEditingId = editingId; 
        
        // CRITICAL: Temporarily set the formState to the content we want to print.
        // This ensures the useRef (pdfRef) points to the data intended for the PDF.
        // If artContentToRender is an ArtEmergencial, we use its ID for editingId, otherwise null.
        setFormState(artContentToRender);
        setEditingId(artToPrint ? artToPrint.id : null);

        setTimeout(() => {
            // Fix: Use the forwarded ref if available, otherwise fallback to the internal one.
            const input = (ref && 'current' in ref ? ref.current : internalPdfRef.current);
            if (input) {
                const noPrintElements = input.querySelectorAll('.no-print');
                noPrintElements.forEach(el => (el as HTMLElement).style.visibility = 'hidden');

                html2canvas(input, { scale: 2 }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const canvasWidth = canvas.width;
                    const canvasHeight = canvas.height;
                    const ratio = canvasWidth / canvasHeight;
                    let newCanvasWidth = pdfWidth;
                    let newCanvasHeight = newCanvasWidth / ratio;
                    if (newCanvasHeight > pdfHeight) {
                        newCanvasHeight = pdfHeight;
                        newCanvasWidth = newCanvasHeight * ratio;
                    }
                    const x = (pdfWidth - newCanvasWidth) / 2;
                    pdf.addImage(imgData, 'PNG', x, 0, newCanvasWidth, newCanvasHeight);
                    const pdfDataUri = pdf.output('datauristring'); // Get PDF as data URI
                    window.open(pdfDataUri, '_blank'); // Open in new tab for preview
                    noPrintElements.forEach(el => (el as HTMLElement).style.visibility = 'visible');
                    // Revert to original state after printing
                    setFormState(originalFormState);
                    setEditingId(originalEditingId);
                });
            }
        }, 100); // give react time to re-render with the correct data
    };

    const handleRiscoIdentificadoChange = (id: number, field: keyof RiscoIdentificadoItem, value: boolean | string) => {
        setFormState(prev => {
            const newRiscosIdentificados = {
                ...prev.riscosIdentificados,
                [id]: {
                    ...prev.riscosIdentificados[id],
                    [field]: value
                }
            };

            let newMapaDiagnostico = { ...prev.mapaDiagnostico };
            let newMapaExecucao = { ...prev.mapaExecucao };

            if (field === 'selected') {
                const isSelected = value as boolean;
                const riskEntryForMap = `${id}`; // Only the risk number

                const quadrantKey = getQuadrantForKey(id);

                newMapaDiagnostico[quadrantKey] = updateQuadrantContent(
                    prev.mapaDiagnostico[quadrantKey],
                    id, // Pass the ID for filtering
                    riskEntryForMap,
                    isSelected
                );
                newMapaExecucao[quadrantKey] = updateQuadrantContent(
                    prev.mapaExecucao[quadrantKey],
                    id, // Pass the ID for filtering
                    riskEntryForMap,
                    isSelected
                );
            }

            return {
                ...prev,
                riscosIdentificados: newRiscosIdentificados,
                mapaDiagnostico: newMapaDiagnostico,
                mapaExecucao: newMapaExecucao,
            };
        });
    };

    const handleOutroRiscoChange = (id: number, field: keyof OutroRiscoEmergencialItem, value: string) => {
        setFormState(prev => ({
            ...prev,
            outrosRiscos: {
                ...prev.outrosRiscos,
                [id]: {
                    ...prev.outrosRiscos[id],
                    [field]: value
                }
            }
        }));
    };

    return (
        <div>
            {/* Fix: Attach forwarded ref to the main div for external PDF generation */}
            <div ref={ref || internalPdfRef}>
                <Card>
                    <div className="text-center mb-4">
                        <h1 className="text-2xl font-bold">ART DE CAMPO EMERGENCIAL</h1>
                        <p>{formState.numeroPro} - Anexo 1 - REV 03 - 20/12/2023</p>
                    </div>
                    {/* Header fields */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <input type="date" value={formState.data} onChange={e => setFormState({...formState, data: e.target.value})} className="p-2 border rounded-lg"/>
                        <input type="time" value={formState.hora} onChange={e => setFormState({...formState, hora: e.target.value})} className="p-2 border rounded-lg"/>
                        <input type="text" value={formState.tag} onChange={e => setFormState({...formState, tag: e.target.value})} placeholder="TAG" className="p-2 border rounded-lg"/>
                        <input type="text" value={formState.om} onChange={e => setFormState({...formState, om: e.target.value})} placeholder="OM" className="p-2 border rounded-lg"/>
                    </div>
                    {/* Análise 360 */}
                    <SectionTitle>Análise 360º</SectionTitle>
                    <textarea value={formState.analise360} onChange={e => setFormState({...formState, analise360: e.target.value})} placeholder="Identifique as situações de risco e descreva as medidas de controle..." className="w-full p-2 border rounded-lg h-24"></textarea>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                        <div>
                            <SectionTitle>Etapa de Diagnóstico</SectionTitle>
                            <p className="mb-4 text-sm text-gray-600">Após equipe conversar sobre riscos e controles, preencher o mapa abaixo com os riscos circunstaciais (do ambiente) ou o PRO</p>
                            <RiskMap mapa={formState.mapaDiagnostico} setMapa={mapa => setFormState({...formState, mapaDiagnostico: mapa})} />
                        </div>
                        <div>
                            <SectionTitle>Situações de Risco</SectionTitle>
                            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                {RISCOS.map(risco => (
                                    <div key={risco.id} className="flex flex-col mb-2 p-1 rounded-md hover:bg-gray-50">
                                        <label className="flex items-start">
                                            <input
                                                type="checkbox"
                                                checked={formState.riscosIdentificados[risco.id]?.selected || false}
                                                onChange={() => handleRiscoIdentificadoChange(risco.id, 'selected', !(formState.riscosIdentificados[risco.id]?.selected || false))}
                                                className="mt-1 mr-2 h-4 w-4"
                                            />
                                            <span>{risco.id}. {risco.text}</span>
                                        </label>
                                        <textarea
                                            value={formState.riscosIdentificados[risco.id]?.control || ''}
                                            onChange={(e) => handleRiscoIdentificadoChange(risco.id, 'control', e.target.value)}
                                            placeholder="CONTROLE (S): Manual"
                                            className={`ml-6 p-1 border rounded-lg text-xs w-[calc(100%-1.5rem)] resize-y ${!formState.riscosIdentificados[risco.id]?.selected ? 'bg-gray-100 italic' : ''}`}
                                            rows={2}
                                            disabled={!formState.riscosIdentificados[risco.id]?.selected}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                        <div>
                            <SectionTitle>Etapa de Execução</SectionTitle>
                            <p className="mb-2 font-semibold">Essa tarefa possui PRO ou ART de planejamento?</p>
                            <div className="flex gap-4 mb-4">
                               <label><input type="radio" name="art-planejamento" value="sim" checked={formState.possuiARTPlanejamento === 'sim'} onChange={e => setFormState({...formState, possuiARTPlanejamento: 'sim'})} /> Sim</label>
                               <label><input type="radio" name="art-planejamento" value="nao" checked={formState.possuiARTPlanejamento === 'nao'} onChange={e => setFormState({...formState, possuiARTPlanejamento: 'nao'})} /> Não</label>
                            </div>
                            <RiskMap mapa={formState.mapaExecucao} setMapa={mapa => setFormState({...formState, mapaExecucao: mapa})} />
                        </div>
                         <div>
                            <SectionTitle>Outras Situações de Risco</SectionTitle>
                            <div className="space-y-2">
                                {OUTROS_RISCOS_EMERGENCIAL_DATA.map(item => (
                                    <div key={item.id} className="flex flex-col">
                                        <label className="font-semibold">{item.id}.</label>
                                        <input
                                            type="text"
                                            value={formState.outrosRiscos[item.id]?.description || ''}
                                            onChange={e => handleOutroRiscoChange(item.id, 'description', e.target.value)}
                                            className="w-full p-2 border rounded-lg mb-1 text-sm"
                                            placeholder={item.defaultDescription}
                                        />
                                        <textarea
                                            value={formState.outrosRiscos[item.id]?.control || ''}
                                            onChange={e => handleOutroRiscoChange(item.id, 'control', e.target.value)}
                                            className="w-full p-2 border rounded-lg text-xs resize-y"
                                            placeholder="CONTROLE (S): Manual"
                                            rows={2}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <SectionTitle>Equipe Envolvida na Discussão e Ciente dos Riscos</SectionTitle>
                    <SignatureSection funcionarios={funcionarios} equipe={formState.equipe} setEquipe={(equipe) => setFormState({...formState, equipe})} />
                    
                    <div className="flex justify-end mt-8 gap-4 no-print">
                        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white"><PlusIcon/>{editingId ? "Atualizar ART" : "Salvar ART"}</Button>
                    </div>
                </Card>
            </div>

             <Card>
                <SectionTitle>ARTs Emergenciais Salvas</SectionTitle>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                         <thead>
                            <tr className="border-b">
                                <th className="p-2">Data</th>
                                <th className="p-2">Hora</th>
                                <th className="p-2">TAG</th>
                                <th className="p-2">OM</th>
                                <th className="p-2">Equipe</th>
                                <th className="p-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {savedArts.map(art => (
                                <tr key={art.id} className={`border-b ${editingId === art.id ? 'bg-yellow-100 border-yellow-500 ring-2 ring-yellow-300' : ''}`}>
                                    <td className="p-2">{art.data}</td>
                                    <td className="p-2">{art.hora}</td>
                                    <td className="p-2">{art.tag}</td>
                                    <td className="p-2">{art.om}</td>
                                    <td className="p-2">{art.equipe.map(e => e.nome).join(', ')}</td>
                                    <td className="p-2 flex gap-2">
                                        <button onClick={() => handleView(art)} className="text-gray-600"><EyeIcon /></button>
                                        <button onClick={() => handleEdit(art)} className="text-blue-500"><EditIcon /></button>
                                        <button onClick={() => handleDelete(art.id)} className="text-red-500"><TrashIcon /></button>
                                        <button onClick={() => handleDownloadPdf(art)} className="text-gray-600"><DownloadIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            {showViewModal && selectedArtToView && (
                <ArtEmergencialViewModal
                    art={selectedArtToView}
                    funcionarios={funcionarios}
                    onClose={() => setShowViewModal(false)}
                />
            )}
        </div>
    );
}); // End of forwardRef for ArtEmergencialForm

// --- ART da Atividade View Modal Component ---
export const ArtAtividadeViewModal: React.FC<{
    art: ArtAtividade;
    funcionarios: Funcionario[];
    arts: ART[]; // For linked ART PDF preview
    onClose: () => void;
}> = ({ art, funcionarios, arts, onClose }) => {
    // Helper to get funcionario matricula
    const getFuncionarioMatricula = (funcionarioId: string) => {
        return funcionarios.find(f => f.id === funcionarioId)?.matricula || 'N/A';
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative p-6">
                <h2 className="text-2xl font-bold mb-4 border-b pb-2">Detalhes da ART da Atividade</h2>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div><strong>Empresa:</strong> {art.empresa}</div>
                    <div><strong>Gerência:</strong> {art.gerencia}</div>
                    <div className="col-span-2"><strong>Tarefa a ser executada:</strong> <span className="whitespace-pre-wrap">{art.tarefaExecutada || 'N/A'}</span></div>
                    <div><strong>Código da ART:</strong> {art.codigoArt}</div>
                    <div><strong>Local da Atividade:</strong> {art.localAtividade || 'N/A'}</div>
                    <div className="col-span-2"><strong>OMVE - Risco:</strong> {art.omveNao ? 'Não' : ''} {art.omveCilindro ? 'Cilindro' : ''} {art.omveGradesDePiso ? 'Grades de Piso' : ''}</div>
                    <div><strong>Data Emissão:</strong> {art.dataEmissao}</div>
                    <div className="col-span-2">
                        <strong>ART Anexada:</strong> {art.linkedArtNumero || 'N/A'}
                        {art.linkedArtPdfDataUrl && (
                            <a
                                href={art.linkedArtPdfDataUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-blue-600 hover:underline text-xs"
                            >
                                (Ver PDF)
                            </a>
                        )}
                    </div>
                </div>

                <h3 className="text-lg font-bold mt-4 mb-2">Principais Situações de Risco</h3>
                <div className="overflow-x-auto border rounded-md bg-gray-50 mb-4">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border-r border-b">Situação de Risco</th>
                                <th className="p-2 border-r border-b">Total</th>
                                <th className="p-2 border-b">Risco</th>
                            </tr>
                        </thead>
                        <tbody>
                            {PRINCIPAIS_SITUACAO_RISCO_DATA.map((item, index) => (
                                <tr key={index} className="border-b last:border-b-0">
                                    <td className="p-2">{item.situacao}</td>
                                    <td className="p-2">{item.total}</td>
                                    <td className="p-2">{item.risco}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h3 className="text-lg font-bold mt-4 mb-2">Resumo das Medidas de Controle</h3>
                <p className="border p-2 rounded-md bg-gray-50 whitespace-pre-wrap">{art.resumoMedidasControle || 'N/A'}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <h3 className="text-lg font-bold mb-2">Mapa de Risco</h3>
                        <div className="border p-2 rounded-md bg-gray-50">
                            <RiskMap mapa={art.mapaRisco} setMapa={() => {}} disabled={true} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-2">Medidas de Controle Adicionais</h3>
                        <p className="border p-2 rounded-md bg-gray-50 whitespace-pre-wrap h-full">{art.medidasControleAdicionais || 'N/A'}</p>
                    </div>
                </div>

                <h3 className="text-lg font-bold mt-4 mb-2">Riscos Circunstanciais (Identificados)</h3>
                <ul className="list-disc pl-5 border p-2 rounded-md bg-gray-50 mb-4">
                    {RISCOS_CIRCUNSTANCIAIS_LIST.slice(0, 19).map((risco, index) => (
                        art.riscosCircunstanciaisChecklist[index + 1] && (
                            <li key={index + 1}>{index + 1}. {risco}</li>
                        )
                    ))}
                    {art.outrasSituacoesRisco20 && art.outrasSituacoesRisco20 !== RISCOS_CIRCUNSTANCIAIS_LIST[19] && (
                        <li>{RISCOS_CIRCUNSTANCIAIS_LIST.length}. {art.outrasSituacoesRisco20}</li>
                    )}
                     {Object.keys(art.riscosCircunstanciaisChecklist).every(id => !art.riscosCircunstanciaisChecklist[parseInt(id)]) && !art.outrasSituacoesRisco20 && (
                        <p className="italic text-gray-600">Nenhum risco circunstancial selecionado.</p>
                    )}
                </ul>

                <h3 className="text-lg font-bold mt-4 mb-2">Passos da Tarefa</h3>
                <div className="overflow-x-auto border rounded-md bg-gray-50 mb-4">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border-r border-b">Item</th>
                                <th className="p-2 border-r border-b">Descrição</th>
                                <th className="p-2 border-b">Risco</th>
                            </tr>
                        </thead>
                        <tbody>
                            {art.passosDaTarefa.map((passo, index) => (
                                <tr key={passo.itemId} className="border-b last:border-b-0">
                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2">{passo.descricao || 'N/A'}</td>
                                    <td className="p-2">{passo.risco || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h3 className="text-lg font-bold mt-4 mb-2">Equipe Envolvida</h3>
                <div className="overflow-x-auto border rounded-md bg-gray-50">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border-r border-b">Matrícula</th>
                                <th className="p-2 border-r border-b">Nome</th>
                                <th className="p-2 border-r border-b">Função</th>
                                <th className="p-2 border-r border-b">Data</th>
                                <th className="p-2 border-b">Hora</th>
                            </tr>
                        </thead>
                        <tbody>
                            {art.equipeAssinaturas.map(membro => (
                                <tr key={membro.funcionarioId} className="border-b last:border-b-0">
                                    <td className="p-2">{getFuncionarioMatricula(membro.funcionarioId)}</td>
                                    <td className="p-2">{membro.nome}</td>
                                    <td className="p-2">{membro.funcao}</td>
                                    <td className="p-2">{membro.data}</td>
                                    <td className="p-2">{membro.hora}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


// Moved constant declarations here to resolve "Block-scoped variable used before its declaration" error.
const PRINCIPAIS_SITUACAO_RISCO_DATA = [
    { situacao: 'BATIDA CONTRA - ESTRUTURA E EQUIPAMENTOS', total: 7, risco: 'MÉDIA' },
    { situacao: 'CONTATOS COM SUPERFÍCIES CORTANTES/PERFURANTES/ABRASIVAS', total: 6, risco: 'MÉDIA' },
    { situacao: 'ATINGIDO POR PROJEÇÃO DE MATERIAIS (FERRAMENTAS, PEÇAS, FRAGMENTOS, FAGULHAS)', total: 5, risco: 'MÉDIA' },
    { situacao: 'PRENSAMENTO DO CORPO OU PARTES DO CORPO', total: 5, risco: 'MÉDIA' },
    { situacao: 'ATINGIDO POR QUEDA DE PEÇAS/ESTRUTURAS/EQUIPAMENTOS/FERRAMENTAS', total: 4, risco: 'MÉDIA' },
    { situacao: 'QUEDA/ESCORREGÃO/TROPEÇO (MESMO NÍVEL)', total: 4, risco: 'MÉDIA' },
    { situacao: 'ATROPELAMENTO - VEÍCULOS OU EQUIPAMENTOS AUTOMOTORES', total: 3, risco: 'MÉDIA' },
    { situacao: 'ATINGIDO POR DESCARGA ATMOSFÉRICA', total: 3, risco: 'MÉDIA' },
    { situacao: 'QUEDA DE PESSOA DE NÍVEL DIFERENTE', total: 3, risco: 'MÉDIA' },
    { situacao: 'CONTATO/EXPOSIÇÃO A PRODUTOS QUÍMICOS', total: 2, risco: 'MÉDIA' },
];

const RESUMO_MEDIDAS_CONTROLE_TEXT = `MÉDIA: Utilizar EPI's (capacete com jugular, óculos de proteção, botina de
segurança tipo manobreiro e luva de proteção), Evitar ficar no raio de ação de partes
móveis, Manter local de trabalho organizado, Observar o ambiente e local de
trabalho, Utilizar método FALAAD, Seguir recomendações do alerta amarelo e
vermelho para descarga atmosférica, Inspecionar local quanto presença de arestas
cortantes, Inspecionar ambiente de trabalho mantendo acessos desobstruídos, Não
criar ou improvisar acessos, Utilizar sempre 3 pontos de apoio para subir e descer
do equipamento, Sempre abrir e fechar portas utilizando as maçanetas com luvas,
Transitar por caminhos seguros destinados a pedestres
BAIXA: Avaliar previamente o local de trabalho quanto presença de animais e
insetos, Caso identifique algum animal manter distância segura e acionar o CECOM`;

const RISCOS_CIRCUNSTANCIAIS_LIST = [
    "Contato com superfícies cortantes / perfurante em ferramentas manuais ou em estruturas.",
    "Prensamento de dedos ou mãos." ,
    "Queda de peças / estruturas / equipamentos.",
    "Prensamento ou agarramento do corpo.",
    "Atropelamento / esmagamento por veículos como em vias, pátios, cruzamentos e ferrovias.",
    "Queda, tropeço ou escorregão no acesso ou no local de trabalho." ,
    "Animais peçonhentos / insetos / animal selvagem." ,
    "Desmoronamentos de pilhas (minério, estéril, entre outros tipos de materiais)." ,
    "Queda de plataforma ou de escadas durante o acesso (atenção para os possíveis pontos com corrosão).",
    "Arco e/ou choque elétrico.",
    "Fontes de energia (hidráulica, pneumática, elétrica, etc).",
    "Exposição a vapores, condensados ou superfícies quentes.",
    "Gases, vapores, poeiras ou fumos.",
    "Produtos químicos ou queimaduras.",
    "Projeção de materiais na face ou nos olhos." ,
    "Condições climáticas adversas (sol, chuva, vento).",
    "Queda de homem ao mar ou afogamento.",
    "Interferência entre equipes (traballho sobreposto, espaço restrito)." ,
    "Excesso ou deficiência de iluminação.",
    "Outras situações de risco:" // Item 20, with an associated text input in the original form.
];

const initialArtAtividadeState: Omit<ArtAtividade, 'id'> = {
    empresa: 'Vale',
    tarefaExecutada: '', // Changed to empty string
    gerencia: 'GER MANUT EQUIP TRANSPORTE - BENTO MOREIRA DA SILVA',
    codigoArt: '155574',
    omveNao: true,
    omveCilindro: false,
    omveGradesDePiso: false,
    localAtividade: '',
    dataEmissao: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (UTC-3)',
    resumoMedidasControle: RESUMO_MEDIDAS_CONTROLE_TEXT,
    mapaRisco: { frente: '', atras: '', esquerda: '', direita: '' },
    medidasControleAdicionais: '',
    riscosCircunstanciaisChecklist: {}, // Initialize as empty
    outrasSituacoesRisco20: '',
    linkedArtId: undefined, // Initialize as undefined
    linkedArtNumero: undefined, // Initialize as undefined
    linkedArtPdfDataUrl: undefined, // Initialize as undefined
    passosDaTarefa: [{ itemId: Date.now().toString(), descricao: '', risco: '' }], // Start with one empty step
    equipeAssinaturas: []
};

export const ArtAtividadeForm: React.FC<{
  funcionarios: Funcionario[];
  arts: ART[]; // New prop for available ARTs (PDFs)
  savedData: ArtAtividade[];
  setSavedData: React.Dispatch<React.SetStateAction<ArtAtividade[]>>;
  editingId: string | null;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  setPage: (page: Page) => void;
}> = ({ funcionarios, arts, savedData, setSavedData, editingId, setEditingId, setPage }) => {
    // Fix: Updated formState type to allow 'id' property when editing
    const [formState, setFormState] = useState<ArtAtividade | Omit<ArtAtividade, 'id'>>(initialArtAtividadeState);
    const pdfRef = useRef<HTMLDivElement>(null);
    const [selectedLinkedArtId, setSelectedLinkedArtId] = useState<string>(''); // For dropdown selection
    const [showViewModal, setShowViewModal] = useState(false); // State for the view modal
    const [selectedArtAtividadeToView, setSelectedArtAtividadeToView] = useState<ArtAtividade | null>(null); // State for the selected ART to view

    // Update dataEmissao on component mount
    useEffect(() => {
        if (editingId) {
            const artToEdit = savedData.find(art => art.id === editingId);
            if (artToEdit) {
                setFormState(artToEdit);
                setSelectedLinkedArtId(artToEdit.linkedArtId || ''); // Set the selection when editing
            }
        } else {
            setFormState(prev => ({
                ...prev,
                dataEmissao: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (UTC-3)'
            }));
            setSelectedLinkedArtId(''); // Reset linked ART selection when starting a new form
        }
    }, [editingId, savedData]);

    const handleSave = () => {
        if (editingId) {
            setSavedData(savedData.map(art => art.id === editingId ? { ...formState, id: editingId } : art));
        } else {
            setSavedData([...savedData, { ...formState, id: Date.now().toString() }]);
        }
        setFormState(initialArtAtividadeState);
        setEditingId(null);
    };
    
    const handleEdit = (art: ArtAtividade) => {
        setEditingId(art.id);
        setFormState(art);
        setSelectedLinkedArtId(art.linkedArtId || ''); // Set the selection when editing
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir esta ART?")) {
            setSavedData(savedData.filter(art => art.id !== id));
            if (editingId === id) { // If deleting the one currently being edited
                setEditingId(null);
                setFormState(initialArtAtividadeState);
            }
        }
    };

    // New: Handle View for ArtAtividade
    const handleView = (art: ArtAtividade) => {
        setSelectedArtAtividadeToView(art);
        setShowViewModal(true);
    };

    // Fix: Ensure currentArt always has an 'id' when passed to setEditingId
    const handleDownloadPdf = (artToPrint?: ArtAtividade) => {
        const artContentToRender = artToPrint ? artToPrint : formState;

        const originalState = { ...formState };
        const originalEditingId = editingId;
        const originalSelectedLinkedArtId = selectedLinkedArtId;

        setFormState(artContentToRender);
        setEditingId(artToPrint ? artToPrint.id : null);
        setSelectedLinkedArtId(artToPrint?.linkedArtId || '');


        setTimeout(() => {
            const input = pdfRef.current;
            if (input) {
                // Hide buttons for PDF
                const noPrintElements = input.querySelectorAll('.no-print');
                noPrintElements.forEach(el => (el as HTMLElement).style.visibility = 'hidden');

                html2canvas(input, { scale: 2 }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();

                    const imgHeight = canvas.height * pdfWidth / canvas.width;
                    let heightLeft = imgHeight;
                    let position = 0;

                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                    heightLeft -= pdfHeight;

                    while (heightLeft >= -10) { // Add tolerance for small remaining height
                        position = heightLeft - imgHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                        heightLeft -= pdfHeight;
                    }
                    const pdfDataUri = pdf.output('datauristring'); // Get PDF as data URI
                    window.open(pdfDataUri, '_blank'); // Open in new tab for preview
                    
                    // Restore visibility of buttons
                    noPrintElements.forEach(el => (el as HTMLElement).style.visibility = 'visible');
                    // Restore original state
                    setFormState(originalState);
                    setEditingId(originalEditingId);
                    setSelectedLinkedArtId(originalSelectedLinkedArtId);
                });
            }
        }, 100);
    };

    const handleOmveChange = (type: 'nao' | 'cilindro' | 'grades_de_piso') => {
        setFormState(prev => ({
            ...prev,
            omveNao: type === 'nao',
            omveCilindro: type === 'cilindro',
            omveGradesDePiso: type === 'grades_de_piso',
        }));
    };

    const handleRiscoCircunstancialChange = (id: number) => {
        setFormState(prev => ({
            ...prev,
            riscosCircunstanciaisChecklist: {
                ...prev.riscosCircunstanciaisChecklist,
                [id]: !prev.riscosCircunstanciaisChecklist[id]
            }
        }));
    };

    const handleAddPasso = () => {
        setFormState(prev => ({
            ...prev,
            passosDaTarefa: [...prev.passosDaTarefa, { itemId: Date.now().toString(), descricao: '', risco: '' }]
        }));
    };

    const handleRemovePasso = (itemId: string) => {
        setFormState(prev => ({
            ...prev,
            passosDaTarefa: prev.passosDaTarefa.filter(passo => passo.itemId !== itemId)
        }));
    };

    const handlePassoChange = (itemId: string, field: 'descricao' | 'risco', value: string) => {
        setFormState(prev => ({
            ...prev,
            passosDaTarefa: prev.passosDaTarefa.map(passo =>
                passo.itemId === itemId ? { ...passo, [field]: value } : passo
            )
        }));
    };

    const handleLinkedArtChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const artId = e.target.value;
        setSelectedLinkedArtId(artId);
        if (artId) {
            const selectedArt = arts.find(art => art.id === artId);
            if (selectedArt) {
                setFormState(prev => ({
                    ...prev,
                    linkedArtId: selectedArt.id,
                    linkedArtNumero: selectedArt.numero,
                    linkedArtPdfDataUrl: selectedArt.pdfDataUrl,
                }));
            }
        } else {
            setFormState(prev => ({
                ...prev,
                linkedArtId: undefined,
                linkedArtNumero: undefined,
                linkedArtPdfDataUrl: undefined,
            }));
        }
    };

    return (
        <div>
            <div ref={pdfRef} className="p-4 bg-white shadow-lg rounded-xl">
                {/* Header Section (Page 1) */}
                <div className="border border-gray-400 p-2 mb-4">
                    <div className="flex justify-between items-center text-sm font-semibold mb-2 pb-2 border-b border-gray-300">
                        <p className="flex-1">Empresa: <span className="font-normal">{formState.empresa}</span></p>
                        <p className="flex-1 text-center">ART - ANÁLISE DE RISCO DA TAREFA</p>
                        <p className="flex-1 text-right">Diretrizes para Análise de Risco da Tarefa - ART</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-sm mb-2">
                        <div className="border border-gray-300 p-1">
                            <label className="font-semibold block">Tarefa a ser executada</label>
                            <textarea
                                value={formState.tarefaExecutada}
                                onChange={e => setFormState({...formState, tarefaExecutada: e.target.value})}
                                className="w-full text-xs h-10 resize-none border-none focus:ring-0 p-0"
                                placeholder="Descreva a tarefa..."
                            />
                        </div>
                        <div className="border border-gray-300 p-1">
                            <label className="font-semibold block">Gerência</label>
                            <input
                                type="text"
                                value={formState.gerencia}
                                onChange={e => setFormState({...formState, gerencia: e.target.value})}
                                className="w-full text-xs border-none focus:ring-0 p-0"
                            />
                        </div>
                        <div className="border border-gray-300 p-1">
                            <label className="font-semibold block">Código da ART:</label>
                            <input
                                type="text"
                                value={formState.codigoArt}
                                onChange={e => setFormState({...formState, codigoArt: e.target.value})}
                                className="w-full text-xs border-none focus:ring-0 p-0"
                            />
                        </div>
                        <div className="flex items-center gap-4 border border-gray-300 p-1">
                            <label className="font-semibold">OMVE - Risco:</label>
                            <label className="flex items-center gap-1">
                                <input type="radio" name="omve" checked={formState.omveNao} onChange={() => handleOmveChange('nao')} className="h-3 w-3" /> Não
                            </label>
                            <label className="flex items-center gap-1">
                                <input type="radio" name="omve" checked={formState.omveCilindro} onChange={() => handleOmveChange('cilindro')} className="h-3 w-3" /> Cilindro
                            </label>
                            <label className="flex items-center gap-1">
                                <input type="radio" name="omve" checked={formState.omveGradesDePiso} onChange={() => handleOmveChange('grades_de_piso')} className="h-3 w-3" /> Grades de Piso
                            </label>
                        </div>
                        <div className="border border-gray-300 p-1">
                            <label className="font-semibold block">Local da Atividade</label>
                            <input
                                type="text"
                                value={formState.localAtividade}
                                onChange={e => setFormState({...formState, localAtividade: e.target.value})}
                                className="w-full text-xs border-none focus:ring-0 p-0"
                            />
                        </div>
                        <div className="border border-gray-300 p-1">
                            <label className="font-semibold block">Data Emissão</label>
                            <span className="block text-xs">{formState.dataEmissao}</span>
                        </div>
                         {/* New section for linking an existing ART */}
                        <div className="md:col-span-2 border border-gray-300 p-1">
                            <label className="font-semibold block mb-1">Anexar ART Cadastrada</label>
                            <div className="flex items-center gap-2">
                                <select
                                    value={selectedLinkedArtId}
                                    onChange={handleLinkedArtChange}
                                    className="flex-1 p-1 border rounded-md text-xs"
                                >
                                    <option value="">Selecione uma ART...</option>
                                    {arts.map(art => (
                                        <option key={art.id} value={art.id}>
                                            {art.numero} - {art.nome}
                                        </option>
                                    ))}
                                </select>
                                {formState.linkedArtPdfDataUrl && (
                                    <a
                                        href={formState.linkedArtPdfDataUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-xs flex-shrink-0 no-print"
                                    >
                                        Ver ART Anexada
                                    </a>
                                )}
                            </div>
                            {formState.linkedArtNumero && (
                                <p className="text-xs mt-1">ART Anexada: <span className="font-normal">{formState.linkedArtNumero}</span></p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
                    {/* Left Column - Principais Situações de Risco */}
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm bg-gray-200 p-1 mb-1 border border-gray-300 text-center">PRINCIPAIS SITUAÇÕES DE RISCO</h3>
                        <div className="overflow-x-auto mb-4">
                            <table className="w-full text-left border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-1 border-r border-b text-xs">SITUAÇÃO DE RISCO</th>
                                        <th className="p-1 border-r border-b w-16 text-xs text-center">TOTAL</th>
                                        <th className="p-1 border-b w-20 text-xs text-center">RISCO</th>
                                    </tr>
                               </thead>
                               <tbody>
                                    {PRINCIPAIS_SITUACAO_RISCO_DATA.map((item, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="p-1 border-r text-xs">{item.situacao}</td>
                                            <td className="p-1 border-r text-xs text-center">{item.total}</td>
                                            <td className="p-1 text-xs text-center">{item.risco}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <h3 className="font-bold text-gray-800 text-sm bg-gray-200 p-1 mb-1 border border-gray-300 text-center">RESUMO DAS MEDIDAS DE CONTROLE</h3>
                        <textarea
                            value={formState.resumoMedidasControle}
                            onChange={e => setFormState({...formState, resumoMedidasControle: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-md text-xs h-48 resize-y"
                        />

                        <div className="mt-4 border border-gray-300 p-2">
                            <p className="text-xs text-gray-600 mb-2">Após a equipe conversar sobre as principais situações de risco da tabela acima e sua medidas de controle, preencher o mapa com os riscos circunstaciais (do ambiente) e as medidas de controle propostas</p>
                            <RiskMap mapa={formState.mapaRisco} setMapa={mapa => setFormState({...formState, mapaRisco: mapa})} />
                        </div>
                    </div>

                    {/* Right Column - Medidas de Controle Adicionais & Risco Circunstaciais */}
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm bg-gray-200 p-1 mb-1 border border-gray-300 text-center">MEDIDAS DE CONTROLE DE CONTROLE ADICIONAIS</h3>
                        <textarea
                            value={formState.medidasControleAdicionais}
                            onChange={e => setFormState({...formState, medidasControleAdicionais: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-md text-xs h-64 resize-y mb-4"
                        />

                        <h3 className="font-bold text-gray-800 text-sm bg-gray-200 p-1 mb-1 border border-gray-300 text-center">RISCO CIRCUNSTANCIAIS (Identificados no Raio de Ação da Tarefa)</h3>
                        <div className="space-y-1 text-xs max-h-96 overflow-y-auto pr-2 mb-4 border border-gray-300 p-2">
                            {RISCOS_CIRCUNSTANCIAIS_LIST.slice(0, 19).map((risco, index) => (
                                <label key={index + 1} className="flex items-start">
                                    <input
                                        type="checkbox"
                                        checked={!!formState.riscosCircunstanciaisChecklist[index + 1]}
                                        onChange={() => handleRiscoCircunstancialChange(index + 1)}
                                        className="mt-1 mr-2 h-3 w-3"
                                    />
                                    <span>{index + 1}. {risco}</span>
                                </label>
                            ))}
                            <div className="flex items-start mt-2">
                                <span className="mr-2">{RISCOS_CIRCUNSTANCIAIS_LIST.length}.</span>
                                <input
                                    type="text"
                                    value={formState.outrasSituacoesRisco20}
                                    onChange={e => setFormState({...formState, outrasSituacoesRisco20: e.target.value})}
                                    className="w-full p-1 border border-gray-300 rounded-md text-xs"
                                    placeholder={RISCOS_CIRCUNSTANCIAIS_LIST[19]}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page 2 content starts here - Passo da Tarefa & Equipe */}
                <div className="pt-8 mt-8 page-break-before">
                     <div className="flex justify-between items-center text-xs font-semibold mb-2 text-gray-600 border border-gray-400 p-1">
                        <p>Código da ART: <span className="font-normal">{formState.codigoArt}</span></p>
                        <p>Data Emissão: <span className="font-normal">{formState.dataEmissao.split(' ')[0]}</span></p>
                        <p>Pág.: <span className="font-normal">1 de 2</span></p> {/* This will dynamically update if I can get html2canvas to split */}
                    </div>

                    <h3 className="font-bold text-gray-800 text-sm bg-gray-200 p-1 mb-1 border border-gray-300 text-center">Passo da Tarefa</h3>
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full text-left border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-1 border-r border-b w-12 text-xs text-center">Item</th>
                                    <th className="p-1 border-r border-b text-xs">Passo da Tarefa</th>
                                    <th className="p-1 border-b w-24 text-xs text-center">RISCO</th>
                                    <th className="p-1 border-b w-20 no-print text-xs text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formState.passosDaTarefa.map((passo, index) => (
                                    <tr key={passo.itemId} className="border-b">
                                        <td className="p-1 border-r text-xs text-center font-semibold">{index + 1}</td>
                                        <td className="p-1 border-r">
                                            <input
                                                type="text"
                                                value={passo.descricao}
                                                onChange={e => handlePassoChange(passo.itemId, 'descricao', e.target.value)}
                                                className="w-full p-0 text-xs border-none focus:ring-0"
                                                placeholder="Descreva o passo da tarefa"
                                            />
                                        </td>
                                        <td className="p-1 border-r">
                                            <select
                                                value={passo.risco}
                                                onChange={e => handlePassoChange(passo.itemId, 'risco', e.target.value as ArtAtividade['passosDaTarefa'][0]['risco'])}
                                                className="w-full p-0 text-xs border-none focus:ring-0"
                                            >
                                                <option value="">Selecione</option>
                                                <option value="MÉDIA">MÉDIA</option>
                                                <option value="BAIXA">BAIXA</option>
                                                <option value="ALTA">ALTA</option>
                                            </select>
                                        </td>
                                        <td className="p-1 no-print text-center">
                                            <button onClick={() => handleRemovePasso(passo.itemId)} className="text-red-500 hover:text-red-700"><TrashIcon /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Button onClick={handleAddPasso} className="no-print mb-8"><PlusIcon /> Adicionar Passo</Button>
                </div>
                
                {/* Team Signatures Section (Continues to page 2 if needed) */}
                <div className="pt-8 mt-8 page-break-before">
                    <div className="flex justify-between items-center text-xs font-semibold mb-2 text-gray-600 border border-gray-400 p-1">
                        <p>Código da ART: <span className="font-normal">{formState.codigoArt}</span></p>
                        <p>Data Emissão: <span className="font-normal">{formState.dataEmissao.split(' ')[0]}</span></p>
                        <p>Pág.: <span className="font-normal">2 de 2</span></p> {/* This will dynamically update if I can get html2canvas to split */}
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm bg-gray-200 p-1 mb-1 border border-gray-300 text-center">Equipe Envolvida na Discussão e Ciente dos Riscos</h3>
                    <SignatureSection funcionarios={funcionarios} equipe={formState.equipeAssinaturas} setEquipe={(equipe) => setFormState({...formState, equipeAssinaturas: equipe})} editable={true} minRows={6} />
                </div>

                <div className="flex justify-end mt-8 gap-4 no-print">
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white"><PlusIcon/>{editingId ? "Atualizar ART" : "Salvar ART"}</Button>
                </div>
            </div>

            <Card className="mt-8">
                <SectionTitle>ARTs da Atividade Salvas</SectionTitle>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">Código ART</th>
                                <th className="p-2">Tarefa</th>
                                <th className="p-2">ART Anexada</th> {/* New column header */}
                                <th className="p-2">Data Emissão</th>
                                <th className="p-2">Equipe</th>
                                <th className="p-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {savedData.map(art => (
                                <tr key={art.id} className="border-b">
                                    <td className="p-2">{art.codigoArt}</td>
                                    <td className="p-2 truncate max-w-xs">{art.tarefaExecutada}</td>
                                    <td className="p-2">
                                        {art.linkedArtNumero ? (
                                            <div className="flex items-center gap-2">
                                                <span>{art.linkedArtNumero}</span>
                                                <a
                                                    href={art.linkedArtPdfDataUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline text-sm"
                                                >
                                                    <DownloadIcon />
                                                </a>
                                            </div>
                                        ) : 'N/A'}
                                    </td>
                                    <td className="p-2">{art.dataEmissao.split(' ')[0]}</td>
                                    <td className="p-2">{art.equipeAssinaturas.map(e => e.nome).join(', ')}</td>
                                    <td className="p-2 flex gap-2">
                                        <button onClick={() => handleView(art)} className="text-gray-600"><EyeIcon /></button>
                                        <button onClick={() => handleEdit(art)} className="text-blue-500"><EditIcon /></button>
                                        <button onClick={() => handleDelete(art.id)} className="text-red-500"><TrashIcon /></button>
                                        <button onClick={() => handleDownloadPdf(art)} className="text-gray-600"><DownloadIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            {showViewModal && selectedArtAtividadeToView && (
                <ArtAtividadeViewModal
                    art={selectedArtAtividadeToView}
                    funcionarios={funcionarios}
                    arts={arts}
                    onClose={() => setShowViewModal(false)}
                />
            )}
        </div>
    );
};

// --- Lockout Matrix View Modal Component ---
export const LockoutMatrixViewModal: React.FC<{
    matrix: MatrizBloqueio;
    funcionarios: Funcionario[];
    onClose: () => void;
}> = ({ matrix, funcionarios, onClose }) => {
    // Helper to get funcionario matricula
    const getFuncionarioMatricula = (funcionarioId: string) => {
        return funcionarios.find(f => f.id === funcionarioId)?.matricula || 'N/A';
    };

    const selectedAreas = Object.entries(matrix.areas)
                                  .filter(([, isSelected]) => isSelected)
                                  .map(([area]) => area.charAt(0).toUpperCase() + area.slice(1))
                                  .join(', ');

    const selectedEnergias = Object.entries(matrix.energias)
                                   .filter(([, isSelected]) => isSelected)
                                   .map(([energia]) => {
                                       switch(energia) {
                                           case 'eletrica': return 'Elétrica';
                                           case 'mecanica': return 'Mecânica';
                                           case 'hidraulica': return 'Hidráulica';
                                           case 'pneumatica': return 'Pneumática';
                                           case 'termica': return 'Térmica';
                                           case 'quimica': return 'Química';
                                           case 'gravitacional': return 'Gravitacional';
                                           case 'residual': return 'Residual';
                                           default: return energia;
                                       }
                                   })
                                   .join(', ');

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative p-6">
                <h2 className="text-2xl font-bold mb-4 border-b pb-2">Detalhes da Matriz de Bloqueio</h2>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div><strong>Empresa:</strong> {matrix.empresa}</div>
                    <div><strong>Gerência:</strong> {matrix.gerencia}</div>
                    <div className="col-span-2"><strong>Tarefa a ser executada:</strong> <span className="whitespace-pre-wrap">{matrix.tarefaExecutada || 'N/A'}</span></div>
                    <div><strong>Código da ART:</strong> {matrix.codigoArt}</div>
                    <div><strong>Local da Atividade:</strong> {matrix.localAtividade || 'N/A'}</div>
                    <div><strong>OM:</strong> {matrix.om}</div>
                    <div><strong>TAG:</strong> {matrix.tag}</div>
                    <div className="col-span-2"><strong>Data Emissão:</strong> {matrix.dataEmissao}</div>
                </div>

                <h3 className="text-lg font-bold mt-4 mb-2">Seleção de Área</h3>
                <p className="border p-2 rounded-md bg-gray-50 whitespace-pre-wrap">
                    {selectedAreas || 'Nenhuma área selecionada'}
                </p>

                <h3 className="text-lg font-bold mt-4 mb-2">Energias a Bloquear</h3>
                <p className="border p-2 rounded-md bg-gray-50 whitespace-pre-wrap">
                    {selectedEnergias || 'Nenhuma energia selecionada'}
                </p>

                <h3 className="text-lg font-bold mt-4 mb-2">Teste de Efetividade</h3>
                <p className="border p-2 rounded-md bg-gray-50">
                    {matrix.testeEfetividade === 'sim' ? 'Sim' : matrix.testeEfetividade === 'nao' ? 'Não' : 'N/A'}
                </p>

                <h3 className="text-lg font-bold mt-4 mb-2">Equipe Responsável</h3>
                <div className="overflow-x-auto border rounded-md bg-gray-50">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border-r border-b">Matrícula</th>
                                <th className="p-2 border-r border-b">Nome</th>
                                <th className="p-2 border-r border-b">Função</th>
                                <th className="p-2 border-r border-b">Data</th>
                                <th className="p-2 border-b">Hora</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matrix.equipe.map(membro => (
                                <tr key={membro.funcionarioId} className="border-b last:border-b-0">
                                    <td className="p-2">{getFuncionarioMatricula(membro.funcionarioId)}</td>
                                    <td className="p-2">{membro.nome}</td>
                                    <td className="p-2">{membro.funcao}</td>
                                    <td className="p-2">{membro.data}</td>
                                    <td className="p-2">{membro.hora}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


// --- Lockout Matrix Form Component ---

const initialMatrizBloqueioState: Omit<MatrizBloqueio, 'id'> = {
  empresa: 'Vale',
  tarefaExecutada: '',
  gerencia: 'GER MANUT EQUIP TRANSPORTE - BENTO MOREIRA DA SILVA',
  codigoArt: '',
  localAtividade: '',
  dataEmissao: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (UTC-3)',
  om: '',
  tag: '',
  areas: {
    roda: false,
    direcao: false,
    bascula: false,
    geral: false,
  },
  energias: {
    eletrica: false,
    mecanica: false,
    hidraulica: false,
    pneumatica: false,
    termica: false,
    quimica: false,
    gravitacional: false,
    residual: false,
  },
  testeEfetividade: null,
  equipe: [],
};

export const LockoutMatrixForm: React.FC<{
  funcionarios: Funcionario[];
  savedData: MatrizBloqueio[];
  setSavedData: React.Dispatch<React.SetStateAction<MatrizBloqueio[]>>;
  editingId: string | null;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  setPage: (page: Page) => void;
}> = ({ funcionarios, savedData, setSavedData, editingId, setEditingId, setPage }) => {
    // Fix: Updated formState type to allow 'id' property when editing
    const [formState, setFormState] = useState<MatrizBloqueio | Omit<MatrizBloqueio, 'id'>>(initialMatrizBloqueioState);
    const pdfRef = useRef<HTMLDivElement>(null);
    const [showViewModal, setShowViewModal] = useState(false); // State for the view modal
    const [selectedMatrizBloqueioToView, setSelectedMatrizBloqueioToView] = useState<MatrizBloqueio | null>(null); // State for the selected matrix to view

    // Update dataEmissao on component mount
    useEffect(() => {
        if (editingId) {
            const matrixToEdit = savedData.find(m => m.id === editingId);
            if (matrixToEdit) {
                setFormState(matrixToEdit);
            }
        } else {
            setFormState(prev => ({
                ...prev,
                dataEmissao: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (UTC-3)'
            }));
        }
    }, [editingId, savedData]);

    const handleSave = () => {
        if (!formState.tarefaExecutada || !formState.codigoArt || !formState.om || !formState.tag) {
            alert('Por favor, preencha a Tarefa, Código ART, OM e TAG.');
            return;
        }

        if (editingId) {
            setSavedData(savedData.map(matrix => matrix.id === editingId ? { ...formState, id: editingId } : matrix));
        } else {
            setSavedData([...savedData, { ...formState, id: Date.now().toString() }]);
        }
        setFormState(initialMatrizBloqueioState);
        setEditingId(null);
    };
    
    const handleEdit = (matrix: MatrizBloqueio) => {
        setEditingId(matrix.id);
        setFormState(matrix);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir esta Matriz de Bloqueio?")) {
            setSavedData(savedData.filter(matrix => matrix.id !== id));
            if (editingId === id) { // If deleting the one currently being edited
                setEditingId(null);
                setFormState(initialMatrizBloqueioState);
            }
        }
    };

    // New: Handle View for Lockout Matrix
    const handleView = (matrix: MatrizBloqueio) => {
        setSelectedMatrizBloqueioToView(matrix);
        setShowViewModal(true);
    };

    // Fix: Ensure currentMatrix always has an 'id' when passed to setEditingId
    const handleDownloadPdf = (matrixToPrint?: MatrizBloqueio) => {
        const matrixContentToRender = matrixToPrint ? matrixToPrint : formState;

        const originalState = { ...formState };
        const originalEditingId = editingId;

        setFormState(matrixContentToRender);
        setEditingId(matrixToPrint ? matrixToPrint.id : null);

        setTimeout(() => {
            const input = pdfRef.current;
            if (input) {
                const noPrintElements = input.querySelectorAll('.no-print');
                noPrintElements.forEach(el => (el as HTMLElement).style.visibility = 'hidden');

                html2canvas(input, { scale: 2 }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();

                    const imgHeight = canvas.height * pdfWidth / canvas.width;
                    let heightLeft = imgHeight;
                    let position = 0;

                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                    heightLeft -= pdfHeight;

                    while (heightLeft >= -10) { // Add tolerance for small remaining height
                        position = heightLeft - imgHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                        heightLeft -= pdfHeight;
                    }
                    
                    const pdfDataUri = pdf.output('datauristring'); // Get PDF as data URI
                    window.open(pdfDataUri, '_blank'); // Open in new tab for preview
                    
                    noPrintElements.forEach(el => (el as HTMLElement).style.visibility = 'visible');
                    // Restore original state
                    setFormState(originalState);
                    setEditingId(originalEditingId);
                });
            }
        }, 100);
    };

    const handleAreaChange = (area: keyof MatrizBloqueio['areas']) => {
        setFormState(prev => ({
            ...prev,
            areas: {
                ...prev.areas,
                [area]: !prev.areas[area],
            },
        }));
    };

    const handleEnergiaChange = (energia: keyof MatrizBloqueio['energias']) => {
        setFormState(prev => ({
            ...prev,
            energias: {
                ...prev.energias,
                [energia]: !prev.energias[energia],
            },
        }));
    };

    const handleTesteEfetividadeChange = (value: 'sim' | 'nao') => {
        setFormState(prev => ({
            ...prev,
            testeEfetividade: value,
        }));
    };

    return (
        <div>
            <div ref={pdfRef} className="p-4 bg-white shadow-lg rounded-xl text-gray-800">
                <Card>
                    <div className="text-center mb-4">
                        <h1 className="text-2xl font-bold">MATRIZ DE BLOQUEIO</h1>
                        <p>Empresa: <span className="font-normal">{formState.empresa}</span></p>
                    </div>

                    {/* Header fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="border border-gray-300 p-1">
                            <label className="font-semibold block">Tarefa a ser executada</label>
                            <textarea
                                value={formState.tarefaExecutada}
                                onChange={e => setFormState({...formState, tarefaExecutada: e.target.value})}
                                className="w-full text-xs h-10 resize-none border-none focus:ring-0 p-0"
                                placeholder="Descreva a tarefa..."
                            />
                        </div>
                        <div className="border border-gray-300 p-1">
                            <label className="font-semibold block">Gerência</label>
                            <input
                                type="text"
                                value={formState.gerencia}
                                onChange={e => setFormState({...formState, gerencia: e.target.value})}
                                className="w-full text-xs border-none focus:ring-0 p-0"
                            />
                        </div>
                        <div className="border border-gray-300 p-1">
                            <label className="font-semibold block">Código da ART:</label>
                            <input
                                type="text"
                                value={formState.codigoArt}
                                onChange={e => setFormState({...formState, codigoArt: e.target.value})}
                                className="w-full text-xs border-none focus:ring-0 p-0"
                            />
                        </div>
                        <div className="border border-gray-300 p-1">
                            <label className="font-semibold block">Local da Atividade</label>
                            <input
                                type="text"
                                value={formState.localAtividade}
                                onChange={e => setFormState({...formState, localAtividade: e.target.value})}
                                className="w-full text-xs border-none focus:ring-0 p-0"
                            />
                        </div>
                        <div className="border border-gray-300 p-1">
                            <label className="font-semibold block">OM</label>
                            <input
                                type="text"
                                value={formState.om}
                                onChange={e => setFormState({...formState, om: e.target.value})}
                                className="w-full text-xs border-none focus:ring-0 p-0"
                            />
                        </div>
                        <div className="border border-gray-300 p-1">
                            <label className="font-semibold block">TAG</label>
                            <input
                                type="text"
                                value={formState.tag}
                                onChange={e => setFormState({...formState, tag: e.target.value})}
                                className="w-full text-xs border-none focus:ring-0 p-0"
                            />
                        </div>
                        <div className="border border-gray-300 p-1 col-span-1">
                            <label className="font-semibold block">Data Emissão</label>
                            <span className="block text-xs">{formState.dataEmissao}</span>
                        </div>
                    </div>

                    <SectionTitle className="mt-6">Seleção de Área</SectionTitle>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={formState.areas.roda} onChange={() => handleAreaChange('roda')} className="h-4 w-4"/> Roda
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={formState.areas.direcao} onChange={() => handleAreaChange('direcao')} className="h-4 w-4"/> Direção
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={formState.areas.bascula} onChange={() => handleAreaChange('bascula')} className="h-4 w-4"/> Bascula
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={formState.areas.geral} onChange={() => handleAreaChange('geral')} className="h-4 w-4"/> Geral
                        </label>
                    </div>

                    <SectionTitle>Energias a Bloquear</SectionTitle>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={formState.energias.eletrica} onChange={() => handleEnergiaChange('eletrica')} className="h-4 w-4"/> Energia Elétrica
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={formState.energias.mecanica} onChange={() => handleEnergiaChange('mecanica')} className="h-4 w-4"/> Energia Mecânica
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={formState.energias.hidraulica} onChange={() => handleEnergiaChange('hidraulica')} className="h-4 w-4"/> Energia Hidráulica
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={formState.energias.pneumatica} onChange={() => handleEnergiaChange('pneumatica')} className="h-4 w-4"/> Energia Pneumática
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={formState.energias.termica} onChange={() => handleEnergiaChange('termica')} className="h-4 w-4"/> Energia Térmica
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={formState.energias.quimica} onChange={() => handleEnergiaChange('quimica')} className="h-4 w-4"/> Energia Química
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={formState.energias.gravitacional} onChange={() => handleEnergiaChange('gravitacional')} className="h-4 w-4"/> Energia Gravitacional
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={formState.energias.residual} onChange={() => handleEnergiaChange('residual')} className="h-4 w-4"/> Energia Residual
                        </label>
                    </div>

                    <SectionTitle>Teste de Efetividade</SectionTitle>
                    <p className="mb-2">Foi realizado teste de efetividade?</p>
                    <div className="flex gap-4 mb-6">
                        <label className="flex items-center gap-2">
                            <input type="radio" name="testeEfetividade" value="sim" checked={formState.testeEfetividade === 'sim'} onChange={() => handleTesteEfetividadeChange('sim')} className="h-4 w-4"/> Sim
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="radio" name="testeEfetividade" value="nao" checked={formState.testeEfetividade === 'nao'} onChange={() => handleTesteEfetividadeChange('nao')} className="h-4 w-4"/> Não
                        </label>
                    </div>

                    <SectionTitle>Equipe Responsável</SectionTitle>
                    <SignatureSection funcionarios={funcionarios} equipe={formState.equipe} setEquipe={(equipe) => setFormState({...formState, equipe})} minRows={5}/>
                    
                    <div className="flex justify-end mt-8 gap-4 no-print">
                        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white"><PlusIcon/>{editingId ? "Atualizar Matriz" : "Salvar Matriz"}</Button>
                    </div>
                </Card>
            </div>

            <Card className="mt-8">
                <SectionTitle>Matrizes de Bloqueio Salvas</SectionTitle>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">OM</th>
                                <th className="p-2">TAG</th>
                                <th className="p-2">Data Emissão</th>
                                <th className="p-2">Equipe</th>
                                <th className="p-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {savedData.map(matrix => (
                                <tr key={matrix.id} className="border-b">
                                    <td className="p-2">{matrix.om}</td>
                                    <td className="p-2">{matrix.tag}</td>
                                    <td className="p-2">{matrix.dataEmissao.split(' ')[0]}</td>
                                    <td className="p-2">{matrix.equipe.map(e => e.nome).join(', ')}</td>
                                    <td className="p-2 flex gap-2">
                                        <button onClick={() => handleView(matrix)} className="text-gray-600"><EyeIcon /></button>
                                        <button onClick={() => handleEdit(matrix)} className="text-blue-500"><EditIcon /></button>
                                        <button onClick={() => handleDelete(matrix.id)} className="text-red-500"><TrashIcon /></button>
                                        <button onClick={() => handleDownloadPdf(matrix)} className="text-gray-600"><DownloadIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            {showViewModal && selectedMatrizBloqueioToView && (
                <LockoutMatrixViewModal
                    matrix={selectedMatrizBloqueioToView}
                    funcionarios={funcionarios}
                    onClose={() => setShowViewModal(false)}
                />
            )}
        </div>
    );
};

// --- CHECKLIST View Modal Component ---
export const ChecklistViewModal: React.FC<{
    checklist: Checklist;
    funcionarios: Funcionario[];
    onClose: () => void;
}> = ({ checklist, funcionarios, onClose }) => {
    // Helper to get funcionario matricula
    const getFuncionarioMatricula = (funcionarioId: string) => {
        return funcionarios.find(f => f.id === funcionarioId)?.matricula || 'N/A';
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative p-6">
                <h2 className="text-2xl font-bold mb-4 border-b pb-2">Detalhes do Check List de Pós-Manutenção</h2>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div><strong>Empresa:</strong> VALE</div>
                    <div><strong>Ativo:</strong> {checklist.ativo}</div>
                    <div><strong>OM:</strong> {checklist.om}</div>
                    <div><strong>Data:</strong> {checklist.data}</div>
                    <div><strong>Hora:</strong> {checklist.hora || 'N/A'}</div>
                    <div className="col-span-2">
                        <strong>Técnico do Turno Manutenção:</strong> {checklist.tecnicoAssinatura?.nome || 'N/A'} ({checklist.tecnicoAssinatura?.matricula || 'N/A'})
                    </div>
                </div>

                <h3 className="text-lg font-bold mt-4 mb-2">Itens de Verificação</h3>
                <div className="overflow-x-auto border rounded-md bg-gray-50 mb-4">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border-r border-b">Item</th>
                                <th className="p-2 border-r border-b">Sistema</th>
                                <th className="p-2 border-r border-b">Descrição</th>
                                <th className="p-2 border-r border-b">Atende</th>
                                <th className="p-2 border-r border-b">Observação</th>
                                <th className="p-2 border-b">Conforme</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CHECKLIST_ITEMS_DATA.map(item => {
                                const checklistItem = checklist.itens[item.itemId];
                                return (
                                    <tr key={item.itemId} className="border-b last:border-b-0">
                                        <td className="p-2">{item.itemId}</td>
                                        <td className="p-2">{item.system}</td>
                                        <td className="p-2">{item.description}</td>
                                        <td className="p-2">{checklistItem?.atende === 'sim' ? 'Sim' : checklistItem?.atende === 'nao' ? 'Não' : 'N/A'}</td>
                                        <td className="p-2">{checklistItem?.observacao || 'N/A'}</td>
                                        <td className="p-2">{checklistItem?.conforme === 'sim' ? 'Sim' : checklistItem?.conforme === 'nao' ? 'Não' : 'N/A'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


// --- CHECKLIST Form Component ---
const CHECKLIST_ITEMS_DATA = [
  { itemId: 1, system: 'MOTOR', description: 'Nível de óleo do motor', },
  { itemId: 2, system: 'MOTOR', description: 'Vazamento de óleo no motor', },
  { itemId: 3, system: 'MOTOR', description: 'Ruído anormal no motor', },
  { itemId: 4, system: 'MOTOR', description: 'Sistema de arrefecimento (nível/vazamento)', },
  { itemId: 5, system: 'MOTOR', description: 'Filtro de ar', },
  { itemId: 6, system: 'TRANSMISSÃO', description: 'Nível de óleo da transmissão', },
  { itemId: 7, system: 'TRANSMISSÃO', description: 'Vazamento de óleo na transmissão', },
  { itemId: 8, system: 'TRANSMISSÃO', description: 'Engate de marchas', },
  { itemId: 9, system: 'FREIOS', description: 'Pastilhas/lonas de freio', },
  { itemId: 10, system: 'FREIOS', description: 'Nível de fluído de freio', },
  { itemId: 11, system: 'FREIOS', description: 'Funcionamento do freio de estacionamento', },
  { itemId: 12, system: 'HIDRÁULICO', description: 'Nível de óleo hidráulico', },
  { itemId: 13, system: 'HIDRÁULICO', description: 'Vazamento de mangueiras/cilindros', },
  { itemId: 14, system: 'HIDRÁULICO', description: 'Funcionamento de comandos', },
  { itemId: 15, system: 'ELÉTRICO', description: 'Bateria e terminais', },
  { itemId: 16, system: 'ELÉTRICO', description: 'Iluminação (faróis, lanternas, setas)', },
  { itemId: 17, system: 'ELÉTRICO', description: 'Alternador/Motor de partida', },
  { itemId: 18, system: 'PNEUS', description: 'Calibragem dos pneus', },
  { itemId: 19, system: 'PNEUS', description: 'Desgaste/condição dos pneus', },
  { itemId: 20, system: 'CHASSI/ESTRUTURA', description: 'Trincas/rachaduras no chassi', },
  { itemId: 21, system: 'CHASSI/ESTRUTURA', description: 'Parafusos/fixações', },
  { itemId: 22, system: 'CABINE', description: 'Limpeza e organização da cabine', },
  { itemId: 23, system: 'CABINE', description: 'Assento do operador', },
  { itemId: 24, system: 'CABINE', description: 'Espelhos retrovisores', },
  { itemId: 25, system: 'SEGURANÇA', description: 'Extintor de incêndio (validade/pressão)', },
  { itemId: 26, system: 'SEGURANÇA', description: 'Cinto de segurança', },
  { itemId: 27, system: 'SEGURANÇA', description: 'Alarme de ré', },
  { itemId: 28, system: 'SISTEMA DE LUBRIFICAÇÃO', description: 'Pontos de lubrificação', },
  { itemId: 29, system: 'SISTEMA DE LUBRIFICAÇÃO', description: 'Graxa/óleo', },
  { itemId: 30, system: 'DIREÇÃO', description: 'Folga no sistema de direção', },
  { itemId: 31, system: 'DIREÇÃO', description: 'Vazamento na direção hidráulica', },
  { itemId: 32, system: 'SUSPENSÃO', description: 'Condição das molas/amortecedores', },
  { itemId: 33, system: 'SUSPENSÃO', description: 'Buchas/pinos', },
  { itemId: 34, system: 'OUTROS', description: 'Outros itens de verificação (especificar)', },
];

const initialChecklistState: Omit<Checklist, 'id'> = {
  ativo: '',
  om: '',
  data: new Date().toLocaleDateString('pt-BR'),
  hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), // Initialize hora
  itens: CHECKLIST_ITEMS_DATA.reduce((acc, item) => ({
    ...acc,
    [item.itemId]: {
      itemId: item.itemId,
      system: item.system,
      description: item.description,
      atende: null,
      observacao: '',
      conforme: null,
    }
  }), {} as { [key: number]: ChecklistItemDetails }),
  tecnicoAssinatura: null,
};

export const ChecklistForm: React.FC<{
  funcionarios: Funcionario[];
  savedChecklists: Checklist[];
  setSavedChecklists: React.Dispatch<React.SetStateAction<Checklist[]>>;
  editingId: string | null;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  setPage: (page: Page) => void;
}> = ({ funcionarios, savedChecklists, setSavedChecklists, editingId, setEditingId, setPage }) => {
    const [formState, setFormState] = useState<Checklist | Omit<Checklist, 'id'>>(initialChecklistState);
    const pdfRef = useRef<HTMLDivElement>(null);
    const [showViewModal, setShowViewModal] = useState(false); // State for the view modal
    const [selectedChecklistToView, setSelectedChecklistToView] = useState<Checklist | null>(null); // State for the selected checklist to view


    useEffect(() => {
        if (editingId) {
            const checklistToEdit = savedChecklists.find(c => c.id === editingId);
            if (checklistToEdit) {
                setFormState(checklistToEdit);
            }
        } else {
            setFormState(prev => ({
                ...prev,
                data: new Date().toLocaleDateString('pt-BR'),
                hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                // Ensure all items are present and initialized, even if coming from a loaded checklist
                itens: CHECKLIST_ITEMS_DATA.reduce((acc, item) => ({
                    ...acc,
                    [item.itemId]: {
                        itemId: item.itemId,
                        system: item.system,
                        description: item.description,
                        atende: prev.itens[item.itemId]?.atende || null,
                        observacao: prev.itens[item.itemId]?.observacao || '',
                        conforme: prev.itens[item.itemId]?.conforme || null,
                    }
                }), {} as { [key: number]: ChecklistItemDetails }),
            }));
        }
    }, [editingId, savedChecklists]);

    const handleSave = () => {
        if (!formState.ativo || !formState.om || !formState.tecnicoAssinatura) {
            alert('Por favor, preencha Ativo, OM e selecione o Técnico do Turno Manutenção.');
            return;
        }

        if (editingId) {
            setSavedChecklists(savedChecklists.map(c => c.id === editingId ? { ...formState, id: editingId } : c));
        } else {
            setSavedChecklists([...savedChecklists, { ...formState, id: Date.now().toString() }]);
        }
        setFormState(initialChecklistState);
        setEditingId(null);
    };

    const handleEdit = (checklist: Checklist) => {
        setEditingId(checklist.id);
        setFormState(checklist);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir este Check List?")) {
            setSavedChecklists(savedChecklists.filter(c => c.id !== id));
            if (editingId === id) {
                setEditingId(null);
                setFormState(initialChecklistState);
            }
        }
    };

    const handleItemChange = (itemId: number, field: keyof ChecklistItemDetails, value: any) => {
        setFormState(prev => ({
            ...prev,
            itens: {
                ...prev.itens,
                [itemId]: {
                    ...prev.itens[itemId],
                    [field]: value
                }
            }
        }));
    };

    const handleTecnicoChange = (funcionarioId: string) => {
        const func = funcionarios.find(f => f.id === funcionarioId);
        if (func) {
            setFormState(prev => ({
                ...prev,
                tecnicoAssinatura: {
                    funcionarioId: func.id,
                    nome: func.nome,
                    matricula: func.matricula,
                }
            }));
        } else {
            setFormState(prev => ({ ...prev, tecnicoAssinatura: null }));
        }
    };

    // New: Handle View for Checklist
    const handleView = (checklist: Checklist) => {
        setSelectedChecklistToView(checklist);
        setShowViewModal(true);
    };

    const handleDownloadPdf = (checklistToPrint?: Checklist) => {
        const checklistContentToRender = checklistToPrint ? checklistToPrint : formState;

        const originalState = { ...formState };
        // Fix: Use the prop `editingId` which is correctly destructured.
        const originalEditingId = editingId;

        setFormState(checklistContentToRender);
        setEditingId(checklistToPrint ? checklistToPrint.id : null);

        setTimeout(() => {
            const input = pdfRef.current;
            if (input) {
                const noPrintElements = input.querySelectorAll('.no-print');
                noPrintElements.forEach(el => (el as HTMLElement).style.visibility = 'hidden');

                html2canvas(input, { scale: 2 }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();

                    const imgHeight = canvas.height * pdfWidth / canvas.width;
                    let heightLeft = imgHeight;
                    let position = 0;

                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                    heightLeft -= pdfHeight;

                    while (heightLeft >= -10) {
                        position = heightLeft - imgHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                        heightLeft -= pdfHeight;
                    }
                    
                    const pdfDataUri = pdf.output('datauristring');
                    window.open(pdfDataUri, '_blank');
                    
                    noPrintElements.forEach(el => (el as HTMLElement).style.visibility = 'visible');
                    setFormState(originalState);
                    setEditingId(originalEditingId);
                });
            }
        }, 100);
    };

    return (
        <div>
            <div ref={pdfRef} className="p-4 bg-white shadow-lg rounded-xl text-gray-800">
                <Card>
                    <div className="text-center mb-4">
                        <h1 className="text-2xl font-bold">CHECK LIST DE PÓS-MANUTENÇÃO</h1>
                        <p>Empresa: VALE</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                        <div className="border border-gray-300 p-1">
                            <label className="font-semibold block">Ativo</label>
                            <input
                                type="text"
                                value={formState.ativo}
                                onChange={e => setFormState({...formState, ativo: e.target.value})}
                                className="w-full text-xs border-none focus:ring-0 p-0"
                                placeholder="Nome do Ativo"
                            />
                        </div>
                        <div className="border border-gray-300 p-1">
                            <label className="font-semibold block">OM</label>
                            <input
                                type="text"
                                value={formState.om}
                                onChange={e => setFormState({...formState, om: e.target.value})}
                                className="w-full text-xs border-none focus:ring-0 p-0"
                                placeholder="Número da OM"
                            />
                        </div>
                        <div className="border border-gray-300 p-1">
                            <label className="font-semibold block">Data</label>
                            <span className="block text-xs">{formState.data}</span>
                        </div>
                        <div className="border border-gray-300 p-1">
                            <label className="font-semibold block">Hora</label>
                            <input
                                type="time"
                                value={formState.hora}
                                onChange={e => setFormState({...formState, hora: e.target.value})}
                                className="w-full text-xs border-none focus:ring-0 p-0"
                            />
                        </div>
                    </div>

                    <SectionTitle className="mt-6">Itens de Verificação</SectionTitle>
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full text-left border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-1 border-r border-b w-10 text-xs text-center">Item</th>
                                    <th className="p-1 border-r border-b w-24 text-xs">Sistema</th>
                                    <th className="p-1 border-r border-b text-xs">Descrição</th>
                                    <th className="p-1 border-r border-b w-16 text-xs text-center">Atende</th>
                                    <th className="p-1 border-r border-b w-32 text-xs">Observação</th>
                                    <th className="p-1 border-b w-16 text-xs text-center">Conforme</th>
                                </tr>
                            </thead>
                            <tbody>
                                {CHECKLIST_ITEMS_DATA.map(item => (
                                    <tr key={item.itemId} className="border-b">
                                        <td className="p-1 border-r text-xs text-center">{item.itemId}</td>
                                        <td className="p-1 border-r text-xs">{item.system}</td>
                                        <td className="p-1 border-r text-xs">{item.description}</td>
                                        <td className="p-1 border-r text-xs text-center">
                                            <select
                                                value={formState.itens[item.itemId]?.atende === 'sim' ? 'sim' : formState.itens[item.itemId]?.atende === 'nao' ? 'nao' : ''}
                                                onChange={e => handleItemChange(item.itemId, 'atende', e.target.value === 'sim' ? 'sim' : e.target.value === 'nao' ? 'nao' : null)}
                                                className="w-full p-0 text-xs border-none focus:ring-0 bg-transparent"
                                            >
                                                <option value="">N/A</option>
                                                <option value="sim">Sim</option>
                                                <option value="nao">Não</option>
                                            </select>
                                        </td>
                                        <td className="p-1 border-r">
                                            <input
                                                type="text"
                                                value={formState.itens[item.itemId]?.observacao || ''}
                                                onChange={e => handleItemChange(item.itemId, 'observacao', e.target.value)}
                                                className="w-full p-0 text-xs border-none focus:ring-0"
                                                placeholder="Observação"
                                            />
                                        </td>
                                        <td className="p-1 text-xs text-center">
                                            <select
                                                value={formState.itens[item.itemId]?.conforme === 'sim' ? 'sim' : formState.itens[item.itemId]?.conforme === 'nao' ? 'nao' : ''}
                                                onChange={e => handleItemChange(item.itemId, 'conforme', e.target.value === 'sim' ? 'sim' : e.target.value === 'nao' ? 'nao' : null)}
                                                className="w-full p-0 text-xs border-none focus:ring-0 bg-transparent"
                                            >
                                                <option value="">N/A</option>
                                                <option value="sim">Sim</option>
                                                <option value="nao">Não</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <SectionTitle>Técnico do Turno Manutenção</SectionTitle>
                    <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
                        <div className="flex-grow w-full">
                            <label className="block text-sm font-medium text-gray-700">Selecionar Técnico</label>
                            <select
                                value={formState.tecnicoAssinatura?.funcionarioId || ''}
                                onChange={e => handleTecnicoChange(e.target.value)}
                                className="p-2 border rounded-lg w-full"
                            >
                                <option value="">Selecione...</option>
                                {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome} ({f.matricula})</option>)}
                            </select>
                        </div>
                        {formState.tecnicoAssinatura && (
                            <div className="flex-grow w-full text-sm">
                                <p><strong>Nome:</strong> {formState.tecnicoAssinatura.nome}</p>
                                <p><strong>Matrícula:</strong> {formState.tecnicoAssinatura.matricula}</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end mt-8 gap-4 no-print">
                        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white"><PlusIcon/>{editingId ? "Atualizar Check List" : "Salvar Check List"}</Button>
                    </div>
                </Card>
            </div>

            <Card className="mt-8">
                <SectionTitle>Check Lists Salvos</SectionTitle>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">Ativo</th>
                                <th className="p-2">OM</th>
                                <th className="p-2">Data</th>
                                <th className="p-2">Hora</th> {/* New header for Hora */}
                                <th className="p-2">Técnico</th>
                                <th className="p-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {savedChecklists.map(checklist => (
                                <tr key={checklist.id} className={`border-b ${editingId === checklist.id ? 'bg-yellow-100 border-yellow-500 ring-2 ring-yellow-300' : ''}`}>
                                    <td className="p-2">{checklist.ativo}</td>
                                    <td className="p-2">{checklist.om}</td>
                                    <td className="p-2">{checklist.data}</td>
                                    <td className="p-2">{checklist.hora || 'N/A'}</td> {/* Display hora */}
                                    <td className="p-2">{checklist.tecnicoAssinatura?.nome || 'N/A'}</td>
                                    <td className="p-2 flex gap-2">
                                        <button onClick={() => handleView(checklist)} className="text-gray-600"><EyeIcon /></button>
                                        <button onClick={() => handleEdit(checklist)} className="text-blue-500"><EditIcon /></button>
                                        <button onClick={() => handleDelete(checklist.id)} className="text-red-500"><TrashIcon /></button>
                                        <button onClick={() => handleDownloadPdf(checklist)} className="text-gray-600"><DownloadIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            {showViewModal && selectedChecklistToView && (
                <ChecklistViewModal
                    checklist={selectedChecklistToView}
                    funcionarios={funcionarios}
                    onClose={() => setShowViewModal(false)}
                />
            )}
        </div>
    );
};

// --- Document Management Component ---
export const DocumentManagement: React.FC<{
    artEmergenciais: ArtEmergencial[];
    setArtEmergenciais: React.Dispatch<React.SetStateAction<ArtEmergencial[]>>;
    artAtividades: ArtAtividade[];
    setArtAtividades: React.Dispatch<React.SetStateAction<ArtAtividade[]>>;
    checklists: Checklist[];
    setChecklists: React.Dispatch<React.SetStateAction<Checklist[]>>;
    matrizesBloqueio: MatrizBloqueio[];
    setMatrizesBloqueio: React.Dispatch<React.SetStateAction<MatrizBloqueio[]>>;
    setPage: (page: Page) => void;
    setEditingArtEmergencialId: React.Dispatch<React.SetStateAction<string | null>>;
    setEditingArtAtividadeId: React.Dispatch<React.SetStateAction<string | null>>;
    setEditingChecklistId: React.Dispatch<React.SetStateAction<string | null>>;
    setEditingMatrizBloqueioId: React.Dispatch<React.SetStateAction<string | null>>;
    funcionarios: Funcionario[]; // For ArtEmergencialViewModal
    arts: ART[]; // For ArtAtividadeForm
    editingArtEmergencialId: string | null; // Read-only current editing state
    editingArtAtividadeId: string | null;   // Read-only current editing state
    editingChecklistId: string | null;         // Read-only current editing state
    editingMatrizBloqueioId: string | null; // Read-only current editing state
}> = ({
    artEmergenciais, setArtEmergenciais,
    artAtividades, setArtAtividades,
    checklists, setChecklists,
    matrizesBloqueio, setMatrizesBloqueio,
    setPage,
    setEditingArtEmergencialId,
    setEditingArtAtividadeId,
    setEditingChecklistId,
    setEditingMatrizBloqueioId,
    funcionarios,
    arts,
    editingArtEmergencialId,
    editingArtAtividadeId,
    editingChecklistId,
    editingMatrizBloqueioId,
}) => {
    const [showArtEmergencialViewModal, setShowArtEmergencialViewModal] = useState(false);
    const [selectedArtEmergencialToView, setSelectedArtEmergencialToView] = useState<ArtEmergencial | null>(null);
    const [isExporting, setIsExporting] = useState(false); // New state for export loading

    // Dynamic rendering refs for PDF generation
    // Fix: Added ref for ArtEmergencialForm
    const artEmergencialPdfRef = useRef<HTMLDivElement>(null); 
    const artAtividadePdfRef = useRef<HTMLDivElement>(null);
    const checklistPdfRef = useRef<HTMLDivElement>(null);
    const matrizBloqueioPdfRef = useRef<HTMLDivElement>(null);

    const checkExistingEdit = (currentEditingId: string | null, newDocumentId: string, docType: string): boolean => {
        if (currentEditingId && currentEditingId !== newDocumentId) {
            alert(`Você já está editando/visualizando um(a) ${docType}. Por favor, salve ou cancele antes de abrir outro(a) do mesmo tipo.`);
            return true;
        }
        return false;
    };


    const handleViewArtEmergencial = (art: ArtEmergencial) => {
        setSelectedArtEmergencialToView(art);
        setShowArtEmergencialViewModal(true);
    };

    const handleEditDocument = (docId: string, docType: Page) => {
        switch (docType) {
            case 'art-emergencial':
                if (checkExistingEdit(editingArtEmergencialId, docId, 'ART Emergencial')) return;
                setEditingArtEmergencialId(docId);
                setPage('art-emergencial');
                break;
            case 'art-atividade':
                if (checkExistingEdit(editingArtAtividadeId, docId, 'ART da Atividade')) return;
                setEditingArtAtividadeId(docId);
                setPage('art-atividade');
                break;
            case 'check-list':
                if (checkExistingEdit(editingChecklistId, docId, 'Checklist')) return;
                setEditingChecklistId(docId);
                setPage('check-list');
                break;
            case 'matriz-de-bloqueio':
                if (checkExistingEdit(editingMatrizBloqueioId, docId, 'Matriz de Bloqueio')) return;
                setEditingMatrizBloqueioId(docId);
                setPage('matriz-de-bloqueio');
                break;
        }
    };

    const handleDeleteArtEmergencial = (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir esta ART Emergencial?")) {
            setArtEmergenciais(artEmergenciais.filter(art => art.id !== id));
            if (editingArtEmergencialId === id) setEditingArtEmergencialId(null);
        }
    };

    const handleDeleteArtAtividade = (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir esta ART da Atividade?")) {
            setArtAtividades(artAtividades.filter(art => art.id !== id));
            if (editingArtAtividadeId === id) setEditingArtAtividadeId(null);
        }
    };

    const handleDeleteChecklist = (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir este Checklist?")) {
            setChecklists(checklists.filter(c => c.id !== id));
            if (editingChecklistId === id) setEditingChecklistId(null);
        }
    };

    const handleDeleteMatrizBloqueio = (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir esta Matriz de Bloqueio?")) {
            setMatrizesBloqueio(matrizesBloqueio.filter(m => m.id !== id));
            if (editingMatrizBloqueioId === id) setEditingMatrizBloqueioId(null);
        }
    };
    
    // Generic PDF generation handler for any component
    const generatePdfFromComponent = async (
        Component: React.FC<any> | React.ForwardRefExoticComponent<any>, // Accept forwardRef components
        props: any,
        pdfRef: React.RefObject<HTMLDivElement>
    ) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Por favor, permita pop-ups para visualizar o PDF.');
            return;
        }

        const tempDiv = printWindow.document.createElement('div');
        printWindow.document.body.appendChild(tempDiv);

        // Dynamically render the component into the new window's document
        const root = ReactDOM.createRoot(tempDiv);
        root.render(React.createElement(Component, { ...props, ref: pdfRef }));

        // Wait for component to render and react to prop changes
        await new Promise(resolve => setTimeout(resolve, 500)); 

        const input = printWindow.document.body; // Use the body of the new window
        if (input) {
            const noPrintElements = input.querySelectorAll('.no-print');
            noPrintElements.forEach(el => (el as HTMLElement).style.visibility = 'hidden');

            html2canvas(input, { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                const imgHeight = canvas.height * pdfWidth / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;

                while (heightLeft >= -10) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                    heightLeft -= pdfHeight;
                }
                
                const pdfDataUri = pdf.output('datauristring');
                printWindow.location.href = pdfDataUri; // Load PDF in the new window
                
                noPrintElements.forEach(el => (el as HTMLElement).style.visibility = 'visible');
                root.unmount(); // Clean up React root
            }).catch(error => {
                console.error("Erro ao gerar PDF:", error);
                alert("Erro ao gerar PDF. Verifique o console para mais detalhes.");
                printWindow.close();
            });
        }
    };

    // Callback functions for PDF download (passed to children components for internal use)
    // Fix: Added handleDownloadArtEmergencialPdf
    const handleDownloadArtEmergencialPdf = useCallback((artToPrint: ArtEmergencial) => {
        generatePdfFromComponent(
            ArtEmergencialForm,
            {
                funcionarios: funcionarios,
                savedArts: [artToPrint],
                setSavedArts: ((_value: any) => {}) as React.Dispatch<React.SetStateAction<ArtEmergencial[]>>, // Dummy setter
                editingId: artToPrint.id,
                setEditingId: ((_value: any) => {}) as React.Dispatch<React.SetStateAction<string | null>>, // Dummy setter
                setPage: () => {}, // Dummy setter
            },
            artEmergencialPdfRef
        );
    }, [funcionarios]);

    const handleDownloadArtAtividadePdf = useCallback((artToPrint: ArtAtividade) => {
        // Here we need to render ArtAtividadeForm temporarily to generate its PDF.
        // We'll pass dummy setters as they won't be used during PDF generation.
        generatePdfFromComponent(
            ArtAtividadeForm,
            {
                funcionarios: funcionarios,
                arts: arts,
                savedData: [artToPrint], // Pass only the document to be printed
                // Fix: Corrected type assertion syntax for dummy functions.
                setSavedData: ((_value: any) => {}) as React.Dispatch<React.SetStateAction<ArtAtividade[]>>, // Dummy setter
                editingId: artToPrint.id, // Set editingId for the component to pick up
                // Fix: Corrected type assertion syntax for dummy functions.
                setEditingId: ((_value: any) => {}) as React.Dispatch<React.SetStateAction<string | null>>, // Dummy setter
                setPage: () => {}, // Dummy setter
            },
            artAtividadePdfRef // Pass ref for the component to attach to
        );
    }, [funcionarios, arts]);

    const handleDownloadChecklistPdf = useCallback((checklistToPrint: Checklist) => {
        generatePdfFromComponent(
            ChecklistForm,
            {
                funcionarios: funcionarios,
                savedChecklists: [checklistToPrint],
                // Fix: Corrected type assertion syntax for dummy functions.
                setSavedChecklists: ((_value: any) => {}) as React.Dispatch<React.SetStateAction<Checklist[]>>,
                editingId: checklistToPrint.id,
                // Fix: Corrected type assertion syntax for dummy functions.
                setEditingId: ((_value: any) => {}) as React.Dispatch<React.SetStateAction<string | null>>,
                setPage: () => {},
            },
            checklistPdfRef
        );
    }, [funcionarios]);

    const handleDownloadMatrizBloqueioPdf = useCallback((matrizToPrint: MatrizBloqueio) => {
        generatePdfFromComponent(
            LockoutMatrixForm,
            {
                funcionarios: funcionarios,
                savedData: [matrizToPrint],
                // Fix: Corrected type assertion syntax for dummy functions.
                setSavedData: ((_value: any) => {}) as React.Dispatch<React.SetStateAction<MatrizBloqueio[]>>,
                editingId: matrizToPrint.id,
                // Fix: Corrected type assertion syntax for dummy functions.
                setEditingId: ((_value: any) => {}) as React.Dispatch<React.SetStateAction<string | null>>,
                setPage: () => {},
            },
            matrizBloqueioPdfRef
        );
    }, [funcionarios]);

    const handleExportAllDocuments = async () => {
        setIsExporting(true);
        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 2000)); 

        const summary = `Documentos "enviados" para a rede (simulação):\n\n` +
                        `- ARTs Emergenciais: ${artEmergenciais.length}\n` +
                        `- ARTs da Atividade: ${artAtividades.length}\n` +
                        `- Checklists: ${checklists.length}\n` +
                        `- Matrizes de Bloqueio: ${matrizesBloqueio.length}\n\n` +
                        `Em um aplicativo real, esta ação enviaria os dados para um serviço de backend para armazenamento ou processamento.`;

        alert(summary);
        setIsExporting(false);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Gerenciamento de Documentos</h1>

            {/* ARTs Emergenciais */}
            <Card>
                <SectionTitle>ARTs de Campo Emergenciais</SectionTitle>
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="p-2">Data</th>
                                <th className="p-2">Hora</th>
                                <th className="p-2">TAG</th>
                                <th className="p-2">OM</th>
                                <th className="p-2">Equipe</th>
                                <th className="p-2 w-32">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {artEmergenciais.map(art => (
                                <tr key={art.id} className={`border-b ${editingArtEmergencialId === art.id ? 'bg-yellow-100 border-yellow-500 ring-2 ring-yellow-300' : ''}`}>
                                    <td className="p-2 text-sm">{art.data}</td>
                                    <td className="p-2 text-sm">{art.hora}</td>
                                    <td className="p-2 text-sm">{art.tag}</td>
                                    <td className="p-2 text-sm">{art.om}</td>
                                    <td className="p-2 text-sm">{art.equipe.map(e => e.nome).join(', ')}</td>
                                    <td className="p-2 flex gap-2 no-print">
                                        <button onClick={() => handleViewArtEmergencial(art)} className="text-gray-600 hover:text-gray-900"><EyeIcon /></button>
                                        <button onClick={() => handleEditDocument(art.id, 'art-emergencial')} className="text-blue-600 hover:text-blue-800"><EditIcon /></button>
                                        <button onClick={() => handleDeleteArtEmergencial(art.id)} className="text-red-600 hover:text-red-800"><TrashIcon /></button>
                                        {/* Fix: Call the new specific handler for ArtEmergencial */}
                                        <button onClick={() => handleDownloadArtEmergencialPdf(art)} className="text-gray-600 hover:text-gray-900"><DownloadIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* ARTs da Atividade */}
            <Card>
                <SectionTitle>ARTs da Atividade</SectionTitle>
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="p-2">Código ART</th>
                                <th className="p-2">Tarefa</th>
                                <th className="p-2">ART Anexada</th>
                                <th className="p-2">Data Emissão</th>
                                <th className="p-2">Equipe</th>
                                <th className="p-2 w-32">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {artAtividades.map(art => (
                                <tr key={art.id} className={`border-b ${editingArtAtividadeId === art.id ? 'bg-yellow-100 border-yellow-500 ring-2 ring-yellow-300' : ''}`}>
                                    <td className="p-2 text-sm">{art.codigoArt}</td>
                                    <td className="p-2 text-sm truncate max-w-[150px]">{art.tarefaExecutada}</td>
                                    <td className="p-2 text-sm">{art.linkedArtNumero || 'N/A'}</td>
                                    <td className="p-2 text-sm">{art.dataEmissao.split(' ')[0]}</td>
                                    <td className="p-2 text-sm">{art.equipeAssinaturas.map(e => e.nome).join(', ')}</td>
                                    <td className="p-2 flex gap-2 no-print">
                                        <button onClick={() => handleEditDocument(art.id, 'art-atividade')} className="text-gray-600 hover:text-gray-900"><EyeIcon /></button> {/* View also goes to edit page */}
                                        <button onClick={() => handleEditDocument(art.id, 'art-atividade')} className="text-blue-600 hover:text-blue-800"><EditIcon /></button>
                                        <button onClick={() => handleDeleteArtAtividade(art.id)} className="text-red-600 hover:text-red-800"><TrashIcon /></button>
                                        <button onClick={() => handleDownloadArtAtividadePdf(art)} className="text-gray-600 hover:text-gray-900"><DownloadIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Checklists */}
            <Card>
                <SectionTitle>Checklists de Pós-Manutenção</SectionTitle>
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="p-2">Ativo</th>
                                <th className="p-2">OM</th>
                                <th className="p-2">Data</th>
                                <th className="p-2">Hora</th>
                                <th className="p-2">Técnico</th>
                                <th className="p-2 w-32">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {checklists.map(checklist => (
                                <tr key={checklist.id} className={`border-b ${editingChecklistId === checklist.id ? 'bg-yellow-100 border-yellow-500 ring-2 ring-yellow-300' : ''}`}>
                                    <td className="p-2 text-sm">{checklist.ativo}</td>
                                    <td className="p-2 text-sm">{checklist.om}</td>
                                    <td className="p-2 text-sm">{checklist.data}</td>
                                    <td className="p-2 text-sm">{checklist.hora || 'N/A'}</td>
                                    <td className="p-2 text-sm">{checklist.tecnicoAssinatura?.nome || 'N/A'}</td>
                                    <td className="p-2 flex gap-2 no-print">
                                        <button onClick={() => handleEditDocument(checklist.id, 'check-list')} className="text-gray-600 hover:text-gray-900"><EyeIcon /></button> {/* View also goes to edit page */}
                                        <button onClick={() => handleEditDocument(checklist.id, 'check-list')} className="text-blue-600 hover:text-blue-800"><EditIcon /></button>
                                        <button onClick={() => handleDeleteChecklist(checklist.id)} className="text-red-600 hover:text-red-800"><TrashIcon /></button>
                                        <button onClick={() => handleDownloadChecklistPdf(checklist)} className="text-gray-600 hover:text-gray-900"><DownloadIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Matrizes de Bloqueio */}
            <Card>
                <SectionTitle>Matrizes de Bloqueio</SectionTitle>
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="p-2">OM</th>
                                <th className="p-2">TAG</th>
                                <th className="p-2">Data Emissão</th>
                                <th className="p-2">Equipe</th>
                                <th className="p-2 w-32">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matrizesBloqueio.map(matrix => (
                                <tr key={matrix.id} className={`border-b ${editingMatrizBloqueioId === matrix.id ? 'bg-yellow-100 border-yellow-500 ring-2 ring-yellow-300' : ''}`}>
                                    <td className="p-2 text-sm">{matrix.om}</td>
                                    <td className="p-2 text-sm">{matrix.tag}</td>
                                    <td className="p-2 text-sm">{matrix.dataEmissao.split(' ')[0]}</td>
                                    <td className="p-2 text-sm">{matrix.equipe.map(e => e.nome).join(', ')}</td>
                                    <td className="p-2 flex gap-2 no-print">
                                        <button onClick={() => handleEditDocument(matrix.id, 'matriz-de-bloqueio')} className="text-gray-600 hover:text-gray-900"><EyeIcon /></button> {/* View also goes to edit page */}
                                        <button onClick={() => handleEditDocument(matrix.id, 'matriz-de-bloqueio')} className="text-blue-600 hover:text-blue-800"><EditIcon /></button>
                                        <button onClick={() => handleDeleteMatrizBloqueio(matrix.id)} className="text-red-600 hover:text-red-800"><TrashIcon /></button>
                                        <button onClick={() => handleDownloadMatrizBloqueioPdf(matrix)} className="text-gray-600 hover:text-gray-900"><DownloadIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* New: Exportar Documentos para Rede Section */}
            <Card className="mt-8 bg-blue-50 border border-blue-200">
                <SectionTitle className="border-blue-400 text-blue-900">Exportar Documentos para Rede</SectionTitle>
                <p className="text-blue-800 mb-4">
                    Utilize esta funcionalidade para simular o envio de todos os documentos salvos para uma rede ou sistema externo.
                    Em um aplicativo real, esta ação realizaria uma integração com um serviço de backend.
                </p>
                <div className="flex justify-center">
                    <Button 
                        onClick={handleExportAllDocuments} 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <div className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Enviando...
                            </div>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                                Enviar Todos os Documentos
                            </>
                        )}
                    </Button>
                </div>
            </Card>

            {showArtEmergencialViewModal && selectedArtEmergencialToView && (
                <ArtEmergencialViewModal
                    art={selectedArtEmergencialToView}
                    funcionarios={funcionarios}
                    onClose={() => setShowArtEmergencialViewModal(false)}
                />
            )}
            
            {/* Hidden refs for PDF generation of other forms */}
            <div style={{ display: 'none' }}>
                {/* Fix: Add hidden ref for ArtEmergencialForm */}
                <div ref={artEmergencialPdfRef}></div>
                <div ref={artAtividadePdfRef}></div>
                <div ref={checklistPdfRef}></div>
                <div ref={matrizBloqueioPdfRef}></div>
            </div>
        </div>
    );
};
