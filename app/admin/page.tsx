"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [utilizadores, setUtilizadores] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const setor = localStorage.getItem("setor");
    if (setor !== "Gestão") {
      router.push("/dashboard");
      return;
    }
    carregarPendentes();
  }, [router]);

  const carregarPendentes = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem("token");
      
      const resposta = await fetch(`${baseUrl}/auth/pendentes`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (resposta.ok) {
        const dados = await resposta.json();
        setUtilizadores(dados);
      }
    } catch (error) {
      console.error("Erro ao carregar pendentes", error);
    } finally {
      setCarregando(false);
    }
  };

  // CORREÇÃO: "id: number" em vez de "id: int"
  const aprovarConta = async (id: number) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem("token");
      
      const resposta = await fetch(`${baseUrl}/auth/aprovar/${id}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (resposta.ok) {
        setUtilizadores(utilizadores.filter(u => u.id !== id));
      } else {
        alert("Erro ao aprovar a conta.");
      }
    } catch (error) {
      alert("Falha de rede ao aprovar conta.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Validação de Contas</h1>
          </div>
          <button onClick={() => router.push("/dashboard")} className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            Voltar
          </button>
        </header>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Contas Pendentes de Aprovação</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {carregando ? (
              <div className="p-8 text-center text-gray-500 text-sm">A carregar dados...</div>
            ) : utilizadores.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">Nenhuma conta pendente.</div>
            ) : (
              utilizadores.map((u) => (
                <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-900">{u.nome}</p>
                    <p className="text-sm text-gray-500">{u.contacto} • <span className="font-semibold text-orange-600">{u.setor}</span></p>
                  </div>
                  <button 
                    onClick={() => aprovarConta(u.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto"
                  >
                    Aprovar Conta
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}