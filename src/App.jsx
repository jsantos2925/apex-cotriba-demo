import React, { useState, useEffect, useMemo, useRef } from 'react';
// import { jsPDF } from 'jspdf'; 
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, onSnapshot, query, where, addDoc, serverTimestamp, orderBy, limit, updateDoc, deleteDoc } from 'firebase/firestore';
import { 
    Home, Package, MessageCircle, DollarSign, User, LogOut, Loader, Camera, Plus, Send, 
    AlertTriangle, X, TrendingUp, Sun, MapPin, Calculator, Search, ShieldCheck, 
    Leaf, ShoppingCart, FileText, ThumbsUp, ThumbsDown, Truck, HelpCircle, Zap, Cloud,
    CreditCard, Tag, TrendingDown, Thermometer, Wind, Droplets, CalendarDays, ListChecks,
    CheckCircle, Tractor, Sprout, SprayCan, Clock, Edit, Trash2, Warehouse, Plane, Menu, 
    BarChart3, Activity, MoreHorizontal, ShoppingBag, Megaphone, ArrowRightLeft, Filter,
    Lock, Mail, ArrowRight, FileSignature, QrCode, ClipboardList, Gavel, Handshake, Scale,
    Info, AlertOctagon, ScanEye, Bug, Users, Target, Siren, PieChart, LineChart, Wallet,
    Hash, MessageSquare, FileBarChart, Download, BoxSelect, Navigation, Wrench, Split, Landmark,
    FileUp, RefreshCw, Check, Newspaper, ExternalLink, Bell, CalendarClock, Database, Layers, Coffee, Tag as TagIcon,
    Wheat, Building2, Repeat, Network, ChevronDown, Smartphone, LayoutDashboard, UserCheck, PlusCircle, LockKeyhole, Pill
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// 1. CONFIGURAÇÃO
// ============================================================================

const apiKey = "AIzaSyAwMRDcadf5b0KlOmyxH4KyIj-fHnq-VxE"; // <--- COLE SUA API KEY DO GEMINI AQUI

const defaultFirebaseConfig = {
    apiKey: "AIzaSyD_o-5ZhbfQHmgCb21RKU3c9XXCOLhFR8s",
  authDomain: "agrimind-os.firebaseapp.com",
  projectId: "agrimind-os",
  storageBucket: "agrimind-os.firebasestorage.app",
  messagingSenderId: "466795111574",
  appId: "1:466795111574:web:3ca0be4acdcbcf56a50eb7"
};

// ============================================================================
// 2. INICIALIZAÇÃO
// ============================================================================

const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-apex';
const appId = rawAppId.replace(/[\/.]/g, '_'); 
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : defaultFirebaseConfig;

let app, db, auth;
try {
    if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("COLE_SUA")) {
        app = initializeApp(firebaseConfig);
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

let GLOBAL_STOCK = [
    { id: 1, nome: "Glifosato 480", lote: "LT-2024", quantidade: 5000, unidade: "L", branch: "São Gabriel", time: "08:00" },
    { id: 2, nome: "Semente Soja Intacta", lote: "S-88", quantidade: 200, unidade: "Sc", branch: "Santa Margarida", time: "Ontem" },
    { id: 3, nome: "Adubo NPK 04-14-08", lote: "NPK-10", quantidade: 150, unidade: "Ton", branch: "São Francisco de Assis", time: "Ontem" }
];

const getUserRole = (email) => {
    if (!email) return 'Visitante';
    if (email.includes('everton')) return 'Coordenador Regional';
    if (email.includes('ricardo')) return 'Coordenador Unidade';
    if (email.includes('produtor')) return 'Produtor';
    if (email.includes('agronomo')) return 'Agrônomo';
    if (email.includes('operador')) return 'Operador';
    if (email.includes('estoquista')) return 'Estoquista';
    return 'Admin'; 
};
const formatCurrency = (val) => typeof val === 'number' ? `R$ ${val.toFixed(2)}` : 'R$ 0,00';
const fileToBase64 = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = error => reject(error); });

// --- COMPONENTES VISUAIS ---
const GlassCard = ({ children, className, onClick }) => (
    <motion.div whileHover={onClick ? { scale: 1.005, borderColor: "rgba(255,255,255,0.5)" } : {}} whileTap={onClick ? { scale: 0.99 } : {}} onClick={onClick} className={twMerge(`backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group transition-all duration-300 bg-black/60`, className, onClick && "cursor-pointer")}>{children}</motion.div>
);
const NeonButton = ({ children, onClick, className, disabled, themeColor }) => (
    <button onClick={onClick} disabled={disabled} className={twMerge(`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md ${themeColor || "bg-yellow-500 text-blue-900 hover:bg-yellow-400"}`, className, disabled && "opacity-50 cursor-not-allowed")}>{children}</button>
);
const ThemedButton = ({ children, onClick, className, disabled, theme }) => (
    <button onClick={onClick} disabled={disabled} className={twMerge(`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md ${theme.colors.button}`, className, disabled && "opacity-50 cursor-not-allowed")}>{children}</button>
);
const GlassInput = ({ label, value, onChange, icon: Icon, ...props }) => (
    <div className="w-full space-y-1">{label && <label className="text-xs text-white/50 font-bold uppercase tracking-wider ml-1">{label}</label>}<div className="relative">{Icon && <Icon className="absolute left-4 top-3.5 text-white/50" size={20}/>}<input value={value} onChange={onChange} {...props} className={twMerge("w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white/50 focus:outline-none transition-all placeholder-white/20", Icon ? "pl-12 pr-4" : "px-4")}/></div></div>
);
const GlassSelect = ({ label, children, value, onChange }) => (
    <div className="w-full space-y-1">{label && <label className="text-xs text-white/50 font-bold uppercase tracking-wider ml-1">{label}</label>}<select value={value} onChange={onChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white/50 focus:outline-none [&>option]:bg-slate-900">{children}</select></div>
);

// --- SERVIÇOS INTELIGENTES (AGRILENS 2.0) ---
const realAgriLens = async (file) => {
    if (!apiKey) return { diagnosis: "Modo Demonstração", confidence: "100%", severity: "Teste", recommendation: "Insira sua API Key no código.", productMatch: { name: "Produto Genérico", price: 0 } };
    try {
        const base64Image = await fileToBase64(file);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
        
        // Prompt Aprimorado para Sugestão de Estoque
        const prompt = `
        Aja como um Engenheiro Agrônomo Sênior da Cotribá. Analise esta imagem agrícola.
        Retorne APENAS um JSON válido (sem markdown) com este formato exato:
        {
            "diagnosis": "Nome da Praga/Doença ou Saudável",
            "confidence": "XX%",
            "severity": "Baixa/Média/Alta",
            "explanation": "Explicação técnica detalhada de 2 frases sobre o que é visualizado.",
            "recommendation": "Recomendação técnica agronômica de manejo.",
            "productMatch": {
                "name": "Nome de um produto comercial real para isso (Ex: Fox Xpro, Elatus, etc)",
                "stock_status": "Disponível na Unidade"
            }
        }`;
        
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { mimeType: file.type, data: base64Image } }] }] };
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error();
        const data = await response.json();
        return JSON.parse(data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim());
    } catch (e) { return { diagnosis: "Erro na Análise", confidence: "0%", explanation: "Não foi possível processar.", severity: "N/A", recommendation: "Tente novamente.", productMatch: { name: "N/A", price: 0 } }; }
};

// --- WIDGETS ESPECIAIS PRODUTOR ---
const WeatherWidget = () => (
    <GlassCard className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 border-none">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-blue-200 flex items-center gap-1"><MapPin size={14}/> Ibirubá, RS</p>
                <h3 className="text-5xl font-black mt-2 text-white">28°</h3>
                <p className="text-white/80 mt-1 text-xs">Parcialmente Nublado</p>
            </div>
            <Cloud size={48} className="text-blue-400 drop-shadow-lg"/>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] text-center opacity-80">
            <div className="bg-black/20 rounded p-1"><Droplets size={12} className="mx-auto text-blue-400 mb-1"/>78%</div>
            <div className="bg-black/20 rounded p-1"><Wind size={12} className="mx-auto text-teal-400 mb-1"/>12km</div>
            <div className="bg-black/20 rounded p-1"><Sun size={12} className="mx-auto text-yellow-400 mb-1"/>UV Alto</div>
        </div>
    </GlassCard>
);

const TaskWidget = ({ onClick }) => (
    <GlassCard onClick={onClick} className="cursor-pointer hover:border-emerald-500/50 border-l-4 border-emerald-500">
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg text-white">Minhas Tarefas</h3>
            <span className="text-xs bg-emerald-500 text-black px-2 py-1 rounded-full font-bold">3 Pendentes</span>
        </div>
        <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500"/> Assinar Receituário</li>
            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-white/20"/> Retirar Adubo (S. Chico)</li>
            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-white/20"/> Confirmar Venda Soja</li>
        </ul>
    </GlassCard>
);

const FinanceWidget = ({ onClick }) => (
    <GlassCard onClick={onClick} className="cursor-pointer hover:border-red-500/50 border-l-4 border-red-500">
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg text-white">Financeiro</h3>
            <CreditCard size={20} className="text-red-400"/>
        </div>
        <p className="text-xs text-white/50">Próximo Vencimento</p>
        <p className="text-2xl font-bold text-white">R$ 15.200</p>
        <p className="text-xs text-red-300 mt-1">20/05/2025 - Boleto NFe 4429</p>
    </GlassCard>
);

const AgriNewsWidget = () => (
    <GlassCard className="col-span-full border-t-4 border-blue-400 p-4">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-white"><Newspaper size={18} className="text-blue-400"/> Notícias do Agro</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-black/20 p-3 rounded hover:bg-white/5 cursor-pointer transition"><span className="text-[10px] text-blue-300 block mb-1">CLIMA</span>Chuva prevista para Ibirubá favorece plantio.</div>
            <div className="bg-black/20 p-3 rounded hover:bg-white/5 cursor-pointer transition"><span className="text-[10px] text-green-300 block mb-1">MERCADO</span>Dólar cai e favorece compra de insumos.</div>
            <div className="bg-black/20 p-3 rounded hover:bg-white/5 cursor-pointer transition"><span className="text-[10px] text-yellow-300 block mb-1">COMMODITIES</span>Soja fecha em alta na bolsa de Chicago.</div>
        </div>
    </GlassCard>
);

// --- MÓDULOS COMPLETOS ---

const ChatModule = ({ title, subtitle }) => {
    const [messages, setMessages] = useState([{ id: 1, text: "Olá! Como podemos ajudar?", sender: "system", time: "Agora" }]);
    const [input, setInput] = useState("");
    const handleSend = (e) => { e.preventDefault(); if(!input.trim()) return; setMessages([...messages, { id: Date.now(), text: input, sender: "me", time: "Agora" }]); setInput(""); };
    return (<div className="h-[600px] flex flex-col bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden animate-in fade-in"><div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white"><MessageCircle size={20}/></div><div><h3 className="font-bold text-white">{title}</h3><p className="text-xs text-white/50">{subtitle}</p></div></div></div><div className="flex-1 overflow-y-auto p-4 space-y-4">{messages.map(m => (<div key={m.id} className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.sender === 'me' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}><p>{m.text}</p></div></div>))}</div><form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/10 flex gap-2"><input value={input} onChange={e=>setInput(e.target.value)} className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" placeholder="Digite..."/><button type="submit" className="p-3 bg-blue-600 rounded-xl text-white"><Send size={20}/></button></form></div>);
};

const FinanceiroCompleto = ({ role }) => (
    <div className="space-y-6 animate-in fade-in"><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><GlassCard className="border-l-4 border-green-500"><p className="text-sm text-white/50">Receita</p><h3 className="text-3xl font-bold mt-1 text-white">R$ 5.2M</h3></GlassCard><GlassCard className="border-l-4 border-red-500"><p className="text-sm text-white/50">Despesas</p><h3 className="text-3xl font-bold mt-1 text-white">R$ 1.8M</h3></GlassCard><GlassCard className="border-l-4 border-blue-500"><p className="text-sm text-white/50">Líquido</p><h3 className="text-3xl font-bold mt-1 text-white">R$ 3.4M</h3></GlassCard></div><GlassCard><h3 className="font-bold mb-4 flex items-center gap-2 text-white"><ShieldCheck/> Audit Hawk</h3><p className="text-green-400">Nenhuma anomalia detetada.</p></GlassCard></div>
);

const AgriLensView = ({ setView }) => {
    const [result, setResult] = useState(null); const [loading, setLoading] = useState(false); const fileRef = useRef(null);
    const handleAnalyze = async (e) => { const f = e.target.files[0]; if(!f) return; setLoading(true); const data = await realAgriLens(f); setResult(data); setLoading(false); };
    const notifyAgronomist = () => { alert("Enviado para o Agrônomo!"); setView('chat'); };
    return (
        <div className="space-y-6 animate-in fade-in"><div className="flex justify-between items-center"><h2 className="text-3xl font-bold text-white flex items-center gap-2"><ScanEye className="text-purple-400"/> AgriLens IA</h2></div><GlassCard className="text-center py-12">{!result ? (<><div onClick={() => fileRef.current.click()} className="w-40 h-40 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 cursor-pointer hover:bg-purple-500/30 border-2 border-dashed border-purple-500/50 animate-pulse"><Camera size={48} className="text-purple-400"/></div><h3 className="text-2xl font-bold text-white mb-2">{loading ? "Analisando..." : "Diagnóstico por Imagem"}</h3><input type="file" ref={fileRef} hidden onChange={handleAnalyze} accept="image/*"/></>) : (
        <div className="text-left space-y-4 max-w-md mx-auto">
            
            {/* AVISO LEGAL REFORÇADO - PEDIDO DO USUÁRIO */}
            <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-xl flex items-start gap-3 mb-4">
                <AlertTriangle className="text-yellow-400 shrink-0 mt-1"/>
                <div>
                    <h4 className="font-bold text-yellow-400 text-sm uppercase">Aviso Legal</h4>
                    <p className="text-xs text-yellow-200/80">Ferramenta de auxílio. A compra de defensivos exige prescrição de um Engenheiro Agrônomo.</p>
                </div>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-white/10"><h3 className="text-3xl font-bold text-red-400">{result.diagnosis}</h3><span className="bg-white/10 px-3 py-1 rounded text-xs font-mono">{result.confidence} Confiança</span></div>
            
            <div className="bg-white/5 p-4 rounded-xl">
                <h4 className="font-bold text-white text-sm mb-1">Análise Técnica:</h4>
                <p className="text-white/70 text-sm leading-relaxed">{result.explanation}</p>
            </div>

            <div className="bg-green-900/40 border border-green-500/30 p-4 rounded-xl flex justify-between items-center">
                <div>
                    <p className="text-xs text-green-400 font-bold uppercase">Solução em Estoque</p>
                    <p className="text-xl font-bold text-white">{result.productMatch?.name || "Consulte Agrônomo"}</p>
                    <p className="text-xs text-white/50">{result.productMatch?.stock_status}</p>
                </div>
                <Pill size={32} className="text-green-400"/>
            </div>

            <div className="flex gap-2 mt-4"><button onClick={() => setResult(null)} className="flex-1 py-3 w-full rounded-xl bg-white/10 hover:bg-white/20 text-sm font-bold text-white">Nova Análise</button><NeonButton onClick={notifyAgronomist} variant="accent" className="flex-1 text-sm">Solicitar Receita</NeonButton></div></div>)}</GlassCard></div>
    );
};

const ReceituarioView = () => {
    const [form, setForm] = useState({ produtor: '', cultura: '', produto: '' });
    const gerarPDF = () => { if (!form.produtor) return alert("Preencha os dados"); alert("Simulação: PDF Gerado!"); };
    return (<div className="space-y-6 animate-in fade-in"><h2 className="text-3xl font-bold flex items-center gap-2 text-white"><FileSignature/> Receituário</h2><GlassCard><p className="text-white">Sistema de Emissão Digital</p><NeonButton className="mt-4">Novo Documento</NeonButton></GlassCard></div>);
};
const LogisticaView = () => (<div className="space-y-6 animate-in fade-in"><h2 className="text-3xl font-bold flex gap-2 text-white"><Truck/> Frota</h2><GlassCard className="h-96 flex items-center justify-center border-dashed text-white"><MapPin size={48} className="mr-2"/> Mapa em Tempo Real</GlassCard></div>);
const ExpedicaoView = () => (<div className="space-y-6 animate-in fade-in"><h2 className="text-3xl font-bold flex gap-2 text-white"><BoxSelect/> Expedição</h2><GlassCard className="border-l-4 border-yellow-500"><h3 className="font-bold text-white">Carga #9982</h3><NeonButton className="w-full mt-4 text-xs">Iniciar Conferência</NeonButton></GlassCard></div>);
const CobreancaView = () => (<div className="space-y-6 animate-in fade-in"><h2 className="text-3xl font-bold flex items-center gap-2 text-white"><CreditCard/> Financeiro</h2><GlassCard><h3 className="font-bold text-white">A Vencer</h3><p className="text-3xl font-bold text-white">R$ 15.200,00</p></GlassCard></div>);
const PoolView = () => (<div className="space-y-6 animate-in fade-in"><h2 className="text-3xl font-bold flex gap-2 text-white"><Users/> Pool de Compras</h2><GlassCard className="border-l-4 border-teal-500"><div className="flex justify-between"><h3 className="font-bold text-white">Glifosato 200L</h3><span className="bg-teal-500/20 text-teal-300 px-2 py-1 rounded text-xs">Aberto</span></div><p className="text-sm text-white/70 mb-4">Meta: 10.000L. Faltam 2.500L.</p><div className="w-full bg-white/10 h-2 rounded-full mb-4"><div className="bg-teal-500 h-2 rounded-full w-[75%]"/></div><NeonButton className="w-full text-xs">Entrar</NeonButton></GlassCard></div>);
const RelatoriosView = () => (<div className="space-y-6 animate-in fade-in"><h2 className="text-3xl font-bold flex gap-2 text-white"><FileBarChart/> Relatórios</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{["Vendas", "Estoque", "Inadimplência"].map((r,i)=><GlassCard key={i} className="p-4 flex justify-between cursor-pointer hover:bg-white/10"><span className="font-bold text-white">{r}</span><Download size={16} className="text-white"/></GlassCard>)}</div></div>);
const EstoqueView = ({ role, activeBranch }) => {
    const [scanning, setScanning] = useState(false);
    const [items, setItems] = useState(GLOBAL_STOCK);
    const fileRef = useRef(null);

    const handleScan = async () => { 
        setScanning(true); 
        await new Promise(r => setTimeout(r, 2500)); 
        const novoItem = { id: Date.now(), nome: "Ureia Agrícola 46%", lote: "NF-8842", quantidade: 32000, unidade: "Kg", branch: "São Francisco de Assis", time: "Agora" };
        GLOBAL_STOCK.unshift(novoItem); setItems([...GLOBAL_STOCK]); 
        setScanning(false); 
        alert("✅ Nota Fiscal processada via OCR.\nEstoque atualizado em São Francisco de Assis.");
    };
    const filteredItems = activeBranch.includes('Visão') ? items : items.filter(i => i.branch === activeBranch);

    return (
        <div className="space-y-6 animate-in fade-in">
            {(role === 'Estoquista' || role === 'Operador') && <GlassCard className="bg-slate-800/50 border-l-4 border-green-500"><div className="flex justify-between mb-6 items-center"><div><h3 className="text-xl font-bold text-white">Entrada (OCR)</h3><p className="text-white/50 text-sm">Unidade: São Francisco de Assis</p></div><NeonButton onClick={()=>fileRef.current.click()} className="py-3 bg-green-600 hover:bg-green-500"><Camera size={18}/> Scan</NeonButton><input type="file" ref={fileRef} hidden onChange={handleScan}/></div>{scanning && <div className="text-center py-4 text-green-400 animate-pulse">Processando...</div>}</GlassCard>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{filteredItems.map(i => (<GlassCard key={i.id} className="border-l-4 border-blue-500 p-4"><div className="flex justify-between"><span className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-white">{i.lote}</span><span className="text-green-400 text-xs font-bold">{i.time}</span></div><h4 className="font-bold mt-2 text-white">{i.nome}</h4><p className="text-xs text-white/50 mt-1 flex items-center gap-1"><MapPin size={10}/> {i.branch}</p><div className="mt-4 border-t border-white/10 pt-2 font-bold text-xl text-white">{i.quantidade} <span className="text-xs font-normal">{i.unidade}</span></div></GlassCard>))}</div>
        </div>
    );
};

const MarketplaceView = ({ goToChat, products }) => {
    const [cart, setCart] = useState([]);
    const [checkoutStep, setCheckoutStep] = useState('list'); 
    const isRetail = (p) => p.type === 'retail';
    const addToCart = (p) => setCart([...cart, p]);
    const total = cart.reduce((acc, item) => acc + (item.price || 0), 0);
    const pixCode = "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-42661417400052040000530398654041.005802BR5913Apex Demo6008Brasilia62070503***63041D3D"; 
    const handlePayment = () => { setCheckoutStep('payment'); setTimeout(() => { setCheckoutStep('done'); setCart([]); }, 5000); };

    if (checkoutStep === 'payment') return <div className="flex flex-col items-center justify-center h-96 animate-in fade-in text-center p-6"><h3 className="text-2xl font-bold text-white mb-2">Pagamento via Pix</h3><p className="text-white/50 mb-6">Aguardando confirmação...</p><div className="bg-white p-4 rounded-xl mb-6"><QrCode size={200} className="text-black"/></div><div className="w-full max-w-xs bg-white/10 p-3 rounded-lg border border-white/20 flex items-center justify-between"><span className="text-xs text-white/50 truncate w-48">{pixCode}</span><button onClick={() => navigator.clipboard.writeText(pixCode)} className="text-xs text-emerald-400 font-bold hover:text-emerald-300">COPIAR</button></div><div className="mt-6 flex items-center gap-2 text-sm text-emerald-400 animate-pulse"><Loader size={16} className="animate-spin"/> Processando...</div></div>;
    if (checkoutStep === 'done') return <div className="flex flex-col items-center justify-center h-96 animate-in fade-in text-center"><div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/50"><Check size={48} className="text-white"/></div><h3 className="text-3xl font-bold text-white mb-2">Pagamento Confirmado!</h3><NeonButton onClick={() => setCheckoutStep('list')} className="flex-1" variant="secondary">Voltar à Loja</NeonButton></div>;

    return (
        <div className="space-y-8 animate-in fade-in">
             <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/10 sticky top-0 z-20 backdrop-blur-xl"><h2 className="text-2xl font-bold flex items-center gap-2 text-white"><ShoppingBag className="text-yellow-400"/> Loja</h2><div className="flex items-center gap-4"><div className="text-right"><p className="text-xs text-white/50 uppercase tracking-wider">Seu Carrinho</p><p className="font-bold text-emerald-400 text-lg">{cart.length} itens | {formatCurrency(total)}</p></div><NeonButton disabled={cart.length === 0} onClick={handlePayment} variant="accent">Pagar</NeonButton></div></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{products.map(p => (<GlassCard key={p.id} className="flex flex-col p-4 hover:border-yellow-500/50 cursor-pointer group relative" onClick={() => {}}><div className="text-6xl my-6 text-center">{p.img}</div><h4 className="font-bold text-white leading-tight mb-1">{p.name}</h4>
            
            {/* LÓGICA HÍBRIDA DE PREÇO - PEDIDO DO USUÁRIO */}
            <div className="mt-auto pt-2">
                {isRetail(p) ? (
                    <p className="text-emerald-400 font-bold text-lg">{formatCurrency(p.price)} <span className="text-white/40 text-xs font-normal">/{p.unit}</span></p>
                ) : (
                    <div className="flex items-center gap-1 text-blue-300 text-sm font-bold bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 w-fit"><MessageCircle size={12}/> Sob Consulta</div>
                )}
            </div>

            {/* BOTÃO HÍBRIDO */}
            <button onClick={() => isRetail(p) ? addToCart(p) : goToChat()} className={twMerge("mt-3 w-full py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2", isRetail(p) ? "bg-white/10 hover:bg-white/20 text-white" : "bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/30 shadow-lg shadow-blue-900/20")}>{isRetail(p) ? <><PlusCircle size={16}/> Comprar</> : 'Solicitar Cotação'}</button>
            </GlassCard>))}</div></div>
    );
};
const TradingView = ({ role }) => <GlassCard><h2 className="text-3xl font-bold flex gap-2 text-white"><Gavel className="text-amber-400"/> Mesa de Grãos</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">{[{id:1, g:'Soja', p:135.5}].map(c => <GlassCard key={c.id}><h4 className="font-bold text-white">{c.g}</h4><div className="text-center py-4 bg-black/20 rounded-xl my-4"><span className="text-4xl font-black text-white">{formatCurrency(c.p)}</span></div>{role === 'Produtor' && <NeonButton variant="gold" className="w-full mt-4">Vender Agora</NeonButton>}</GlassCard>)}</div></GlassCard>;
const CommunityView = ({ userEmail }) => <ChatModule title="Comunidade" subtitle="Produtores Online" />;

// --- DASHBOARDS ESPECÍFICOS (HOME) ---

const DirectorHome = ({ setView, branchData }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
        <GlassCard className="cursor-pointer hover:bg-white/5" onClick={() => setView('estoque')}><div className="flex items-center gap-3 mb-4"><Package className="text-green-400"/><h3 className="font-bold text-lg text-white">Estoque</h3></div><p className="text-2xl font-bold text-white">{branchData.stock}</p><p className="text-xs text-white/50">Atualizado Agora</p></GlassCard>
        <GlassCard className="cursor-pointer hover:bg-white/5" onClick={() => setView('financeiro')}><div className="flex items-center gap-3 mb-4"><Wallet className="text-yellow-400"/><h3 className="font-bold text-lg text-white">Vendas</h3></div><p className="text-2xl font-bold text-white">{branchData.sales}</p><p className="text-xs text-white/50">Hoje</p></GlassCard>
        <GlassCard className="cursor-pointer hover:bg-white/5" onClick={() => setView('logistica')}><div className="flex items-center gap-3 mb-4"><Truck className="text-blue-400"/><h3 className="font-bold text-lg text-white">Logística</h3></div><p className="text-2xl font-bold text-white">{branchData.trucks}</p><p className="text-xs text-white/50">Caminhões no Pátio</p></GlassCard>
        <GlassCard className="col-span-full md:col-span-3 border-t-4 border-indigo-500"><div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg text-white flex gap-2 items-center"><Activity/> Performance Geral</h3><span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">Em Tempo Real</span></div><div className="grid grid-cols-4 gap-4 text-center"><div className="p-3 bg-white/5 rounded-lg"><p className="text-xs text-white/50">Faturamento</p><p className="font-bold text-lg text-white">{branchData.sales}</p></div><div className="p-3 bg-white/5 rounded-lg"><p className="text-xs text-white/50">Margem</p><p className="font-bold text-lg text-green-400">+12%</p></div><div className="p-3 bg-white/5 rounded-lg"><p className="text-xs text-white/50">Ruptura</p><p className="font-bold text-lg text-red-400">3.2%</p></div><div className="p-3 bg-white/5 rounded-lg"><p className="text-xs text-white/50">NPS</p><p className="font-bold text-lg text-yellow-400">78</p></div></div></GlassCard>
    </div>
);

const ProducerHome = ({ setView }) => (
    <div className="space-y-6 animate-in fade-in">
        {/* VISÃO GERAL EXPANDIDA - PEDIDO DO USUÁRIO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AgriNewsWidget />
            <WeatherWidget />
            <TaskWidget onClick={() => setView('chat')} />
            <FinanceWidget onClick={() => setView('cobranca')} />
            <GlassCard className="col-span-2 border-l-4 border-yellow-500 flex justify-between items-center cursor-pointer" onClick={() => setView('marketplace')}><div><h3 className="text-xl font-bold text-white">Loja Cotribá</h3><p className="text-sm opacity-70 text-white">Insumos disponíveis.</p></div><Tractor size={64} className="opacity-20 text-white"/></GlassCard>
            
            {/* MENU RÁPIDO */}
            <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => setView('chat')} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex flex-col items-center gap-2 text-white"><MessageCircle/><span className="text-xs">Consultor</span></button>
                <button onClick={() => setView('agrilens')} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex flex-col items-center gap-2 text-white"><ScanEye/><span className="text-xs">AgriLens</span></button>
                <button onClick={() => setView('pool')} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex flex-col items-center gap-2 text-white"><Users/><span className="text-xs">Pool</span></button>
                <button onClick={() => setView('marketplace')} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex flex-col items-center gap-2 text-white"><ShoppingBag/><span className="text-xs">Loja</span></button>
            </div>
        </div>
    </div>
);

const OperatorHome = ({ setView }) => (
    <div className="grid grid-cols-1 gap-6 animate-in fade-in"><GlassCard className="col-span-full border-l-4 border-green-500 text-center py-12 cursor-pointer hover:bg-white/5" onClick={()=>setView('estoque')}><Camera size={48} className="mx-auto mb-4 text-green-400"/><h3 className="text-2xl font-bold text-white">Escanear Entrada</h3><p className="text-white/50">Ler Nota Fiscal</p></GlassCard><div className="grid grid-cols-2 gap-4"><GlassCard className="cursor-pointer hover:bg-white/10" onClick={()=>setView('expedicao')}><h3 className="font-bold text-white">Expedição</h3><p className="text-white/50">3 Cargas Pendentes</p></GlassCard><GlassCard className="cursor-pointer hover:bg-white/10" onClick={()=>setView('logistica')}><h3 className="font-bold text-white">Pátio</h3><p className="text-white/50">5 Caminhões</p></GlassCard></div></div>
);
const EstoquistaDashboard = ({ setView }) => (
    <div className="grid grid-cols-1 gap-6 animate-in fade-in"><GlassCard className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-l-4 border-cyan-500 p-6"><h2 className="text-2xl font-bold text-white">Olá, Estoquista</h2><p className="text-white/50">Sua função: Conferir e Registrar.</p></GlassCard><div className="grid grid-cols-2 gap-4"><GlassCard className="cursor-pointer hover:bg-white/10 bg-green-600/20 text-center py-8" onClick={()=>setView('estoque')}><Package size={32} className="mx-auto text-green-400 mb-2"/><h3 className="font-bold text-white">Entrada/Saída</h3></GlassCard><GlassCard className="cursor-pointer hover:bg-white/10 bg-blue-600/20 text-center py-8" onClick={()=>setView('expedicao')}><BoxSelect size={32} className="mx-auto text-blue-400 mb-2"/><h3 className="font-bold text-white">Conferir Carga</h3></GlassCard></div></div>
);
const SmartHome = ({ role, setView, branchData }) => {
    if (role === 'Produtor') return <ProducerHome setView={setView} />;
    if (role === 'Estoquista') return <EstoquistaDashboard setView={setView} />;
    if (role === 'Operador') return <OperatorHome setView={setView} />;
    return <DirectorHome setView={setView} branchData={branchData} />;
};
const SwitchTenantWidget = ({ currentTenant, onSwitch }) => {
    const otherTenant = currentTenant === 'cotriba' ? '3tentos' : 'cotriba';
    return (<GlassCard className="cursor-pointer hover:bg-white/10 border-dashed border-white/30" onClick={() => onSwitch(otherTenant)}><div className="flex items-center gap-4"><div className="p-3 bg-white/10 rounded-full"><Repeat size={24}/></div><div><h4 className="font-bold text-lg">Acessar {tenants[otherTenant].name}</h4><p className="text-xs text-white/50">Trocar de conta cooperativa</p></div></div></GlassCard>);
};
const LoginScreen = ({ onLogin, loading, error }) => {
    const [email, setEmail] = useState(''); const [pass, setPass] = useState('');
    const quickLogin = (e, roleEmail) => { e.preventDefault(); onLogin(roleEmail, '123456'); };
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#003B71] relative overflow-hidden"><div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-yellow-500/20 via-[#003B71] to-[#003B71]"/><GlassCard className="w-full max-w-sm p-8 relative z-10 border-yellow-500/30"><div className="text-center mb-8"><div className="inline-flex p-4 bg-white/10 rounded-full mb-4 text-yellow-400 shadow-lg"><Wheat size={48}/></div><h1 className="text-4xl font-black text-white tracking-tighter">Cotribá <span className="text-yellow-400">Digital</span></h1><p className="text-white/60 text-sm mt-2">Acesso Corporativo</p></div><form onSubmit={(e)=>{e.preventDefault(); onLogin(email, pass)}} className="space-y-4"><GlassInput label="Email" icon={Mail} value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com"/><GlassInput label="Senha" icon={Lock} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••"/>{error && <div className="text-red-400 text-xs bg-red-500/10 p-2 rounded">{String(error)}</div>}<NeonButton className="w-full" disabled={loading}>{loading ? 'Entrando...' : 'Acessar'}</NeonButton></form><div className="mt-6 pt-4 border-t border-white/10"><p className="text-[10px] text-white/30 text-center mb-2 uppercase tracking-widest">Acesso Rápido (Demo)</p><div className="grid grid-cols-3 gap-2"><button onClick={(e)=>quickLogin(e, 'everton@cotriba.com')} className="text-[10px] bg-purple-900/50 p-2 rounded text-purple-200 border border-purple-500/30 hover:bg-purple-800 transition">1. Everton</button><button onClick={(e)=>quickLogin(e, 'ricardo@cotriba.com')} className="text-[10px] bg-blue-900/50 p-2 rounded text-blue-200 border border-blue-500/30 hover:bg-blue-800 transition">2. Ricardo</button><button onClick={(e)=>quickLogin(e, 'operador@cotriba.com')} className="text-[10px] bg-orange-900/50 p-2 rounded text-orange-200 border border-orange-500/30 hover:bg-orange-800 transition">3. Operador</button><button onClick={(e)=>quickLogin(e, 'produtor@cotriba.com')} className="text-[10px] bg-green-900/50 p-2 rounded text-green-200 border border-green-500/30 hover:bg-green-800 transition">4. Produtor</button><button onClick={(e)=>quickLogin(e, 'estoquista@cotriba.com')} className="text-[10px] bg-cyan-900/50 p-2 rounded text-cyan-200 border border-cyan-500/30 hover:bg-cyan-800 transition">5. Estoque</button><button onClick={(e)=>quickLogin(e, 'agronomo@cotriba.com')} className="text-[10px] bg-teal-900/50 p-2 rounded text-teal-200 border border-teal-500/30 hover:bg-teal-800 transition">6. Agrônomo</button></div><p className="text-[10px] text-white/20 text-center mt-4">Powered by <strong>Apex OS</strong></p></div></GlassCard></div>
    );
};
const Dashboard = ({ user, role, currentTenant, onChangeTenant, onLogout, marketProducts, setMarketProducts }) => {
    const [view, setView] = useState('home');
    const [activeBranch, setActiveBranch] = useState(currentTenant.branches[0]);
    const Logo = currentTenant.logo;
    const menu = [
        { id: 'home', icon: Home, label: 'Visão Geral', roles: ['Admin', 'Coordenador Regional', 'Coordenador Unidade', 'Operador', 'Produtor', 'Estoquista', 'Agrônomo'] },
        { id: 'marketplace', icon: ShoppingBag, label: 'Loja', roles: ['Produtor'] },
        { id: 'trading', icon: Gavel, label: 'Grãos', roles: ['Admin', 'Produtor', 'Coordenador Regional', 'Coordenador Unidade'] },
        { id: 'estoque', icon: Package, label: 'Estoque', roles: ['Admin', 'Coordenador Regional', 'Coordenador Unidade', 'Operador', 'Estoquista'] },
        { id: 'logistica', icon: Truck, label: 'Logística', roles: ['Admin', 'Operador', 'Coordenador Regional', 'Coordenador Unidade'] },
        { id: 'financeiro', icon: Wallet, label: 'Financeiro', roles: ['Admin', 'Produtor', 'Coordenador Regional', 'Coordenador Unidade'] },
        { id: 'comunidade', icon: Users, label: 'Comunidade', roles: ['Produtor'] },
        { id: 'agrilens', icon: ScanEye, label: 'AgriLens', roles: ['Produtor', 'Agrônomo'] },
        { id: 'receituario', icon: FileSignature, label: 'Receituário', roles: ['Agrônomo'] },
        { id: 'chat', icon: MessageCircle, label: 'Chat', roles: ['Produtor', 'Admin', 'Agrônomo'] },
        { id: 'pool', icon: Users, label: 'Pool', roles: ['Produtor'] },
        { id: 'team_chat', icon: MessageSquare, label: 'Team', roles: ['Admin', 'Operador', 'Estoquista', 'Coordenador Regional', 'Coordenador Unidade'] },
        { id: 'relatorios', icon: FileBarChart, label: 'Relatórios', roles: ['Admin', 'Coordenador Regional', 'Coordenador Unidade'] },
    ].filter(item => item.roles.includes(role));
    const branchData = useMemo(() => {
        if (activeBranch === 'São Francisco de Assis') return { stock: '3.200 Ton', sales: 'R$ 450k', trucks: 5 };
        if (activeBranch.includes('Visão')) return { stock: '15.800 Ton', sales: 'R$ 2.1M', trucks: 22 };
        return { stock: '1.500 Ton', sales: 'R$ 120k', trucks: 2 };
    }, [activeBranch]);
    return (
        <div className={`min-h-screen bg-gradient-to-br ${currentTenant.colors.gradient} text-white font-sans flex transition-all duration-1000`}>
            <div className="fixed inset-0 z-0 pointer-events-none"><img src={currentTenant.bg_image} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="bg"/><div className="absolute inset-0 bg-black/60"/><div className="absolute bottom-8 right-8 opacity-10"><Logo size={400}/></div></div>
            <aside className={`w-20 ${currentTenant.colors.sidebar} border-r border-white/10 flex flex-col items-center py-6 gap-6 hidden md:flex relative z-20 backdrop-blur-xl`}><div className={`p-3 bg-white/10 rounded-xl ${currentTenant.colors.primary.replace('bg-', 'text-')}`}><Logo size={28}/></div><nav className="flex-1 flex flex-col gap-4 w-full px-2">{menu.map(item => (<button key={item.id} onClick={() => setView(item.id)} className={twMerge("p-3 rounded-xl transition-all flex justify-center group relative", view === item.id ? "bg-white/20 text-white" : "text-white/40 hover:text-white hover:bg-white/5")} title={item.label}><item.icon size={22}/>{view === item.id && <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full ${currentTenant.colors.accent_bg}`}/>}</button>))}</nav><button onClick={onLogout} className="p-3 text-white/30 hover:text-red-400 transition"><LogOut size={22}/></button></aside>
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md z-20"><div className="flex items-center gap-4"><h1 className="font-bold text-lg tracking-tight">{currentTenant.name} <span className="text-white/40 font-normal">Manager</span></h1>{(role === 'Admin' || role === 'Coordenador Regional') && (<div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/20 transition"><MapPin size={14} className={currentTenant.colors.accent.replace('text-', 'text-')}/><select value={activeBranch} onChange={(e) => setActiveBranch(e.target.value)} className="bg-transparent text-xs font-bold text-white outline-none appearance-none cursor-pointer [&>option]:bg-slate-900 pr-2 min-w-[120px]">{currentTenant.branches.map(b => <option key={b} value={b}>{b}</option>)}</select><ChevronDown size={12} className="text-white/50"/></div>)}{role === 'Coordenador Unidade' && (<div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 cursor-not-allowed opacity-80"><MapPin size={14} className="text-white/50"/><span className="text-xs font-bold text-white">São Francisco de Assis</span><LockKeyhole size={12} className="text-white/30"/></div>)}</div><div className="flex items-center gap-4"><div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10"><Database size={12} className="text-green-400"/><span className="text-[10px] font-mono text-white/60">ERP: Online</span></div><div className={`h-8 w-8 rounded-full ${currentTenant.colors.accent_bg} flex items-center justify-center font-bold text-xs text-black shadow-lg`}>{role === 'Coordenador Regional' ? 'EV' : role === 'Coordenador Unidade' ? 'RI' : role[0]}</div></div></header>
                <div className="flex-1 overflow-y-auto p-8"><AnimatePresence mode="wait"><motion.div key={view + activeBranch} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    {view === 'home' && <SmartHome role={role} setView={setView} branchData={branchData} />}
                    {view === 'estoque' && <EstoqueView userId={user.uid} inventory={[]} role={role} activeBranch={activeBranch} />}
                    {view === 'agrilens' && <AgriLensView setView={setView}/>}
                    {view === 'marketplace' && <MarketplaceView goToChat={() => setView('chat')} role={role} products={marketProducts}/>}
                    {view === 'trading' && <TradingView role={role}/>}
                    {view === 'expedicao' && <ExpedicaoView />}
                    {view === 'logistica' && <LogisticaView />}
                    {view === 'financeiro' && <FinanceiroCompleto role={role} />}
                    {view === 'admin_finance' && <FinanceiroCompleto role={role} />}
                    {view === 'cobranca' && <CobrancaView />}
                    {view === 'comunidade' && <CommunityView userEmail={user.email} />}
                    {view === 'chat' && <ChatModule title="Suporte Técnico" subtitle="Online agora" />}
                    {view === 'team_chat' && <ChatModule title="Chat Interno" subtitle="Equipe" />}
                    {view === 'receituario' && <ReceituarioView />}
                    {view === 'pool' && <PoolView />}
                    {view === 'relatorios' && <RelatoriosView />}
                    {view === 'price_update' && <PriceUpdateView products={marketProducts} setProducts={setMarketProducts} />}
                </motion.div></AnimatePresence></div>
            </main>
        </div>
    );
};

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);
    const [marketProducts, setMarketProducts] = useState([
        { id: 1, name: "Adubo NPK 10-10-10", unit: "Ton", img: "🌱", type: 'consult', promo: true, tag: "Insumos", stock: true, desc: "Fertilizante mineral.", price: 0 },
        { id: 2, name: "Herbicida Glyphosate", unit: "Litro", img: "🧪", type: 'consult', promo: false, tag: "Químicos", stock: true, desc: "Controle de plantas.", price: 0 },
        { id: 3, name: "Botina Segurança", unit: "Par", img: "🥾", type: 'retail', promo: false, tag: "EPI", stock: true, desc: "Couro legítimo.", price: 149.90 }
    ]);
    useEffect(() => { if(!auth) { setLoading(false); return; } const init = async () => { try { if(initialAuthToken) await signInWithCustomToken(auth, initialAuthToken); else await signInAnonymously(auth); } catch(e) {} }; if(!user) init(); return onAuthStateChanged(auth, u => { setUser(u); setLoading(false); }); }, []);
    const handleLogin = async (email, pass, isRegister) => { setLoading(true); setAuthError(null); try { if(isRegister) await createUserWithEmailAndPassword(auth, email, pass); else await signInWithEmailAndPassword(auth, email, pass); } catch(e) { setAuthError(e.message); setLoading(false); } };
    if (!user) return <LoginScreen onLogin={handleLogin} loading={loading} error={authError} />;
    return <Dashboard user={user} role={getUserRole(user.email)} currentTenant={tenants['cotriba']} onChangeTenant={() => {}} onLogout={() => signOut(auth)} marketProducts={marketProducts} setMarketProducts={setMarketProducts} />;
}