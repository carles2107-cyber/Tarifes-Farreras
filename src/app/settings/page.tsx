"use client";

import { useState } from "react";
import { Key, Save, CheckCircle, ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const [token, setToken] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 fade-in max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Configuració</h1>
        <p className="text-slate-500 text-sm mt-1">Configura la connexió amb HubSpot</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div>
          <h2 className="font-semibold text-slate-900 mb-1">Integració HubSpot</h2>
          <p className="text-sm text-slate-500 mb-4">
            Per connectar l{"'"}aplicació amb el teu HubSpot, necessites un{" "}
            <strong>Private App Token</strong>. Segueix aquests passos:
          </p>

          <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside mb-6">
            <li>Ves a <strong>HubSpot → Configuració → Integracions → Aplicacions privades</strong></li>
            <li>Crea una nova aplicació privada amb els àmbits: <code className="bg-slate-100 px-1 rounded text-xs">crm.objects.deals.read</code>, <code className="bg-slate-100 px-1 rounded text-xs">crm.objects.contacts.read</code>, <code className="bg-slate-100 px-1 rounded text-xs">crm.objects.owners</code></li>
            <li>Copia el token generat</li>
            <li>Afegeix-lo al fitxer de configuració del servidor (veure instruccions tècniques)</li>
          </ol>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 space-y-2">
            <p className="font-medium">Configuració del servidor</p>
            <p>Crea un fitxer de configuració al directori del projecte amb la teva clau d{"'"}accés de HubSpot.</p>
            <p>Nom de la variable: <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">HUBSPOT_ACCESS_TOKEN</code></p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="font-medium text-slate-800 mb-3">Àmbits requerits</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              "crm.objects.deals.read",
              "crm.objects.contacts.read",
              "crm.objects.companies.read",
              "crm.objects.owners",
              "crm.pipelines.orders.read",
              "crm.schemas.deals.read",
            ].map((scope) => (
              <div key={scope} className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                <code className="font-mono">{scope}</code>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Estat de la connexió</h2>
        <button
          onClick={() => fetch("/api/kpis").then((r) => r.json()).then((d) => {
            if (d.error) alert("Error: " + d.error);
            else alert("Connexió amb HubSpot correcta!");
          })}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Provar connexió
        </button>
      </div>
    </div>
  );
}
