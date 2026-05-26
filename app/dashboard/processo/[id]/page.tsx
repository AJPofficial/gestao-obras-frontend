"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ProcessoDetalhe() {
  const router = useRouter();
  const params = useParams();
  const processoId = params?.id;

  const [setorUtilizador, setSetorUtilizador] = useState("");
  const [processo, setProcesso] = useState<any>(null);
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [utilizadores, setUtilizadores] = useState<any[]>([]);
  const [setorAtivoAbas, setSetorAtivoAbas] = useState("Orçamentação");

  const [modalTarefaAberto, setModalTarefaAberto] = useState(false);
  const [tituloTarefa, setTituloTarefa] = useState("");
  const [descricaoTarefa, setDescricaoTarefa] = useState("");
  const [tipoTarefa, setTipoTarefa] = useState("Tarefa");
  const [utilizadoresSelecionados, setUtilizadoresSelecionados] = useState<number[]>([]);
  const [erroModal, setErroModal] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const setor = localStorage.getItem("setor");

    if (!token) {
      router.push("/");
      return;
    }
    setSetorUtilizador(setor || "Indefinido");
    
    if (processoId) {
      carregarDadosProcesso();
      carregarTarefas();
      carregarUtilizadores();
    }
  }, [processoId, router]);

  const carregarDadosProcesso = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem("token");
      const resposta = await fetch(`${baseUrl}/processos/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        const encontrado = dados.find((p: any) => p.id.toString() === processoId);
        if (encontrado) setProcesso(encontrado);
      }
    } catch (error) {
      console.error("Falha ao obter dados do processo", error);
    }
  };

  const carregarTarefas = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem("token");
      const resposta = await fetch(`${baseUrl}/tarefas/processo/${processoId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        if (Array.isArray(dados)) setTarefas(dados);
      }
    } catch (error) {
      console.error("Falha ao carregar fluxo de tarefas", error);
    }
  };

  const carregarUtilizadores = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem("token");
      const resposta = await fetch(`${baseUrl}/tarefas/utilizadores`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        if (Array.isArray(dados)) setUtilizadores(dados);
      }
    } catch (error) {
      console.error("Falha ao carregar utilizadores", error);
    }
  };

  const alternarEstadoTarefa = async (tarefaId: number, estadoAtual: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem("token");
      const novoEstado = estadoAtual === "Pendente" ? "Resolvido" : "Pendente";
      
      const resposta = await fetch(`${baseUrl}/tarefas/${tarefaId}/estado`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ estado: novoEstado })
      });

      if (resposta.ok) carregarTarefas();
    } catch (error) {
      console.error("Erro na mutação de estado da tarefa", error);
    }
  };

  const submeterTarefa = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroModal("");

    if (setorUtilizador === "Montagem" && setorAtivoAbas !== "Montagem") {
      setErroModal("Permissão restrita. Apenas pode registar itens no setor de Montagem.");
      return;
    }
    if (setorUtilizador === "Produção" && setorAtivoAbas !== "Produção") {
      setErroModal("Permissão restrita. Apenas pode registar itens no setor de Produção.");
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem("token");
      const resposta = await fetch(`${baseUrl}/tarefas/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          processo_id: parseInt(processoId as string),
          setor_alvo: setorAtivoAbas,
          titulo: tituloTarefa,
          descricao: descricaoTarefa,
          tipo: tipoTarefa,
          utilizadores_associados: utilizadoresSelecionados
        })
      });

      if (resposta.ok) {
        setModalTarefaAberto(false);
        setTituloTarefa("");
        setDescricaoTarefa("");
        setUtilizadoresSelecionados([]);
        carregarTarefas();
      } else {
        const erro = await resposta.json();
        setErroModal(erro.detail || "Falha ao submeter o registo.");
      }
    } catch (error) {
      setErroModal("Falha de comunicação externa.");
    }
  };

  const handleSelecaoUtilizador = (id: number) => {
    if (utilizadoresSelecionados.includes(id)) {
      setUtilizadoresSelecionados(utilizadoresSelecionados.filter(uid => uid !== id));
    } else {
      setUtilizadoresSelecionados([...utilizadoresSelecionados, id]);
    }
  };

  if (!processo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">A carregar registo operacional...</p>
      </div>
    );
  }

  const tarefasFiltradas = tarefas.filter(t => t.setor_alvo === setorAtivoAbas);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Processo sob Consulta</span>
          <h1 className="text-xl font-bold text-orange-600 leading-none mt-1">{processo.codigo}</h1>
        </div>
        <button 
          onClick={() => router.push("/dashboard")}
          className="bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wide"
        >
          Voltar ao Painel
        </button>
      </header>

      <main className="flex-1 p-4 w-full max-w-5xl mx-auto space-y-6 mt-2">
        
        <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Especificação Geral / Cliente</h2>
          <p className="text-sm text-gray-800 font-medium">{processo.descricao || <span className="text-gray-300 italic">Sem comentários iniciais</span>}</p>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400 font-bold">
            <span>Estado da Obra: <span className="text-blue-600 uppercase">{processo.estado}</span></span>
            <span>Identificador: ID {processo.id}</span>
          </div>
        </section>

        <nav className="grid grid-cols-4 gap-1 bg-gray-200 p-1 rounded-xl shadow-inner">
          {["Orçamentação", "Preparação", "Produção", "Montagem"].map((s) => (
            <button
              key={s}
              onClick={() => setSetorAtivoAbas(s)}
              className={`py-3 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                setorAtivoAbas === s 
                  ? "bg-white text-orange-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {s}
            </button>
          ))}
        </nav>

        {((setorUtilizador === "Montagem" && setorAtivoAbas === "Montagem") ||
          (setorUtilizador === "Produção" && setorAtivoAbas === "Produção") ||
          ["Gestão", "Preparação", "Orçamentação"].includes(setorUtilizador)) && (
          <button
            onClick={() => setModalTarefaAberto(true)}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition-colors text-xs uppercase tracking-wider flex items-center justify-center"
          >
            Registar Item em {setorAtivoAbas}
          </button>
        )}

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Fluxo de Registos do Setor</h3>
            <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2.5 py-1 rounded-lg uppercase">{setorAtivoAbas}</span>
          </div>

          <div className="hidden sm:grid grid-cols-5 gap-4 px-4 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
            <div>Tipo</div>
            <div className="col-span-2">Título / Descrição</div>
            <div>Equipa Associada</div>
            <div className="text-right">Ação</div>
          </div>

          <div className="divide-y divide-gray-100">
            {tarefasFiltradas.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-medium text-sm">
                Nenhum registo operacional associado a este setor até ao momento.
              </div>
            ) : (
              tarefasFiltradas.map((t) => (
                <div key={t.id} className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-4 items-start sm:items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <span className={`inline-block text-xxs font-extrabold px-2 py-0.5 rounded uppercase border ${
                      t.tipo === "Alerta" 
                        ? "bg-red-50 text-red-700 border-red-100" 
                        : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}>
                      {t.tipo}
                    </span>
                  </div>
                  <div className="col-span-2 space-y-0.5">
                    <p className={`text-sm font-bold text-gray-900 ${t.estado === "Resolvido" ? "line-through text-gray-400" : ""}`}>{t.titulo}</p>
                    {t.descricao && <p className="text-xs text-gray-500">{t.descricao}</p>}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    {utilizadores
                      .filter(u => t.utilizadores_associados?.includes(u.id))
                      .map(u => u.nome)
                      .join(", ") || <span className="text-gray-300 italic">Sem atribuição</span>}
                  </div>
                  <div className="sm:text-right">
                    <button
                      onClick={() => alternarEstadoTarefa(t.id, t.estado)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                        t.estado === "Resolvido"
                          ? "bg-green-50 text-green-700 border-green-100 hover:bg-green-100"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 shadow-sm"
                      }`}
                    >
                      {t.estado === "Resolvido" ? "Concluído" : "Marcar Concluído"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </main>

      {modalTarefaAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 w-full text-center pl-6">Novo Registo</h3>
              <button onClick={() => setModalTarefaAberto(false)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={submeterTarefa} className="p-6 space-y-4 bg-white">
              {erroModal && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center font-medium">{erroModal}</div>}
              
              <div>
                <label className="block text-center w-full text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Tipo</label>
                <select value={tipoTarefa} onChange={(e) => setTipoTarefa(e.target.value)} className="w-full px-3 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 font-semibold cursor-pointer text-center text-sm">
                  <option value="Tarefa">Tarefa Padrão</option>
                  <option value="Alerta">Alerta Crítico</option>
                </select>
              </div>

              <div>
                <label className="block text-center w-full text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Título</label>
                <input required type="text" value={tituloTarefa} onChange={(e) => setTituloTarefa(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 text-center text-sm" />
              </div>
              
              <div>
                <label className="block text-center w-full text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Especificações Detalheadas</label>
                <textarea value={descricaoTarefa} onChange={(e) => setDescricaoTarefa(e.target.value)} rows={2} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 text-center text-sm"></textarea>
              </div>

              <div>
                <label className="block text-center w-full text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Associar Colaboradores</label>
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1.5 bg-gray-50/50">
                  {utilizadores.map((u) => (
                    <label key={u.id} className="flex items-center space-x-3 px-2 py-1 hover:bg-white rounded-lg cursor-pointer transition-colors text-sm text-gray-800">
                      <input 
                        type="checkbox" 
                        checked={utilizadoresSelecionados.includes(u.id)}
                        onChange={() => handleSelecaoUtilizador(u.id)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                      />
                      <span className="font-medium">{u.nome} <span className="text-xs text-gray-400">({u.setor})</span></span>
                    </label>
                  ))}
                </div>
              </div>
              
              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors uppercase tracking-wider text-xs mt-4 shadow-sm">
                Confirmar Registo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}