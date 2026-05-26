"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [temConta, setTemConta] = useState(true);
  
  const [nome, setNome] = useState("");
  const [contacto, setContacto] = useState("");
  const [setor, setSetor] = useState("");
  const [palavraPasse, setPalavraPasse] = useState("");
  const [erro, setErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const submeterFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setMensagemSucesso("");

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const endpoint = temConta ? "/auth/login" : "/auth/registar";
    const payload = temConta ? { contacto, palavra_passe: palavraPasse } : { nome, contacto, setor };

    try {
      const resposta = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const textoResposta = await resposta.text();
      let dados;
      
      try {
        dados = JSON.parse(textoResposta);
      } catch (parseError) {
        throw new Error("O Backend está inacessível ou devolveu um formato inválido.");
      }

      if (!resposta.ok) {
        throw new Error(dados.detail || dados.erro || "Ocorreu um erro na autenticação.");
      }

      if (temConta) {
        localStorage.setItem("token", dados.access_token);
        localStorage.setItem("setor", dados.setor);
        router.push("/dashboard"); 
      } else {
        setMensagemSucesso(`Conta criada! A aguardar aprovação. A sua password temporária é: ${dados.password_temporaria}`);
        setTemConta(true);
      }
    } catch (err: any) {
      setErro(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        
        <div className="flex justify-center mb-8">
          <img 
            src="/perfil.png" 
            alt="Logótipo da Empresa" 
            className="h-24 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.insertAdjacentHTML('afterend', '<div class="w-20 h-20 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">AJ</div>');
            }}
          />
        </div>

        <h2 className="text-xl font-bold text-center text-gray-800 mb-6">
          {temConta ? "Iniciar Sessão" : "Criar Nova Conta"}
        </h2>

        {erro && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-medium">{erro}</div>}
        {mensagemSucesso && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center font-bold">{mensagemSucesso}</div>}

        <form className="space-y-4" onSubmit={submeterFormulario}>
          {!temConta && (
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Nome</label>
              <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-gray-50 transition-all" placeholder="Ex: João Tavares" />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Contacto</label>
            <input type="text" required value={contacto} onChange={(e) => setContacto(e.target.value)} className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-gray-50 transition-all" placeholder="O seu contacto" />
          </div>

          {!temConta ? (
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Setor</label>
              <select required value={setor} onChange={(e) => setSetor(e.target.value)} className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-gray-50 transition-all">
                <option value="">Selecione o Setor</option>
                <option value="Orçamentação">Orçamentação</option>
                <option value="Preparação">Preparação</option>
                <option value="Produção">Produção</option>
                <option value="Montagem">Montagem</option>
                <option value="Gestão">Gestão</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Palavra-passe</label>
              <input type="password" required value={palavraPasse} onChange={(e) => setPalavraPasse(e.target.value)} className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-gray-50 transition-all" placeholder="••••••••" />
            </div>
          )}

          <button type="submit" className="w-full mt-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 transition-colors uppercase tracking-wider">
            {temConta ? "Entrar" : "Solicitar Conta"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button type="button" onClick={() => { setTemConta(!temConta); setErro(""); setMensagemSucesso(""); }} className="text-sm text-gray-500 hover:text-orange-600 font-semibold transition-colors">
            {temConta ? "Não possui conta? Criar agora." : "Já possui conta? Iniciar sessão."}
          </button>
        </div>
      </div>
    </div>
  );
}