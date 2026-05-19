import clsx from "clsx";

type Variant = "blue" | "green" | "red" | "yellow" | "gray" | "purple" | "orange";

const variants: Record<Variant, string> = {
  blue:   "bg-blue-100 text-blue-800",
  green:  "bg-green-100 text-green-800",
  red:    "bg-red-100 text-red-800",
  yellow: "bg-yellow-100 text-yellow-800",
  gray:   "bg-gray-100 text-gray-700",
  purple: "bg-purple-100 text-purple-800",
  orange: "bg-orange-100 text-orange-800",
};

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
};

export default function Badge({ children, variant = "gray", className }: Props) {
  return (
    <span className={clsx(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}

// Helpers de mapeo para los ENUMs de la DB
export const estadoObraVariant: Record<string, Variant> = {
  planificacion: "blue",
  en_ejecucion:  "green",
  en_pausa:      "yellow",
  finalizada:    "gray",
  cancelada:     "red",
};

export const estadoProspectoVariant: Record<string, Variant> = {
  nuevo:           "blue",
  contactado:      "purple",
  en_negociacion:  "yellow",
  convertido:      "green",
  perdido:         "red",
};

export const prioridadVariant: Record<string, Variant> = {
  alta:  "red",
  media: "orange",
  baja:  "gray",
};

export const estadoPagoVariant: Record<string, Variant> = {
  pendiente: "yellow",
  parcial:   "orange",
  pagado:    "green",
  vencido:   "red",
};
