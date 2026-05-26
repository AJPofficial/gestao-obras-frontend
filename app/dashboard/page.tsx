"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [setor, setSetor] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);
  const [processos, setProcessos] = useState<any[]>([]);
  
  // O ano selecionado para visualizar na lista
  const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear().toString());
  
  const [modalAberto, setModalAberto] = useState(false);
  const [novoCodigo, setNovoCodigo] = useState("");
  const [novoDescritivo, setNovoDescritivo] = useState("");
  const [novoAno, setNovoAno] = useState(new Date().getFullYear().toString());
  const [erroModal, setErroModal] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const setorGuardado = localStorage.getItem("setor");

    if (!token) {
      router.push("/");
      return;
    }
    setSetor(setorGuardado || "Indefinido");
    
    const fecharMenu = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAberto(false);
      }
    };
    document.addEventListener("mousedown", fecharMenu);
    return () => document.removeEventListener("mousedown", fecharMenu);
  }, [router]);

  // Recarrega os processos sempre que o ano do filtro mudar
  useEffect(() => {
    carregarProcessos(anoFiltro);
  }, [anoFiltro]);

  const carregarProcessos = async (ano: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem("token");
      const resposta = await fetch(`${baseUrl}/processos/?ano=${ano}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        if (Array.isArray(dados)) {
          setProcessos(dados);
        } else {
          setProcessos([]);
        }
      } else {
        setProcessos([]);
      }
    } catch (error) {
      setProcessos([]);
    }
  };

  const criarProcesso = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroModal("");

    if (!novoAno) {
      setErroModal("Por favor, selecione um ano.");
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem("token");
      const resposta = await fetch(`${baseUrl}/processos/`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ codigo: novoCodigo, descritivo: novoDescritivo, ano: novoAno })
      });

      if (resposta.ok) {
        setModalAberto(false);
        setNovoCodigo("");
        setNovoDescritivo("");
        // Volta a definir o filtro para o ano que o utilizador acabou de criar a obra
        setAnoFiltro(novoAno); 
      } else {
        const dados = await resposta.json();
        setErroModal(dados.detail || "Erro ao criar processo.");
      }
    } catch (error) {
      setErroModal("Falha de comunicação com o servidor.");
    }
  };

  const terminarSessao = () => {
    localStorage.clear();
    router.push("/");
  };

  const reportarErro = () => {
    window.location.href = "mailto:andrecorreia@aj-pinto.pt?subject=Reportar erro: App Gestão Interna";
    setMenuAberto(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex justify-between items-center sticky top-0 z-40">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Setor Ativo</span>
          <span className="text-orange-600 font-bold text-lg leading-none">{setor}</span>
        </div>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuAberto(!menuAberto)} className="focus:outline-none transform transition-transform active:scale-95">
            <img 
              src="/perfil.png" 
              alt="Menu" 
              className="h-14 w-auto object-contain border-2 border-transparent hover:border-gray-100 rounded-lg p-1"
            />
          </button>

          {menuAberto && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              {setor === "Gestão" && (
                <button onClick={() => router.push("/admin")} className="w-full text-left px-4 py-3 text-sm text-gray-900 font-bold hover:bg-gray-50 border-b border-gray-100 flex items-center">
                  <svg className="w-4 h-4 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Administração
                </button>
              )}
              <button onClick={reportarErro} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                <svg className="w-4 h-4 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Reportar Erro
              </button>
              <button onClick={terminarSessao} className="w-full text-left px-4 py-3 text-sm text-red-600 font-semibold hover:bg-red-50 flex items-center">
                <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Sair
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 w-full max-w-4xl mx-auto space-y-6 mt-2">
        
        {["Orçamentação", "Preparação", "Gestão"].includes(setor) && (
          <section>
            <button 
              onClick={() => setModalAberto(true)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-4 rounded-xl shadow-sm transition-colors text-sm uppercase tracking-wider flex items-center justify-center active:scale-[0.98]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Adicionar Novo Processo
            </button>
          </section>
        )}

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-800 flex items-center text-sm uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              Obras Ativas
            </h2>
            
            {/* Selecionador Dinâmico de Ano */}
            <select 
              value={anoFiltro} 
              onChange={(e) => setAnoFiltro(e.target.value)}
              className="text-xs font-bold text-gray-700 bg-white border border-gray-300 px-3 py-1.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              <option value="2024">Ano: 2024</option>
              <option value="2025">Ano: 2025</option>
              <option value="2026">Ano: 2026</option>
              <option value="2027">Ano: 2027</option>
            </select>
          </div>
          
          <div className="divide-y divide-gray-100">
            {processos.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <p className="text-gray-500 font-medium text-sm">Nenhum processo ativo encontrado para {anoFiltro}.</p>
              </div>
            ) : (
              processos.map((proc) => (
                <div key={proc.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <span className="font-bold text-orange-600 text-lg block">{proc.codigo}</span>
                    <span className="text-sm text-gray-600">{proc.descritivo}</span>
                  </div>
                  <span className="mt-2 sm:mt-0 text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 w-fit">
                    {proc.estado}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <button className="w-full bg-white border border-gray-200 hover:border-orange-300 text-gray-700 p-4 rounded-xl shadow-sm flex flex-col items-center justify-center transition-colors active:bg-gray-50">
            <svg className="w-6 h-6 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-xs font-bold uppercase">Histórico de Obras</span>
          </button>
        </section>

      </main>

      {/* MODAL: Adicionar Novo Processo */}
      {modalAberto && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Novo Processo</h3>
              <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={criarProcesso} className="p-6 space-y-4">
              {erroModal && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">{erroModal}</div>}
              
              <div className="grid grid-cols-3 gap-4">
                {/* Campo Ano passa a ser obrigatório e ao lado do código */}
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Ano</label>
                  <select required value={novoAno} onChange={(e) => setNovoAno(e.target.value)} className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 font-semibold cursor-pointer">
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Código</label>
                  {/* bg-white forçado para impedir o Dark Mode de escurecer a caixa */}
                  <input required type="text" value={novoCodigo} onChange={(e) => setNovoCodigo(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 placeholder-gray-400" placeholder="Ex: OB-2601" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Descritivo (Opcional)</label>
                <textarea value={novoDescritivo} onChange={(e) => setNovoDescritivo(e.target.value)} rows={2} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 placeholder-gray-400" placeholder="Ex: Construção de Armazém"></textarea>
              </div>
              
              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors uppercase tracking-wide text-sm mt-4 shadow-sm">
                Gravar Processo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}