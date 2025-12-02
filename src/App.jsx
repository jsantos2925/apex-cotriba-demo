import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
    Home, Package, MessageCircle, Wallet, User, LogOut, Loader, Camera, Send, 
    AlertTriangle, MapPin, Search, ShieldCheck, ShoppingCart, FileText, Truck, Cloud,
    CreditCard, Wind, Droplets, CheckCircle, Tractor, Sprout, Clock, Trash2, Menu, 
    BarChart3, Activity, ShoppingBag, Megaphone, ArrowRightLeft, Filter,
    Lock, Mail, FileSignature, QrCode, Gavel, Scale, ScanEye, Users, Siren, PieChart, LineChart,
    Hash, Download, BoxSelect, Wrench, Split, Landmark, FileUp, RefreshCw, Check, Newspaper, 
    Bell, Database, Layers, Coffee, Wheat, ChevronDown, Smartphone, UserCheck, PlusCircle, 
    LockKeyhole, Pill, Banknote, Milk, Users2, HardHat, ScanFace, ShieldAlert, MessageSquare, Navigation, FileBarChart, PackageCheck, History, AlertCircle, Calendar, Briefcase, Sparkles, ArrowRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// 1. CONFIGURAÇÃO E DADOS
// ============================================================================

const apiKey = "AIzaSyDfBWOJ_Qbfn_tfmR2E_AO9jn73d95uvF4"; // <--- SUA CHAVE GEMINI AQUI

const defaultFirebaseConfig = {
    apiKey: "AIzaSyD_o-5ZhbfQHmgCb21RKU3c9XXCOLhFR8s",
  authDomain: "agrimind-os.firebaseapp.com",
  projectId: "agrimind-os",
  storageBucket: "agrimind-os.firebasestorage.app",
  messagingSenderId: "466795111574",
  appId: "1:466795111574:web:3ca0be4acdcbcf56a50eb7"
};

// Inicialização Segura
let app, db, auth;
const firebaseConfigToUse = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : defaultFirebaseConfig;

try {
    if (firebaseConfigToUse.apiKey && !firebaseConfigToUse.apiKey.includes("SUA_API_KEY")) {
        app = initializeApp(firebaseConfigToUse);
        db = getFirestore(app);
        auth = getAuth(app);
    }
} catch (error) { console.error("Erro Firebase:", error); }

const tenants = {
    'cotriba': {
        id: 'cotriba', name: 'Cotribá', logo: Wheat,
        branches: ['Visão Geral', 'São Francisco de Assis', 'São Gabriel', 'Santa Margarida', 'Ibirubá (Matriz)', 'Cruz Alta'],
        colors: { primary: "bg-[#003B71]", accent: "text-yellow-400", accent_bg: "bg-yellow-500", gradient: "from-[#003B71] via-slate-900 to-black", button: "bg-yellow-500 hover:bg-yellow-400 text-blue-900", sidebar: "bg-[#003B71]/90" },
        bg_image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1920&auto=format&fit=crop"
    }
};

// DADOS SIMULADOS GERAIS
let GLOBAL_STOCK = [
    { id: 1, nome: "Glifosato 480", lote: "LT-2024", quantidade: 5000, unidade: "L", branch: "São Gabriel", time: "08:00" },
    { id: 2, nome: "Semente Soja Intacta", lote: "S-88", quantidade: 200, unidade: "Sc", branch: "Santa Margarida", time: "Ontem" },
    { id: 3, nome: "Adubo NPK 04-14-08", lote: "NPK-10", quantidade: 150, unidade: "Ton", branch: "São Francisco de Assis", time: "Ontem" }
];

const GRAIN_DATA = [
    { id: 99821, data: "26/11/2025", placa: "IXY-9988", produto: "Soja", bruto: 45000, tara: 15000, liquido: 30000, umidade: 16.5, impureza: 2.0, desconto_kg: 1250, saldo_final: 28750, status: "Classificado" },
    { id: 99750, data: "25/11/2025", placa: "JJA-1122", produto: "Soja", bruto: 46000, tara: 15000, liquido: 31000, umidade: 13.8, impureza: 1.0, desconto_kg: 450, saldo_final: 30550, status: "Classificado" }
];

const MOCK_USERS = [
    { id: 1, name: "João da Silva", farm: "Fazenda Santa Rita", status: "online", branch: "São Francisco de Assis" },
    { id: 2, name: "Maria Oliveira", farm: "Sítio Alvorada", status: "offline", branch: "São Gabriel" },
    { id: 3, name: "Pedro Santos", farm: "Agro Santos", status: "online", branch: "Ibirubá" }
];

const EPI_STOCK = [
    { id: 1, name: "Luva de Raspa", qtd: 50, validade: "2026" },
    { id: 2, name: "Máscara PFF2", qtd: 200, validade: "2025" },
    { id: 3, name: "Cinto Paraquedista", qtd: 5, validade: "2028" }
];

const getUserRole = (email) => {
    if (!email) return 'Visitante';
    if (email.includes('everton')) return 'Coord. Regional';
    if (email.includes('ricardo')) return 'Coord. Unidade';
    if (email.includes('supervisor')) return 'Supervisor Armazém';
    if (email.includes('seguranca')) return 'Téc. Segurança';
    if (email.includes('produtor')) return 'Produtor';
    if (email.includes('agronomo')) return 'Eng. Agrônomo';
    if (email.includes('operador')) return 'Operador';
    if (email.includes('estoquista')) return 'Estoquista';
    if (email.includes('nutri')) return 'Téc. Nutrição';
    if (email.includes('adm')) return 'Assist. Administrativo';
    if (email.includes('motorista')) return 'Motorista';
    return 'Admin'; 
};

const formatCurrency = (val) => typeof val === 'number' ? `R$ ${val.toFixed(2)}` : 'R$ 0,00';
const fileToBase64 = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = error => reject(error); });

// --- COMPONENTES VISUAIS ---

const GlassCard = ({ children, className, onClick }) => (
    <motion.div whileHover={onClick ? { scale: 1.02, translateY: -4 } : {}} whileTap={onClick ? { scale: 0.98 } : {}} onClick={onClick} className={twMerge(`backdrop-blur-2xl bg-black/40 border border-white/10 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group transition-all duration-300 hover:shadow-emerald-500/10 hover:border-white/20`, className, onClick && "cursor-pointer")}>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50"/>{children}
    </motion.div>
);

const NeonButton = ({ children, onClick, className, disabled, variant = 'primary' }) => {
    const variants = {
        primary: "bg-gradient-to-b from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-900/40 border-t border-yellow-300 text-blue-900 font-bold",
        accent: "bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-900/40 border-t border-emerald-300 text-white font-bold",
        secondary: "bg-gradient-to-b from-slate-700 to-slate-800 shadow-lg shadow-black/50 border-t border-slate-600 text-white/80 font-medium",
        danger: "bg-gradient-to-b from-red-500 to-red-700 shadow-lg shadow-red-900/40 border-t border-red-400 text-white font-bold"
    };
    return (<button onClick={onClick} disabled={disabled} className={twMerge(`px-5 py-3 rounded-2xl transition-all active:scale-95 active:shadow-inner flex items-center justify-center gap-2 relative overflow-hidden ${variants[variant] || variants.primary}`, className, disabled && "opacity-50 grayscale cursor-not-allowed")}><div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"/>{children}</button>);
};

const GlassInput = ({ label, value, onChange, icon: Icon, ...props }) => (<div className="w-full space-y-1.5">{label && <label className="text-xs text-white/60 font-bold uppercase tracking-wider ml-2">{label}</label>}<div className="relative group">{Icon && <Icon className="absolute left-4 top-3.5 text-white/40 group-focus-within:text-white transition-colors" size={20}/>}<input value={value} onChange={onChange} {...props} className={twMerge("w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:border-white/40 focus:bg-black/50 focus:outline-none transition-all placeholder-white/20 shadow-inner", Icon ? "pl-12 pr-4" : "px-4")}/></div></div>);

// --- SERVIÇOS INTELIGENTES (AGRILENS REAL v2.5) ---
const realAgriLens = async (file) => {
    // Verifica se a chave existe
    if (!apiKey) {
        alert("⚠️ API Key não detectada. O sistema usará o modo simulação.");
        return { 
            diagnosis: "Ferrugem Asiática (Simulação)", 
            confidence: "98%", 
            explanation: "Pústulas identificadas na face inferior da folha. Estágio inicial.", 
            recommendation: "Aplicação imediata de fungicida sistêmico.", 
            productMatch: { name: "Elatus ou Fox Xpro", stock_status: "Disponível na Unidade" } 
        };
    }

    try {
        const base64Image = await fileToBase64(file);
        
        // URL DO MODELO CORRIGIDA (Versão Estável)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
        
        const prompt = `
            Aja como um Engenheiro Agrônomo Sênior. Analise esta imagem agrícola com rigor técnico.
            Retorne APENAS um JSON (sem markdown, sem aspas triplas, sem comentários) neste formato exato:
            {
                "diagnosis": "Nome do Problema",
                "confidence": "XX%",
                "explanation": "Explicação técnica breve.",
                "recommendation": "Recomendação de manejo.",
                "productMatch": {
                    "name": "Produto indicado (ex: Fungicida X)",
                    "stock_status": "Consulte Disponibilidade"
                }
            }
        `;

        const payload = { 
            contents: [{ 
                role: "user", 
                parts: [
                    { text: prompt }, 
                    { inlineData: { mimeType: file.type, data: base64Image } }
                ] 
            }] 
        };

        const response = await fetch(url, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || `Erro API: ${response.status}`);
        }
        
        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        // Limpa formatação Markdown se a IA mandar
        return JSON.parse(text.replace(/```json|```/g, '').trim());

    } catch (e) { 
        console.error("Erro no AgriLens:", e);
        alert(`Erro na análise: ${e.message}. Usando dados simulados.`);
        return null; 
    }
};

// 4. AGRILENS (INTERFACE VISUAL COMPLETA)
const AgriLensView = ({ setView }) => {
    const [result, setResult] = useState(null); 
    const [loading, setLoading] = useState(false); 
    const fileRef = useRef(null);

    const handleAnalyze = async (e) => { 
        const f = e.target.files[0]; 
        if(!f) return; 
        
        setLoading(true); 
        const data = await realAgriLens(f); 
        if (data) setResult(data);
        setLoading(false); 
    };

    const notifyAgronomist = () => { 
        alert("Enviado para o Agrônomo!"); 
        setView('chat'); 
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white flex items-center gap-2"><ScanEye className="text-purple-400"/> AgriLens IA</h2>
            </div>
            
            <GlassCard className="text-center py-16">
                {!result ? (
                    <>
                        <div onClick={() => fileRef.current.click()} className="w-56 h-56 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-8 cursor-pointer hover:bg-purple-500/20 border-4 border-dashed border-purple-500/30 animate-pulse">
                            <Camera size={80} className="text-purple-400"/>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2">{loading ? "Analisando..." : "Toque para Analisar"}</h3>
                        <p className="text-white/50 text-sm px-8">Tire uma foto da folha, fruto ou animal para diagnóstico imediato.</p>
                        <input type="file" ref={fileRef} hidden onChange={handleAnalyze} accept="image/*"/>
                    </>
                ) : (
                    <div className="text-left space-y-6 max-w-lg mx-auto">
                        <div className="bg-yellow-500/10 border border-yellow-500/50 p-5 rounded-2xl flex items-start gap-4">
                            <AlertTriangle className="text-yellow-400 shrink-0 mt-1" size={24}/>
                            <div>
                                <h4 className="font-bold text-yellow-400 text-sm">Aviso Legal</h4>
                                <p className="text-xs text-yellow-200/80">Auxílio diagnóstico. Consulte sempre um <strong>Engenheiro Agrônomo</strong>.</p>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-end pb-4 border-b border-white/10">
                            <h3 className="text-4xl font-black text-red-400">{result.diagnosis}</h3>
                            <span className="bg-white/10 px-4 py-1 rounded-full text-xs font-mono border border-white/10 text-white">{result.confidence} Confiança</span>
                        </div>
                        
                        <div className="bg-white/5 p-4 rounded-xl">
                            <p className="text-white/80 italic">"{result.explanation}"</p>
                        </div>

                        <div className="bg-emerald-900/30 border border-emerald-500/30 p-5 rounded-2xl flex justify-between items-center">
                            <div>
                                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">RECOMENDAÇÃO</p>
                                <p className="text-xl font-bold text-white">{result.productMatch?.name}</p>
                                <p className="text-xs text-white/50 mt-1">{result.productMatch?.stock_status}</p>
                            </div>
                            <div className="bg-emerald-500/20 p-3 rounded-full">
                                <Pill size={24} className="text-emerald-400"/>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setResult(null)} className="flex-1 py-4 w-full rounded-2xl bg-white/5 text-white font-bold border border-white/10">Nova Foto</button>
                            <NeonButton onClick={notifyAgronomist} variant="accent" className="flex-[2]">Falar com Agrônomo</NeonButton>
                        </div>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

// --- MÓDULOS DE NEGÓCIO ---

// 1. FINANCEIRO PRODUTOR (PAINEL DETALHADO COMPLETO)
const CobreancaView = () => {
    const [activeTab, setActiveTab] = useState('resumo');
    const [creditLimit] = useState(50000); 
    const [usedLimit] = useState(15200); 
    const percentUsed = (usedLimit / creditLimit) * 100;

    // DADOS DE SALDO DE RETIRADA
    const productsToWithdraw = [
        { id: 1, name: "Ração Destete", total: 300, remaining: 150, unit: "Sc", img: "🐂" },
        { id: 2, name: "Freno", total: 1000, remaining: 250, unit: "L", img: "🧪" },
        { id: 3, name: "Zaap QI", total: 600, remaining: 120, unit: "L", img: "⚡" }
    ];

    const bills = {
        overdue: [ { id: 99, doc: "NFe 3321", valor: 1250.00, venc: "10/11/2025", desc: "Manutenção Trator" } ],
        open: [ { id: 1, doc: "NFe 4429", valor: 15200.00, venc: "20/05/2025", desc: "Insumos Safra" }, { id: 2, doc: "NFe 4500", valor: 3450.00, venc: "15/06/2025", desc: "Peças Reposição" } ],
        paid: [ { id: 10, doc: "NFe 4000", valor: 5000.00, venc: "01/04/2025", paidDate: "30/03/2025", desc: "Adiantamento Soja" } ]
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <h2 className="text-3xl font-bold flex items-center gap-2 text-white"><Wallet className="text-green-400"/> Minha Carteira</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button onClick={() => setActiveTab('resumo')} className={`px-5 py-2 rounded-full text-sm font-bold transition ${activeTab==='resumo'?'bg-green-500 text-black':'bg-white/10 text-white hover:bg-white/20'}`}>Visão Geral</button>
                <button onClick={() => setActiveTab('retirar')} className={`px-5 py-2 rounded-full text-sm font-bold transition ${activeTab==='retirar'?'bg-green-500 text-black':'bg-white/10 text-white hover:bg-white/20'}`}>Saldos a Retirar</button>
                <button onClick={() => setActiveTab('historico')} className={`px-5 py-2 rounded-full text-sm font-bold transition ${activeTab==='historico'?'bg-green-500 text-black':'bg-white/10 text-white hover:bg-white/20'}`}>Histórico</button>
            </div>

            {activeTab === 'resumo' && (
                <>
                    <GlassCard className="border-t-4 border-green-500">
                        <div className="flex justify-between items-end mb-2"><h3 className="text-white font-bold">Limite Disponível</h3><span className="text-green-400 font-mono font-bold text-xl">{formatCurrency(creditLimit - usedLimit)}</span></div>
                        <div className="w-full bg-white/10 h-4 rounded-full overflow-hidden mb-1"><div className="bg-gradient-to-r from-green-500 to-emerald-400 h-full transition-all duration-1000" style={{ width: `${100 - percentUsed}%` }}/></div>
                        <div className="flex justify-between text-[10px] text-white/50"><span>Usado: {formatCurrency(usedLimit)}</span><span>Total: {formatCurrency(creditLimit)}</span></div>
                    </GlassCard>
                    {bills.overdue.length > 0 && (
                        <GlassCard className="bg-red-900/20 border-l-4 border-red-500 flex items-center justify-between p-4">
                            <div className="flex items-center gap-3"><div className="bg-red-500/20 p-2 rounded-full text-red-400"><AlertTriangle size={20}/></div><div><h4 className="font-bold text-white">Em Atraso</h4><p className="text-xs text-white/70">{bills.overdue[0].desc} • {formatCurrency(bills.overdue[0].valor)}</p></div></div>
                            <NeonButton variant="danger" className="h-8 text-xs px-4">Pagar</NeonButton>
                        </GlassCard>
                    )}
                    <h3 className="font-bold text-white mt-4 flex gap-2 items-center"><Calendar size={18}/> Próximos Vencimentos</h3>
                    <div className="space-y-3">
                        {bills.open.map(b => (
                            <GlassCard key={b.id} className="p-4 flex justify-between items-center bg-white/5">
                                <div><p className="font-bold text-white">{b.desc}</p><p className="text-xs text-white/50">{b.doc} • Vence {b.venc}</p></div>
                                <div className="text-right"><p className="font-bold text-white text-lg">{formatCurrency(b.valor)}</p><button className="text-xs text-green-400 border border-green-500/30 px-3 py-1 rounded-lg mt-1 hover:bg-green-500/10 transition">Copiar Pix</button></div>
                            </GlassCard>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'retirar' && (
                <div className="space-y-4">
                    <h3 className="font-bold text-white flex gap-2 items-center"><PackageCheck className="text-blue-400"/> Produtos no Armazém (Já Pagos)</h3>
                    {productsToWithdraw.map(p => {
                        const percentage = (p.remaining / p.total) * 100;
                        return (
                            <GlassCard key={p.id} className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3"><span className="text-2xl">{p.img}</span><div><h4 className="font-bold text-white text-lg">{p.name}</h4><p className="text-xs text-white/50">Saldo Atual</p></div></div>
                                    <span className="text-2xl font-bold text-white">{p.remaining} <span className="text-sm font-normal text-white/50">{p.unit}</span></span>
                                </div>
                                <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden mb-2"><div className="bg-blue-500 h-full transition-all duration-1000 relative" style={{ width: `${percentage}%` }}></div></div>
                                <div className="flex justify-between text-xs text-white/40"><span>Já retirado: {p.total - p.remaining} {p.unit}</span><span>Total comprado: {p.total} {p.unit}</span></div>
                                <NeonButton className="w-full mt-4 h-10 text-sm" variant="secondary">Gerar Ordem de Retirada</NeonButton>
                            </GlassCard>
                        );
                    })}
                </div>
            )}

            {activeTab === 'historico' && (
                <div className="space-y-3">
                    <h3 className="font-bold text-white flex gap-2 items-center"><History/> Pagamentos Realizados</h3>
                    {bills.paid.map(b => (<div key={b.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center"><div className="flex items-center gap-3"><div className="bg-green-500/20 p-2 rounded-full text-green-400"><CheckCircle size={16}/></div><div><p className="font-bold text-white">{b.desc}</p><p className="text-xs text-white/50">Pago em {b.paidDate}</p></div></div><span className="font-bold text-white opacity-60">{formatCurrency(b.valor)}</span></div>))}
                </div>
            )}
        </div>
    );
};

// 2. FINANCEIRO DIRETORIA (RESUMO)
const FinanceiroCompleto = ({ role }) => (
    <div className="space-y-6 animate-in fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="border-l-4 border-green-500 bg-green-900/20"><p className="text-sm text-white/50">Receita</p><h3 className="text-4xl font-black mt-1 text-white tracking-tight">R$ 5.2M</h3></GlassCard>
            <GlassCard className="border-l-4 border-red-500 bg-red-900/20"><p className="text-sm text-white/50">Despesas</p><h3 className="text-4xl font-black mt-1 text-white tracking-tight">R$ 1.8M</h3></GlassCard>
            <GlassCard className="border-l-4 border-blue-500 bg-blue-900/20"><p className="text-sm text-white/50">Líquido</p><h3 className="text-4xl font-black mt-1 text-white tracking-tight">R$ 3.4M</h3></GlassCard>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard><h3 className="font-bold mb-4 flex items-center gap-2 text-white"><Layers/> Split de Receita</h3><div className="space-y-4"><div className="flex justify-between items-center text-sm text-white"><span>Insumos</span><span className="font-bold">R$ 3.2M (60%)</span></div><div className="w-full bg-white/10 h-2 rounded-full"><div className="bg-green-500 h-2 rounded-full w-[60%]"/></div></div></GlassCard>
            <GlassCard><h3 className="font-bold mb-4 flex items-center gap-2 text-white"><ShieldCheck/> Audit Hawk (IA)</h3><div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl flex items-center gap-3 mb-4"><CheckCircle className="text-green-400"/><p className="text-sm text-green-200">Nenhuma anomalia financeira detectada.</p></div></GlassCard>
        </div>
    </div>
);

// --- MÓDULOS FUNCIONAIS GERAIS ---

// --- MÓDULO DE CHAT INTELIGENTE (HÍBRIDO) ---
const ChatModule = ({ title, subtitle, userEmail }) => {
    const isCommunity = title.includes("Comunidade"); // Detecta se é Comunidade ou Suporte
    const [activeSlot, setActiveSlot] = useState(null); // Pode ser um Grupo ou um Departamento
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const endRef = useRef(null);

    // DADOS DO SUPORTE (Produtor -> Empresa)
    const departments = [
        { id: 'comercial', name: 'Comercial', icon: <ShoppingBag className="text-blue-400" size={24}/>, desc: 'Vendas, Cotações e Financeiro' },
        { id: 'agronomo', name: 'Agronomia', icon: <Wheat className="text-green-400" size={24}/>, desc: 'Técnico, Pragas e Receituário' },
        { id: 'nutricao', name: 'Nutrição Animal', icon: <Milk className="text-pink-400" size={24}/>, desc: 'Rações, Gado e Leite' },
        { id: 'seguranca', name: 'Segurança', icon: <ShieldCheck className="text-red-400" size={24}/>, desc: 'EPIs e Normas' }
    ];

    // DADOS DA COMUNIDADE (Produtor -> Produtor)
    const [groups, setGroups] = useState([
        { id: 'geral', name: "Comunidade Geral", desc: "120 membros", icon: <Users size={24}/> },
        { id: 'vizinhos', name: "Vizinhos São Chico", desc: "12 membros", icon: <MapPin size={24}/> }
    ]);

    // Selecionar Canal
    const handleSelect = (item) => {
        setActiveSlot(item);
        // Mensagem inicial personalizada dependendo do tipo
        const welcomeMsg = isCommunity 
            ? `Você entrou no grupo ${item.name}.`
            : `Olá! Sou do setor de ${item.name}. Como posso ajudar sua propriedade hoje?`;
            
        setMessages([{ id: 1, text: welcomeMsg, sender: "System", time: "Agora" }]);
    };

    // Enviar Mensagem
    const handleSend = (e) => {
        e.preventDefault();
        if(!input.trim()) return;
        setMessages([...messages, { id: Date.now(), text: input, sender: "Eu", time: "Agora" }]);
        setInput("");
    };

    // Criar Grupo (Apenas na Comunidade)
    const createGroup = () => {
        if(!newGroupName) return;
        setGroups([...groups, { id: Date.now(), name: newGroupName, desc: "1 membro", icon: <Users size={24}/> }]);
        setShowCreateGroup(false);
        setNewGroupName("");
    };

    // Rolagem automática
    useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    // 1. TELA DE SELEÇÃO (LOBBY)
    if (!activeSlot) return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                    <MessageCircle className={isCommunity ? "text-yellow-400" : "text-green-400"}/> 
                    {isCommunity ? "Comunidade" : "Atendimento"}
                </h2>
                {isCommunity && (
                    <NeonButton onClick={() => setShowCreateGroup(!showCreateGroup)} className="h-8 text-xs px-3" variant="secondary">
                        <PlusCircle size={14}/> Novo Grupo
                    </NeonButton>
                )}
            </div>

            {/* Formulário de Novo Grupo (Só aparece na Comunidade) */}
            {showCreateGroup && isCommunity && (
                <GlassCard className="mb-4 bg-yellow-900/20 border-yellow-500/30 p-3">
                    <div className="flex gap-2">
                        <GlassInput placeholder="Nome do Grupo..." value={newGroupName} onChange={e=>setNewGroupName(e.target.value)}/>
                        <NeonButton onClick={createGroup} className="h-12">Criar</NeonButton>
                    </div>
                </GlassCard>
            )}
            
            <p className="text-white/50 text-sm mb-2">
                {isCommunity ? "Converse com outros produtores:" : "Escolha um departamento para falar:"}
            </p>

            <div className="grid grid-cols-1 gap-3">
                {isCommunity ? (
                    // LISTA DE GRUPOS (COMUNIDADE)
                    groups.map(g => (
                        <GlassCard key={g.id} onClick={() => handleSelect(g)} className="p-4 cursor-pointer hover:bg-white/10 flex items-center gap-4 transition-all">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white">{g.icon}</div>
                            <div><h4 className="font-bold text-white">{g.name}</h4><p className="text-xs text-white/50">{g.desc}</p></div>
                            <ArrowRightLeft size={16} className="ml-auto text-white/30"/>
                        </GlassCard>
                    ))
                ) : (
                    // LISTA DE DEPARTAMENTOS (SUPORTE)
                    departments.map(dept => (
                        <GlassCard key={dept.id} onClick={() => handleSelect(dept)} className="p-4 cursor-pointer hover:bg-white/10 flex items-center gap-4 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">{dept.icon}</div>
                            <div><h4 className="font-bold text-white">{dept.name}</h4><p className="text-xs text-white/50">{dept.desc}</p></div>
                            <ArrowRightLeft size={16} className="ml-auto text-white/30"/>
                        </GlassCard>
                    ))
                )}
            </div>
        </div>
    );

    // 2. TELA DE CHAT (SALA DE BATE-PAPO)
    return (
        <div className="h-[600px] flex flex-col bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button onClick={() => setActiveSlot(null)} className="p-2 hover:bg-white/10 rounded-full text-white transition"><ArrowRightLeft className="rotate-180" size={20}/></button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">{activeSlot.icon}</div>
                        <div><h3 className="font-bold text-white">{activeSlot.name}</h3><p className="text-xs text-green-400 flex items-center gap-1">● Online</p></div>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.sender === 'Eu' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-md ${m.sender === 'Eu' ? 'bg-gradient-to-br from-green-600 to-green-800 text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none border border-white/5'}`}>
                            <p className="text-[10px] opacity-50 mb-1 font-bold">{m.sender}</p>
                            <p>{m.text}</p>
                            <p className="text-[9px] text-right opacity-30 mt-1">{m.time}</p>
                        </div>
                    </div>
                ))}
                <div ref={endRef}/>
            </div>
            
            <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
                {/* Botões de Mídia (Simulados) */}
                <button type="button" className="p-2 text-white/50 hover:text-blue-400"><Camera size={20}/></button>
                <button type="button" className="p-2 text-white/50 hover:text-purple-400"><Paperclip size={20}/></button>
                <input value={input} onChange={e=>setInput(e.target.value)} className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-green-500/50" placeholder="Mensagem..."/>
                <NeonButton type="submit" className="px-3 rounded-xl" variant="accent"><Send size={18}/></NeonButton>
            </form>
        </div>
    );
};

// 3. MÓDULO DE SEGURANÇA DO TRABALHO (EHS - COMPLETO COM ESTOQUE)
const SafetyView = ({ setView, role, activeBranch }) => {
    const [activeTab, setActiveTab] = useState('dashboard'); 
    const [showRiskModal, setShowRiskModal] = useState(false);
    const [biometryStatus, setBiometryStatus] = useState('idle'); 
    const fileRef = useRef(null);

    // --- DADOS DE ESTOQUE DE SEGURANÇA (POR UNIDADE) ---
    const SAFETY_WAREHOUSE = [
        // São Francisco de Assis
        { id: 1, name: "Luva de Raspa", type: "EPI", qtd: 45, min: 50, branch: "São Francisco de Assis", status: "Baixo" },
        { id: 2, name: "Máscara PFF2", type: "EPI", qtd: 200, min: 100, branch: "São Francisco de Assis", status: "Ok" },
        { id: 3, name: "Detector de Gases (4 gases)", type: "Ferramenta", qtd: 2, min: 2, branch: "São Francisco de Assis", status: "Ok" },
        { id: 4, name: "Trava Quedas Retrátil", type: "Ferramenta", qtd: 4, min: 5, branch: "São Francisco de Assis", status: "Atenção" },
        
        // São Gabriel
        { id: 5, name: "Luva de Raspa", type: "EPI", qtd: 120, min: 50, branch: "São Gabriel", status: "Ok" },
        { id: 6, name: "Capacete Aba Frontal", type: "EPI", qtd: 15, min: 20, branch: "São Gabriel", status: "Baixo" },
        { id: 7, name: "Kit Bloqueio/Etiquetagem", type: "Ferramenta", qtd: 1, min: 3, branch: "São Gabriel", status: "Crítico" },

        // Ibirubá
        { id: 8, name: "Botina de Segurança", type: "EPI", qtd: 300, min: 100, branch: "Ibirubá (Matriz)", status: "Ok" }
    ];

    // --- DADOS GERAIS ---
    const allTrainings = [
        { id: 1, name: "Carlos Mendes", role: "Operador", branch: "São Francisco de Assis", course: "NR-33 (Espaço Confinado)", expire: "10/06/2026", status: "Vigente" },
        { id: 2, name: "Roberto Alves", role: "Manutenção", branch: "São Francisco de Assis", course: "NR-35 (Trabalho em Altura)", expire: "01/11/2023", status: "Vencido" },
        { id: 3, name: "Ana Paula", role: "Supervisora", branch: "São Gabriel", course: "NR-10 (Elétrica)", expire: "15/12/2025", status: "Vigente" },
        { id: 4, name: "João Silva", role: "Auxiliar", branch: "Ibirubá (Matriz)", course: "NR-33 (Espaço Confinado)", expire: "20/11/2023", status: "Vencido" }
    ];

    const allPETs = [
        { id: 901, local: "Silo 03 (Subsolo)", type: "Espaço Confinado", worker: "Carlos Mendes", start: "14:00", max_end: "15:00", branch: "São Francisco de Assis", risk: "Alto" },
        { id: 902, local: "Telhado Armazém B", type: "Trabalho em Altura", worker: "Equipe Tercerizada", start: "08:00", max_end: "17:00", branch: "São Gabriel", risk: "Médio" }
    ];

    const riskAreas = [
        { id: 'R1', area: "Galpão de Químicos", risk: "Químico/Inflamável", class: "Zona 1", branch: "São Francisco de Assis" },
        { id: 'R2', area: "Moega de Recebimento", risk: "Ruído/Poeira", class: "Zona 2", branch: "São Francisco de Assis" },
        { id: 'R3', area: "Tanque Diesel", risk: "Explosão", class: "Zona 0", branch: "São Gabriel" }
    ];

    // --- FILTROS INTELIGENTES (POR FILIAL) ---
    const currentStock = activeBranch.includes("Visão") ? SAFETY_WAREHOUSE : SAFETY_WAREHOUSE.filter(i => i.branch === activeBranch);
    const currentTrainings = activeBranch.includes("Visão") ? allTrainings : allTrainings.filter(t => t.branch === activeBranch);
    const currentPETs = activeBranch.includes("Visão") ? allPETs : allPETs.filter(p => p.branch === activeBranch);
    const currentRisks = activeBranch.includes("Visão") ? riskAreas : riskAreas.filter(r => r.branch === activeBranch);

    // --- FUNÇÕES ---
    const handleBiometry = () => fileRef.current.click();
    const confirmBiometry = () => {
        setBiometryStatus('scanning');
        setTimeout(() => {
            setBiometryStatus('success');
            setTimeout(() => {
                alert("✅ Identidade Confirmada: Téc. Segurança Responsável.\nAção autorizada e registrada.");
                setShowRiskModal(false);
                setBiometryStatus('idle');
            }, 1500);
        }, 2000);
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            
            {/* CABEÇALHO */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-2"><ShieldCheck className="text-green-400"/> Segurança do Trabalho</h2>
                    <div className="text-right">
                        <p className="text-[10px] text-white/50 uppercase">Unidade Ativa</p>
                        <p className="text-sm font-bold text-white">{activeBranch}</p>
                    </div>
                </div>
                {/* MENU DE NAVEGAÇÃO DO MÓDULO */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {['dashboard', 'estoque', 'movimentacoes', 'treinamentos', 'mapa'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition ${activeTab === tab ? 'bg-green-600 text-white' : 'bg-white/10 text-white/50'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- ABA 1: DASHBOARD --- */}
            {activeTab === 'dashboard' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <GlassCard className="border-l-4 border-green-500">
                            <h3 className="text-white font-bold">Dias Sem Acidentes</h3>
                            <p className="text-4xl font-black text-white mt-2">{activeBranch === 'São Francisco de Assis' ? '450' : '1.205'}</p>
                            <p className="text-xs text-white/50">Recorde da Unidade</p>
                        </GlassCard>
                        <GlassCard className="border-l-4 border-red-500" onClick={() => setActiveTab('movimentacoes')}>
                            <h3 className="text-white font-bold">Riscos Ativos</h3>
                            <div className="flex items-center gap-2 mt-2"><span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"/><p className="text-4xl font-black text-white">{currentPETs.length}</p></div>
                            <p className="text-xs text-white/50">Atividades Críticas</p>
                        </GlassCard>
                        <GlassCard className="border-l-4 border-blue-500" onClick={() => setActiveTab('estoque')}>
                            <h3 className="text-white font-bold">Alerta de Estoque</h3>
                            <p className="text-4xl font-black text-white mt-2">{currentStock.filter(i => i.status !== 'Ok').length}</p>
                            <p className="text-xs text-white/50">Itens Abaixo do Mínimo</p>
                        </GlassCard>
                    </div>
                    <GlassCard className="bg-gradient-to-r from-slate-800 to-slate-900">
                        <h3 className="font-bold text-white mb-2 flex items-center gap-2"><Bell size={16}/> Mural de Avisos EHS</h3>
                        <p className="text-sm text-white/70">• Inspeção dos extintores programada para Sexta-feira.</p>
                    </GlassCard>
                </>
            )}

            {/* --- ABA 2: ESTOQUE DE SEGURANÇA (NOVA) --- */}
            {activeTab === 'estoque' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-white flex gap-2 items-center"><Package size={20}/> Almoxarifado EHS</h3>
                        <button className="text-xs text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg hover:bg-blue-500/10">Solicitar Reposição</button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                        {currentStock.length === 0 && <p className="text-white/30 text-center py-8">Nenhum item cadastrado nesta unidade.</p>}
                        {currentStock.map(item => (
                            <GlassCard key={item.id} className={`p-4 flex justify-between items-center border-l-4 ${item.status === 'Ok' ? 'border-green-500' : item.status === 'Crítico' ? 'border-red-500' : 'border-yellow-500'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${item.type === 'EPI' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                        {item.type === 'EPI' ? <HardHat size={24}/> : <Wrench size={24}/>}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{item.name}</h4>
                                        <p className="text-xs text-white/50">{item.type} • Mínimo: {item.min}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-white">{item.qtd}</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${item.status === 'Ok' ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                                        {item.status}
                                    </span>
                                    <button onClick={handleBiometry} className="block mt-2 text-[10px] text-white/40 hover:text-white underline">Entregar</button>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                    <input type="file" ref={fileRef} hidden onChange={confirmBiometry} accept="image/*;capture=user"/>
                </div>
            )}

            {/* --- ABA 3: MOVIMENTAÇÕES (PETs) --- */}
            {activeTab === 'movimentacoes' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-white">Monitoramento em Tempo Real</h3>
                        <NeonButton onClick={() => setShowRiskModal(true)} className="h-8 text-xs"><PlusCircle size={14}/> Nova Movimentação</NeonButton>
                    </div>
                    {currentPETs.map(pet => (
                        <GlassCard key={pet.id} className="border-l-4 border-red-500 bg-red-900/10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-white text-lg">{pet.local}</h4>
                                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30">{pet.type}</span>
                                    <p className="text-sm text-white/70 mt-2">Resp: {pet.worker}</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-red-400 font-mono font-bold bg-black/30 px-2 py-1 rounded"><Clock size={14}/> {pet.max_end}</div>
                                    <button className="mt-2 text-xs text-green-400 border border-green-500/30 px-2 py-1 rounded hover:bg-green-500/10">Finalizar</button>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            {/* --- ABA 4: TREINAMENTOS --- */}
            {activeTab === 'treinamentos' && (
                <div className="space-y-4">
                    <h3 className="font-bold text-white flex gap-2 items-center"><UserCheck size={18}/> Matriz de Capacitação</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {currentTrainings.map(t => (
                            <GlassCard key={t.id} className="p-4 flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-white">{t.name}</h4>
                                    <p className="text-xs text-white/50">{t.role} • {t.branch}</p>
                                    <p className="text-sm text-white mt-1">{t.course}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${t.status === 'Vigente' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'}`}>{t.status}</span>
                                    <p className="text-[10px] text-white/40 mt-1">Val: {t.expire}</p>
                                    {t.status === 'Vencido' && <button className="block w-full text-right text-[10px] text-yellow-400 mt-1 hover:underline">Notificar</button>}
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            )}

            {/* --- ABA 5: MAPA DE RISCO --- */}
            {activeTab === 'mapa' && (
                <div className="space-y-4">
                    <h3 className="font-bold text-white flex gap-2 items-center"><AlertTriangle size={18}/> Plantas de Risco</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentRisks.map(risk => (
                            <GlassCard key={risk.id} className="bg-orange-900/10 border-l-4 border-orange-500">
                                <div className="flex justify-between mb-2"><h4 className="font-bold text-white">{risk.area}</h4><span className="text-xs font-mono bg-black/30 px-2 py-1 rounded text-white">{risk.class}</span></div>
                                <p className="text-sm text-white/70">Risco: <strong className="text-orange-400">{risk.risk}</strong></p>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            )}

            {/* --- MODAL DE ABERTURA DE MOVIMENTAÇÃO DE RISCO --- */}
            <AnimatePresence>
                {showRiskModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{scale:0.9}} animate={{scale:1}} className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-3xl p-6 shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-4">Nova Movimentação de Risco</h3>
                            {biometryStatus === 'idle' && (
                                <div className="space-y-4">
                                    <GlassInput label="Local do Serviço" placeholder="Ex: Silo 02"/>
                                    <GlassInput label="Descrição da Atividade" placeholder="Ex: Solda em altura"/>
                                    <div className="bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/30 text-xs text-yellow-200"><p className="font-bold mb-1">⚠️ Requisitos Obrigatórios:</p><ul className="list-disc pl-4 space-y-1"><li>Medição de Gases (LEL/O2)</li><li>Bloqueio de Energia (Lockout)</li><li>Vigia Externo posicionado</li></ul></div>
                                    <div className="flex gap-3 mt-6"><button onClick={() => setShowRiskModal(false)} className="flex-1 py-3 text-white/50 hover:text-white">Cancelar</button><NeonButton onClick={confirmBiometry} className="flex-1"><ScanFace size={18}/> Autorizar (FaceID)</NeonButton></div>
                                </div>
                            )}
                            {biometryStatus === 'scanning' && (<div className="text-center py-8"><ScanFace size={64} className="text-blue-400 animate-pulse mx-auto mb-4"/><h4 className="text-white font-bold">Escaneando Face...</h4><p className="text-xs text-white/50">Mantenha o rosto centralizado</p></div>)}
                            {biometryStatus === 'success' && (<div className="text-center py-8"><CheckCircle size={64} className="text-green-400 mx-auto mb-4"/><h4 className="text-white font-bold">Autorização Validada</h4><p className="text-xs text-white/50">Certificado Digital Gerado</p></div>)}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- MÓDULO SUPERVISOR DE ARMAZÉM (NOVO) ---
const WarehouseView = ({ setView, role, activeBranch }) => {
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, logistica, gastos, equipe
    const [showPetModal, setShowPetModal] = useState(false);
    const [biometryStatus, setBiometryStatus] = useState('idle');
    const [selectedWorker, setSelectedWorker] = useState("");
    const fileRef = useRef(null);

    // DADOS: EQUIPE DO ARMAZÉM
    const warehouseTeam = [
        { id: 1, name: "Carlos Mendes", role: "Operador de Secador", status: "Ativo" },
        { id: 2, name: "João Silva", role: "Auxiliar de Limpeza", status: "Ativo" },
        { id: 3, name: "Roberto Alves", role: "Classificador", status: "Férias" }
    ];

    // DADOS: EXPEDIÇÃO vs PORTO (CONTROLE DE QUEBRA)
    const shipmentHistory = [
        { id: 5501, data: "28/11", placa: "IXY-9988", destino: "Porto Rio Grande", pesoSaida: 32000, pesoChegada: 31950, quebra: 50, status: "Aceitável" },
        { id: 5502, data: "27/11", placa: "JJA-1122", destino: "Porto Rio Grande", pesoSaida: 45000, pesoChegada: 44800, quebra: 200, status: "Alerta de Perda" }
    ];

    // DADOS: GASTOS INTERNOS
    const internalExpenses = [
        { id: 1, desc: "Manutenção Correia Elevador 2", valor: 4500.00, data: "Hoje", status: "Aprovado" },
        { id: 2, desc: "Lenha para Secagem (Metrp)", valor: 12000.00, data: "25/11", status: "Pendente" }
    ];

    const confirmBiometry = () => {
        if(!selectedWorker) return alert("Selecione o funcionário que entrará na área de risco.");
        setBiometryStatus('scanning');
        setTimeout(() => {
            setBiometryStatus('success');
            setTimeout(() => {
                alert(`✅ PET Autorizada!\n\nColaborador: ${selectedWorker}\nSupervisor Responsável: ${role}\nValidação Biométrica: OK`);
                setShowPetModal(false);
                setBiometryStatus('idle');
            }, 1500);
        }, 2000);
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* CABEÇALHO */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-2"><PackageCheck className="text-blue-400"/> Gestão de Armazém</h2>
                    <div className="text-right"><p className="text-[10px] text-white/50 uppercase">Unidade</p><p className="text-sm font-bold text-white">{activeBranch}</p></div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {['dashboard', 'logistica', 'gastos', 'equipe'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/50'}`}>{tab}</button>
                    ))}
                </div>
            </div>

            {/* DASHBOARD */}
            {activeTab === 'dashboard' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <GlassCard className="border-l-4 border-green-500"><h3 className="text-white font-bold">Volume Recebido</h3><p className="text-4xl font-black text-white mt-2">450k <span className="text-lg font-normal text-white/50">sc</span></p></GlassCard>
                        <GlassCard className="border-l-4 border-red-500"><h3 className="text-white font-bold">Quebra Técnica</h3><p className="text-4xl font-black text-white mt-2">0.45%</p><p className="text-xs text-red-300">Acima da meta (0.3%)</p></GlassCard>
                        <GlassCard className="border-l-4 border-blue-500" onClick={()=>setActiveTab('equipe')}><h3 className="text-white font-bold">Equipe Presente</h3><p className="text-4xl font-black text-white mt-2">8/10</p></GlassCard>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setShowPetModal(true)} className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl flex flex-col items-center gap-2 hover:bg-red-900/50 transition"><AlertTriangle className="text-red-400" size={32}/><span className="text-white font-bold">Liberar PET</span></button>
                        <button onClick={() => setActiveTab('gastos')} className="p-4 bg-blue-900/30 border border-blue-500/50 rounded-xl flex flex-col items-center gap-2 hover:bg-blue-900/50 transition"><Wallet className="text-blue-400" size={32}/><span className="text-white font-bold">Lançar Gasto</span></button>
                    </div>
                </>
            )}

            {/* LOGÍSTICA (QUEBRA) */}
            {activeTab === 'logistica' && (
                <div className="space-y-4">
                    <h3 className="font-bold text-white flex gap-2 items-center"><Truck size={18}/> Expedição vs. Porto</h3>
                    {shipmentHistory.map(s => (
                        <GlassCard key={s.id} className={`p-4 border-l-4 ${s.status.includes('Alerta') ? 'border-red-500' : 'border-green-500'}`}>
                            <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2"><div><p className="font-bold text-white">Carga #{s.id}</p><p className="text-xs text-white/50">{s.destino}</p></div><span className="text-[10px] bg-white/10 px-2 py-1 rounded">{s.status}</span></div>
                            <div className="grid grid-cols-3 text-center gap-2 text-xs">
                                <div><p className="text-white/40">Saída</p><p className="text-white font-mono">{s.pesoSaida}</p></div>
                                <div><p className="text-white/40">Chegada</p><p className="text-white font-mono">{s.pesoChegada}</p></div>
                                <div className="bg-black/30 rounded p-1"><p className="text-white/40">Quebra</p><p className="text-red-400 font-mono font-bold">-{s.quebra} kg</p></div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            {/* GASTOS */}
            {activeTab === 'gastos' && (
                <div className="space-y-4">
                    <h3 className="font-bold text-white">Despesas Operacionais</h3>
                    {internalExpenses.map(e => (<div key={e.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5"><div><p className="font-bold text-white text-sm">{e.desc}</p><p className="text-[10px] text-white/40">{e.data}</p></div><div className="text-right"><p className="font-bold text-white">{formatCurrency(e.valor)}</p><span className="text-[10px] text-yellow-400">{e.status}</span></div></div>))}
                </div>
            )}

            {/* MODAL PET (COM SELEÇÃO DE FUNCIONÁRIO) */}
            <AnimatePresence>
                {showPetModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{scale:0.9}} animate={{scale:1}} className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-3xl p-6 shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-4">Autorizar Trabalho de Risco</h3>
                            {biometryStatus === 'idle' && (
                                <div className="space-y-4">
                                    <GlassInput label="Local" placeholder="Ex: Fosso Elevador 1"/>
                                    <GlassInput label="Atividade" placeholder="Ex: Limpeza"/>
                                    <div>
                                        <label className="text-xs text-white/60 font-bold uppercase ml-2">Colaborador Executante</label>
                                        <select className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white mt-1 focus:outline-none [&>option]:bg-slate-900" value={selectedWorker} onChange={(e) => setSelectedWorker(e.target.value)}>
                                            <option value="">Selecione...</option>
                                            {warehouseTeam.map(w => <option key={w.id} value={w.name}>{w.name} - {w.role}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex gap-3 mt-6"><button onClick={() => setShowPetModal(false)} className="flex-1 py-3 text-white/50 hover:text-white">Cancelar</button><NeonButton onClick={confirmBiometry} className="flex-1"><ScanFace size={18}/> Autorizar (FaceID)</NeonButton></div>
                                </div>
                            )}
                            {biometryStatus === 'scanning' && (<div className="text-center py-8"><ScanFace size={64} className="text-blue-400 animate-pulse mx-auto mb-4"/><h4 className="text-white font-bold">Validando Supervisor...</h4></div>)}
                            {biometryStatus === 'success' && (<div className="text-center py-8"><CheckCircle size={64} className="text-green-400 mx-auto mb-4"/><h4 className="text-white font-bold">PET Emitida</h4><p className="text-xs text-white/50">Assinatura Digital Registrada</p></div>)}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <input type="file" ref={fileRef} hidden onChange={confirmBiometry} accept="image/*;capture=user"/>
        </div>
    );
};

const MarketplaceView = ({ goToChat, products, setView }) => {
    const [cart, setCart] = useState([]); const [checkoutStep, setCheckoutStep] = useState('list'); 
    const isRetail = (p) => p.type === 'retail'; const addToCart = (p) => setCart([...cart, p]); const total = cart.reduce((acc, item) => acc + (item.price || 0), 0);
    const pixCode = "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-42661417400052040000530398654041.005802BR5913Apex Demo6008Brasilia62070503***63041D3D"; 
    const handlePayment = () => { setCheckoutStep('payment'); setTimeout(() => { setCheckoutStep('done'); setCart([]); }, 4000); };
    const handleAssociate = () => { alert("Conectando com a Central de Relacionamento..."); setView('chat'); };

    if (checkoutStep === 'payment') return <div className="flex flex-col items-center justify-center h-96 animate-in fade-in text-center p-6"><h3 className="text-3xl font-black text-white mb-4">Pagamento via Pix</h3><p className="text-white/50 mb-8">Escaneie o QR Code</p><div className="bg-white p-6 rounded-3xl mb-8 shadow-2xl shadow-white/10"><QrCode size={240} className="text-black"/></div><div className="w-full max-w-xs bg-white/10 p-4 rounded-2xl border border-white/20 flex items-center justify-between backdrop-blur-md"><span className="text-xs text-white/50 truncate w-48">{pixCode}</span><button onClick={() => navigator.clipboard.writeText(pixCode)} className="text-xs text-emerald-400 font-bold hover:text-emerald-300 uppercase tracking-wider">Copiar</button></div><div className="mt-8 flex items-center gap-3 text-sm text-emerald-400 animate-pulse font-medium"><Loader size={20} className="animate-spin"/> Aguardando confirmação...</div></div>;
    if (checkoutStep === 'done') return <div className="flex flex-col items-center justify-center h-96 animate-in fade-in text-center"><div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/50"><Check size={64} className="text-white drop-shadow-md"/></div><h3 className="text-4xl font-black text-white mb-4">Sucesso!</h3><p className="text-white/60 mb-8 text-lg">Compra confirmada.</p><NeonButton onClick={() => setCheckoutStep('list')} variant="primary">Voltar à Loja</NeonButton></div>;

    return (
        <div className="space-y-8 animate-in fade-in"><div className="flex justify-between items-center bg-black/40 p-6 rounded-3xl border border-white/10 sticky top-0 z-20 backdrop-blur-xl shadow-xl"><h2 className="text-3xl font-bold flex items-center gap-3 text-white"><ShoppingBag className="text-yellow-400"/> Loja Virtual</h2><div className="flex items-center gap-4"><NeonButton onClick={handleAssociate} variant="secondary" className="text-xs h-10 px-4 bg-white/10 border-white/10 hover:bg-white/20 text-white"><UserCheck size={16}/> Seja Sócio</NeonButton><div className="text-right hidden md:block"><p className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Carrinho</p><p className="font-bold text-emerald-400 text-lg">{cart.length} itens | {formatCurrency(total)}</p></div><NeonButton disabled={cart.length === 0} onClick={handlePayment} variant="accent" className="shadow-lg shadow-emerald-900/40">Checkout</NeonButton></div></div><div className="grid grid-cols-2 md:grid-cols-4 gap-6">{products.map(p => (<GlassCard key={p.id} className="flex flex-col p-0 hover:border-yellow-500/50 cursor-pointer group relative overflow-hidden h-full" onClick={() => {}}><div className="p-8 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center group-hover:scale-105 transition duration-500"><div className="text-7xl drop-shadow-2xl filter">{p.img}</div></div><div className="p-5 flex flex-col flex-1"><div className="flex justify-between items-start mb-2"><span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded-md text-white/60 uppercase tracking-wider">{p.tag}</span>{p.promo && <span className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-md font-bold shadow-lg shadow-red-500/30">OFERTA</span>}</div><h4 className="font-bold text-white text-lg leading-tight mb-4">{p.name}</h4><div className="mt-auto flex items-end justify-between border-t border-white/10 pt-4">{isRetail(p) ? (<div><p className="text-xs text-white/40 mb-1">Preço</p><p className="text-emerald-400 font-bold text-xl">{formatCurrency(p.price)}</p></div>) : (<div className="flex items-center gap-2 text-blue-300 text-xs font-bold bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20"><MessageCircle size={14}/> Sob Consulta</div>)}</div><button onClick={() => isRetail(p) ? addToCart(p) : goToChat()} className={twMerge("mt-4 w-full py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg", isRetail(p) ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-900/30")}>{isRetail(p) ? <><PlusCircle size={18}/> Comprar</> : 'Solicitar Cotação'}</button></div></GlassCard>))}</div></div>
    );
};

// --- MÓDULO DE VENDA DIRETA (AGRÔNOMO/NUTRIÇÃO) ---
const DirectSalesView = ({ products, role }) => {
    const [step, setStep] = useState('form'); // form, confirm, success
    const [order, setOrder] = useState({ client: '', productId: '', qty: 1 });

    // Filtra produtos baseado no papel (Agrônomo vê Químicos/Sementes, Nutrição vê Rações)
    const availableProducts = products.filter(p => {
        if (role === 'Téc. Nutrição') return p.tag === 'Nutrição';
        if (role === 'Eng. Agrônomo') return p.tag !== 'Nutrição'; // Vê todo o resto
        return true;
    });

    const selectedProduct = availableProducts.find(p => p.id == order.productId);
    const total = selectedProduct ? (selectedProduct.price || 0) * order.qty : 0;

    const handleSale = () => {
        if (!order.client || !order.productId) return alert("Preencha cliente e produto.");
        setStep('confirm');
        setTimeout(() => {
            setStep('success');
            setTimeout(() => {
                alert(`✅ Pedido Enviado!\n\nCliente: ${order.client}\nValor: ${formatCurrency(total)}\nNota Fiscal em processamento.`);
                setStep('form');
                setOrder({ client: '', productId: '', qty: 1 });
            }, 2000);
        }, 1500);
    };

    if (step === 'success') return <div className="flex flex-col items-center justify-center h-96 animate-in fade-in"><div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/50"><Check size={48} className="text-white"/></div><h3 className="text-3xl font-bold text-white">Venda Realizada!</h3><p className="text-white/50 mt-2">O pedido já está na expedição.</p></div>;

    if (step === 'confirm') return <div className="flex flex-col items-center justify-center h-96 animate-in fade-in"><Loader size={48} className="text-blue-400 animate-spin mb-4"/><h3 className="text-xl font-bold text-white">Processando Pedido...</h3><p className="text-white/50">Verificando limite de crédito...</p></div>;

    return (
        <div className="space-y-6 animate-in fade-in">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                <ShoppingCart className={role === 'Téc. Nutrição' ? "text-pink-400" : "text-green-400"}/> Venda Rápida
            </h2>
            
            <GlassCard className="border-t-4 border-blue-500">
                <div className="space-y-4">
                    {/* Seleção de Cliente */}
                    <div>
                        <label className="text-xs text-white/60 font-bold uppercase ml-2 mb-1 block">Produtor / Cliente</label>
                        <select className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none [&>option]:bg-slate-900" value={order.client} onChange={e => setOrder({...order, client: e.target.value})}>
                            <option value="">Selecione o Cooperado...</option>
                            {MOCK_USERS.map(u => <option key={u.id} value={u.name}>{u.name} - {u.farm}</option>)}
                        </select>
                    </div>

                    {/* Seleção de Produto */}
                    <div>
                        <label className="text-xs text-white/60 font-bold uppercase ml-2 mb-1 block">Produto ({role === 'Téc. Nutrição' ? 'Nutrição' : 'Insumos'})</label>
                        <select className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none [&>option]:bg-slate-900" value={order.productId} onChange={e => setOrder({...order, productId: e.target.value})}>
                            <option value="">Selecione o Produto...</option>
                            {availableProducts.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} - {p.price > 0 ? formatCurrency(p.price) : 'Sob Consulta'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Quantidade e Total */}
                    <div className="grid grid-cols-2 gap-4 items-end">
                        <GlassInput label="Quantidade" type="number" value={order.qty} onChange={e => setOrder({...order, qty: e.target.value})} min="1"/>
                        <div className="bg-white/10 rounded-2xl p-3 text-right border border-white/10">
                            <p className="text-[10px] text-white/50 uppercase">Total Estimado</p>
                            <p className="text-xl font-bold text-emerald-400">{formatCurrency(total)}</p>
                        </div>
                    </div>

                    <NeonButton onClick={handleSale} className="w-full mt-4" variant="primary">
                        <CheckCircle size={18}/> Confirmar Venda
                    </NeonButton>
                </div>
            </GlassCard>

            {/* Últimas Vendas Rápidas */}
            <h3 className="font-bold text-white text-lg mt-4">Minhas Vendas Hoje</h3>
            <div className="space-y-2 opacity-60">
                <div className="bg-white/5 p-3 rounded-xl flex justify-between items-center">
                    <div><p className="text-white font-bold text-sm">João da Silva</p><p className="text-xs text-white/50">5x Ração Destete</p></div>
                    <span className="text-green-400 font-bold text-sm">R$ 412,50</span>
                </div>
            </div>
        </div>
    );
};

// --- OUTRAS TELAS ---
const ReceituarioView = () => (<div className="space-y-6 animate-in fade-in"><h2 className="text-3xl font-bold flex items-center gap-2 text-white"><FileSignature/> Receituário</h2><GlassCard><p className="text-white">Sistema de Emissão Digital</p><NeonButton className="mt-4">Novo Documento</NeonButton></GlassCard></div>);
const LogisticaView = () => (<div className="space-y-6 animate-in fade-in"><h2 className="text-3xl font-bold flex gap-2 text-white"><Truck/> Frota</h2><GlassCard className="h-96 flex items-center justify-center border-dashed text-white"><MapPin size={48} className="mr-2"/> Mapa em Tempo Real</GlassCard></div>);
const ExpedicaoView = () => (<div className="space-y-6 animate-in fade-in"><h2 className="text-3xl font-bold flex gap-2 text-white"><BoxSelect/> Expedição</h2><GlassCard className="border-l-4 border-yellow-500"><h3 className="font-bold text-white">Carga #9982</h3><NeonButton className="w-full mt-4 text-xs">Iniciar Conferência</NeonButton></GlassCard></div>);

// --- MÓDULO POOL DE COMPRAS (GAMIFICADO) ---
const PoolView = () => {
    const [joined, setJoined] = useState(false);
    
    // Dados da Campanha Principal
    const campaign = {
        name: "Glifosato 480 (Concentrado)",
        target: 100000, // Meta em Litros
        current: 35000, // Atual
        priceFrom: 21.00,
        priceTo: 17.00,
        deadline: "04 dias 12:30:00"
    };

    const progress = (campaign.current / campaign.target) * 100;

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold flex gap-2 text-white"><Users className="text-teal-400"/> Pool de Compras</h2>
                <span className="bg-teal-500/20 text-teal-400 px-3 py-1 rounded-full text-xs font-bold border border-teal-500/30 animate-pulse flex items-center gap-1">
                    <Clock size={12}/> Oportunidade Ativa
                </span>
            </div>

            {/* CAMPANHA DESTAQUE */}
            <GlassCard className="border-l-4 border-teal-500 relative overflow-hidden">
                {/* Efeito de Fundo */}
                <div className="absolute right-0 top-0 p-32 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded">OFERTA RELÂMPAGO</span>
                                <span className="text-teal-200 text-xs">Campanha Safra 24/25</span>
                            </div>
                            <h3 className="font-black text-2xl text-white">{campaign.name}</h3>
                        </div>
                        <div className="text-left md:text-right mt-4 md:mt-0 bg-black/20 p-3 rounded-xl border border-white/5">
                            <p className="text-xs text-white/50 line-through">De {formatCurrency(campaign.priceFrom)}</p>
                            <div className="flex items-baseline gap-1">
                                <p className="text-3xl font-black text-teal-400">{formatCurrency(campaign.priceTo)}</p>
                                <span className="text-sm text-white/70 font-normal">/L</span>
                            </div>
                            <p className="text-[10px] text-white/40">Condicionado à meta de 100k L</p>
                        </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="my-6 p-4 bg-black/20 rounded-xl border border-white/5">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/70 flex items-center gap-2"><Users size={14}/> 42 Produtores entraram</span>
                            <span className="text-teal-400 font-bold">{progress.toFixed(0)}% Atingido</span>
                        </div>
                        <div className="w-full bg-white/10 h-4 rounded-full overflow-hidden border border-white/5 relative">
                            {/* Barra de preenchimento */}
                            <div className="bg-gradient-to-r from-teal-800 to-teal-400 h-full transition-all duration-1000 relative" style={{ width: `${progress}%` }}>
                                <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/50 shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                            </div>
                            {/* Marca da Meta */}
                            <div className="absolute right-0 top-0 bottom-0 w-px bg-red-500/50 dashed"></div>
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] font-mono">
                            <span className="text-teal-200">{campaign.current.toLocaleString()} L Vendidos</span>
                            <span className="text-white/30">Meta: {campaign.target.toLocaleString()} L</span>
                        </div>
                        <p className="text-xs text-white/50 mt-3 text-center italic">
                            "Faltam <strong>{(campaign.target - campaign.current).toLocaleString()} litros</strong> para ativar o desconto máximo. Convide seu vizinho!"
                        </p>
                    </div>

                    {/* Ação */}
                    <div className="flex flex-col md:flex-row gap-4 items-center border-t border-white/10 pt-4">
                        <div className="flex-1 w-full">
                            <p className="text-xs text-white/50 mb-1">Oferta encerra em:</p>
                            <div className="flex gap-2 items-center">
                                <div className="bg-white/10 px-2 py-1 rounded text-white font-mono text-sm border border-white/10">04d</div>
                                <span className="text-white/30">:</span>
                                <div className="bg-white/10 px-2 py-1 rounded text-white font-mono text-sm border border-white/10">12h</div>
                                <span className="text-white/30">:</span>
                                <div className="bg-white/10 px-2 py-1 rounded text-white font-mono text-sm border border-white/10">30m</div>
                            </div>
                        </div>
                        
                        {!joined ? (
                            <NeonButton onClick={() => setJoined(true)} variant="accent" className="w-full md:w-auto h-12 text-lg shadow-teal-500/20 border-teal-500/50 px-8">
                                <CheckCircle size={20}/> Entrar no Pool
                            </NeonButton>
                        ) : (
                            <div className="w-full md:w-auto flex items-center justify-center gap-2 text-green-400 bg-green-500/10 px-6 py-3 rounded-xl border border-green-500/20 animate-pulse">
                                <CheckCircle size={24}/> 
                                <div>
                                    <p className="font-bold text-sm">Participação Confirmada</p>
                                    <p className="text-[10px]">Aguardando fechamento da meta.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </GlassCard>

            {/* OUTRAS OPORTUNIDADES (Lista Secundária) */}
            <h3 className="font-bold text-white text-lg mt-8 border-b border-white/10 pb-2">Encerrados / Futuros</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70 grayscale hover:grayscale-0 transition duration-300">
                 <GlassCard className="border-l-4 border-slate-500 flex justify-between items-center p-4">
                    <div>
                        <h4 className="font-bold text-white">Ureia Agrícola (Big Bag)</h4>
                        <p className="text-xs text-white/50">Meta atingida em 12/05. Sucesso.</p>
                    </div>
                    <Lock size={20} className="text-white/30"/>
                 </GlassCard>
                 <GlassCard className="border-l-4 border-slate-500 flex justify-between items-center p-4">
                    <div>
                        <h4 className="font-bold text-white">Semente de Trigo TBIO</h4>
                        <p className="text-xs text-white/50">Aguardando início da safra.</p>
                    </div>
                    <Clock size={20} className="text-white/30"/>
                 </GlassCard>
            </div>
        </div>
    );
};

const RelatoriosView = () => (<div className="space-y-6 animate-in fade-in"><h2 className="text-3xl font-bold flex gap-2 text-white"><FileBarChart/> Relatórios</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{["Vendas", "Estoque", "Inadimplência"].map((r,i)=><GlassCard key={i} className="p-4 flex justify-between cursor-pointer hover:bg-white/10"><span className="font-bold text-white">{r}</span><Download size={16} className="text-white"/></GlassCard>)}</div></div>);
// 2. MESA DE GRÃOS (TRADING COM GRÁFICO E ROBÔ)
const TradingView = ({ role }) => {
    const [selectedComm, setSelectedComm] = useState(1); // 1=Soja, 2=Milho, 3=Trigo
    const [orders, setOrders] = useState([
        { id: 101, commodity: 'Soja', target: 138.00, qty: 500, type: 'Físico', status: 'Aguardando', date: '28/11' }
    ]);
    const [newOrder, setNewOrder] = useState({ targetPrice: '', quantity: '', type: 'future' });

    // DADOS COM HISTÓRICO PARA O GRÁFICO
    const commodities = [
        { 
            id: 1, name: 'Soja', price: 135.50, trend: 'up', variation: '+1.2%', icon: '🌱', harvest: 'Safra 24/25',
            history: [128.5, 130.0, 129.2, 131.5, 133.0, 132.8, 135.5], // Últimos 7 dias
            color: '#4ade80' // Verde
        },
        { 
            id: 2, name: 'Milho', price: 58.20, trend: 'down', variation: '-0.5%', icon: '🌽', harvest: 'Safrinha 25',
            history: [60.0, 59.5, 59.8, 59.0, 58.5, 58.0, 58.2], 
            color: '#fbbf24' // Amarelo
        },
        { 
            id: 3, name: 'Trigo', price: 82.00, trend: 'neutral', variation: '0.0%', icon: '🌾', harvest: 'Inverno 25',
            history: [80.0, 81.2, 81.0, 82.5, 82.0, 81.8, 82.0],
            color: '#f87171' // Vermelho/Laranja
        }
    ];

    const activeAsset = commodities.find(c => c.id === selectedComm);

    // COMPONENTE DE GRÁFICO LEVE (SVG)
    const MiniChart = ({ data, color }) => {
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;
        
        // Gera os pontos da linha (coordenadas X,Y)
        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((val - min) / range) * 80 - 10; // Margem de 10%
            return `${x},${y}`;
        }).join(' ');

        return (
            <div className="w-full h-40 mt-4 relative">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    {/* Gradiente de Fundo */}
                    <defs>
                        <linearGradient id={`grad-${color}`} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
                            <stop offset="100%" stopColor={color} stopOpacity="0"/>
                        </linearGradient>
                    </defs>
                    <polygon points={`0,100 ${points} 100,100`} fill={`url(#grad-${color})`} />
                    {/* Linha Principal */}
                    <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/>
                    {/* Pontos de Dados */}
                    {data.map((val, i) => {
                        const x = (i / (data.length - 1)) * 100;
                        const y = 100 - ((val - min) / range) * 80 - 10;
                        return <circle key={i} cx={x} cy={y} r="1.5" fill="#fff" stroke={color} strokeWidth="0.5"/>;
                    })}
                </svg>
                {/* Indicadores de Máx/Min */}
                <div className="absolute top-0 right-0 text-[10px] text-white/50 bg-black/40 px-2 rounded">Máx: {formatCurrency(max)}</div>
                <div className="absolute bottom-0 right-0 text-[10px] text-white/50 bg-black/40 px-2 rounded">Mín: {formatCurrency(min)}</div>
            </div>
        );
    };

    const handleCreateLock = () => {
        if (!newOrder.targetPrice || !newOrder.quantity) return alert("Preencha todos os campos para ativar o robô.");
        
        const order = {
            id: Date.now(),
            commodity: activeAsset.name,
            target: parseFloat(newOrder.targetPrice),
            qty: parseInt(newOrder.quantity),
            type: newOrder.type === 'physical' ? 'Saldo em Silo' : 'Venda Futura',
            status: 'Ativa (Monitorando)',
            date: 'Hoje'
        };
        
        setOrders([order, ...orders]);
        alert(`✅ Robô Configurado!\n\nSe a ${activeAsset.name} bater R$ ${order.target}, a venda será executada automaticamente.`);
        setNewOrder({ ...newOrder, targetPrice: '', quantity: '' });
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-bold flex gap-2 text-white"><Gavel className="text-amber-400"/> Mesa de Grãos</h2>
                 {/* Seletor de Grão */}
                 <div className="flex bg-white/10 p-1 rounded-xl">
                    {commodities.map(c => (
                        <button 
                            key={c.id} 
                            onClick={() => setSelectedComm(c.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${selectedComm === c.id ? 'bg-white text-black shadow' : 'text-white/50 hover:text-white'}`}
                        >
                            {c.name}
                        </button>
                    ))}
                 </div>
            </div>

            {/* CARD PRINCIPAL (GRÁFICO) */}
            <GlassCard className="border-l-4 border-white/20 relative overflow-hidden">
                <div className="flex justify-between items-end relative z-10">
                    <div>
                        <p className="text-white/50 text-xs uppercase font-bold mb-1 flex items-center gap-1">{activeAsset.icon} {activeAsset.harvest}</p>
                        <h3 className="text-5xl font-black text-white tracking-tighter">{formatCurrency(activeAsset.price)}</h3>
                        <p className={`text-sm font-bold flex items-center gap-1 mt-1 ${activeAsset.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                            <Activity size={14}/> {activeAsset.variation} nas últimas 24h
                        </p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-white/40">Chicago (CBOT) - Delay 15min</p>
                    </div>
                </div>

                {/* O Gráfico desenhado na hora */}
                <MiniChart data={activeAsset.history} color={activeAsset.color} />
            </GlassCard>

            {/* FERRAMENTAS DE VENDA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Robô de Trava Automática */}
                <GlassCard className="border-t-4 border-amber-500 bg-amber-900/10">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><LockKeyhole className="text-amber-400"/> Trava Automática (Target)</h3>
                    
                    <div className="space-y-4">
                        <div className="flex bg-black/40 p-1 rounded-xl">
                            <button onClick={() => setNewOrder({...newOrder, type: 'future'})} className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${newOrder.type === 'future' ? 'bg-amber-500 text-black' : 'text-white/50'}`}>🚜 Futura (Lavoura)</button>
                            <button onClick={() => setNewOrder({...newOrder, type: 'physical'})} className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${newOrder.type === 'physical' ? 'bg-amber-500 text-black' : 'text-white/50'}`}>🏭 Física (Silo)</button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <GlassInput label="Qtd (Sacas)" type="number" value={newOrder.quantity} onChange={e=>setNewOrder({...newOrder, quantity: e.target.value})} placeholder="1000"/>
                            <GlassInput label="Preço Alvo (R$)" type="number" value={newOrder.targetPrice} onChange={e=>setNewOrder({...newOrder, targetPrice: e.target.value})} placeholder="140.00"/>
                        </div>
                        
                        <div className="flex justify-between text-[10px] text-white/40 px-1">
                            <span>Atual: {formatCurrency(activeAsset.price)}</span>
                            <span>Total Est.: {formatCurrency((newOrder.targetPrice || 0) * (newOrder.quantity || 0))}</span>
                        </div>

                        <NeonButton onClick={handleCreateLock} variant="accent" className="w-full mt-2">Armar Robô de Venda</NeonButton>
                    </div>
                </GlassCard>

                {/* Carteira de Ordens */}
                <GlassCard>
                    <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-white">Minhas Ordens</h3><Filter size={16} className="text-white/30"/></div>
                    <div className="space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar">
                        {orders.length === 0 && <p className="text-white/30 text-center py-8 text-xs">Nenhuma ordem ativa.</p>}
                        {orders.map(o => (
                            <div key={o.id} className="bg-white/5 p-3 rounded-xl border border-white/10 flex justify-between items-center group hover:bg-white/10 transition">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${o.type.includes('Futura') ? 'bg-blue-500/20 text-blue-300' : 'bg-orange-500/20 text-orange-300'}`}>{o.type}</span>
                                        <span className="text-[10px] text-white/30">{o.date}</span>
                                    </div>
                                    <p className="font-bold text-white">{o.commodity} <span className="text-xs text-white/50">({o.qty} sc)</span></p>
                                    <p className="text-xs text-amber-400 font-mono font-bold">Alvo: {formatCurrency(o.target)}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20 uppercase font-bold">{o.status}</span>
                                    <button className="block text-[10px] text-red-400 mt-2 hover:underline w-full text-right">Cancelar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
const CommunityView = ({ userEmail }) => <ChatModule title="Comunidade" subtitle="Produtores Online" userEmail={userEmail} />;
const AgriNewsWidget = () => <GlassCard className="col-span-full border-t-4 border-blue-400 p-4"><h3 className="text-lg font-bold mb-2 text-white"><Newspaper/> Notícias</h3></GlassCard>;
const WeatherWidget = () => <GlassCard className="col-span-full md:col-span-1 bg-gradient-to-br from-blue-900/40 to-slate-900/40"><h3 className="text-5xl font-black mt-2 text-white">28°</h3></GlassCard>;
const TaskWidget = ({onClick}) => <GlassCard onClick={onClick} className="col-span-full md:col-span-1 cursor-pointer hover:border-emerald-500/50"><h3 className="text-2xl font-bold text-white">3 Tarefas</h3></GlassCard>;
const FinanceWidget = ({onClick}) => <GlassCard onClick={onClick} className="col-span-full md:col-span-1 cursor-pointer hover:border-red-500/50"><h3 className="text-2xl font-bold text-white">R$ 15k</h3><p className="text-white/50">A vencer</p></GlassCard>;
// 3. MÓDULO GRÃOS (DETALHADO E TRANSPARENTE)
const GrainWalletView = () => {
    const [filter, setFilter] = useState('Todos');

    // Cálculo automático dos saldos totais
    const totalSoja = GRAIN_DATA.filter(g => g.produto === 'Soja').reduce((acc, curr) => acc + curr.saldo_final, 0);
    const totalTrigo = GRAIN_DATA.filter(g => g.produto === 'Trigo').reduce((acc, curr) => acc + curr.saldo_final, 0);
    
    const filteredData = filter === 'Todos' ? GRAIN_DATA : GRAIN_DATA.filter(d => d.produto === filter);

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white flex items-center gap-2"><Wheat className="text-yellow-400"/> Meus Grãos</h2>
                <div className="flex gap-2">
                    {['Todos', 'Soja', 'Trigo'].map(f => (
                        <button 
                            key={f} 
                            onClick={() => setFilter(f)} 
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition ${filter === f ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-white/5 text-white/50 border-white/10'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cards de Saldo em Silo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="bg-gradient-to-br from-yellow-600/20 to-yellow-900/20 border-yellow-500/30 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between mb-2">
                            <p className="text-white/60 text-sm font-bold uppercase">Soja em Depósito</p>
                            <Wheat size={20} className="text-yellow-400"/>
                        </div>
                        <h3 className="text-4xl font-black text-white">{(totalSoja / 60).toFixed(0)} <span className="text-lg font-normal opacity-50">sc</span></h3>
                        <p className="text-xs text-yellow-200/50 mt-1">≈ {totalSoja.toLocaleString()} kg físicos</p>
                    </div>
                </GlassCard>

                <GlassCard className="bg-gradient-to-br from-orange-600/20 to-orange-900/20 border-orange-500/30">
                    <div className="flex justify-between mb-2">
                        <p className="text-white/60 text-sm font-bold uppercase">Trigo em Depósito</p>
                        <Sprout size={20} className="text-orange-400"/>
                    </div>
                    <h3 className="text-4xl font-black text-white">{(totalTrigo / 60).toFixed(0)} <span className="text-lg font-normal opacity-50">sc</span></h3>
                    <p className="text-xs text-orange-200/50 mt-1">≈ {totalTrigo.toLocaleString()} kg físicos</p>
                </GlassCard>
            </div>

            <div className="flex items-center justify-between mt-6">
                <h3 className="font-bold text-white text-lg">Extrato de Romaneios (Classificação)</h3>
                <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Download size={14}/> PDF</button>
            </div>

            {/* Lista de Cargas Detalhada */}
            <div className="space-y-4">
                {filteredData.map(r => (
                    <GlassCard key={r.id} className="p-0 flex flex-col hover:border-white/30 transition duration-300">
                        {/* Cabeçalho da Carga */}
                        <div className="p-4 flex justify-between items-center bg-white/5 border-b border-white/10">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-white/80">ROMANEIO #{r.id}</span>
                                    <span className="text-[10px] text-white/40">{r.data}</span>
                                </div>
                                <p className="font-bold text-white text-lg mt-1">{r.produto} <span className="text-sm font-normal opacity-50">| Placa: {r.placa}</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-white/50 uppercase">Saldo Líquido</p>
                                <p className="text-2xl font-bold text-green-400">{(r.saldo_final).toLocaleString()} <span className="text-sm text-white/50">kg</span></p>
                            </div>
                        </div>
                        
                        {/* A "Caixa Preta" Aberta: Pesagem */}
                        <div className="p-4 grid grid-cols-3 gap-4 text-center border-b border-white/10 bg-black/20">
                            <div>
                                <p className="text-[10px] text-white/40 uppercase mb-1">Peso Bruto</p>
                                <div className="flex items-center justify-center gap-1 text-white font-mono font-bold">
                                    <Scale size={12} className="text-white/30"/> {r.bruto.toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] text-white/40 uppercase mb-1">Tara (Caminhão)</p>
                                <div className="flex items-center justify-center gap-1 text-white font-mono font-bold">
                                    <Truck size={12} className="text-white/30"/> {r.tara.toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] text-white/40 uppercase mb-1">Peso Sujo</p>
                                <div className="flex items-center justify-center gap-1 text-white font-mono font-bold">
                                    <Package size={12} className="text-white/30"/> {r.liquido.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Detalhe dos Descontos (Classificação) */}
                        <div className="p-4 bg-red-900/10 text-xs">
                            <p className="text-red-300 font-bold mb-3 flex items-center gap-2 uppercase tracking-wide">
                                <AlertTriangle size={12}/> Descontos de Classificação (Quebra)
                            </p>
                            
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                    <span className="text-white/70 flex items-center gap-2"><Droplets size={10}/> Umidade ({r.umidade}%)</span>
                                    <span className="text-red-400 font-mono font-bold">-{r.desconto_kg} kg</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                    <span className="text-white/70 flex items-center gap-2"><Filter size={10}/> Impureza ({r.impureza}%)</span>
                                    <span className="text-red-400 font-mono font-bold">-{Math.round(r.liquido * (r.impureza/100))} kg</span>
                                </div>
                            </div>
                            
                            <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center">
                                <span className="text-white/40 italic">Total descontado nesta carga:</span>
                                <span className="text-red-400 font-bold">-{r.desconto_kg + Math.round(r.liquido * (r.impureza/100))} kg</span>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};
const PriceUpdateView = () => (<div className="space-y-6 animate-in fade-in"><h2 className="text-3xl font-bold flex items-center gap-2"><FileUp/> Atualizador</h2><GlassCard className="text-center py-12 border-dashed border-white/20"><p>Arraste o PDF</p></GlassCard></div>);
const CRMView = () => (<div className="space-y-6 animate-in fade-in"><h2 className="text-3xl font-bold text-white"><Users2/> Produtores</h2><GlassCard>3 Online</GlassCard></div>);
const NutricaoView = ({ products }) => (
    <div className="space-y-6 animate-in fade-in">
        <div className="flex justify-between items-center"><h2 className="text-3xl font-bold text-white flex items-center gap-2"><Milk className="text-blue-300"/> Nutrição Animal</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.filter(p => p.tag === 'Nutrição').map(p => (
                <GlassCard key={p.id} className="flex flex-col justify-between h-full">
                    <div><div className="text-6xl mb-4 text-center">{p.img}</div><h4 className="font-bold text-white text-lg">{p.name}</h4><p className="text-xs text-white/50 mt-1">{p.desc}</p></div>
                    <div className="mt-4"><p className="text-emerald-400 font-bold text-xl mb-3">{formatCurrency(p.price)}</p><NeonButton variant="accent" className="w-full text-sm">Comprar</NeonButton></div>
                </GlassCard>
            ))}
        </div>
    </div>
);

const EstoqueView = ({ role, activeBranch }) => {
    const [scanning, setScanning] = useState(false); const [items, setItems] = useState(GLOBAL_STOCK); const fileRef = useRef(null);
    const handleScan = async () => { setScanning(true); await new Promise(r => setTimeout(r, 2500)); const novoItem = { id: Date.now(), nome: "Ureia Agrícola 46%", lote: "NF-8842", quantidade: 32000, unidade: "Kg", branch: "São Francisco de Assis", time: "Agora" }; GLOBAL_STOCK.unshift(novoItem); setItems([...GLOBAL_STOCK]); setScanning(false); alert("✅ Nota Fiscal processada via OCR.\nEstoque atualizado em São Francisco de Assis."); };
    const filteredItems = activeBranch.includes('Visão') ? items : items.filter(i => i.branch === activeBranch);
    return (
        <div className="space-y-6 animate-in fade-in">{(role === 'Estoquista' || role === 'Operador') && <GlassCard className="bg-slate-800/50 border-l-4 border-green-500"><div className="flex justify-between mb-6 items-center"><div><h3 className="text-xl font-bold text-white">Entrada (OCR)</h3><p className="text-white/50 text-sm">Unidade: São Francisco de Assis</p></div><NeonButton onClick={()=>fileRef.current.click()} className="py-3 bg-green-600 hover:bg-green-500"><Camera size={18}/> Scan</NeonButton><input type="file" ref={fileRef} hidden onChange={handleScan}/></div>{scanning && <div className="text-center py-4 text-green-400 animate-pulse">Processando...</div>}</GlassCard>}<div className="grid grid-cols-1 md:grid-cols-3 gap-4">{filteredItems.map(i => (<GlassCard key={i.id} className="border-l-4 border-blue-500 p-4"><div className="flex justify-between"><span className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-white">{i.lote}</span><span className="text-green-400 text-xs font-bold">{i.time}</span></div><h4 className="font-bold mt-2 text-white">{i.nome}</h4><p className="text-xs text-white/50 mt-1 flex items-center gap-1"><MapPin size={10}/> {i.branch}</p><div className="mt-4 border-t border-white/10 pt-2 font-bold text-xl text-white">{i.quantidade} <span className="text-xs font-normal">{i.unidade}</span></div></GlassCard>))}</div></div>
    );
};

// --- HOMES ---
const DirectorHome = ({ setView, branchData }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in"><GlassCard className="cursor-pointer hover:bg-white/5" onClick={() => setView('estoque')}><h3 className="font-bold text-lg text-white">Estoque</h3><p className="text-2xl font-bold text-white">{branchData.stock}</p></GlassCard><GlassCard className="cursor-pointer hover:bg-white/5" onClick={() => setView('financeiro')}><h3 className="font-bold text-lg text-white">Vendas</h3><p className="text-2xl font-bold text-white">{branchData.sales}</p></GlassCard><GlassCard className="cursor-pointer hover:bg-white/5" onClick={() => setView('logistica')}><h3 className="font-bold text-lg text-white">Logística</h3><p className="text-2xl font-bold text-white">{branchData.trucks}</p></GlassCard></div>
);
const ProducerHome = ({ setView }) => (
    <div className="space-y-6 animate-in fade-in"><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><AgriNewsWidget /><WeatherWidget /><TaskWidget onClick={() => setView('chat')} /><FinanceWidget onClick={() => setView('financeiro')} /><GlassCard className="col-span-2 border-l-4 border-yellow-500 flex justify-between items-center cursor-pointer" onClick={() => setView('marketplace')}><div><h3 className="text-xl font-bold text-white">Loja Cotribá</h3><p className="text-sm opacity-70 text-white">Insumos disponíveis.</p></div><Tractor size={64} className="opacity-20 text-white"/></GlassCard><div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-4"><button onClick={() => setView('chat')} className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex flex-col items-center gap-2 text-white"><MessageCircle/><span className="text-xs">Consultor</span></button><button onClick={() => setView('agrilens')} className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex flex-col items-center gap-2 text-white"><ScanEye/><span className="text-xs">AgriLens</span></button><button onClick={() => setView('pool')} className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex flex-col items-center gap-2 text-white"><Users/><span className="text-xs">Pool</span></button><button onClick={() => setView('marketplace')} className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex flex-col items-center gap-2 text-white"><ShoppingBag/><span className="text-xs">Loja</span></button></div></div></div>
);
const OperatorHome = ({ setView }) => (<div className="grid grid-cols-1 gap-6 animate-in fade-in"><GlassCard className="col-span-full border-l-4 border-green-500 text-center py-12 cursor-pointer hover:bg-white/5" onClick={()=>setView('estoque')}><Camera size={48} className="mx-auto mb-4 text-green-400"/><h3 className="text-2xl font-bold text-white">Escanear Entrada</h3></GlassCard></div>);
const EstoquistaDashboard = ({ setView }) => (<div className="grid grid-cols-1 gap-6 animate-in fade-in"><GlassCard className="col-span-full border-l-4 border-green-500 text-center py-12 cursor-pointer hover:bg-white/5" onClick={()=>setView('estoque')}><Camera size={48} className="mx-auto mb-4 text-green-400"/><h3 className="text-2xl font-bold text-white">Escanear Entrada</h3></GlassCard></div>);
const SmartHome = ({ role, setView, branchData, activeBranch }) => {
    // 1. Perfis Externos/Operacionais
    if (role === 'Produtor') return <ProducerHome setView={setView} />;
    if (role === 'Estoquista') return <EstoquistaDashboard setView={setView} />;
    if (role === 'Operador') return <OperatorHome setView={setView} />;
    
    // 2. Perfil SUPERVISOR DE ARMAZÉM (Novo Painel Operacional)
    if (role === 'Supervisor Armazém') {
        return <WarehouseView setView={setView} role={role} activeBranch={activeBranch} />;
    }
    
    // 3. Perfil TÉC. SEGURANÇA (Painel Original de EHS)
    if (role === 'Téc. Segurança') {
        return <SafetyView setView={setView} role={role} activeBranch={activeBranch} />;
    }

    // 4. Diretoria
    return <DirectorHome setView={setView} branchData={branchData} />;
};
const SwitchTenantWidget = ({ currentTenant, onSwitch }) => {
    const otherTenant = currentTenant === 'cotriba' ? '3tentos' : 'cotriba';
    const OtherLogo = tenants[otherTenant].logo;
    return (<GlassCard className="cursor-pointer hover:bg-white/10 border-dashed border-white/30" onClick={() => onSwitch(otherTenant)}><div className="flex items-center gap-4"><div className="p-3 bg-white/10 rounded-full"><Repeat size={24}/></div><div><h4 className="font-bold text-lg">Acessar {tenants[otherTenant].name}</h4><p className="text-xs text-white/50">Trocar de conta cooperativa</p></div><OtherLogo className="ml-auto opacity-50" size={32}/></div></GlassCard>);
};

const LoginScreen = ({ onLogin, loading, error }) => {
    const [email, setEmail] = useState(''); const [pass, setPass] = useState(''); const [isRegistering, setIsRegistering] = useState(false);
    const handleSubmit = (e) => { e.preventDefault(); onLogin(email, pass, isRegistering); };
    const quickLogin = (e, roleEmail) => { e.preventDefault(); onLogin(roleEmail, '123456'); };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#003B71] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-yellow-500/20 via-[#003B71] to-[#003B71]"/>
            <GlassCard className="w-full max-w-sm p-8 relative z-10 border-yellow-500/30">
                <div className="text-center mb-8"><div className="inline-flex p-4 bg-white/10 rounded-full mb-4 text-yellow-400 shadow-lg"><Wheat size={48}/></div><h1 className="text-4xl font-black text-white tracking-tighter">Cotribá <span className="text-yellow-400">Digital</span></h1><p className="text-white/60 text-sm mt-2">Acesso Corporativo</p></div>
                <form onSubmit={handleSubmit} className="space-y-4"><GlassInput label="Email" icon={Mail} value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com"/><GlassInput label="Senha" icon={Lock} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••"/>
                {error && <div className="text-red-400 text-xs bg-red-500/10 p-2 rounded">{String(error)}</div>}
                <NeonButton className="w-full" disabled={loading}>{loading ? 'Entrando...' : 'Acessar'}</NeonButton></form>
                <div className="mt-6 pt-4 border-t border-white/10"><p className="text-[10px] text-white/30 text-center mb-2 uppercase tracking-widest">Acesso Rápido (Demo)</p><div className="grid grid-cols-3 gap-2">
                    <button onClick={(e)=>quickLogin(e, 'everton@cotriba.com')} className="text-[10px] bg-purple-900/50 p-2 rounded text-purple-200 border border-purple-500/30 hover:bg-purple-800 transition">1. Everton</button>
                    <button onClick={(e)=>quickLogin(e, 'ricardo@cotriba.com')} className="text-[10px] bg-blue-900/50 p-2 rounded text-blue-200 border border-blue-500/30 hover:bg-blue-800 transition">2. Ricardo</button>
                    <button onClick={(e)=>quickLogin(e, 'operador@cotriba.com')} className="text-[10px] bg-orange-900/50 p-2 rounded text-orange-200 border border-orange-500/30 hover:bg-orange-800 transition">3. Operador</button>
                    <button onClick={(e)=>quickLogin(e, 'produtor@cotriba.com')} className="text-[10px] bg-green-900/50 p-2 rounded text-green-200 border border-green-500/30 hover:bg-green-800 transition">4. Produtor</button>
                    <button onClick={(e)=>quickLogin(e, 'estoquista@cotriba.com')} className="text-[10px] bg-cyan-900/50 p-2 rounded text-cyan-200 border border-cyan-500/30 hover:bg-cyan-800 transition">5. Estoque</button>
                    <button onClick={(e)=>quickLogin(e, 'agronomo@cotriba.com')} className="text-[10px] bg-teal-900/50 p-2 rounded text-teal-200 border border-teal-500/30 hover:bg-teal-800 transition">6. Agrônomo</button>
                    <button onClick={(e)=>quickLogin(e, 'nutri@cotriba.com')} className="text-[10px] bg-pink-900/50 p-2 rounded text-pink-200 border border-pink-500/30 hover:bg-pink-800 transition">7. Nutrição</button>
                    <button onClick={(e)=>quickLogin(e, 'adm@cotriba.com')} className="text-[10px] bg-gray-700 p-2 rounded text-gray-200 border border-gray-500 transition">8. Admin</button>
                    <button onClick={(e)=>quickLogin(e, 'motorista@cotriba.com')} className="text-[10px] bg-red-900/50 p-2 rounded text-red-200 border border-red-500/30 hover:bg-red-800 transition">9. Motorista</button>
                    <button onClick={(e)=>quickLogin(e, 'seguranca@cotriba.com')} className="text-[10px] bg-yellow-900/50 p-2 rounded text-yellow-200 border border-yellow-500/30 hover:bg-yellow-800 transition">10. Segurança</button>
                    <button onClick={(e)=>quickLogin(e, 'supervisor@cotriba.com')} className="text-[10px] bg-indigo-900/50 p-2 rounded text-indigo-200 border border-indigo-500/30 hover:bg-indigo-800 transition">11. Supervisor</button>
                </div><p className="text-[10px] text-white/20 text-center mt-4">Powered by <strong>Vitalis OS</strong></p></div>
            </GlassCard>
        </div>
    );
};

// --- MÓDULO DE INOVAÇÃO: VITALIS COPILOT (SUPER FUNCIONÁRIO) ---
const VitalisCopilot = ({ setView, role }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [command, setCommand] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [feedback, setFeedback] = useState(null); 

    const executeCommand = () => {
        if (!command.trim()) return;
        setIsProcessing(true);
        setFeedback(null);
        
        const cmd = command.toLowerCase();

        // SIMULAÇÃO DE INTELIGÊNCIA ARTIFICIAL (NLP)
        setTimeout(() => {
            setIsProcessing(false);

            // 1. PROCESSO DE ASSOCIAÇÃO (RH/JURÍDICO)
            // Ex: "Quais documentos precisa para associar?" ou "Como cadastrar novo sócio?"
            if (cmd.includes("associar") || cmd.includes("sócio") || cmd.includes("cadastro")) {
                if (cmd.includes("documento") || cmd.includes("precisa")) {
                    setFeedback({
                        type: "info",
                        title: "📋 Requisitos para Associação (PF)",
                        details: [
                            "1. Cópia do CPF e RG (e do cônjuge)",
                            "2. Matrícula do Imóvel (atualizada 30 dias)",
                            "3. CCIR e ITR do último exercício",
                            "4. Inscrição Estadual de Produtor",
                            "5. Comprovante de Endereço"
                        ],
                        action: "Dica: Digite 'Gerar contrato para CPF...' quando tiver os documentos."
                    });
                } else {
                    // Ex: "Gerar contrato para João Silva"
                    setFeedback({
                        type: "success",
                        title: "📝 Contrato de Associação Gerado",
                        details: [
                            "Tipo: Pessoa Física",
                            "Status: Minuta criada no Jurídico",
                            "Matrícula Provisória: #99821",
                            "Pendência: Assinatura Digital"
                        ],
                        action: "Link para assinatura enviado ao WhatsApp do produtor."
                    });
                }
                return;
            }

            // 2. RELATÓRIOS COMPLEXOS (GRÃOS)
            // Ex: "Relatório tradição 40/40 últimos 15 dias"
            if (cmd.includes("relatório") || cmd.includes("tradição")) {
                setFeedback({
                    type: "success",
                    title: "📊 Relatório de Recebimento (Tradição)",
                    details: [
                        "Período: Últimos 15 dias",
                        "Filtro: Soja Padrão 40/40",
                        "Volume Total: 45.200 sacas",
                        "Umidade Média: 13.2%",
                        "Impureza Média: 0.8%"
                    ],
                    action: "O PDF completo foi enviado para seu e-mail."
                });
                return;
            }

            // 3. VENDAS E PEDIDOS (COMERCIAL)
            // Ex: "Vender 10 caixas de fungicida para o Pedro"
            if (cmd.includes("venda") || cmd.includes("vender") || cmd.includes("pedido")) {
                setFeedback({
                    type: "success",
                    title: "💰 Pedido de Venda Criado",
                    details: [
                        "Cliente: Pedro (Identificado na carteira)",
                        "Produto: Fungicida Fox Xpro",
                        "Qtd: 10 Caixas",
                        "Valor Total: R$ 12.500,00",
                        "Status: Aguardando Faturamento"
                    ],
                    action: "Nota Fiscal pré-emitida. Estoque reservado."
                });
                return;
            }

            // 4. CONSULTA RÁPIDA (GERAL)
            if (cmd.includes("estoque") || cmd.includes("preço")) {
                setFeedback({
                    type: "info",
                    title: "🔎 Consulta Rápida",
                    details: ["Produto: Ureia Agrícola", "Estoque: 500 Ton (S. Francisco)", "Preço: R$ 135,00"],
                    action: "Deseja reservar?"
                });
                return;
            }

            // Fallback
            setFeedback({
                type: "error",
                title: "Comando não entendido",
                details: ["Tente ser mais específico, ex:", "'Gerar contrato de associação'", "'Relatório de soja'", "'Vender adubo'"],
                action: ""
            });

        }, 1500);
    };

    return (
        <>
            <button onClick={() => { setIsOpen(true); setFeedback(null); setCommand(""); }} className="fixed bottom-24 right-6 z-50 bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 rounded-full shadow-2xl shadow-blue-900/50 hover:scale-110 transition-transform border-2 border-white/20 group">
                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
                <Briefcase size={28}/>
                <span className="absolute right-full mr-3 top-2 bg-black/90 text-white text-xs px-3 py-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 font-bold">Vitalis Copilot</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-0">
                        <motion.div initial={{ y: 100, scale: 0.9 }} animate={{ y: 0, scale: 1 }} exit={{ y: 100, scale: 0.9 }} className="w-full max-w-lg bg-[#0f172a] border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                            <div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-bold text-white flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center"><Briefcase size={16}/></div> Vitalis Copilot</h3><button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-white"><X size={24}/></button></div>

                            {feedback ? (
                                <div className={`mb-6 p-4 rounded-2xl border ${feedback.type === 'success' ? 'bg-green-900/20 border-green-500/50' : feedback.type === 'error' ? 'bg-red-900/20 border-red-500/50' : 'bg-blue-900/20 border-blue-500/50'}`}>
                                    <h4 className={`font-bold text-lg mb-2 ${feedback.type === 'success' ? 'text-green-400' : feedback.type === 'error' ? 'text-red-400' : 'text-blue-400'}`}>{feedback.title}</h4>
                                    <ul className="space-y-2 mb-4">{feedback.details.map((det, i) => (<li key={i} className="text-sm text-white/80 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/50"/> {det}</li>))}</ul>
                                    <p className="text-xs font-bold uppercase tracking-wider opacity-50">{feedback.action}</p>
                                    <NeonButton onClick={() => { setFeedback(null); setCommand(""); }} className="w-full mt-4">Nova Solicitação</NeonButton>
                                </div>
                            ) : (
                                <div className="mb-6 text-center">
                                    <p className="text-white/60 text-sm mb-4">Sou o seu Assistente Administrativo. O que deseja fazer?</p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        <button onClick={() => setCommand("O que precisa para associar?")} className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-indigo-300 hover:bg-white/10">📋 Requisitos Sócio</button>
                                        <button onClick={() => setCommand("Fazer contrato de associação para CPF...")} className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-indigo-300 hover:bg-white/10">📝 Gerar Contrato</button>
                                        <button onClick={() => setCommand("Relatório Tradição 40/40 últimos 15 dias")} className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-indigo-300 hover:bg-white/10">📊 Relatório Grãos</button>
                                    </div>
                                </div>
                            )}

                            {!feedback && (
                                <div className="relative">
                                    <input autoFocus value={command} onChange={(e) => setCommand(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && executeCommand()} className="w-full bg-black/40 border border-indigo-500/50 rounded-2xl pl-4 pr-14 py-4 text-lg text-white focus:outline-none focus:border-indigo-400 shadow-inner placeholder-white/20" placeholder="Digite ou fale o comando..."/>
                                    <div className="absolute right-2 top-2 flex gap-1">{isProcessing ? <Loader className="animate-spin text-white p-2" size={40}/> : (<button onClick={executeCommand} className="p-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition"><Send size={20}/></button>)}</div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};


// --- MAIN DASHBOARD (COM MENU MOBILE CORRIGIDO) ---
const Dashboard = ({ user, role, currentTenant, onChangeTenant, onLogout, marketProducts, setMarketProducts }) => {
    const [view, setView] = useState('home');
    const [activeBranch, setActiveBranch] = useState(currentTenant.branches[0]);
    const [showMobileMenu, setShowMobileMenu] = useState(false); // Estado do Menu
    const [chatContext, setChatContext] = useState(null);
    const Logo = currentTenant.logo;

    const menu = [
        { id: 'venda_direta', icon: ShoppingCart, label: 'Venda Rápida', roles: ['Eng. Agrônomo', 'Téc. Nutrição', 'Coord. Regional'] },
        { id: 'home', icon: Home, label: 'Visão Geral', roles: ['Admin', 'Coord. Regional', 'Coord. Unidade', 'Operador', 'Produtor', 'Estoquista', 'Eng. Agrônomo', 'Téc. Nutrição', 'Assist. Administrativo', 'Motorista', 'Téc. Segurança', 'Supervisor Armazém'] },
        { id: 'marketplace', icon: ShoppingBag, label: 'Loja', roles: ['Produtor', 'Téc. Nutrição'] },
        { id: 'grains', icon: Wheat, label: 'Grãos', roles: ['Produtor', 'Coord. Regional', 'Coord. Unidade', 'Admin'] },
        { id: 'trading', icon: Gavel, label: 'Grãos', roles: ['Admin', 'Produtor', 'Coord. Regional'] },
        { id: 'estoque', icon: Package, label: 'Estoque', roles: ['Admin', 'Coord. Regional', 'Coord. Unidade', 'Operador', 'Estoquista', 'Supervisor Armazém'] },
        { id: 'logistica', icon: Truck, label: 'Logística', roles: ['Admin', 'Operador', 'Coord. Regional', 'Motorista'] },
        { id: 'financeiro', icon: Wallet, label: 'Financeiro', roles: ['Admin', 'Produtor', 'Coord. Regional', 'Assist. Administrativo'] },
        { id: 'comunidade', icon: Users, label: 'Comunidade', roles: ['Produtor'] },
        { id: 'agrilens', icon: ScanEye, label: 'AgriLens', roles: ['Produtor', 'Eng. Agrônomo'] },
        { id: 'receituario', icon: FileSignature, label: 'Receituário', roles: ['Eng. Agrônomo'] },
        { id: 'chat', icon: MessageCircle, label: 'Chat', roles: ['Produtor', 'Admin', 'Eng. Agrônomo', 'Téc. Nutrição', 'Téc. Segurança', 'Supervisor Armazém'] },
        { id: 'pool', icon: Users, label: 'Pool', roles: ['Produtor'] },
        { id: 'team_chat', icon: MessageSquare, label: 'Team', roles: ['Admin', 'Operador', 'Estoquista', 'Coord. Regional', 'Coord. Unidade'] },
        { id: 'safety', icon: HardHat, label: 'Segurança', roles: ['Téc. Segurança', 'Supervisor Armazém', 'Coord. Unidade'] },
        { id: 'crm', icon: Users2, label: 'Produtores', roles: ['Coord. Regional', 'Coord. Unidade'] },
        { id: 'relatorios', icon: FileBarChart, label: 'Relatórios', roles: ['Admin', 'Coord. Regional', 'Coord. Unidade', 'Assist. Administrativo'] },
        { id: 'price_update', icon: FileUp, label: 'Preços', roles: ['Admin'] },
        { id: 'nutricao', icon: Milk, label: 'Nutrição', roles: ['Produtor', 'Téc. Nutrição', 'Coord. Regional'] },
    ].filter(item => item.roles.includes(role));

    const branchData = useMemo(() => {
        if (activeBranch === 'São Francisco de Assis') return { stock: '3.200 Ton', sales: 'R$ 450k', trucks: 5 };
        if (activeBranch.includes('Visão')) return { stock: '15.800 Ton', sales: 'R$ 2.1M', trucks: 22 };
        return { stock: '1.500 Ton', sales: 'R$ 120k', trucks: 2 };
    }, [activeBranch]);

    return (
        <div className={`min-h-screen bg-gradient-to-br ${currentTenant.colors.gradient} text-white font-sans flex transition-all duration-1000`}>
            <div className="fixed inset-0 z-0 pointer-events-none"><img src={currentTenant.bg_image} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="bg"/><div className="absolute inset-0 bg-black/60"/><div className="absolute bottom-8 right-8 opacity-10"><Logo size={400}/></div></div>
            
            {/* SIDEBAR (DESKTOP) */}
            <aside className={`w-20 ${currentTenant.colors.sidebar} border-r border-white/10 flex flex-col items-center py-6 gap-6 hidden md:flex relative z-20 backdrop-blur-xl`}>
                <div className={`p-3 bg-white/10 rounded-xl ${currentTenant.colors.primary.replace('bg-', 'text-')}`}><Logo size={28}/></div>
                <nav className="flex-1 flex flex-col gap-4 w-full px-2">{menu.map(item => (<button key={item.id} onClick={() => setView(item.id)} className={twMerge("p-3 rounded-xl transition-all flex justify-center group relative", view === item.id ? "bg-white/20 text-white" : "text-white/40 hover:text-white hover:bg-white/5")} title={item.label}><item.icon size={22}/></button>))}</nav><button onClick={onLogout} className="p-3 text-white/30 hover:text-red-400 transition"><LogOut size={22}/></button>
            </aside>

            {/* ÁREA PRINCIPAL */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
                {/* LÓGICA DE PERMISSÃO REGIONAL ATUALIZADA */}
{(role === 'Admin' || role === 'Coord. Regional' || role === 'Téc. Segurança') && (
    <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/20 transition">
        <MapPin size={14} className={currentTenant.colors.accent.replace('text-', 'text-')}/>
        <select 
            value={activeBranch} 
            onChange={(e) => setActiveBranch(e.target.value)} 
            className="bg-transparent text-xs font-bold text-white outline-none appearance-none cursor-pointer [&>option]:bg-slate-900 pr-2 min-w-[120px]"
        >
            {currentTenant.branches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <ChevronDown size={12} className="text-white/50"/>
    </div>
)}
{/* --- VITALIS COPILOT (APENAS PARA FUNCIONÁRIOS) --- */}
            {role !== 'Produtor' && (
                <VitalisCopilot setView={setView} role={role} />
            )} 
               
                {/* CONTEÚDO ROLÁVEL COM PADDING PARA O MENU MOBILE */}
                <div className="flex-1 overflow-y-auto p-6 pb-24">
                    <AnimatePresence mode="wait">
                        <motion.div key={view + activeBranch} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            {view === 'venda_direta' && <DirectSalesView products={marketProducts} role={role} />}
                            {view === 'home' && <SmartHome role={role} setView={setView} branchData={branchData} activeBranch={activeBranch} />}
                            {view === 'estoque' && <EstoqueView userId={user.uid} inventory={[]} role={role} activeBranch={activeBranch} />}
                            {view === 'agrilens' && <AgriLensView setView={setView} setChatContext={setChatContext}/>}
                            {view === 'marketplace' && <MarketplaceView goToChat={() => setView('chat')} role={role} products={marketProducts} setView={setView} setChatContext={setChatContext}/>}
                            {view === 'trading' && <TradingView role={role}/>}
                            {view === 'expedicao' && <ExpedicaoView />}
                            {view === 'logistica' && <LogisticaView />}
                            {view === 'financeiro' && (role === 'Produtor' ? <CobreancaView /> : <FinanceiroCompleto role={role} />)}
                            {view === 'admin_finance' && <FinanceiroCompleto role={role} />}
                            {view === 'cobranca' && <CobreancaView />}
                            {view === 'grains' && <GrainWalletView />}
                            {view === 'comunidade' && <CommunityView userEmail={user.email} />}
                            {view === 'chat' && <ChatModule title="Suporte Técnico" subtitle="Online agora" userEmail={user.email} role={role} chatContext={chatContext} setChatContext={setChatContext}/>}
                            {view === 'team_chat' && <ChatModule title="Chat Interno" subtitle="Equipe" />}
                            {view === 'receituario' && <ReceituarioView />}
                            {view === 'pool' && <PoolView />}
                            {view === 'crm' && <CRMView />}
                            {view === 'safety' && <SafetyView setView={setView} role={role} activeBranch={activeBranch} />}
                            {view === 'relatorios' && <RelatoriosView />}
                            {view === 'price_update' && <PriceUpdateView products={marketProducts} setProducts={setMarketProducts} />}
                            {view === 'nutricao' && <NutricaoView products={marketProducts} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
      
            {/* --- GAVETA DE MENU MOBILE (CORRIGIDA) --- */}
            <AnimatePresence>
                {showMobileMenu && (
                    <motion.div 
                        initial={{ y: "100%" }} 
                        animate={{ y: 0 }} 
                        exit={{ y: "100%" }} 
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="md:hidden fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl pt-6 px-6 pb-24 overflow-y-auto flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                            <h2 className="text-2xl font-bold text-white">Menu Completo</h2>
                            <button onClick={() => setShowMobileMenu(false)} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20"><X size={24}/></button>
                        </div>
                        <div className="grid grid-cols-3 gap-4 pb-4">
                            {menu.map(item => (
                                <button key={item.id} onClick={() => { setView(item.id); setShowMobileMenu(false); }} className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${view === item.id ? 'bg-white/10 border-yellow-500/50 text-yellow-400' : 'bg-white/5 border-transparent text-white/50'}`}>
                                    <item.icon size={24}/>
                                    <span className="text-[10px] font-medium text-center">{item.label}</span>
                                </button>
                            ))}
                            <button onClick={onLogout} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-red-900/20 text-red-400 border border-red-900/50">
                                <LogOut size={24}/>
                                <span className="text-[10px] font-medium">Sair</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- BARRA INFERIOR (DOCK) --- */}
            <div className="md:hidden fixed bottom-0 w-full bg-[#002851] border-t border-white/10 p-2 flex justify-around items-center z-50 pb-6 safe-area-bottom">
                {/* 4 Ícones Principais */}
                {menu.slice(0, 4).map(item => (
                    <button key={item.id} onClick={() => { setView(item.id); setShowMobileMenu(false); }} className={twMerge("p-3 rounded-xl transition", view === item.id ? "text-yellow-400 bg-white/10" : "text-white/50")}>
                        <item.icon size={24}/>
                    </button>
                ))}
                {/* Botão Menu (Abre a Gaveta) */}
                <button onClick={() => setShowMobileMenu(true)} className={twMerge("p-3 rounded-xl transition text-white/50", showMobileMenu && "text-yellow-400 bg-white/10")}>
                    <Menu size={24}/>
                </button>
            </div>
        </div>
    );
};
export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    // Estado GLOBAL de produtos (Híbrido)
    const [marketProducts, setMarketProducts] = useState([
        { id: 1, name: "Adubo NPK 10-10-10", unit: "Ton", img: "🌱", type: 'consult', promo: true, tag: "Insumos", stock: true, desc: "Fertilizante mineral.", price: 0 },
        { id: 2, name: "Herbicida Glyphosate", unit: "Litro", img: "🧪", type: 'consult', promo: false, tag: "Químicos", stock: true, desc: "Controle de plantas.", price: 0 },
        { id: 3, name: "Botina Segurança", unit: "Par", img: "🥾", type: 'retail', promo: false, tag: "EPI", stock: true, desc: "Couro legítimo.", price: 149.90 },
        { id: 4, name: "Semente Trigo", unit: "Sc", img: "🌾", type: 'consult', promo: false, tag: "Sementes", stock: true, desc: "Alta produtividade.", price: 0 },
        // Novos produtos de Nutrição
        { id: 5, name: "Tamponada 22%", unit: "Sc", img: "🐄", type: 'retail', promo: true, tag: "Nutrição", stock: true, desc: "Alta performance.", price: 95.00 },
        { id: 6, name: "Destete 18%", unit: "Sc", img: "🐂", type: 'retail', promo: false, tag: "Nutrição", stock: true, desc: "Crescimento.", price: 82.50 },
        { id: 7, name: "Bovino de Corte 140", unit: "Sc", img: "🥩", type: 'retail', promo: false, tag: "Nutrição", stock: true, desc: "Engorda rápida.", price: 78.00 },
        { id: 8, name: "Dieta Total", unit: "Ton", img: "🥣", type: 'consult', promo: false, tag: "Nutrição", stock: true, desc: "Nutrição completa.", price: 0 },
        { id: 9, name: "Fosfosal 500ml", unit: "Frasco", img: "💉", type: 'retail', promo: false, tag: "Nutrição", stock: true, desc: "Suplemento injetável.", price: 45.90 }
    ]);

    useEffect(() => { if(!auth) { setLoading(false); return; } const init = async () => { try { if(initialAuthToken) await signInWithCustomToken(auth, initialAuthToken); else await signInAnonymously(auth); } catch(e) {} }; if(!user) init(); return onAuthStateChanged(auth, u => { setUser(u); setLoading(false); }); }, []);
    const handleLogin = async (email, pass, isRegister) => { setLoading(true); setAuthError(null); try { if(isRegister) await createUserWithEmailAndPassword(auth, email, pass); else await signInWithEmailAndPassword(auth, email, pass); } catch(e) { setAuthError(e.message); setLoading(false); } };

    if (!user) return <LoginScreen onLogin={handleLogin} loading={loading} error={authError} />;
    return <Dashboard user={user} role={getUserRole(user.email)} currentTenant={tenants['cotriba']} onChangeTenant={() => {}} onLogout={() => signOut(auth)} marketProducts={marketProducts} setMarketProducts={setMarketProducts} />;
}