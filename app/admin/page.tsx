"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [utilizadores, setUtilizadores] = useState<any[]>([]);

  useEffect(() => {
    const setor = localStorage.getItem("setor");
    
    // Proteção rigorosa: Apenas Gestão acede a esta página
    if (setor !== "Gestão") {
      router.push("/dashboard");
      return;
    }
    
    // Aqui faremos a chamada à base de dados para listar contas pendentes
    // Para já, apresenta uma simulação visual
    setUtilizadores([
      { id: 1, nome: "Carlos Silva", setor: "Produção", contacto: "carlos@empresa.pt" }
    ]);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel de Administração</h1>
            <p className="text-sm text-gray-500">Aprovação e gestão de acessos à plataforma.</p>
          </div>
          <button 
            onClick={() => router.push("/dashboard")}
            className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            Voltar
          </button>
        </header>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Contas Pendentes de Aprovação</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {utilizadores.map((u) => (
              <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-900">{u.nome}</p>
                  <p className="text-sm text-gray-500">{u.contacto} • <span className="font-semibold text-orange-600">{u.setor}</span></p>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto">
                  Aprovar Conta
                </button>
              </div>
            ))}
            
            {utilizadores.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">Nenhuma conta pendente.</div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}