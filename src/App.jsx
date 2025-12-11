import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Picker } from '@react-native-picker/picker';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Home, Package, MessageCircle, Wallet, User, LogOut, Loader, Camera, Send, Leaf, Building2, 
  AlertTriangle, MapPin, Search, ShieldCheck, ShoppingCart, FileText, Truck, Cloud,
  CreditCard, Wind, Droplets, CheckCircle, Tractor, Sprout, Clock, Trash2, Menu, Play, Pause, Paperclip, 
  BarChart3, Activity, ShoppingBag, Megaphone, ArrowRightLeft, Filter, Mic, Video, Image as ImageIcon,
  Lock, Mail, FileSignature, QrCode, Gavel, Scale, ScanEye, Users, Siren, PieChart, LineChart,
  Hash, Download, BoxSelect, Wrench, Split, Landmark, FileUp, RefreshCw, Check, Newspaper, ChevronRight, LayoutGrid, Globe2, 
  Bell, Database, Layers, Coffee, Wheat, ChevronDown, Smartphone, UserCheck, PlusCircle, Gauge, Signal, Fuel, Map, 
  LockKeyhole, Pill, Banknote, Milk, Users2, HardHat, ShieldAlert, MessageSquare, Navigation, FileBarChart, PackageCheck, History, AlertCircle, Calendar, Briefcase, Sparkles, ArrowRight, X, Repeat,
  ArrowUpRight, ArrowDownLeft, DollarSign, Barcode, Unlock, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// 1. CONFIGURAÇÃO E DADOS
// ============================================================================

// ============================================================================
// 1. CONFIGURAÇÃO (COLE SUAS CHAVES DO NOVO PROJETO AQUI)
// ============================================================================

const apiKey = "AIzaSyDDNyTI1wdBHnZkrJV9aYC5ZvRAYk9fP14"; // <--- SUA CHAVE GEMINI (IA)

const firebaseConfig = {
    apiKey: "AIzaSyCLZdof7ckXqiwK5Mn6i8-G73eCUTx-WNA",
  authDomain: "vitalis-demo-v2.firebaseapp.com",
  projectId: "vitalis-demo-v2",
  storageBucket: "vitalis-demo-v2.firebasestorage.app",
  messagingSenderId: "893780689786",
  appId: "1:893780689786:web:b68d1bef7c33a153b94cc3"
};

// Inicialização Real do Banco de Dados
let app, db, auth;
try {
    // Só inicia se você tiver colado a chave acima
    if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("AIzaSy...")) {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
    } else {
        console.warn("⚠️ AVISO: Chaves do Firebase não configuradas. O chat não funcionará.");
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

// --- MÓDULO DE CHAT REAL (MULTIMÍDIA + PRESENÇA ONLINE) ---
const ChatModule = ({ title, subtitle, userEmail, role, chatContext, setChatContext }) => {
    const isCommunity = title.includes("Comunidade"); 
    const [activeSlot, setActiveSlot] = useState(null); 
    const [viewTab, setViewTab] = useState('chats'); // 'chats' ou 'online'
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const endRef = useRef(null);

    // CANAIS CORPORATIVOS (Acesso da Equipe/Suporte)
    const supportChannels = [
        { id: 'chat_comercial', name: 'Comercial', icon: <ShoppingBag className="text-blue-400" size={24}/>, desc: 'Vendas', type: 'dept' },
        { id: 'chat_agronomia', name: 'Agronomia', icon: <Wheat className="text-green-400" size={24}/>, desc: 'Técnico', type: 'dept' },
        { id: 'chat_nutricao', name: 'Nutrição', icon: <Milk className="text-pink-400" size={24}/>, desc: 'Rações', type: 'dept' },
        { id: 'chat_seguranca', name: 'Segurança', icon: <ShieldCheck className="text-red-400" size={24}/>, desc: 'Normas', type: 'dept' }
    ];

    // GRUPOS DA COMUNIDADE
    const [communityGroups, setCommunityGroups] = useState([
        { id: 'gp_geral', name: "Comunidade Geral", desc: "120 membros", icon: <Users size={24}/>, type: 'group' },
        { id: 'gp_vizinhos', name: "Vizinhos Unidade", desc: "Local", icon: <MapPin size={24}/>, type: 'group' }
    ]);

    // LISTA DE PESSOAS ONLINE (MOCKUP INTELIGENTE)
    // Se sou Produtor -> Vejo outros Produtores.
    // Se sou Equipe -> Vejo Produtores para atender.
    const onlinePeople = MOCK_USERS.filter(u => u.name !== (userEmail ? userEmail.split('@')[0] : ''));

    // --- 1. CONEXÃO REAL-TIME ---
    useEffect(() => {
        if (!activeSlot || !db) return;
        
        // Define a coleção baseada se é um Grupo ou um Chat Direto (Pessoa)
        const collectionId = activeSlot.type === 'user' ? `dm_${activeSlot.id}` : activeSlot.id;

        const q = query(
            collection(db, 'vitalis_chats', collectionId, 'messages'), 
            orderBy('createdAt', 'asc'), 
            limit(100)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [activeSlot]);

    // --- 2. ENVIAR TEXTO ---
    const handleSend = async (e) => { 
        e.preventDefault(); 
        if(!input.trim()) return; 
        sendMessage(input, 'text');
    };

    // --- 3. ENVIAR MÍDIA (SIMULAÇÃO DE UPLOAD PARA DEMO) ---
    const sendMedia = (mediaType) => {
        const content = mediaType === 'audio' ? "Áudio (0:14)" : mediaType === 'video' ? "Vídeo da Lavoura.mp4" : "Foto.jpg";
        sendMessage(content, mediaType);
    };

    const sendMessage = async (content, type) => {
        const collectionId = activeSlot.type === 'user' ? `dm_${activeSlot.id}` : activeSlot.id;
        
        const msgData = {
            text: content,
            sender: userEmail ? userEmail.split('@')[0] : "Anônimo",
            role: role || "Usuário",
            createdAt: serverTimestamp(),
            type: type
        };

        if (db) {
            await addDoc(collection(db, 'vitalis_chats', collectionId, 'messages'), msgData);
            setInput(""); 
        } else {
            // Fallback Offline
            setMessages([...messages, { ...msgData, id: Date.now(), createdAt: { seconds: Date.now()/1000 } }]);
        }
    };

    // ROTEAMENTO AGRILENS
    useEffect(() => {
        if (chatContext && !activeSlot && setChatContext) {
            const target = supportChannels.find(d => d.id === `chat_${chatContext.id}`) || supportChannels[1];
            if (target) { setActiveSlot(target); setChatContext(null); }
        }
    }, [chatContext]);

    const createGroup = () => {
        if(!newGroupName) return;
        const newGroup = { id: `gp_${Date.now()}`, name: newGroupName, icon: <Users size={24}/>, desc: "Criado agora", type: 'group' };
        setCommunityGroups([...communityGroups, newGroup]);
        setShowCreateGroup(false);
    };

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    // RENDERIZAÇÃO DA MENSAGEM (BOLHAS DE MÍDIA)
    const renderMessageBubble = (m) => {
        const isMe = m.sender === (userEmail ? userEmail.split('@')[0] : 'Anônimo');
        
        // Bolha de Áudio
        if (m.type === 'audio') return (
            <div className={`flex items-center gap-3 p-3 rounded-2xl min-w-[150px] ${isMe ? 'bg-green-600 text-white' : 'bg-white/10 text-white'}`}>
                <button className="p-2 bg-black/20 rounded-full hover:bg-black/40"><Play size={16} fill="white"/></button>
                <div className="flex flex-col"><div className="h-1 w-24 bg-white/30 rounded-full mb-1"/><span className="text-[10px] opacity-70">0:14</span></div>
            </div>
        );

        // Bolha de Imagem/Vídeo
        if (m.type === 'image' || m.type === 'video') return (
            <div className={`p-2 rounded-2xl ${isMe ? 'bg-green-600' : 'bg-white/10'}`}>
                <div className="w-48 h-32 bg-black/30 rounded-lg flex items-center justify-center border border-white/10 mb-1">
                    {m.type === 'image' ? <ImageIcon size={32} className="text-white/50"/> : <Video size={32} className="text-white/50"/>}
                </div>
                <p className="text-xs text-white px-1">{m.text}</p>
            </div>
        );

        // Bolha de Texto Padrão
        return (
            <div className={`p-3 rounded-2xl text-sm ${isMe ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none border border-white/5'}`}>
                <p>{m.text}</p>
            </div>
        );
    };

    // TELA 1: LOBBY (LISTAS)
    if (!activeSlot) return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                    <MessageCircle className={isCommunity ? "text-yellow-400" : "text-green-400"}/> 
                    {isCommunity ? "Comunidade" : "Atendimento"}
                </h2>
                
                {/* ABAS DE NAVEGAÇÃO (GRUPOS vs ONLINE) */}
                <div className="flex bg-white/10 rounded-lg p-1">
                    <button onClick={()=>setViewTab('chats')} className={`px-3 py-1 rounded text-xs transition ${viewTab==='chats'?'bg-white/20 text-white':'text-white/40'}`}>Conversas</button>
                    <button onClick={()=>setViewTab('online')} className={`px-3 py-1 rounded text-xs transition ${viewTab==='online'?'bg-white/20 text-white':'text-white/40'}`}>Online</button>
                </div>
            </div>

            {/* LISTA DE CONVERSAS (GRUPOS E DEPARTAMENTOS) */}
            {viewTab === 'chats' && (
                <>
                    {isCommunity && <NeonButton onClick={() => setShowCreateGroup(!showCreateGroup)} className="w-full mb-4 h-10 text-xs" variant="secondary"><PlusCircle size={14}/> Novo Grupo</NeonButton>}
                    {showCreateGroup && (<GlassCard className="mb-4 bg-yellow-900/20 p-3 flex gap-2"><GlassInput placeholder="Nome..." value={newGroupName} onChange={e=>setNewGroupName(e.target.value)}/><NeonButton onClick={createGroup}>Criar</NeonButton></GlassCard>)}
                    
                    <div className="grid grid-cols-1 gap-3">
                        {(isCommunity ? communityGroups : supportChannels).map(item => (
                            <GlassCard key={item.id} onClick={() => setActiveSlot(item)} className="p-4 cursor-pointer hover:bg-white/10 flex items-center gap-4 transition-all">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white">{item.icon}</div>
                                <div><h4 className="font-bold text-white">{item.name}</h4><p className="text-xs text-white/50">{item.desc}</p></div>
                                <ArrowRightLeft size={16} className="ml-auto text-white/30"/>
                            </GlassCard>
                        ))}
                    </div>
                </>
            )}

            {/* LISTA DE PESSOAS ONLINE (WHASTAPP STYLE) */}
            {viewTab === 'online' && (
                <div className="grid grid-cols-1 gap-3">
                    <p className="text-xs text-white/40 uppercase mb-1">Disponíveis agora</p>
                    {onlinePeople.map(u => (
                        <GlassCard key={u.id} onClick={() => setActiveSlot({...u, type: 'user'})} className="p-3 cursor-pointer hover:bg-white/10 flex items-center gap-3 border-l-4 border-green-500">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">{u.name[0]}</div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-white text-sm">{u.name}</h4>
                                <p className="text-xs text-green-400">{u.farm}</p>
                            </div>
                            <MessageCircle size={20} className="text-white/30"/>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );

    // TELA 2: SALA DE CHAT
    return (
        <div className="h-[600px] flex flex-col bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden animate-in fade-in">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button onClick={() => setActiveSlot(null)} className="p-2 hover:bg-white/10 rounded-full text-white"><ArrowRightLeft className="rotate-180" size={20}/></button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">{activeSlot.icon || <User/>}</div>
                        <div><h3 className="font-bold text-white">{activeSlot.name}</h3><p className="text-xs text-green-400 flex items-center gap-1">● Online</p></div>
                    </div>
                </div>
            </div>
            
            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 && <div className="text-center text-white/20 py-10">Inicie a conversa...</div>}
                
                {messages.map((m) => {
                    const isMe = m.sender === (userEmail ? userEmail.split('@')[0] : 'Eu');
                    return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className="flex flex-col gap-1 max-w-[80%]">
                                <span className={`text-[9px] ${isMe ? 'text-right' : 'text-left'} text-white/40 ml-1`}>{!isMe && m.sender}</span>
                                {renderMessageBubble(m)}
                            </div>
                        </div>
                    );
                })}
                <div ref={endRef}/>
            </div>
            
            {/* Input Multimídia */}
            <form onSubmit={handleSend} className="p-3 bg-white/5 border-t border-white/10 flex gap-2 items-center">
                <button type="button" onClick={()=>sendMedia('audio')} className="p-2 text-white/50 hover:text-green-400 transition bg-white/5 rounded-full"><Mic size={20}/></button>
                <button type="button" onClick={()=>sendMedia('image')} className="p-2 text-white/50 hover:text-blue-400 transition bg-white/5 rounded-full"><Camera size={20}/></button>
                <button type="button" onClick={()=>sendMedia('video')} className="p-2 text-white/50 hover:text-purple-400 transition bg-white/5 rounded-full"><Video size={20}/></button>
                
                <div className="flex-1 relative">
                    <input value={input} onChange={e=>setInput(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-full px-4 py-2 text-white focus:outline-none focus:border-green-500/50 text-sm" placeholder="Mensagem..."/>
                </div>
                <button type="submit" className="p-2 bg-green-600 rounded-full text-white shadow-lg hover:scale-105 transition"><Send size={18}/></button>
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

// --- MÓDULO DE VENDA DIRETA (AGRÔNOMO/NUTRIÇÃO) - COMPLETO ---
const DirectSalesView = ({ products, role }) => {
    const [step, setStep] = useState('form'); 
    // ADICIONADO: payment e delivery
    const [order, setOrder] = useState({ client: '', productId: '', qty: 1, payment: 'safra', delivery: 'retira' });

    const availableProducts = products.filter(p => {
        if (role === 'Téc. Nutrição') return p.tag === 'Nutrição';
        if (role === 'Eng. Agrônomo') return p.tag !== 'Nutrição'; 
        return true; 
    });

    const selectedProduct = availableProducts.find(p => p.id == order.productId);
    const total = selectedProduct ? (selectedProduct.price || 0) * order.qty : 0;

    const handleSale = () => {
        if (!order.client || !order.productId) return alert("Preencha os dados do pedido.");
        setStep('confirm');
        setTimeout(() => {
            setStep('success');
            setTimeout(() => {
                // Mensagem mais completa
                alert(`✅ Pedido Realizado!\n\nCliente: ${order.client}\nTotal: ${formatCurrency(total)}\nPagamento: ${order.payment.toUpperCase()}\nEntrega: ${order.delivery.toUpperCase()}\n\nO pedido seguiu para faturamento.`);
                setStep('form');
                setOrder({ client: '', productId: '', qty: 1, payment: 'safra', delivery: 'retira' });
            }, 2000);
        }, 1500);
    };

    if (step === 'success') return <div className="flex flex-col items-center justify-center h-96 animate-in fade-in"><div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/50"><Check size={48} className="text-white"/></div><h3 className="text-3xl font-bold text-white">Sucesso!</h3><p className="text-white/50 mt-2">Pedido #4402 gerado.</p></div>;

    if (step === 'confirm') return <div className="flex flex-col items-center justify-center h-96 animate-in fade-in"><Loader size={48} className="text-blue-400 animate-spin mb-4"/><h3 className="text-xl font-bold text-white">Reservando Estoque...</h3><p className="text-white/50">Validando limite de crédito...</p></div>;

    return (
        <div className="space-y-6 animate-in fade-in">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                <ShoppingCart className={role === 'Téc. Nutrição' ? "text-pink-400" : "text-green-400"}/> Venda Rápida
            </h2>
            
            <GlassCard className="border-t-4 border-blue-500">
                <div className="space-y-4">
                    {/* Cliente */}
                    <div>
                        <label className="text-xs text-white/60 font-bold uppercase ml-2 mb-1 block">Cliente</label>
                        <select className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none [&>option]:bg-slate-900" value={order.client} onChange={e => setOrder({...order, client: e.target.value})}>
                            <option value="">Selecione o Cooperado...</option>
                            {MOCK_USERS.map(u => <option key={u.id} value={u.name}>{u.name} - {u.farm}</option>)}
                        </select>
                    </div>

                    {/* Produto */}
                    <div>
                        <label className="text-xs text-white/60 font-bold uppercase ml-2 mb-1 block">Produto</label>
                        <select className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none [&>option]:bg-slate-900" value={order.productId} onChange={e => setOrder({...order, productId: e.target.value})}>
                            <option value="">Selecione...</option>
                            {availableProducts.map(p => (<option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>))}
                        </select>
                    </div>

                    {/* Quantidade e Pagamento (Lado a Lado) */}
                    <div className="grid grid-cols-2 gap-4">
                        <GlassInput label="Qtd" type="number" value={order.qty} onChange={e => setOrder({...order, qty: e.target.value})} min="1"/>
                        
                        <div>
                            <label className="text-xs text-white/60 font-bold uppercase ml-2 mb-1 block">Pagamento</label>
                            <select className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:outline-none [&>option]:bg-slate-900" value={order.payment} onChange={e => setOrder({...order, payment: e.target.value})}>
                                <option value="safra">🌾 Safra 2025</option>
                                <option value="30d">📅 30 Dias</option>
                                <option value="avista">💵 À Vista (Pix)</option>
                            </select>
                        </div>
                    </div>

                    {/* Entrega e Total */}
                    <div className="grid grid-cols-2 gap-4 items-end">
                         <div>
                            <label className="text-xs text-white/60 font-bold uppercase ml-2 mb-1 block">Logística</label>
                            <select className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:outline-none [&>option]:bg-slate-900" value={order.delivery} onChange={e => setOrder({...order, delivery: e.target.value})}>
                                <option value="retira">🏭 Retira na Loja</option>
                                <option value="entrega">🚚 Entregar na Fazenda</option>
                            </select>
                        </div>

                        <div className="bg-white/10 rounded-2xl p-3 text-right border border-white/10">
                            <p className="text-[10px] text-white/50 uppercase">Total Pedido</p>
                            <p className="text-xl font-bold text-emerald-400">{formatCurrency(total)}</p>
                        </div>
                    </div>

                    <NeonButton onClick={handleSale} className="w-full mt-4" variant="primary">
                        <CheckCircle size={18}/> Fechar Pedido
                    </NeonButton>
                </div>
            </GlassCard>
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
// 5. MESA DE GRÃOS (VISÃO HÍBRIDA: GESTÃO x PRODUTOR)
const TradingView = ({ role }) => {
    const [selectedComm, setSelectedComm] = useState(1); 
    const [orders, setOrders] = useState([{ id: 101, commodity: 'Soja', target: 138.00, qty: 500, type: 'Físico', status: 'Aguardando', date: '28/11' }]); 
    const [newOrder, setNewOrder] = useState({ targetPrice: '', quantity: '', type: 'future' });

    // Verifica se é Gestão (Vê quem travou) ou Produtor (Trava o seu)
    const isManager = ['Admin', 'Coord. Regional', 'Coord. Unidade', 'Assist. Administrativo', 'Eng. Agrônomo'].includes(role);

    // DADOS DE MERCADO (COMUM A TODOS)
    const commodities = [
        { id: 1, name: 'Soja', price: 135.50, trend: 'up', variation: '+1.2%', icon: '🌱', harvest: 'Safra 24/25', history: [128.5, 130.0, 129.2, 131.5, 133.0, 132.8, 135.5], color: '#4ade80' }, 
        { id: 2, name: 'Milho', price: 58.20, trend: 'down', variation: '-0.5%', icon: '🌽', harvest: 'Safrinha 25', history: [60.0, 59.5, 59.8, 59.0, 58.5, 58.0, 58.2], color: '#fbbf24' }, 
        { id: 3, name: 'Trigo', price: 82.00, trend: 'neutral', variation: '0.0%', icon: '🌾', harvest: 'Inverno 25', history: [80.0, 81.2, 81.0, 82.5, 82.0, 81.8, 82.0], color: '#f87171' }
    ];
    const activeAsset = commodities.find(c => c.id === selectedComm);

    // DADOS DOS PRODUTORES (SÓ GESTÃO VÊ)
    const producerLocks = [
        { id: 1, produtor: "João da Silva", commodity: "Soja", alvo: 138.00, vol: "1.000 sc", tipo: "Futura", status: "Aberto" },
        { id: 2, produtor: "Sítio Alvorada", commodity: "Milho", alvo: 60.00, vol: "500 sc", tipo: "Física", status: "Executado" },
        { id: 3, produtor: "Agro Santos", commodity: "Soja", alvo: 140.00, vol: "5.000 sc", tipo: "Futura", status: "Aberto" },
        { id: 4, produtor: "Faz. Boa Vista", commodity: "Trigo", alvo: 85.00, vol: "2.000 sc", tipo: "Física", status: "Aberto" }
    ];

    // GRÁFICO SIMPLES (SVG)
    const MiniChart = ({ data, color }) => {
        const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1;
        const points = data.map((val, i) => { const x = (i / (data.length - 1)) * 100; const y = 100 - ((val - min) / range) * 80 - 10; return `${x},${y}`; }).join(' ');
        return (
            <div className="w-full h-40 mt-4 relative">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <defs><linearGradient id={`grad-${color}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
                    <polygon points={`0,100 ${points} 100,100`} fill={`url(#grad-${color})`} />
                    <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/>
                    {data.map((val, i) => { const x = (i / (data.length - 1)) * 100; const y = 100 - ((val - min) / range) * 80 - 10; return <circle key={i} cx={x} cy={y} r="1.5" fill="#fff" stroke={color} strokeWidth="0.5"/>; })}
                </svg>
                <div className="absolute top-0 right-0 text-[10px] text-white/50 bg-black/40 px-2 rounded">Máx: {formatCurrency(max)}</div>
            </div>
        );
    };

    const handleCreateLock = () => { 
        if (!newOrder.targetPrice || !newOrder.quantity) return alert("Preencha todos os campos."); 
        const order = { id: Date.now(), commodity: activeAsset.name, target: parseFloat(newOrder.targetPrice), qty: parseInt(newOrder.quantity), type: newOrder.type === 'physical' ? 'Saldo em Silo' : 'Venda Futura', status: 'Ativa', date: 'Hoje' }; 
        setOrders([order, ...orders]); alert(`✅ Ordem Criada!`); setNewOrder({ ...newOrder, targetPrice: '', quantity: '' }); 
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-bold flex gap-2 text-white"><Gavel className="text-amber-400"/> Comercialização</h2>
                 <div className="flex bg-white/10 p-1 rounded-xl">{commodities.map(c => (<button key={c.id} onClick={()=>setSelectedComm(c.id)} className={`px-3 py-1 rounded-lg text-xs font-bold transition ${selectedComm === c.id ? 'bg-white text-black' : 'text-white/50'}`}>{c.name}</button>))}</div>
            </div>

            {/* GRÁFICO (VISÍVEL PARA TODOS) */}
            <GlassCard className="border-l-4 border-white/20 relative overflow-hidden">
                <div className="flex justify-between items-end relative z-10">
                    <div>
                        <p className="text-white/50 text-xs uppercase font-bold mb-1 flex items-center gap-1">{activeAsset.icon} {activeAsset.harvest}</p>
                        <h3 className="text-5xl font-black text-white tracking-tighter">{formatCurrency(activeAsset.price)}</h3>
                        <p className={`text-sm font-bold flex items-center gap-1 mt-1 ${activeAsset.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}><Activity size={14}/> {activeAsset.variation} hoje</p>
                    </div>
                    <div className="text-right hidden md:block"><p className="text-xs text-white/40">Chicago (CBOT) - Delay 15min</p></div>
                </div>
                <MiniChart data={activeAsset.history} color={activeAsset.color} />
            </GlassCard>

            {/* ÁREA CONDICIONAL: GESTÃO vs PRODUTOR */}
            {isManager ? (
                // VISÃO DO GESTOR (Monitor de Travas)
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-white flex gap-2 items-center"><Users size={18}/> Produtores com Preço Travado</h3>
                        <button className="text-xs text-blue-400 border border-blue-500/30 px-3 py-1 rounded hover:bg-blue-500/10">Exportar Relatório</button>
                    </div>
                    <div className="grid gap-3">
                        {producerLocks.map(lock => (
                            <GlassCard key={lock.id} className="p-3 flex justify-between items-center border-l-4 border-amber-500">
                                <div>
                                    <h4 className="font-bold text-white text-sm">{lock.produtor}</h4>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-[10px] bg-white/10 text-white px-1.5 rounded">{lock.commodity}</span>
                                        <span className={`text-[10px] px-1.5 rounded ${lock.tipo === 'Futura' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>{lock.tipo}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-amber-400 font-mono font-bold text-lg">{formatCurrency(lock.alvo)}</p>
                                    <p className="text-[10px] text-white/50">{lock.vol} • {lock.status}</p>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            ) : (
                // VISÃO DO PRODUTOR (Robô de Venda)
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GlassCard className="border-t-4 border-amber-500 bg-amber-900/10">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2"><LockKeyhole/> Trava Automática</h3>
                        <div className="space-y-4">
                            <div className="flex bg-black/40 p-1 rounded-xl"><button onClick={() => setNewOrder({...newOrder, type: 'future'})} className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${newOrder.type === 'future' ? 'bg-amber-500 text-black' : 'text-white/50'}`}>🚜 Futura</button><button onClick={() => setNewOrder({...newOrder, type: 'physical'})} className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${newOrder.type === 'physical' ? 'bg-amber-500 text-black' : 'text-white/50'}`}>🏭 Física</button></div>
                            <div className="grid grid-cols-2 gap-4"><GlassInput label="Qtd" type="number" value={newOrder.quantity} onChange={e=>setNewOrder({...newOrder, quantity: e.target.value})}/><GlassInput label="Alvo" type="number" value={newOrder.targetPrice} onChange={e=>setNewOrder({...newOrder, targetPrice: e.target.value})}/></div>
                            <NeonButton onClick={handleCreateLock} variant="accent" className="w-full mt-2">Armar Robô</NeonButton>
                        </div>
                    </GlassCard>
                    <GlassCard><h3 className="font-bold text-white mb-4">Minhas Ordens</h3><div className="space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar">{orders.map(o => (<div key={o.id} className="bg-white/5 p-3 rounded-xl border border-white/10 flex justify-between items-center"><div><p className="font-bold text-white">{o.commodity} <span className="text-xs text-white/50">({o.qty} sc)</span></p><p className="text-xs text-amber-400 font-mono font-bold">Alvo: {formatCurrency(o.target)}</p></div><div className="text-right"><span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">{o.status}</span></div></div>))}</div></GlassCard>
                </div>
            )}
        </div>
    );
};
const CommunityView = ({ userEmail }) => <ChatModule title="Comunidade" subtitle="Produtores Online" userEmail={userEmail} />;
const AgriNewsWidget = () => <GlassCard className="col-span-full border-t-4 border-blue-400 p-4"><h3 className="text-lg font-bold mb-2 text-white"><Newspaper/> Notícias</h3></GlassCard>;
const WeatherWidget = () => <GlassCard className="col-span-full md:col-span-1 bg-gradient-to-br from-blue-900/40 to-slate-900/40"><h3 className="text-5xl font-black mt-2 text-white">28°</h3></GlassCard>;
const TaskWidget = ({onClick}) => <GlassCard onClick={onClick} className="col-span-full md:col-span-1 cursor-pointer hover:border-emerald-500/50"><h3 className="text-2xl font-bold text-white">3 Tarefas</h3></GlassCard>;
const FinanceWidget = ({onClick}) => (
    <GlassCard onClick={onClick} className="col-span-full md:col-span-1 cursor-pointer hover:border-emerald-500/50 group">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-2xl font-bold text-white">R$ 145k</h3>
                <p className="text-white/50 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> Conta Digital
                </p>
            </div>
            <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition">
                <Landmark size={20}/>
            </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
            <span className="text-[10px] text-blue-300 font-bold flex items-center gap-1">
                <Tractor size={10}/> Limite subiu hoje
            </span>
            <ArrowRight size={14} className="text-white/30"/>
        </div>
    </GlassCard>
);

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

// --- HOMES (COORDENADOR DE UNIDADE - RICARDO - COM VISÃO DE GRÃOS) ---
const CoordinatorHome = ({ setView, branchData }) => {
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, graos_fisico, travas, pool_criador, sede, clientes
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [newCampaign, setNewCampaign] = useState({ name: '', target: '', discountPrice: '' });
    
    // DADOS: TRAVAS DE GRÃOS (COMERCIAL)
    const grainLocks = [
        { id: 1, produtor: "João da Silva", produto: "Soja", qtd: "1.000 sc", alvo: "R$ 138,00", status: "Aguardando Mercado" },
        { id: 2, produtor: "Agro Santos", produto: "Trigo", qtd: "500 sc", alvo: "R$ 85,00", status: "Executado" },
        { id: 3, produtor: "Sítio Alvorada", produto: "Milho", qtd: "2.000 sc", alvo: "R$ 60,00", status: "Aguardando Mercado" }
    ];

    // DADOS: ESTOQUE DA SEDE
    const matrizStock = [
        { id: 1, name: "Ureia Agrícola", qtd: 15000, unit: "Sacos" },
        { id: 2, name: "Glifosato 480", qtd: 5000, unit: "Litros" },
        { id: 3, name: "Semente Soja Intacta", qtd: 800, unit: "Sacos" }
    ];

    // DADOS NOVOS: POSIÇÃO FÍSICA DE GRÃOS (ARMAZÉM LOCAL)
    const producerGrainStocks = [
        { id: 1, name: "João da Silva", soja: 5400, milho: 1200, trigo: 0, sobra: 12.5 },
        { id: 2, name: "Agro Santos Ltda", soja: 12800, milho: 5000, trigo: 2000, sobra: 4.2 },
        { id: 3, name: "Sítio Alvorada", soja: 2100, milho: 0, trigo: 0, sobra: -2.1 }, // Alerta
        { id: 4, name: "Fazenda Boa Vista", soja: 8500, milho: 3000, trigo: 1500, sobra: 8.0 },
        { id: 5, name: "Cooperado Paulo", soja: 1500, milho: 0, trigo: 0, sobra: 15.0 }
    ];

    // Cálculo dos Totais Locais
    const totalSoja = producerGrainStocks.reduce((acc, curr) => acc + curr.soja, 0);
    const totalMilho = producerGrainStocks.reduce((acc, curr) => acc + curr.milho, 0);
    const mediaSobra = (producerGrainStocks.reduce((acc, curr) => acc + curr.sobra, 0) / producerGrainStocks.length).toFixed(2);

    // Funções
    const handleCreateCampaign = () => {
        if(!newCampaign.name || !newCampaign.target) return alert("Preencha os dados.");
        alert(`🚀 Campanha "${newCampaign.name}" ativada com sucesso!`);
        setNewCampaign({ name: '', target: '', discountPrice: '' });
    };
    const handleSearchClient = () => {
        if (!searchTerm) return;
        setSearchResult({ name: "João da Silva", doc: "000.123.456-78", score: "A", debt: "R$ 15.200", limit: "R$ 150.000" });
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* CABEÇALHO */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white flex items-center gap-2"><Building2 className="text-blue-400"/> Gestão Unidade</h2>
                        <p className="text-xs text-white/50">Filial: <strong className="text-green-400">São Francisco de Assis</strong></p>
                    </div>
                    <div className="text-right hidden md:block"><p className="text-[10px] text-white/40 uppercase">Meta do Mês</p><p className="text-2xl font-bold text-green-400">92%</p></div>
                </div>
                
                {/* MENU DO COORDENADOR */}
                <div className="flex gap-2 bg-black/20 p-1 rounded-xl overflow-x-auto no-scrollbar">
                    {['dashboard', 'graos_fisico', 'travas', 'pool_criador', 'sede', 'clientes'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold uppercase whitespace-nowrap transition ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}>
                            {tab === 'dashboard' ? 'Visão Geral' : tab === 'graos_fisico' ? '🌾 Posição Física' : tab === 'travas' ? 'Originação' : tab === 'pool_criador' ? 'Criar Campanha' : tab === 'sede' ? 'Estoque Matriz' : 'Clientes'}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- ABA 1: DASHBOARD LOCAL --- */}
            {activeTab === 'dashboard' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <GlassCard className="cursor-pointer hover:bg-white/5 border-l-4 border-green-500" onClick={() => setView('estoque')}>
                            <div className="flex justify-between"><div><p className="text-white/60 text-xs">Estoque Insumos</p><h3 className="text-2xl font-black text-white">{branchData.stock}</h3></div><Package className="text-green-400"/></div>
                        </GlassCard>
                        <GlassCard className="cursor-pointer hover:bg-white/5 border-l-4 border-blue-500" onClick={() => setView('financeiro')}>
                            <div className="flex justify-between"><div><p className="text-white/60 text-xs">Vendas Hoje</p><h3 className="text-2xl font-black text-white">{branchData.sales}</h3></div><ShoppingBag className="text-blue-400"/></div>
                        </GlassCard>
                        <GlassCard className="cursor-pointer hover:bg-white/5 border-l-4 border-yellow-500" onClick={() => setView('logistica')}>
                            <div className="flex justify-between"><div><p className="text-white/60 text-xs">Pátio</p><h3 className="text-2xl font-black text-white">{branchData.trucks} Caminhões</h3></div><Truck className="text-yellow-400"/></div>
                        </GlassCard>
                    </div>
                </>
            )}

            {/* --- ABA 2: POSIÇÃO FÍSICA DE GRÃOS (NOVA) --- */}
            {activeTab === 'graos_fisico' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="grid grid-cols-3 gap-3">
                        <GlassCard className="p-3 bg-yellow-900/20 border-yellow-500/30 text-center">
                            <p className="text-[10px] text-white/50 uppercase font-bold">Total Soja</p>
                            <p className="text-xl font-black text-yellow-400">{totalSoja.toLocaleString()} <span className="text-[10px]">sc</span></p>
                        </GlassCard>
                        <GlassCard className="p-3 bg-orange-900/20 border-orange-500/30 text-center">
                            <p className="text-[10px] text-white/50 uppercase font-bold">Total Milho</p>
                            <p className="text-xl font-black text-orange-400">{totalMilho.toLocaleString()} <span className="text-[10px]">sc</span></p>
                        </GlassCard>
                        <GlassCard className="p-3 bg-blue-900/20 border-blue-500/30 text-center">
                            <p className="text-[10px] text-white/50 uppercase font-bold">Sobra Média</p>
                            <p className={`text-xl font-black ${mediaSobra >= 0 ? 'text-green-400' : 'text-red-400'}`}>{mediaSobra}%</p>
                        </GlassCard>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-white">Detalhamento por Produtor</h3>
                            <button className="text-xs text-blue-400 flex items-center gap-1"><Download size={14}/> Exportar</button>
                        </div>
                        <div className="space-y-2">
                            <div className="grid grid-cols-12 text-[10px] text-white/40 px-4 uppercase font-bold">
                                <div className="col-span-5">Produtor</div>
                                <div className="col-span-3 text-center">Soja</div>
                                <div className="col-span-3 text-center">Milho</div>
                                <div className="col-span-1 text-right">Sobra</div>
                            </div>
                            {producerGrainStocks.map(p => (
                                <div key={p.id} className="bg-white/5 p-3 rounded-xl border border-white/5 grid grid-cols-12 items-center hover:bg-white/10 transition">
                                    <div className="col-span-5"><p className="text-sm font-bold text-white truncate">{p.name}</p></div>
                                    <div className="col-span-3 text-center"><p className="text-xs text-yellow-200 font-mono">{p.soja.toLocaleString()}</p></div>
                                    <div className="col-span-3 text-center"><p className="text-xs text-orange-200 font-mono">{p.milho > 0 ? p.milho.toLocaleString() : '-'}</p></div>
                                    <div className="col-span-1 text-right"><span className={`text-[10px] font-bold ${p.sobra < 0 ? 'text-red-400' : 'text-green-400'}`}>{p.sobra > 0 ? '+' : ''}{p.sobra}%</span></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- ABA 3: MONITOR DE TRAVAS (ORIGINAÇÃO) --- */}
            {activeTab === 'travas' && (
                <div className="space-y-4">
                    <h3 className="font-bold text-white flex gap-2 items-center"><Lock size={18}/> Monitor de Travas (Agrotitan)</h3>
                    {grainLocks.map(lock => (
                        <GlassCard key={lock.id} className="flex justify-between items-center p-3 border-l-4 border-amber-500">
                            <div><h4 className="font-bold text-white text-sm">{lock.produtor}</h4><p className="text-xs text-white/50">{lock.produto} • {lock.qtd}</p></div>
                            <div className="text-right"><p className="text-amber-400 font-mono font-bold">{lock.alvo}</p><span className="text-[9px] uppercase bg-white/10 px-2 py-0.5 rounded text-white/60">{lock.status}</span></div>
                        </GlassCard>
                    ))}
                </div>
            )}

            {/* --- ABA 4: CRIADOR DE CAMPANHAS --- */}
            {activeTab === 'pool_criador' && (
                <GlassCard className="border-t-4 border-teal-500">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Megaphone className="text-teal-400"/> Lançar Campanha</h3>
                    <div className="space-y-4">
                        <GlassInput label="Nome do Produto" value={newCampaign.name} onChange={e=>setNewCampaign({...newCampaign, name:e.target.value})}/>
                        <div className="grid grid-cols-2 gap-4">
                            <GlassInput label="Meta (Qtd)" type="number" value={newCampaign.target} onChange={e=>setNewCampaign({...newCampaign, target:e.target.value})}/>
                            <GlassInput label="Preço Promo" type="number" value={newCampaign.discountPrice} onChange={e=>setNewCampaign({...newCampaign, discountPrice:e.target.value})}/>
                        </div>
                        <NeonButton onClick={handleCreateCampaign} variant="accent" className="w-full">Publicar no App</NeonButton>
                    </div>
                </GlassCard>
            )}

            {/* --- ABA 5: CONSULTA MATRIZ --- */}
            {activeTab === 'sede' && (
                <div className="space-y-4">
                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-2xl"><h3 className="font-bold text-white mb-1 flex items-center gap-2"><Search size={18}/> Estoque Central</h3><p className="text-xs text-white/60">Consulte antes de pedir transferência.</p></div>
                    <div className="grid gap-2">{matrizStock.map(i => (<GlassCard key={i.id} className="p-3 flex justify-between items-center"><span className="text-white font-bold text-sm">{i.name}</span><span className="text-green-400 font-mono">{i.qtd} {i.unit}</span></GlassCard>))}</div>
                    <NeonButton className="w-full mt-2 text-xs h-10">Solicitar Transferência</NeonButton>
                </div>
            )}

            {/* --- ABA 6: CLIENTES --- */}
            {activeTab === 'clientes' && (
                <div className="space-y-4">
                    <div className="relative"><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar Produtor..." className="w-full bg-black/30 border border-white/10 rounded-2xl pl-4 pr-12 py-3 text-white focus:outline-none"/><button onClick={handleSearchClient} className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-lg text-white"><Search size={16}/></button></div>
                    {searchResult && (<GlassCard className="border-t-4 border-green-500 animate-in fade-in"><div className="flex justify-between"><h3 className="font-bold text-white">{searchResult.name}</h3><span className="bg-green-500/20 text-green-400 text-xs px-2 rounded">{searchResult.score}</span></div><div className="grid grid-cols-2 gap-4 mt-4 text-xs"><div><p className="text-white/40">Dívida</p><p className="text-red-400 font-bold">{searchResult.debt}</p></div><div><p className="text-white/40">Limite</p><p className="text-green-400 font-bold">{searchResult.limit}</p></div></div></GlassCard>)}
                </div>
            )}
        </div>
    );
};

// --- MÓDULO TELEMETRIA E IOT (VITALIS CONNECT - ENTERPRISE) ---
const TelemetryView = ({ role }) => {
    // Se for Gestor, começa com o primeiro da lista. Se for produtor, fixa nele mesmo.
    const isManager = ['Admin', 'Coord. Regional', 'Coord. Unidade'].includes(role);
    const [selectedProducer, setSelectedProducer] = useState("João da Silva");
    const [activeMachine, setActiveMachine] = useState(0);
    const [isConnecting, setIsConnecting] = useState(false);

    // DADOS DE SIMULAÇÃO AVANÇADA (DIFERENTES FROTAS POR PRODUTOR)
    const PRODUCER_FLEETS = {
        "João da Silva": {
            farm: "Fazenda Santa Rita (Talhão 04)",
            activity: "Colheita de Soja",
            machines: [
                { id: 1, name: "John Deere S790", type: "Colheitadeira", status: "Operando", fuel: "68%", speed: "5.4 km/h", yield: "78 sc/ha", moisture: "13.2%", engine: "85%", lat: 30, lng: 40, color: "text-green-500" },
                { id: 2, name: "Valtra T250", type: "Transbordo", status: "Aguardando", fuel: "45%", speed: "0.0 km/h", yield: "-", moisture: "-", engine: "10%", lat: 35, lng: 45, color: "text-yellow-500" }
            ]
        },
        "Agro Santos": {
            farm: "Estância Velha (Pivô Central)",
            activity: "Plantio de Trigo",
            machines: [
                { id: 3, name: "Case Magnum 340", type: "Trator + Plantadeira", status: "Operando", fuel: "82%", speed: "7.1 km/h", yield: "-", moisture: "-", engine: "92%", lat: 60, lng: 60, color: "text-red-500" },
                { id: 4, name: "New Holland Defensor", type: "Pulverizador", status: "Em Deslocamento", fuel: "30%", speed: "22.0 km/h", yield: "-", moisture: "-", engine: "60%", lat: 70, lng: 20, color: "text-blue-400" }
            ]
        },
        "Sítio Alvorada": {
            farm: "Sítio Alvorada (Sede)",
            activity: "Manutenção",
            machines: [
                { id: 5, name: "Massey Ferguson 6700", type: "Trator", status: "Parado", fuel: "90%", speed: "0.0 km/h", yield: "-", moisture: "-", engine: "0%", lat: 50, lng: 50, color: "text-orange-500" }
            ]
        }
    };

    const currentData = PRODUCER_FLEETS[selectedProducer] || PRODUCER_FLEETS["João da Silva"];
    const currentMachineData = currentData.machines[activeMachine] || currentData.machines[0];

    const handleConnect = () => {
        setIsConnecting(true);
        setTimeout(() => {
            setIsConnecting(false);
            alert(`✅ Conexão API estabelecida com sucesso para ${selectedProducer}!`);
        }, 2000);
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* CABEÇALHO */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                        <MapPin className="text-blue-400"/> Telemetria 4.0
                    </h2>
                    <div className="flex items-center gap-2 bg-green-900/30 px-3 py-1 rounded-full border border-green-500/30">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Sinal Satélite: OK</span>
                    </div>
                </div>

                {/* SELETOR DE PRODUTOR (APENAS PARA GESTORES) */}
                {isManager && (
                    <GlassCard className="p-3 bg-blue-900/20 border-blue-500/30">
                        <label className="text-xs text-blue-300 font-bold uppercase mb-1 block">Monitorar Cooperado:</label>
                        <div className="relative">
                            <select 
                                value={selectedProducer} 
                                onChange={(e) => { setSelectedProducer(e.target.value); setActiveMachine(0); }}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none appearance-none cursor-pointer"
                            >
                                {Object.keys(PRODUCER_FLEETS).map(p => <option key={p} value={p} className="bg-slate-900">{p}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 text-white/50" size={16}/>
                        </div>
                    </GlassCard>
                )}
            </div>

            {/* MAPA TÁTICO (SIMULAÇÃO VISUAL DE ALTA TECNOLOGIA) */}
            <GlassCard className="p-0 h-[420px] relative overflow-hidden border-t-4 border-blue-500 bg-[#0f172a] group">
                
                {/* Camadas do Mapa (Grid + Radar) */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                <div className="absolute inset-0 bg-[linear-gradient(transparent_98%,_rgba(0,255,255,0.1)_100%)] bg-[length:100%_20px] animate-scan"></div>

                {/* Informações da Fazenda (HUD) */}
                <div className="absolute top-4 left-4 z-30">
                    <h4 className="text-white font-bold text-lg drop-shadow-md">{currentData.farm}</h4>
                    <p className="text-xs text-green-400 bg-black/60 px-2 py-0.5 rounded w-fit border border-green-500/30">{currentData.activity}</p>
                </div>

                {/* Desenho dos Talhões (Geometria) */}
                <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-white/10 rounded-3xl bg-white/5 transform rotate-12"></div>

                {/* MÁQUINAS (MÓVEIS) */}
                {currentData.machines.map((m, index) => (
                    <motion.div 
                        key={m.id}
                        layout
                        initial={{ x: m.lng * 3, y: m.lat * 3 }}
                        animate={{ 
                            x: activeMachine === index ? [m.lng * 3, m.lng * 3 + 30, m.lng * 3] : m.lng * 3, // Movimento suave se ativo
                            scale: activeMachine === index ? 1.1 : 1
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        onClick={() => setActiveMachine(index)}
                        className="absolute cursor-pointer flex flex-col items-center gap-1 z-20 group/pin"
                        style={{ top: `${m.lat}%`, left: `${m.lng}%` }}
                    >
                        {/* Ícone da Máquina */}
                        <div className={`p-3 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] border-2 transition-all ${activeMachine === index ? 'bg-white border-blue-500 scale-110' : 'bg-slate-800 border-white/20 hover:border-white'}`}>
                            <Tractor size={20} className={activeMachine === index ? 'text-black' : 'text-white'}/>
                        </div>
                        {/* Label da Máquina */}
                        <span className={`text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md border transition-all ${activeMachine === index ? 'bg-blue-600 text-white border-blue-400' : 'bg-black/60 text-white/70 border-white/10'}`}>
                            {m.name}
                        </span>
                    </motion.div>
                ))}

                {/* PAINEL DE TELEMETRIA (HUD INFERIOR) */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 text-xl`}>
                                {currentMachineData.type === 'Colheitadeira' ? '🌾' : '🚜'}
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">{currentMachineData.name}</h4>
                                <p className={`text-[10px] font-bold uppercase ${currentMachineData.status.includes('Parado') ? 'text-red-500' : 'text-green-400'}`}>
                                    ● {currentMachineData.status}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] text-white/40 uppercase">Operador</p>
                            <p className="text-xs text-white font-bold">ID #8821</p>
                        </div>
                    </div>

                    {/* Métricas em Grid */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-white/5 p-2 rounded-lg">
                            <p className="text-[9px] text-white/40 uppercase mb-1">Velocidade</p>
                            <p className="text-white font-mono font-bold text-xs">{currentMachineData.speed}</p>
                        </div>
                        <div className="bg-white/5 p-2 rounded-lg">
                            <p className="text-[9px] text-white/40 uppercase mb-1">Motor</p>
                            <p className="text-white font-mono font-bold text-xs">{currentMachineData.engine}</p>
                        </div>
                        <div className="bg-white/5 p-2 rounded-lg">
                            <p className="text-[9px] text-white/40 uppercase mb-1">Tanque</p>
                            <p className={`font-mono font-bold text-xs ${parseInt(currentMachineData.fuel) < 20 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{currentMachineData.fuel}</p>
                        </div>
                        <div className="bg-white/5 p-2 rounded-lg border border-yellow-500/20">
                            <p className="text-[9px] text-yellow-200/60 uppercase mb-1">Colheita</p>
                            <p className="text-yellow-400 font-mono font-bold text-xs">{currentMachineData.yield}</p>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* RODAPÉ DE INTEGRAÇÃO */}
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                    <Cloud className="text-blue-400"/>
                    <div>
                        <h4 className="font-bold text-white text-sm">Integração Cloud</h4>
                        <p className="text-xs text-white/50">Conectado: John Deere & Case IH</p>
                    </div>
                </div>
                <NeonButton onClick={handleConnect} variant="secondary" className="text-xs h-8 px-4" disabled={isConnecting}>
                    {isConnecting ? <Loader className="animate-spin" size={14}/> : "Sincronizar"}
                </NeonButton>
            </div>
        </div>
    );
};

// --- HOMES (DIRETORIA / REGIONAL - COM POSIÇÃO DE GRÃOS DETALHADA) ---
const DirectorHome = ({ setView, branchData, activeBranch }) => {
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, graos_unidade, estoque_sede, clientes
    const [searchTerm, setSearchTerm] = useState('');
    const [stockSearch, setStockSearch] = useState('');
    const [searchResult, setSearchResult] = useState(null);

    // DADOS: ESTOQUE DA SEDE (IBIRUBÁ)
    const matrizStock = [
        { id: 1, name: "Ureia Agrícola", qtd: 15000, unit: "Sacos", status: "Alto" },
        { id: 2, name: "Glifosato 480", qtd: 5000, unit: "Litros", status: "Médio" },
        { id: 3, name: "Semente Soja Intacta", qtd: 800, unit: "Sacos", status: "Baixo" }
    ];

    // DADOS NOVOS: POSIÇÃO DE GRÃOS POR PRODUTOR (DA UNIDADE)
    const producerGrainStocks = [
        { id: 1, name: "João da Silva", soja: 5400, milho: 1200, trigo: 0, sobra: 12.5 }, // Sobra positiva é bom
        { id: 2, name: "Agro Santos Ltda", soja: 12800, milho: 5000, trigo: 2000, sobra: 4.2 },
        { id: 3, name: "Sítio Alvorada", soja: 2100, milho: 0, trigo: 0, sobra: -2.1 }, // Sobra negativa (Alerta)
        { id: 4, name: "Fazenda Boa Vista", soja: 8500, milho: 3000, trigo: 1500, sobra: 8.0 },
        { id: 5, name: "Cooperado Paulo", soja: 1500, milho: 0, trigo: 0, sobra: 15.0 }
    ];

    // Cálculo dos Totais da Unidade
    const totalSoja = producerGrainStocks.reduce((acc, curr) => acc + curr.soja, 0);
    const totalMilho = producerGrainStocks.reduce((acc, curr) => acc + curr.milho, 0);
    const mediaSobra = (producerGrainStocks.reduce((acc, curr) => acc + curr.sobra, 0) / producerGrainStocks.length).toFixed(2);

    const filteredStock = matrizStock.filter(p => p.name.toLowerCase().includes(stockSearch.toLowerCase()));
    const handleSearchClient = () => { if (!searchTerm) return; setSearchResult({ name: "João da Silva", doc: "000.123.456-78", score: "A", last_purchase: "20/05", debt: "R$ 15.200", grain_balance: "5.400 sc Soja", obs: "Cliente fidelizado." }); };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* CABEÇALHO */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white flex items-center gap-2"><Activity className="text-blue-400"/> Gestão Regional</h2>
                        <p className="text-xs text-white/50">Unidade: <strong className="text-white">{activeBranch}</strong></p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] text-white/40 uppercase">Faturamento Dia</p>
                        <p className="text-2xl font-bold text-green-400">R$ 452.000</p>
                    </div>
                </div>
                
                {/* MENU ESTRATÉGICO */}
                <div className="flex gap-2 bg-black/20 p-1 rounded-xl overflow-x-auto no-scrollbar">
                    {['dashboard', 'graos_unidade', 'estoque_sede', 'clientes'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold uppercase transition whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}>
                            {tab === 'dashboard' ? 'KPIs Gerais' : tab === 'graos_unidade' ? '🌾 Posição Grãos' : tab === 'estoque_sede' ? '🔍 Estoque Sede' : 'Consulta 360°'}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- ABA 1: DASHBOARD (Mantida) --- */}
            {activeTab === 'dashboard' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <GlassCard className="cursor-pointer hover:bg-white/5 border-l-4 border-green-500" onClick={() => setView('estoque')}>
                            <div className="flex justify-between items-start"><div><p className="text-white/60 text-xs font-bold">Estoque Insumos</p><h3 className="text-2xl font-black text-white">{branchData.stock}</h3></div><Package className="text-green-400" size={24}/></div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full mt-3"><div className="bg-green-500 h-full w-[75%]"/></div>
                        </GlassCard>
                        <GlassCard className="cursor-pointer hover:bg-white/5 border-l-4 border-blue-500" onClick={() => setView('financeiro')}>
                            <div className="flex justify-between items-start"><div><p className="text-white/60 text-xs font-bold">Vendas (Dia)</p><h3 className="text-2xl font-black text-white">{branchData.sales}</h3></div><ShoppingBag className="text-blue-400" size={24}/></div>
                        </GlassCard>
                        <GlassCard className="cursor-pointer hover:bg-white/5 border-l-4 border-yellow-500" onClick={() => setView('logistica')}>
                            <div className="flex justify-between items-start"><div><p className="text-white/60 text-xs font-bold">Pátio</p><h3 className="text-2xl font-black text-white">{branchData.trucks} Caminhões</h3></div><Truck className="text-yellow-400" size={24}/></div>
                        </GlassCard>
                    </div>
                    <h3 className="font-bold text-white mt-4 mb-2">Ferramentas de Gestão</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button onClick={() => setView('price_update')} className="p-3 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center gap-2 hover:bg-white/10 transition"><FileUp className="text-purple-400"/> <span className="text-xs text-white">Tabela Preços</span></button>
                        <button onClick={() => setView('trading')} className="p-3 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center gap-2 hover:bg-white/10 transition"><Gavel className="text-amber-400"/> <span className="text-xs text-white">Mesa Grãos</span></button>
                        <button onClick={() => setView('relatorios')} className="p-3 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center gap-2 hover:bg-white/10 transition"><FileBarChart className="text-cyan-400"/> <span className="text-xs text-white">Relatórios</span></button>
                        <button onClick={() => setView('admin_finance')} className="p-3 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center gap-2 hover:bg-white/10 transition"><PieChart className="text-emerald-400"/> <span className="text-xs text-white">DRE Gerencial</span></button>
                    </div>
                </>
            )}

            {/* --- ABA 2: POSIÇÃO DE GRÃOS (NOVA E DETALHADA) --- */}
            {activeTab === 'graos_unidade' && (
                <div className="space-y-6 animate-in fade-in">
                    {/* CARDS DE TOTAIS DA UNIDADE */}
                    <div className="grid grid-cols-3 gap-3">
                        <GlassCard className="p-3 bg-yellow-900/20 border-yellow-500/30 text-center">
                            <p className="text-[10px] text-white/50 uppercase font-bold">Total Soja</p>
                            <p className="text-xl font-black text-yellow-400">{totalSoja.toLocaleString()} <span className="text-[10px]">sc</span></p>
                        </GlassCard>
                        <GlassCard className="p-3 bg-orange-900/20 border-orange-500/30 text-center">
                            <p className="text-[10px] text-white/50 uppercase font-bold">Total Milho</p>
                            <p className="text-xl font-black text-orange-400">{totalMilho.toLocaleString()} <span className="text-[10px]">sc</span></p>
                        </GlassCard>
                        <GlassCard className="p-3 bg-blue-900/20 border-blue-500/30 text-center">
                            <p className="text-[10px] text-white/50 uppercase font-bold">Sobra Média</p>
                            <p className={`text-xl font-black ${mediaSobra >= 0 ? 'text-green-400' : 'text-red-400'}`}>{mediaSobra}%</p>
                        </GlassCard>
                    </div>

                    {/* LISTA DETALHADA POR PRODUTOR */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-white">Estoque por Cooperado</h3>
                            <button className="text-xs text-blue-400 flex items-center gap-1"><Download size={14}/> Exportar</button>
                        </div>
                        <div className="space-y-2">
                            {/* Cabeçalho da Tabela */}
                            <div className="grid grid-cols-12 text-[10px] text-white/40 px-4 uppercase font-bold">
                                <div className="col-span-5">Produtor</div>
                                <div className="col-span-3 text-center">Soja</div>
                                <div className="col-span-3 text-center">Milho</div>
                                <div className="col-span-1 text-right">Sobra</div>
                            </div>

                            {producerGrainStocks.map(p => (
                                <div key={p.id} className="bg-white/5 p-3 rounded-xl border border-white/5 grid grid-cols-12 items-center hover:bg-white/10 transition">
                                    <div className="col-span-5">
                                        <p className="text-sm font-bold text-white truncate">{p.name}</p>
                                    </div>
                                    <div className="col-span-3 text-center">
                                        <p className="text-xs text-yellow-200 font-mono">{p.soja.toLocaleString()}</p>
                                    </div>
                                    <div className="col-span-3 text-center">
                                        <p className="text-xs text-orange-200 font-mono">{p.milho > 0 ? p.milho.toLocaleString() : '-'}</p>
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <span className={`text-[10px] font-bold ${p.sobra < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                            {p.sobra > 0 ? '+' : ''}{p.sobra}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- ABA 3: ESTOQUE SEDE --- */}
            {activeTab === 'estoque_sede' && (
                <div className="space-y-4">
                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-2xl">
                        <h3 className="font-bold text-white mb-1 flex items-center gap-2"><Package size={18}/> Consulta Matriz</h3>
                        <div className="relative mt-3"><input value={stockSearch} onChange={(e) => setStockSearch(e.target.value)} placeholder="Buscar produto..." className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none text-sm"/><Search className="absolute left-3 top-3.5 text-white/40" size={16}/></div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {filteredStock.map(item => (<GlassCard key={item.id} className="p-3 flex justify-between items-center hover:bg-white/5"><div><h4 className="font-bold text-white text-sm">{item.name}</h4><p className="text-[10px] text-white/50">Unidade: {item.unit}</p></div><div className="text-right"><p className="font-bold text-white text-lg">{item.qtd.toLocaleString()}</p><span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold ${item.status === 'Indisponível' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{item.status}</span></div></GlassCard>))}
                    </div>
                </div>
            )}

            {/* --- ABA 4: CONSULTA 360 --- */}
            {activeTab === 'clientes' && (
                <div className="space-y-4">
                    <div className="relative"><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar Produtor..." className="w-full bg-black/30 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none"/><Search className="absolute left-4 top-4 text-white/40"/><button onClick={handleSearchClient} className="absolute right-2 top-2 bg-blue-600 p-2 rounded-xl text-white"><ArrowRight size={20}/></button></div>
                    {searchResult && (<GlassCard className="border-t-4 border-green-500 animate-in fade-in"><div className="flex justify-between"><h3 className="font-bold text-white">{searchResult.name}</h3><span className="bg-green-500/20 text-green-400 text-xs px-2 rounded">{searchResult.score}</span></div><div className="grid grid-cols-2 gap-4 mt-4 text-xs"><div><p className="text-white/40">Dívida</p><p className="text-red-400 font-bold">{searchResult.debt}</p></div><div><p className="text-white/40">Saldo Grãos</p><p className="text-yellow-400 font-bold">{searchResult.grain_balance}</p></div></div><p className="text-xs text-white/60 italic border-t border-white/10 pt-2 mt-2">Obs: {searchResult.obs}</p></GlassCard>)}
                </div>
            )}
        </div>
    );
};
const OperatorHome = ({ setView }) => (<div className="grid grid-cols-1 gap-6 animate-in fade-in"><GlassCard className="col-span-full border-l-4 border-green-500 text-center py-12 cursor-pointer hover:bg-white/5" onClick={()=>setView('estoque')}><Camera size={48} className="mx-auto mb-4 text-green-400"/><h3 className="text-2xl font-bold text-white">Escanear Entrada</h3></GlassCard></div>);
const EstoquistaDashboard = ({ setView }) => (<div className="grid grid-cols-1 gap-6 animate-in fade-in"><GlassCard className="col-span-full border-l-4 border-green-500 text-center py-12 cursor-pointer hover:bg-white/5" onClick={()=>setView('estoque')}><Camera size={48} className="mx-auto mb-4 text-green-400"/><h3 className="text-2xl font-bold text-white">Escanear Entrada</h3></GlassCard></div>);

// TELA INICIAL DO PRODUTOR

// --- INICIO DO COMPONENTE CALCULADORA ---
const CalculadoraRoiCotriba = ({ visivel, fechar }) => {
  const [loteQtd, setLoteQtd] = useState('200');
  const [pesoAtual, setPesoAtual] = useState('180');
  const [pesoMeta, setPesoMeta] = useState('');
  const [racaoSelecionada, setRacaoSelecionada] = useState('dieta_total');
  const [suplementoSelecionado, setSuplementoSelecionado] = useState('nenhum');
  const [resultado, setResultado] = useState(null);

  const RACOES = {
    'dieta_total': { nome: 'Dieta Total', gmd: 1.6 },
    'destete_18': { nome: 'Destete 18%', gmd: 0.9 },
    'bovino_140': { nome: 'Bovino de Corte 140', gmd: 1.2 },
  };

  const SUPLEMENTOS = {
    'nenhum': { nome: 'Sem Suplemento', gmdExtra: 0 },
    'invernada_30': { nome: 'Invernada 30 Pro', gmdExtra: 0.25 },
    'tradicao_40': { nome: 'Tradição 40', gmdExtra: 0.35 },
    'tradicao_60': { nome: 'Tradição 60', gmdExtra: 0.45 },
    'invernada_azevem': { nome: 'Invernada Azevém', gmdExtra: 0.30 },
  };

  const calcular = () => {
    const atual = parseFloat(pesoAtual);
    const meta = parseFloat(pesoMeta);
    const qtd = parseInt(loteQtd);
    if (!meta || meta <= atual) { Alert.alert("Atenção", "A meta deve ser maior que o peso atual."); return; }
    
    const r = RACOES[racaoSelecionada];
    const s = SUPLEMENTOS[suplementoSelecionado];
    const gmdTotal = r.gmd + s.gmdExtra;
    const dias = Math.ceil((meta - atual) / gmdTotal);
    const sacas = Math.ceil((dias * 8 * qtd) / 60); // Estimativa simplificada

    setResultado({ dias, gmdTotal: gmdTotal.toFixed(2), sacas });
  };

  return (
    <Modal visible={visivel} animationType="slide" transparent={false}>
      <ScrollView style={{padding: 20, backgroundColor: '#F5F7FA'}}>
        <Text style={{fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#004d40'}}>📊 Simulador de ROI</Text>
        
        <Text style={{fontWeight:'bold'}}>Quantas Cabeças?</Text>
        <TextInput style={estilosCalc.input} keyboardType="numeric" value={loteQtd} onChangeText={setLoteQtd} />

        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
            <View style={{width:'48%'}}>
                <Text style={{fontWeight:'bold'}}>Peso Atual (kg)</Text>
                <TextInput style={estilosCalc.input} keyboardType="numeric" value={pesoAtual} onChangeText={setPesoAtual} />
            </View>
            <View style={{width:'48%'}}>
                <Text style={{fontWeight:'bold'}}>Meta (kg)</Text>
                <TextInput style={estilosCalc.input} keyboardType="numeric" value={pesoMeta} onChangeText={setPesoMeta} placeholder="Ex: 450"/>
            </View>
        </View>

        <Text style={{fontWeight:'bold', marginTop: 10}}>Ração Cotribá:</Text>
        <View style={estilosCalc.pickerBox}>
            <Picker selectedValue={racaoSelecionada} onValueChange={setRacaoSelecionada}>
            {Object.keys(RACOES).map(k => <Picker.Item key={k} label={RACOES[k].nome} value={k} />)}
            </Picker>
        </View>

        <Text style={{fontWeight:'bold', marginTop: 10}}>Suplemento:</Text>
        <View style={estilosCalc.pickerBox}>
            <Picker selectedValue={suplementoSelecionado} onValueChange={setSuplementoSelecionado}>
            {Object.keys(SUPLEMENTOS).map(k => <Picker.Item key={k} label={SUPLEMENTOS[k].nome} value={k} />)}
            </Picker>
        </View>

        <TouchableOpacity onPress={calcular} style={estilosCalc.btnCalc}>
            <Text style={{color:'#FFF', fontWeight:'bold'}}>CALCULAR GANHO</Text>
        </TouchableOpacity>

        {resultado && (
            <View style={estilosCalc.resBox}>
                <Text style={{fontSize:18, fontWeight:'bold', color:'#004d40'}}>Resultado Previsto:</Text>
                <Text>Tempo: {resultado.dias} dias</Text>
                <Text>GMD: {resultado.gmdTotal} kg/dia</Text>
                <Text style={{marginTop:10, fontWeight:'bold'}}>Consumo Estimado: {resultado.sacas} sacas</Text>
            </View>
        )}

        <TouchableOpacity onPress={fechar} style={estilosCalc.btnClose}>
            <Text style={{color:'#d32f2f'}}>Fechar Simulador</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
};

const estilosCalc = StyleSheet.create({
  input: { backgroundColor:'#FFF', borderWidth:1, borderColor:'#CCC', padding:10, borderRadius:5, marginBottom:10 },
  pickerBox: { borderWidth:1, borderColor:'#CCC', borderRadius:5, marginBottom:10, backgroundColor:'#FFF' },
  btnCalc: { backgroundColor:'#004d40', padding:15, borderRadius:5, alignItems:'center', marginTop:10 },
  resBox: { backgroundColor:'#e0f2f1', padding:15, borderRadius:5, marginTop:20, borderWidth:1, borderColor:'#004d40' },
  btnClose: { marginTop:30, alignItems:'center', padding:20 }
});
// --- FIM DO COMPONENTE CALCULADORA ---


// --- NOVO: MÓDULO AGRICULTURA DE PRECISÃO ---
const PrecisionAgView = () => {
    const [layer, setLayer] = useState('ndvi'); // ndvi, solo, colheita
    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white flex items-center gap-2"><Layers className="text-emerald-400"/> Agricultura de Precisão</h2>
                <div className="flex gap-2 bg-black/30 p-1 rounded-lg">
                    <button onClick={()=>setLayer('ndvi')} className={`px-3 py-1 text-xs font-bold rounded ${layer==='ndvi'?'bg-emerald-500 text-black':'text-white/50'}`}>NDVI (Vigor)</button>
                    <button onClick={()=>setLayer('solo')} className={`px-3 py-1 text-xs font-bold rounded ${layer==='solo'?'bg-amber-500 text-black':'text-white/50'}`}>Análise Solo</button>
                </div>
            </div>

            {/* MAPA INTERATIVO (SIMULADO) */}
            <GlassCard className="h-[400px] relative overflow-hidden border-t-4 border-emerald-500 p-0 group">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000')] bg-cover opacity-40 grayscale group-hover:grayscale-0 transition duration-700"></div>
                {/* Sobreposição de Mapa de Calor */}
                <div className={`absolute inset-0 opacity-60 mix-blend-overlay transition-all duration-1000 ${layer === 'ndvi' ? 'bg-gradient-to-tr from-red-500 via-yellow-500 to-green-600' : 'bg-gradient-to-bl from-amber-900 via-amber-600 to-yellow-200'}`}></div>
                
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <h3 className="text-white font-bold">Talhão 04 - Soja</h3>
                    <p className="text-xs text-white/70">Área: 140 Hectares</p>
                    <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-green-400"><div className="w-3 h-3 bg-green-500 rounded-full"/> Alto Vigor (85%)</div>
                        <div className="flex items-center gap-2 text-xs text-yellow-400"><div className="w-3 h-3 bg-yellow-500 rounded-full"/> Médio (10%)</div>
                        <div className="flex items-center gap-2 text-xs text-red-400"><div className="w-3 h-3 bg-red-500 rounded-full"/> Atenção (5%)</div>
                    </div>
                </div>
                <div className="absolute bottom-4 right-4">
                    <NeonButton className="text-xs h-8">Gerar Prescrição (Taxa Variável)</NeonButton>
                </div>
            </GlassCard>

            {/* GRID DE DADOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="text-center">
                    <p className="text-xs text-white/50 uppercase">Média NDVI</p>
                    <p className="text-3xl font-black text-green-400">0.78</p>
                </GlassCard>
                <GlassCard className="text-center">
                    <p className="text-xs text-white/50 uppercase">Umidade Solo</p>
                    <p className="text-3xl font-black text-blue-400">22%</p>
                </GlassCard>
                <GlassCard className="text-center">
                    <p className="text-xs text-white/50 uppercase">Compactação</p>
                    <p className="text-3xl font-black text-yellow-400">Baixa</p>
                </GlassCard>
            </div>
        </div>
    );
};

// --- NOVO: MÓDULO PECUÁRIA DE CORTE ---
// LINHA 2150 EM DIANTE...

// --- NOVO: MÓDULO PECUÁRIA DE CORTE ---
const CattleView = () => { // <--- MUDA AQUI: Troquei o "(" por "{"
  // Agora você pode declarar a variável
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false);

  return (
       <div className="space-y-6 animate-in fade-in">
         <h2 className="text-3xl font-bold text-white flex items-center gap-2"><Activity className="text-red-400"/> Pecuária de Corte (GMD)</h2>
         
         {/* ... O RESTO DO SEU CÓDIGO CONTINUA IGUAL ... */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard className="border-l-4 border-red-500">
                <h3 className="text-white font-bold">Rebanho Total</h3>
                <p className="text-4xl font-black text-white mt-2">450 <span className="text-lg font-normal opacity-50">cb</span></p>
                <p className="text-xs text-white/50">Lote Engorda: 120 cb</p>             

{/* --- BOTÃO PARA ABRIR A CALCULADORA --- */}
<TouchableOpacity 
  onPress={() => setMostrarCalculadora(true)} 
  style={{backgroundColor: '#00695c', padding: 15, borderRadius: 10, marginVertical: 10, alignItems: 'center'}}>
    <Text style={{color: '#FFF', fontWeight: 'bold'}}>📈 ABRIR SIMULADOR DE GANHO DE PESO</Text>
</TouchableOpacity>

{/* --- O COMPONENTE INVISÍVEL (SÓ ABRE QUANDO CLICA) --- */}
<CalculadoraRoiCotriba 
  visivel={mostrarCalculadora} 
  fechar={() => setMostrarCalculadora(false)} 
/>

            </GlassCard>
            <GlassCard className="border-l-4 border-green-500">
                <h3 className="text-white font-bold">GMD (Ganho Médio)</h3>
                <p className="text-4xl font-black text-green-400 mt-2">1.45 <span className="text-lg font-normal opacity-50">kg/dia</span></p>
                <p className="text-xs text-white/50">Meta: 1.50 kg/dia</p>
            </GlassCard>
            <GlassCard className="border-l-4 border-blue-500">
                <h3 className="text-white font-bold">Próxima Pesagem</h3>
                <p className="text-4xl font-black text-white mt-2">05 <span className="text-lg font-normal opacity-50">dias</span></p>
                <p className="text-xs text-white/50">Curral 02</p>
            </GlassCard>
        </div>

        <GlassCard>
            <h3 className="font-bold text-white mb-4 flex gap-2 items-center"><AlertTriangle size={18} className="text-yellow-400"/> Alertas Sanitários</h3>
            <div className="space-y-3">
                <div className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-full text-red-400"><Activity size={16}/></div>
                        <div>
                            <p className="text-sm font-bold text-white">Vacinação Aftosa (Oficial)</p>
                            <p className="text-xs text-white/50">Vence em 15 dias</p>
                        </div>
                    </div>
                    <button className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold">Comprar Vacina</button>
                </div>
                <div className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-full text-blue-400"><Droplets size={16}/></div>
                        <div>
                            <p className="text-sm font-bold text-white">Vermifugação Lote 03</p>
                            <p className="text-xs text-white/50">Sugerido pelo Veterinário</p>
                        </div>
                    </div>
                    <button className="text-xs border border-white/20 text-white px-3 py-1.5 rounded-lg hover:bg-white/10">Agendar</button>
                </div>
            </div>
        </GlassCard>
    </div>
  );
}
// --- VITALIS BANK (VERSÃO PREMIUM BLACK - FINAL) ---
const VitalisBankView = () => {
  const [saldoVisivel, setSaldoVisivel] = useState(true);

  // DADOS MOCK (Simulação para a Reunião)
  const user = { name: "Valdir S.", account: "9982-1", agency: "0001" };
  
  const finances = {
    saldoReais: 145820.50,
    saldoSoja: 5400, // Sacas
    faturaAtual: 12450.90
  };

  // O "Pulo do Gato": A transação que mostra a tecnologia
  const lastRomaneio = {
    id: "#99821",
    data: "Hoje, 14:30",
    desc: "Entrega Soja (Faz. Santa Rita)",
    qtd: "850 sc",
    valorLiberado: 114750.00, // 850 * 135
    status: "Convertido em Limite"
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-24">
      
      {/* 1. CABEÇALHO BANCÁRIO (PERFIL) */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center font-bold text-black shadow-lg shadow-amber-500/20">
                {user.name.charAt(0)}
            </div>
            <div>
                <p className="text-xs text-slate-400">Bem-vindo ao Vitalis Bank</p>
                <h3 className="font-bold text-white text-lg">{user.name}</h3>
            </div>
        </div>
        <div className="flex gap-4">
            <button onClick={() => setSaldoVisivel(!saldoVisivel)} className="text-white/50 hover:text-white transition">
                {saldoVisivel ? <ScanEye size={22}/> : <LockKeyhole size={22}/>}
            </button>
            <Bell size={22} className="text-white/50 hover:text-white transition"/>
        </div>
      </div>

      {/* 2. ÁREA DE SALDOS (MOEDA DUPLA) */}
      <div className="grid grid-cols-2 gap-4">
          <GlassCard className="py-4 px-5 border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-900/40 to-black/40">
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Landmark size={12}/> Conta Corrente</p>
              <h2 className="text-2xl font-bold text-white truncate">
                  {saldoVisivel ? formatCurrency(finances.saldoReais) : "R$ ••••••"}
              </h2>
              <p className="text-[10px] text-white/40 mt-1">Rendimento: 100% CDI</p>
          </GlassCard>

          <GlassCard className="py-4 px-5 border-l-4 border-amber-500 bg-gradient-to-br from-amber-900/40 to-black/40">
              <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Wheat size={12}/> Conta Grãos</p>
              <h2 className="text-2xl font-bold text-white truncate">
                  {saldoVisivel ? finances.saldoSoja.toLocaleString() : "••••"} <span className="text-sm font-normal">sc</span>
              </h2>
              <p className="text-[10px] text-white/40 mt-1">Liq. Imediata: R$ {saldoVisivel ? ((finances.saldoSoja * 135).toLocaleString('pt-BR', { notation: "compact" })) : "•••"}</p>
          </GlassCard>
      </div>

      {/* 3. O CARTÃO BLACK (VISUAL PREMIUM) */}
      <div className="relative group perspective-1000">
          <div className="w-full h-56 rounded-3xl bg-gradient-to-bl from-slate-800 via-black to-slate-900 border border-white/10 shadow-2xl relative overflow-hidden transition-transform duration-500 hover:scale-[1.02]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
              
              <div className="p-6 flex flex-col justify-between h-full relative z-10">
                  <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                          <Wheat className="text-amber-400" size={24}/>
                          <span className="font-bold text-white tracking-widest text-lg italic">VITALIS<span className="text-amber-400">BLACK</span></span>
                      </div>
                      <span className="text-white/30 font-mono text-sm">Cotribá Infinite</span>
                  </div>

                  <div className="flex items-center gap-4">
                      <div className="w-12 h-9 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-md shadow-inner flex items-center justify-center border border-yellow-600/50">
                          <div className="w-8 h-6 border border-black/20 rounded opacity-50 grid grid-cols-2 gap-px"></div>
                      </div>
                      <Signal className="text-white/50 rotate-90" size={20}/>
                  </div>

                  <div>
                      <p className="font-mono text-white text-lg tracking-widest shadow-black drop-shadow-md">
                          {saldoVisivel ? "5502 4491 8821 0092" : "•••• •••• •••• 0092"}
                      </p>
                      <div className="flex justify-between items-end mt-4">
                          <div>
                              <p className="text-[8px] text-white/40 uppercase tracking-widest">Titular</p>
                              <p className="text-white font-medium tracking-wide">{user.name.toUpperCase()}</p>
                          </div>
                          <div>
                              <p className="text-[8px] text-white/40 uppercase tracking-widest">Validade</p>
                              <p className="text-white font-medium">12/29</p>
                          </div>
                          <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-[8px] text-white/50">MASTERCARD</div>
                      </div>
                  </div>
              </div>
          </div>
          
          <div className="flex justify-between items-center px-4 mt-3">
              <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"/>
                  <p className="text-xs text-blue-300">Fatura Aberta</p>
              </div>
              <p className="text-white font-bold">{formatCurrency(finances.faturaAtual)}</p>
          </div>
      </div>

      {/* 4. AÇÕES RÁPIDAS */}
      <div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {[
                  { label: "Pix", icon: <ArrowUpRight/>, color: "bg-emerald-600" },
                  { label: "Pagar", icon: <Barcode/>, color: "bg-white/10" },
                  { label: "Transferir", icon: <ArrowDownLeft/>, color: "bg-white/10" },
                  { label: "Recarga", icon: <Smartphone/>, color: "bg-white/10" },
                  { label: "Cobrar", icon: <DollarSign/>, color: "bg-white/10" },
                  { label: "Extrato", icon: <FileText/>, color: "bg-white/10" },
              ].map((act, i) => (
                  <button key={i} className="flex flex-col items-center gap-2 min-w-[70px] group">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl shadow-lg border border-white/5 transition-transform group-hover:scale-105 ${act.color}`}>
                          {act.icon}
                      </div>
                      <span className="text-xs text-white/70 font-medium">{act.label}</span>
                  </button>
              ))}
          </div>
      </div>

      {/* 5. A PROVA DE CONCEITO (ROMANEIO -> LIMITE) */}
      <div className="relative">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <Activity className="text-blue-400"/> Última Atividade
          </h3>
          <GlassCard className="border-l-4 border-blue-500 relative overflow-hidden">
              <div className="absolute right-0 top-0 p-3 opacity-10"><Truck size={80}/></div>
              <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                      <div>
                          <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-1 rounded border border-blue-500/30">
                              ROMANEIO AUTOMÁTICO
                          </span>
                          <h4 className="text-white font-bold text-lg mt-2">{lastRomaneio.desc}</h4>
                          <p className="text-xs text-white/50">{lastRomaneio.data} • Doc: {lastRomaneio.id}</p>
                      </div>
                      <div className="text-right">
                          <p className="text-xs text-white/50 uppercase">Volume</p>
                          <p className="text-xl font-bold text-white">{lastRomaneio.qtd}</p>
                      </div>
                  </div>
                  
                  <div className="bg-black/40 rounded-xl p-3 mt-3 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/20 rounded-full text-green-400">
                              <Unlock size={20}/>
                          </div>
                          <div>
                              <p className="text-[10px] text-white/50 uppercase">Limite Liberado</p>
                              <p className="text-green-400 font-bold text-lg">+ {formatCurrency(lastRomaneio.valorLiberado)}</p>
                          </div>
                      </div>
                      <button className="text-xs bg-green-600 text-white px-3 py-2 rounded-lg font-bold shadow-lg hover:bg-green-500 transition">
                          Usar Agora
                      </button>
                  </div>
              </div>
          </GlassCard>
      </div>

      {/* 6. OFERTAS DE CRÉDITO */}
      <div>
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <Sprout className="text-green-400"/> Custeio & Investimento
          </h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
              <GlassCard className="min-w-[280px] bg-gradient-to-br from-green-900/40 to-black border-green-500/30">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><Leaf size={24}/></div>
                      <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-white">Pré-Aprovado</span>
                  </div>
                  <h4 className="font-bold text-white text-lg">Custeio Safra 25/26</h4>
                  <p className="text-xs text-white/50 mt-1 mb-4">Insumos Cotribá com taxa zero na originação.</p>
                  <div className="flex justify-between items-end border-t border-white/10 pt-3">
                      <div><p className="text-[10px] text-white/40">Limite Disponível</p><p className="text-white font-bold text-lg">R$ 1.500.000</p></div>
                      <button className="text-xs text-green-400 font-bold uppercase hover:text-green-300">Simular &rarr;</button>
                  </div>
              </GlassCard>

              <GlassCard className="min-w-[280px] bg-gradient-to-br from-yellow-900/40 to-black border-yellow-500/30">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400"><Zap size={24}/></div>
                      <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-white">Investimento</span>
                  </div>
                  <h4 className="font-bold text-white text-lg">Energia Solar</h4>
                  <p className="text-xs text-white/50 mt-1 mb-4">Reduza sua conta de luz na granja.</p>
                  <div className="flex justify-between items-end border-t border-white/10 pt-3">
                      <div><p className="text-[10px] text-white/40">Carência</p><p className="text-white font-bold text-lg">12 meses</p></div>
                      <button className="text-xs text-yellow-400 font-bold uppercase hover:text-yellow-300">Simular &rarr;</button>
                  </div>
              </GlassCard>
          </div>
      </div>
    </div>
  );
};

const ProducerHome = ({ setView }) => (
    <div className="space-y-6 animate-in fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AgriNewsWidget />
            <WeatherWidget />
            <TaskWidget onClick={() => setView('chat')} />
            <FinanceWidget onClick={() => setView('financeiro')} />
            
            <GlassCard className="col-span-2 border-l-4 border-amber-500 flex justify-between items-center cursor-pointer bg-amber-900/10" onClick={() => setView('grains')}>
                <div><h3 className="text-xl font-bold text-white">Meus Grãos (Agrotitan)</h3><p className="text-sm opacity-70 text-white">5.400 sc disponíveis</p></div>
                <Wheat size={64} className="opacity-20 text-amber-400"/>
            </GlassCard>

            <GlassCard className="col-span-2 border-l-4 border-yellow-500 flex justify-between items-center cursor-pointer" onClick={() => setView('marketplace')}>
                <div><h3 className="text-xl font-bold text-white">Loja Cotribá</h3><p className="text-sm opacity-70 text-white">Insumos disponíveis.</p></div>
                <Tractor size={64} className="opacity-20 text-white"/>
            </GlassCard>

            {/* GRADE DE ATALHOS ATUALIZADA */}
            <div className="col-span-full grid grid-cols-3 md:grid-cols-6 gap-3">
                <button onClick={() => setView('chat')} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex flex-col items-center gap-2 text-white transition hover:-translate-y-1"><MessageCircle size={20}/><span className="text-[10px] uppercase font-bold">Consultor</span></button>
                <button onClick={() => setView('agrilens')} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex flex-col items-center gap-2 text-white transition hover:-translate-y-1"><ScanEye size={20}/><span className="text-[10px] uppercase font-bold">AgriLens</span></button>
                
                {/* NOVOS BOTÕES AQUI */}
                <button onClick={() => setView('precision')} className="p-4 rounded-2xl bg-emerald-900/20 hover:bg-emerald-900/40 border border-emerald-500/30 flex flex-col items-center gap-2 text-emerald-400 transition hover:-translate-y-1"><Layers size={20}/><span className="text-[10px] uppercase font-bold">Precisão</span></button>
                <button onClick={() => setView('cattle')} className="p-4 rounded-2xl bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 flex flex-col items-center gap-2 text-red-400 transition hover:-translate-y-1"><Activity size={20}/><span className="text-[10px] uppercase font-bold">Pecuária</span></button>
                
                <button onClick={() => setView('pool')} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex flex-col items-center gap-2 text-white transition hover:-translate-y-1"><Users size={20}/><span className="text-[10px] uppercase font-bold">Pool</span></button>
                <button onClick={() => setView('marketplace')} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex flex-col items-center gap-2 text-white transition hover:-translate-y-1"><ShoppingBag size={20}/><span className="text-[10px] uppercase font-bold">Loja</span></button>
            </div>
        </div>
    </div>
);

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


// --- MAIN DASHBOARD (COM MENU MOBILE E ROTEAMENTO CORRIGIDOS) ---
const Dashboard = ({ user, role, currentTenant, onChangeTenant, onLogout, marketProducts, setMarketProducts }) => {
    const [view, setView] = useState('home');
    const [activeBranch, setActiveBranch] = useState(currentTenant.branches[0]);
    const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
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
        { id: 'telemetry', icon: MapPin, label: 'Telemetria', roles: ['Produtor', 'Coord. Regional'] },
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

    // --- ROTEADOR DE TELAS (CORRIGIDO) ---
    const renderContent = () => {
        switch (view) {
            // Home (AQUI ESTAVA O ERRO: Trocamos HomeView por SmartHome)
            case 'home': return <SmartHome role={role} setView={setView} branchData={branchData} activeBranch={activeBranch} />;
            
            // --- Banco Vitalis (Cartão Black) ---
            case 'financeiro': return <VitalisBankView />;
            
            // --- Pecuária e Lavoura ---
            case 'cattle': return <CattleView />;
            case 'precision': return <PrecisionAgView />;
            case 'agrilens': return <AgriLensView setView={setView} setChatContext={setChatContext}/>;
            case 'receituario': return <ReceituarioView />;
            case 'nutricao': return <NutricaoView products={marketProducts} />;
            
            // --- Comercial e Loja ---
            case 'venda_direta': return <DirectSalesView products={marketProducts} role={role} />;
            case 'marketplace': return <MarketplaceView goToChat={() => setView('chat')} products={marketProducts} setView={setView} setChatContext={setChatContext} />;
            case 'trading': return <TradingView role={role}/>;
            case 'pool': return <PoolView />;
            case 'price_update': return <PriceUpdateView products={marketProducts} setProducts={setMarketProducts} />;
            
            // --- Operacional e Logística ---
            case 'estoque': return <EstoqueView role={role} activeBranch={activeBranch} />;
            case 'expedicao': return <ExpedicaoView />;
            case 'logistica': return <LogisticaView />;
            case 'safety': return <SafetyView setView={setView} role={role} activeBranch={activeBranch} />;
            case 'telemetry': return <TelemetryView role={role} />;
            
            // --- Administrativo e Relacionamento ---
            case 'admin_finance': return <FinanceiroCompleto role={role} />;
            case 'cobranca': return <CobreancaView />;
            case 'grains': return <GrainWalletView />;
            case 'comunidade': return <CommunityView userEmail={user.email} />;
            case 'chat': return <ChatModule title="Suporte Técnico" subtitle="Online agora" userEmail={user.email} role={role} chatContext={chatContext} setChatContext={setChatContext}/>;
            case 'team_chat': return <ChatModule title="Chat Interno" subtitle="Equipe" />;
            case 'crm': return <CRMView />;
            case 'relatorios': return <RelatoriosView />;
            
            // Default (Também corrigido para SmartHome)
            default: return <SmartHome role={role} setView={setView} branchData={branchData} activeBranch={activeBranch} />;
        }
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br ${currentTenant.colors.gradient} text-white font-sans flex transition-all duration-1000`}>
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img src={currentTenant.bg_image} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="bg"/>
                <div className="absolute inset-0 bg-black/60"/>
                <div className="absolute bottom-8 right-8 opacity-10"><Logo size={400}/></div>
            </div>
            
            {/* SIDEBAR (DESKTOP) */}
            <aside className={`w-20 ${currentTenant.colors.sidebar} border-r border-white/10 flex flex-col items-center py-6 gap-6 hidden md:flex relative z-20 backdrop-blur-xl`}>
                <div className={`p-3 bg-white/10 rounded-xl ${currentTenant.colors.primary.replace('bg-', 'text-')}`}><Logo size={28}/></div>
                <nav className="flex-1 flex flex-col gap-4 w-full px-2">
                    {menu.map(item => (
                        <button key={item.id} onClick={() => setView(item.id)} className={twMerge("p-3 rounded-xl transition-all flex justify-center group relative", view === item.id ? "bg-white/20 text-white" : "text-white/40 hover:text-white hover:bg-white/5")} title={item.label}>
                            <item.icon size={22}/>
                        </button>
                    ))}
                </nav>
                <button onClick={onLogout} className="p-3 text-white/30 hover:text-red-400 transition"><LogOut size={22}/></button>
            </aside>

            {/* ÁREA PRINCIPAL */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
                {/* LÓGICA DE PERMISSÃO REGIONAL ATUALIZADA */}
                {(role === 'Admin' || role === 'Coord. Regional' || role === 'Téc. Segurança') && (
                    <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/20 transition absolute top-6 right-6 z-50">
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
                        <motion.div 
                            key={view + activeBranch} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: -10 }} 
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
      
            {/* --- GAVETA DE MENU MOBILE --- */}
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
// --- INICIO DO NOVO COMPONENTE DE LOGIN (TECH) ---
const TechLoginScreen = ({ onLogin, onDemoLogin }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const quickAccessUsers = [
    { id: '1', role: 'Everton', color: 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' },
    { id: '2', role: 'Ricardo', color: 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' },
    { id: '3', role: 'Operador', color: 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10' },
    { id: '4', role: 'Produtor', color: 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10' },
    { id: '5', role: 'Estoque', color: 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10' },
    { id: '6', role: 'Agrônomo', color: 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10' },
    { id: '7', role: 'Nutrição', color: 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10' },
    { id: '8', role: 'Admin', color: 'border-red-500/30 text-red-400 hover:bg-red-500/10' },
    { id: '9', role: 'Motorista', color: 'border-orange-500/30 text-orange-400 hover:bg-orange-500/10' },
    { id: '10', role: 'Segurança', color: 'border-gray-500/30 text-gray-400 hover:bg-gray-500/10' },
    { id: '11', role: 'Supervisor', color: 'border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-between p-16 border-r border-white/5 bg-slate-900/40 backdrop-blur-sm">
        <div>
           <div className="flex items-center gap-4 mb-6">
              <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20"><Leaf className="w-8 h-8 text-emerald-400" /></div>
              <div className="h-8 w-[1px] bg-white/10"></div>
              <Building2 className="w-8 h-8 text-amber-400" />
           </div>
           <h1 className="text-5xl font-bold text-white tracking-tight leading-tight">O futuro do <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">Agronegócio</span> <br/>começa aqui.</h1>
           <p className="text-slate-400 mt-6 text-lg max-w-md leading-relaxed">Gestão, monitoramento via satélite e soluções financeiras integradas.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md"><div className="flex items-center gap-2 mb-1 text-emerald-400"><Globe2 className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Volume</span></div><div className="text-2xl font-bold text-white">R$ 2.4bi</div></div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md"><div className="flex items-center gap-2 mb-1 text-amber-400"><ShieldCheck className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Produtores</span></div><div className="text-2xl font-bold text-white">+5.000</div></div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 z-20">
        <div className="w-full max-w-md space-y-6 animate-in slide-in-from-bottom-5 duration-700">
          <div className="lg:hidden flex justify-center items-center gap-3 mb-6"><Leaf className="w-8 h-8 text-emerald-500" /><span className="text-slate-600">×</span><Building2 className="w-8 h-8 text-amber-400" /></div>
          <div className="text-center lg:text-left"><h2 className="text-3xl font-bold text-white">Acesse sua conta</h2><p className="text-slate-400 text-sm mt-1">Credenciais corporativas Cotribá</p></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="relative group"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" /></div><input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-10 pr-3 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" placeholder="ID ou Email" /></div>
              <div className="relative group"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" /></div><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-10 pr-3 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" placeholder="Senha" /></div>
            </div>
            <button type="submit" className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 focus:outline-none font-bold transition-all transform active:scale-[0.98]">ACESSAR SISTEMA <ChevronRight className="ml-2 w-4 h-4" /></button>
          </form>
          <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div><div className="relative flex justify-center"><span className="px-3 bg-slate-950 text-xs text-slate-500 uppercase flex items-center gap-1"><LayoutGrid className="w-3 h-3" /> Acesso Rápido (Demo)</span></div></div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">{quickAccessUsers.map((user) => (<button key={user.id} onClick={() => onDemoLogin(user.id)} className={`px-1 py-2 rounded-lg border bg-slate-900/50 text-[10px] sm:text-xs font-medium uppercase transition-all hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-1 ${user.color}`}>{user.role}</button>))}</div>
          <div className="text-center pt-4"><p className="text-[10px] text-slate-600 font-mono">Powered by Vitalis OS v2.4 • Secured by Stark Bank</p></div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    // Estado GLOBAL de produtos
    const [marketProducts, setMarketProducts] = useState([
        { id: 1, name: "Adubo NPK 10-10-10", unit: "Ton", img: "🌱", type: 'consult', promo: true, tag: "Insumos", stock: true, desc: "Fertilizante mineral.", price: 0 },
        { id: 2, name: "Herbicida Glyphosate", unit: "Litro", img: "🧪", type: 'consult', promo: false, tag: "Químicos", stock: true, desc: "Controle de plantas.", price: 0 },
        { id: 3, name: "Botina Segurança", unit: "Par", img: "🥾", type: 'retail', promo: false, tag: "EPI", stock: true, desc: "Couro legítimo.", price: 149.90 },
        { id: 4, name: "Semente Trigo", unit: "Sc", img: "🌾", type: 'consult', promo: false, tag: "Sementes", stock: true, desc: "Alta produtividade.", price: 0 },
        { id: 5, name: "Tamponada 22%", unit: "Sc", img: "🐄", type: 'retail', promo: true, tag: "Nutrição", stock: true, desc: "Alta performance.", price: 95.00 },
        { id: 6, name: "Destete 18%", unit: "Sc", img: "🐂", type: 'retail', promo: false, tag: "Nutrição", stock: true, desc: "Crescimento.", price: 82.50 },
        { id: 7, name: "Bovino de Corte 140", unit: "Sc", img: "🥩", type: 'retail', promo: false, tag: "Nutrição", stock: true, desc: "Engorda rápida.", price: 78.00 },
        { id: 8, name: "Dieta Total", unit: "Ton", img: "🥣", type: 'consult', promo: false, tag: "Nutrição", stock: true, desc: "Nutrição completa.", price: 0 },
        { id: 9, name: "Fosfosal 500ml", unit: "Frasco", img: "💉", type: 'retail', promo: false, tag: "Nutrição", stock: true, desc: "Suplemento injetável.", price: 45.90 }
    ]);

    useEffect(() => { 
        if(!auth) { setLoading(false); return; } 
        const unsubscribe = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
        return () => unsubscribe();
    }, []);

    const handleLogin = async (email, pass) => { 
        setLoading(true); setAuthError(null); 
        try { 
            await signInWithEmailAndPassword(auth, email, pass); 
        } catch(e) { 
            setAuthError(e.message); setLoading(false); 
        } 
    };

    // --- FUNÇÃO DE LOGIN DEMO (AGORA EXISTE!) ---
    const handleLoginDemo = (userId) => {
        const demoUsers = {
            '1': { email: 'everton@cotriba.com.br', displayName: 'Everton' },
            '2': { email: 'ricardo@cotriba.com.br', displayName: 'Ricardo' },
            '3': { email: 'operador@cotriba.com.br', displayName: 'Operador' },
            '4': { email: 'produtor@cotriba.com.br', displayName: 'Produtor' },
            '5': { email: 'estoquista@cotriba.com.br', displayName: 'Estoque' },
            '6': { email: 'agronomo@cotriba.com.br', displayName: 'Agrônomo' },
            '7': { email: 'nutricao@cotriba.com.br', displayName: 'Nutrição' },
            '8': { email: 'admin@cotriba.com.br', displayName: 'Admin' },
            '9': { email: 'motorista@cotriba.com.br', displayName: 'Motorista' },
            '10': { email: 'seguranca@cotriba.com.br', displayName: 'Segurança' },
            '11': { email: 'supervisor@cotriba.com.br', displayName: 'Supervisor' },
        };

        const mockUser = demoUsers[userId];
        if (mockUser) {
            // Simula um objeto de usuário do Firebase
            setUser({ 
                uid: `demo_${userId}`, 
                email: mockUser.email, 
                displayName: mockUser.displayName,
                getIdToken: () => Promise.resolve('demo-token')
            });
        }
    };

    if (loading) return <div className="h-screen bg-slate-900 flex items-center justify-center text-white">Carregando...</div>;

    if (!user) {
        return (
            <TechLoginScreen 
                onLogin={handleLogin} 
                onDemoLogin={handleLoginDemo} 
            />
        );
    }

    return (
        <Dashboard 
            user={user} 
            role={getUserRole(user.email)} 
            currentTenant={tenants['cotriba']} 
            onLogout={() => signOut(auth).catch(() => setUser(null))} 
            marketProducts={marketProducts} 
            setMarketProducts={setMarketProducts} 
        />
    );
}