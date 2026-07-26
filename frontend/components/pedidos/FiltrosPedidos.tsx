// components/pedidos/FiltrosPedidos.tsx

import { useAuthStore } from "@/shared/stores/authStore";
import { getLoja } from "@/services/uni";
import { useQuery } from "@tanstack/react-query";

interface FiltrosPedidosProps {
  filters: {
    status?: string;
    data?: string;
    loja?: string;
  };
  onChange: (filters: {
    status?: string;
    data?: string;
    loja?: string;
  }) => void;
}

const STATUS_OPTIONS = [
  { value: "", label: "Todos os status" },
  { value: "pendente", label: "Pendente" },
  { value: "aprovado", label: "Aprovado" },
  { value: "cancelado", label: "Cancelado" },
];

const GERENTE_GROUPS = ["Gerente", "Administrador", "Admin"];

export function FiltrosPedidos({ filters, onChange }: FiltrosPedidosProps) {
  const user = useAuthStore((state) => state.user);
  const isGerente = GERENTE_GROUPS.includes(user?.group ?? "");

  const { data: lojas } = useQuery({
    queryKey: ["lojas"],
    queryFn: getLoja,
    enabled: isGerente, // só busca se for gerente
  });

  function handleChange(key: string, value: string) {
    onChange({
      ...filters,
      [key]: value || undefined, // limpa o filtro se valor vazio
    });
  }

  return (
    <div className="flex gap-3 flex-wrap">
      {/* Filtro de status — aparece para todos */}
      <select
        value={filters.status ?? ""}
        onChange={(e) => handleChange("status", e.target.value)}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Filtro de data — aparece para todos */}
      <input
        type="date"
        value={filters.data ?? ""}
        onChange={(e) => handleChange("data", e.target.value)}
      />

      {/* Filtro de loja — só para gerente/admin */}
      {isGerente && (
        <select
          value={filters.loja ?? ""}
          onChange={(e) => handleChange("loja", e.target.value)}
        ></select>
      )}
    </div>
  );
}
