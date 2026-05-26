"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [setor, setSetor] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);
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
          <button 
            onClick={() => setMenuAberto(!menuAberto)}
            className="focus:outline-none transform transition-transform active:scale-95"
          >
            {/* Logótipo aumentado para h-14 */}
            <img 
              src="/perfil.png" 
              alt="Menu" 
              className="h-14 w-auto object-contain border-2 border-transparent hover:border-gray-100 rounded-lg p-1"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.insertAdjacentHTML('afterend', '<div class="w-12 h-12 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm font-bold">MENU</div>');
              }}
            />
          </button>

          {menuAberto && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fade-in-down">
              {/* Opção extra de menu caso o setor seja Gestão */}
              {setor === "Gestão" && (
                <button 
                  onClick={() => router.push("/admin")}
                  className="w-full text-left px-4 py-3 text-sm text-gray-900 font-bold hover:bg-gray-50 transition-colors flex items-center border-b border-gray-100"
                >
                  <svg className="w-4 h-4 mr-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Administração
                </button>
              )}
              <button 
                onClick={reportarErro}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Reportar Erro
              </button>
              <button 
                onClick={terminarSessao}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-semibold transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Sair
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 w-full max-w-4xl mx-auto space-y-6 mt-2">
        
        <section>
          <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-4 rounded-xl shadow-sm transition-colors text-sm uppercase tracking-wider flex items-center justify-center active:scale-[0.98]">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Adicionar Novo Processo
          </button>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-800 flex items-center text-sm uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              Obras Ativas
            </h2>
            <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded-md">2026</span>
          </div>
          
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-gray-500 font-medium text-sm">Nenhum processo ativo no momento.</p>
          </div>
        </section>

        <section>
          <button className="w-full bg-white border border-gray-200 hover:border-orange-300 text-gray-700 p-4 rounded-xl shadow-sm flex flex-col items-center justify-center transition-colors active:bg-gray-50">
            <svg className="w-6 h-6 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-xs font-bold uppercase">Histórico de Obras</span>
          </button>
        </section>

      </main>
    </div>
  );
}