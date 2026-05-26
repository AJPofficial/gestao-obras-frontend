"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

export default function ProcessoDetalhe() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const processoId = params?.id;
  const anoOperacional = searchParams?.get("ano") || new Date().getFullYear().toString();

  const [setorUtilizador, setSetorUtilizador] = useState("");
  const [processo, setProcesso] = useState<any>(null);
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [utilizadores, setUtilizadores] = useState<any[]>([]);
  const [setorAtivoAbas, setSetorAtivoAbas] = useState("Orçamentação");

  // Estados Modal Registos
  const [modalTarefaAberto, setModalTarefaAberto] = useState(false);
  const [tituloTarefa, setTituloTarefa] = useState("");
  const [descricaoTarefa, setDescricaoTarefa] = useState("");
  const [tipoTarefa, setTipoTarefa] = useState("Tarefa");
  const [utilizadoresSelecionados, setUtilizadoresSelecionados] = useState<number[]>([]);
  const [erroModalTarefa, setErroModalTarefa] = useState("");

  // Estados Modal Transição
  const [modalTransitarAberto, setModalTransitarAberto] = useState(false);
  const [anoDestino, setAnoDestino] = useState((parseInt(anoOperacional) + 1).toString());
  const [erroModalTransitar, setErroModalTransitar] = useState("");

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
      const resposta = await fetch(`${baseUrl}/tarefas/processo/${processoId}?ano=${anoOperacional}`, {
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

  const concluirProcesso = async () => {
    if (!window.confirm("Tem a certeza que deseja marcar esta obra como concluída?")) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem("token");
      const resposta = await fetch(`${baseUrl}/processos/${processoId}/concluir`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (resposta.ok) {
        router.push("/dashboard");
      } else {
        alert("Erro ao concluir o processo.");
      }
    } catch (error) {
      alert("Falha de rede ao tentar atualizar o processo.");
    }
  };

  const confirmarTransicao = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroModalTransitar("");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const token = localStorage.getItem("token");
      const resposta = await fetch(`${baseUrl}/processos/${processoId}/transitar`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ano_destino: parseInt(anoDestino) })
      });

      if (resposta.ok) {
        setModalTransitarAberto(false);
        alert(`Processo transitado para o ano ${anoDestino} com sucesso.`);
        // Redireciona o utilizador diretamente para a secção do novo ano
        router.push(`/dashboard/processo/${processoId}?ano=${anoDestino}`);
      } else {
        const erro = await resposta.json();
        setErroModalTransitar(erro.detail || "Falha ao transitar o processo.");
      }
    } catch (error) {
      setErroModalTransitar("Falha de comunicação externa.");
    }
  };

  const submeterTarefa = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroModalTarefa("");

    if (setorUtilizador === "Montagem" && setorAtivoAbas !== "Montagem") {
      setErroModalTarefa("Permissão restrita. Apenas pode registar itens no setor de Montagem.");
      return;
    }
    if (setorUtilizador === "Produção" && setorAtivoAbas !== "Produção") {
      setErroModalTarefa("Permissão restrita. Apenas pode registar itens no setor de Produção.");
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
          utilizadores_associados: utilizadoresSelecionados,
          ano: parseInt(anoOperacional)
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
        setErroModalTarefa(erro.detail || "Falha ao submeter o registo.");
      }
    } catch (error) {
      setErroModalTarefa("Falha de comunicação externa.");
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
  const gruposSetores = ["Orçamentação", "Preparação", "Produção", "Montagem", "Gestão"];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Cabeçalho Otimizado - Linha única sem distrações visuais */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-2.5 flex flex-col sm:flex-row sm:justify-between sm:items-center sticky top-0 z-40 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3 overflow-hidden w-full sm:w-auto">
          <button 
            onClick={() => router.push("/dashboard")}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors focus:outline-none border border-transparent hover:border-gray-200 shrink-0"
            title="Voltar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          <div className="flex flex-col overflow-hidden whitespace-nowrap">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 flex items-center">
              Processo <span className="mx-1.5 text-gray-300">|</span> Ano Operacional: <span className="text-orange-600 ml-1">{anoOperacional}</span>
            </span>
            <h1 className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight tracking-tight truncate">
              <span className="text-orange-600">{processo.codigo}</span> <span className="text-gray-300 font-light mx-1">|</span> {processo.cliente} <span className="text-gray-300 font-light mx-1">|</span> {processo.descricao}
            </h1>
          </div>
        </div>

        {["Gestão", "Preparação", "Orçamentação"].includes(setorUtilizador) && processo.estado === "Em Curso" && (
          <div className="flex space-x-2 shrink-0">
            <button 
              onClick={() => setModalTransitarAberto(true)}
              className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-4 py-2 rounded-lg text-[10px] uppercase tracking-wider transition-colors border border-blue-200 w-full sm:w-auto"
            >
              Transitar Ano
            </button>
            <button 
              onClick={concluirProcesso}
              className="bg-green-800 hover:bg-green-900 text-white font-bold px-4 py-2 rounded-lg text-[10px] uppercase tracking-wider transition-colors shadow-sm w-full sm:w-auto"
            >
              Concluir Obra
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 p-4 w-full max-w-5xl mx-auto space-y-6 mt-2">
        
        <nav className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-200 p-1.5 rounded-xl shadow-inner">
          {["Orçamentação", "Preparação", "Produção", "Montagem"].map((s) => (
            <button
              key={s}
              onClick={() => setSetorAtivoAbas(s)}
              className={`py-3 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                setorAtivoAbas === s 
                  ? "bg-white text-orange-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-300/50"
              }`}
            >
              {s}
            </button>
          ))}
        </nav>

        {processo.estado === "Em Curso" && ((setorUtilizador === "Montagem" && setorAtivoAbas === "Montagem") ||
          (setorUtilizador === "Produção" && setorAtivoAbas === "Produção") ||
          ["Gestão", "Preparação", "Orçamentação"].includes(setorUtilizador)) && (
          <button
            onClick={() => setModalTarefaAberto(true)}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition-colors text-xs uppercase tracking-wider flex items-center justify-center"
          >
            Registar
          </button>
        )}

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Registos</h3>
            <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2.5 py-1 rounded-lg uppercase border border-gray-300">{setorAtivoAbas}</span>
          </div>

          <div className="hidden sm:grid grid-cols-5 gap-4 px-4 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
            <div>Tipo de Registo</div>
            <div className="col-span-2">Assunto / Indicações</div>
            <div>Equipa Associada</div>
            <div className="text-right">Ação</div>
          </div>

          <div className="divide-y divide-gray-100">
            {tarefasFiltradas.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-medium text-sm">
                Nenhum registo efetuado no ano de {anoOperacional}.
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
                  <div className="text-xs text-gray-600 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">
                    {utilizadores
                      .filter(u => t.utilizadores_associados?.includes(u.id))
                      .map(u => u.nome)
                      .join(", ") || <span className="text-gray-300 italic">Sem atribuição</span>}
                  </div>
                  <div className="sm:text-right">
                    <button
                      disabled={processo.estado !== "Em Curso"}
                      onClick={() => alternarEstadoTarefa(t.id, t.estado)}
                      className={`w-full sm:w-auto text-xs font-bold px-3 py-2 sm:py-1.5 rounded-lg border transition-all ${
                        t.estado === "Resolvido"
                          ? "bg-green-50 text-green-700 border-green-100 hover:bg-green-100"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 shadow-sm"
                      } ${processo.estado !== "Em Curso" ? "opacity-50 cursor-not-allowed" : ""}`}
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

      {/* MODAL: Transitar Processo */}
      {modalTransitarAberto && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 w-full text-center pl-6">Transitar Processo</h3>
              <button onClick={() => setModalTransitarAberto(false)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={confirmarTransicao} className="p-6 space-y-4 bg-white">
              <p className="text-xs text-gray-500 text-center mb-4">Ao transitar, a obra permanecerá idêntica, mas receberá um painel em branco exclusivo para os registos do novo ano.</p>
              
              {erroModalTransitar && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center font-medium">{erroModalTransitar}</div>}
              
              <div>
                <label className="block text-center w-full text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Ano Destino</label>
                <select required value={anoDestino} onChange={(e) => setAnoDestino(e.target.value)} className="w-full px-3 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 font-bold cursor-pointer text-center text-sm">
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                  <option value="2030">2030</option>
                </select>
              </div>
              
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors uppercase tracking-wider text-xs mt-4 shadow-sm">
                Confirmar Transição
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Registos Operacionais */}
      {modalTarefaAberto && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-gray-900 w-full text-center pl-6">Novo Registo</h3>
              <button onClick={() => setModalTarefaAberto(false)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={submeterTarefa} className="p-6 space-y-4 bg-white overflow-y-auto grow">
              {erroModalTarefa && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center font-medium">{erroModalTarefa}</div>}
              
              <div>
                <label className="block text-center w-full text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Tipo de Registo</label>
                <select value={tipoTarefa} onChange={(e) => setTipoTarefa(e.target.value)} className="w-full px-3 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 font-semibold cursor-pointer text-center text-sm">
                  <option value="Tarefa">Tarefa</option>
                  <option value="Alerta">Alerta</option>
                </select>
              </div>

              <div>
                <label className="block text-center w-full text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Assunto</label>
                <input required type="text" value={tituloTarefa} onChange={(e) => setTituloTarefa(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 text-center text-sm" />
              </div>
              
              <div>
                <label className="block text-center w-full text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Indicações</label>
                <textarea value={descricaoTarefa} onChange={(e) => setDescricaoTarefa(e.target.value)} rows={2} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 text-center text-sm"></textarea>
              </div>

              <div>
                <label className="block text-center w-full text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Associar Colaboradores</label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 space-y-4 bg-gray-50 text-left">
                  {gruposSetores.map((setorGroup) => {
                    const usersInSetor = utilizadores.filter(u => u.setor === setorGroup);
                    if (usersInSetor.length === 0) return null;
                    return (
                      <div key={setorGroup} className="space-y-1.5">
                        <h4 className="text-xs font-extrabold text-orange-600 uppercase tracking-wider border-b border-gray-200 pb-1">{setorGroup}</h4>
                        {usersInSetor.map((u) => (
                          <label key={u.id} className="flex items-center space-x-3 px-2 py-1.5 hover:bg-white rounded-lg cursor-pointer transition-colors text-sm text-gray-800 border border-transparent hover:border-gray-100 shadow-sm">
                            <input 
                              type="checkbox" 
                              checked={utilizadoresSelecionados.includes(u.id)}
                              onChange={() => handleSelecaoUtilizador(u.id)}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-4 h-4 bg-white"
                            />
                            <span className="font-medium">{u.nome}</span>
                          </label>
                        ))}
                      </div>
                    );
                  })}
                  {utilizadores.length === 0 && <p className="text-xs text-center text-gray-400 py-2">Sem colaboradores disponíveis.</p>}
                </div>
              </div>
              
              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors uppercase tracking-wider text-xs mt-4 shadow-sm shrink-0">
                Confirmar Registo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}