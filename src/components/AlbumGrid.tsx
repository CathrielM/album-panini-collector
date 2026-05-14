import { memo, useCallback, useEffect, useState } from "react";

const FIGURES_PER_COUNTRY = 20;
const SPECIAL_FIGURES = 20; // IDs 1-20
const COUNTRIES_PER_GROUP = 4;

const statusStyles: Record<number, string> = {
  0: "bg-slate-200 text-slate-700",
  1: "bg-blue-500 text-white",
  2: "bg-green-500 text-white",
};

type Country = {
  code: string;
  name: string;
  flag: string; // Emoji flag
};

type Group = {
  letter: string;
  countries: Country[];
};

// Grupos del Mundial 2026 (actualizado)
const GRUPOS_2026: Group[] = [
  {
    letter: "A",
    countries: [
      { code: "MEX", name: "México", flag: "🇲🇽" },
      { code: "RSA", name: "Sudáfrica", flag: "🇿🇦" },
      { code: "KOR", name: "Corea del Sur", flag: "🇰🇷" },
      { code: "CZE", name: "República Checa", flag: "🇨🇿" },
    ],
  },
  {
    letter: "B",
    countries: [
      { code: "CAN", name: "Canadá", flag: "🇨🇦" },
      { code: "BIH", name: "Bosnia y Herzegovina", flag: "🇧🇦" },
      { code: "QAT", name: "Qatar", flag: "🇶🇦" },
      { code: "SUI", name: "Suiza", flag: "🇨🇭" },
    ],
  },
  {
    letter: "C",
    countries: [
      { code: "BRA", name: "Brasil", flag: "🇧🇷" },
      { code: "MAR", name: "Marruecos", flag: "🇲🇦" },
      { code: "HAI", name: "Haití", flag: "🇭🇹" },
      { code: "SCO", name: "Escocia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
    ],
  },
  {
    letter: "D",
    countries: [
      { code: "USA", name: "Estados Unidos", flag: "🇺🇸" },
      { code: "PAR", name: "Paraguay", flag: "🇵🇾" },
      { code: "AUS", name: "Australia", flag: "🇦🇺" },
      { code: "TUR", name: "Turquía", flag: "🇹🇷" },
    ],
  },
  {
    letter: "E",
    countries: [
      { code: "GER", name: "Alemania", flag: "🇩🇪" },
      { code: "CUW", name: "Curazao", flag: "🇨🇼" },
      { code: "CIV", name: "Costa de Marfil", flag: "🇨🇮" },
      { code: "ECU", name: "Ecuador", flag: "🇪🇨" },
    ],
  },
  {
    letter: "F",
    countries: [
      { code: "NED", name: "Países Bajos", flag: "🇳🇱" },
      { code: "JPN", name: "Japón", flag: "🇯🇵" },
      { code: "SWE", name: "Suecia", flag: "🇸🇪" },
      { code: "TUN", name: "Túnez", flag: "🇹🇳" },
    ],
  },
  {
    letter: "G",
    countries: [
      { code: "BEL", name: "Bélgica", flag: "🇧🇪" },
      { code: "EGY", name: "Egipto", flag: "🇪🇬" },
      { code: "IRN", name: "Irán", flag: "🇮🇷" },
      { code: "NZL", name: "Nueva Zelanda", flag: "🇳🇿" },
    ],
  },
  {
    letter: "H",
    countries: [
      { code: "ESP", name: "España", flag: "🇪🇸" },
      { code: "CPV", name: "Cabo Verde", flag: "🇨🇻" },
      { code: "KSA", name: "Arabia Saudita", flag: "🇸🇦" },
      { code: "URU", name: "Uruguay", flag: "🇺🇾" },
    ],
  },
  {
    letter: "I",
    countries: [
      { code: "FRA", name: "Francia", flag: "🇫🇷" },
      { code: "SEN", name: "Senegal", flag: "🇸🇳" },
      { code: "TBD", name: "BOL/IRA", flag: "🏳️" },
      { code: "NOR", name: "Noruega", flag: "🇳🇴" },
    ],
  },
  {
    letter: "J",
    countries: [
      { code: "ARG", name: "Argentina", flag: "🇦🇷" },
      { code: "ALG", name: "Argelia", flag: "🇩🇿" },
      { code: "AUT", name: "Austria", flag: "🇦🇹" },
      { code: "JOR", name: "Jordania", flag: "🇯🇴" },
    ],
  },
  {
    letter: "K",
    countries: [
      { code: "POR", name: "Portugal", flag: "🇵🇹" },
      { code: "TBD2", name: "JAM/RDC", flag: "🏳️" },
      { code: "UZB", name: "Uzbekistán", flag: "🇺🇿" },
      { code: "COL", name: "Colombia", flag: "🇨🇴" },
    ],
  },
  {
    letter: "L",
    countries: [
      { code: "ENG", name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { code: "CRO", name: "Croacia", flag: "🇭🇷" },
      { code: "GHA", name: "Ghana", flag: "🇬🇭" },
      { code: "PAN", name: "Panamá", flag: "🇵🇦" },
    ],
  },
];

const COUNTRY_EMOJIS = GRUPOS_2026.flatMap(g => g.countries).reduce((acc, c) => ({ ...acc, [c.code]: c.flag }), {});

const getCountryEmoji = (isoCode: string): string => COUNTRY_EMOJIS[isoCode] || '🏴';

type FiguraMetadata = {
  label: string;
  isGold: boolean;
  pais: string;
  grupo: string;
};

const ALBUM_STRUCTURE = {
  special: {
    startId: 1,
    endId: 20,
    sections: [
      { name: "Especiales", start: 1, end: 5 },
      { name: "Balones", start: 6, end: 9 },
      { name: "Historia", start: 10, end: 20 },
    ],
  },
  groups: GRUPOS_2026.map((group, groupIndex) => ({
    ...group,
    startId: 21 + groupIndex * COUNTRIES_PER_GROUP * FIGURES_PER_COUNTRY,
    endId: 20 + (groupIndex + 1) * COUNTRIES_PER_GROUP * FIGURES_PER_COUNTRY,
    countries: group.countries.map((country, countryIndex) => ({
      ...country,
      startId: 21 + groupIndex * COUNTRIES_PER_GROUP * FIGURES_PER_COUNTRY + countryIndex * FIGURES_PER_COUNTRY,
      endId: 20 + groupIndex * COUNTRIES_PER_GROUP * FIGURES_PER_COUNTRY + (countryIndex + 1) * FIGURES_PER_COUNTRY,
    })),
  })),
};

const getFiguraMetadata = (id: number): FiguraMetadata => {
  if (id <= SPECIAL_FIGURES) {
    const label = `FWC ${(id - 1).toString().padStart(2, '0')}`;
    return { label, isGold: id <= 5, pais: "FWC", grupo: "Especial" };
  }

  const adjustedId = id - SPECIAL_FIGURES - 1; // 0-based for groups
  const groupIndex = Math.floor(adjustedId / (COUNTRIES_PER_GROUP * FIGURES_PER_COUNTRY));
  const countryIndex = Math.floor((adjustedId % (COUNTRIES_PER_GROUP * FIGURES_PER_COUNTRY)) / FIGURES_PER_COUNTRY);
  const figureNumber = (adjustedId % FIGURES_PER_COUNTRY) + 1;

  const group = GRUPOS_2026[groupIndex];
  if (!group) return { label: `${id}`, isGold: false, pais: "Desconocido", grupo: "Desconocido" };

  const country = group.countries[countryIndex];
  if (!country) return { label: `${id}`, isGold: false, pais: "Desconocido", grupo: group.letter };

  const label = `${country.code} ${figureNumber}`;
  const isGold = figureNumber === 1;

  return { label, isGold, pais: country.name, grupo: group.letter };
};

const getFiguraLabel = (id: number): string => {
  return getFiguraMetadata(id).label;
};

const isGoldenFigure = (id: number): boolean => {
  return getFiguraMetadata(id).isGold;
};

type AlbumCellProps = {
  id: number;
  tipo: number;
  onToggle: (id: number, tipo: number) => void;
  isHighlighted: boolean;
};

type AlbumGridProps = {
  album?: number[];
  toggleFigura: (id: number, tipo: number) => void;
  highlightedId: number | null;
  filterCountry?: string | null;
};

const AlbumCell = memo(
  ({ id, tipo, onToggle, isHighlighted }: AlbumCellProps) => {
    const label = tipo === 2 ? "X2" : getFiguraLabel(id);
    const highlightStyles = isHighlighted ? "ring-2 ring-amber-400" : "";
    const goldenStyles = isGoldenFigure(id) ? "border-amber-400 bg-amber-100 text-amber-900" : "";

    return (
      <button
        id={`figure-${id}`}
        type="button"
        onClick={() => onToggle(id, tipo)}
        className={`flex aspect-square items-center justify-center rounded-2xl border border-slate-300 px-1 text-center text-[10px] font-semibold leading-none transition-colors duration-150 ${statusStyles[tipo] ?? statusStyles[0]} ${highlightStyles} ${goldenStyles}`}
      >
        <span className="select-none">{label}</span>
      </button>
    );
  },
  (prevProps, nextProps) => prevProps.tipo === nextProps.tipo && prevProps.isHighlighted === nextProps.isHighlighted
);

const GroupHeader = ({ group, album }: { group: Group; album: number[] }) => {
  const startId = SPECIAL_FIGURES + 1 + GRUPOS_2026.indexOf(group) * COUNTRIES_PER_GROUP * FIGURES_PER_COUNTRY;
  const endId = startId + COUNTRIES_PER_GROUP * FIGURES_PER_COUNTRY - 1;
  const collected = album.slice(startId - 1, endId).filter(v => v > 0).length;
  const total = COUNTRIES_PER_GROUP * FIGURES_PER_COUNTRY;

  return (
    <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-slate-700 p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">Grupo {group.letter}</h3>
          <div className="flex flex-wrap gap-2">
            {group.countries.map(country => (
              <span key={country.code} className="text-sm flex items-center gap-1">
                {getCountryEmoji(country.code)} {country.name}
              </span>
            ))}
          </div>
        </div>
        <span className="text-sm text-slate-400">
          {collected}/{total} figuras
        </span>
      </div>
    </div>
  );
};

const getFiguresForCountry = (countryCode: string): number[] => {
  for (let groupIndex = 0; groupIndex < GRUPOS_2026.length; groupIndex++) {
    const group = GRUPOS_2026[groupIndex];
    const countryIndex = group.countries.findIndex(c => c.code === countryCode);
    if (countryIndex !== -1) {
      const startId = SPECIAL_FIGURES + 1 + groupIndex * COUNTRIES_PER_GROUP * FIGURES_PER_COUNTRY + countryIndex * FIGURES_PER_COUNTRY;
      return Array.from({ length: FIGURES_PER_COUNTRY }, (_, i) => startId + i);
    }
  }
  return [];
};

const AlbumGrid = ({ album = [], toggleFigura, highlightedId, filterCountry }: AlbumGridProps) => {
  const [activeHighlightId, setActiveHighlightId] = useState<number | null>(null);

  useEffect(() => {
    if (!highlightedId) return;

    const target = document.getElementById(`figure-${highlightedId}`);
    if (!target) {
      return undefined;
    }

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    setActiveHighlightId(highlightedId);

    const timeoutId = window.setTimeout(() => {
      setActiveHighlightId(null);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [highlightedId]);

  const handleToggle = useCallback(
    (id: number, tipo: number) => {
      toggleFigura(id, tipo);
    },
    [toggleFigura]
  );

  if (filterCountry) {
    const figureIds = getFiguresForCountry(filterCountry);
    if (figureIds.length === 0) return <div>No se encontraron figuras para {filterCountry}</div>;

    return (
      <div>
        <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700 p-3 mb-4">
          <h3 className="text-lg font-semibold text-white">Figuras de {filterCountry}</h3>
        </div>
        <div className="grid grid-cols-4 gap-2 p-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12">
          {figureIds.map(id => {
            const tipo = album[id - 1] ?? 0;
            const isHighlighted = activeHighlightId === id;
            return (
              <AlbumCell
                key={id}
                id={id}
                tipo={tipo}
                onToggle={handleToggle}
                isHighlighted={isHighlighted}
              />
            );
          })}
        </div>
      </div>
    );
  }

  const CountryHeader = ({ country, startId, album }: { country: Country; startId: number; album: number[] }) => {
  const collected = album.slice(startId - 1, startId + FIGURES_PER_COUNTRY - 1).filter(v => v > 0).length;
  const total = FIGURES_PER_COUNTRY;

  return (
    <div className="bg-slate-800/95 backdrop-blur-md border-b border-slate-600 p-2 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{getCountryEmoji(country.code)} {country.name}</span>
        </div>
        <span className="text-xs text-slate-400">
          {collected}/{total}
        </span>
      </div>
    </div>
  );
};

const renderGroup = (group: Group, groupIndex: number) => {
  const groupStartId = SPECIAL_FIGURES + 1 + groupIndex * COUNTRIES_PER_GROUP * FIGURES_PER_COUNTRY;

  return (
    <div key={group.letter}>
      <GroupHeader group={group} album={album} />
      <div className="space-y-4">
        {group.countries.map((country, countryIndex) => {
          const countryStartId = groupStartId + countryIndex * FIGURES_PER_COUNTRY;
          const figures = Array.from({ length: FIGURES_PER_COUNTRY }, (_, i) => {
            const id = countryStartId + i;
            const tipo = album[id - 1] ?? 0;
            const isHighlighted = activeHighlightId === id;
            return (
              <AlbumCell
                key={id}
                id={id}
                tipo={tipo}
                onToggle={handleToggle}
                isHighlighted={isHighlighted}
              />
            );
          });

          return (
            <div key={country.code}>
              <CountryHeader country={country} startId={countryStartId} album={album} />
              <div className="grid grid-cols-4 gap-2 p-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12">
                {figures}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

  return (
    <div className="space-y-6">
      {/* Sección Especial */}
      <div>
        <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700 p-3 mb-4">
          <h3 className="text-lg font-semibold text-white">Figuras Especiales FWC</h3>
        </div>
        <div className="grid grid-cols-4 gap-2 p-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12">
          {Array.from({ length: SPECIAL_FIGURES }, (_, i) => {
            const id = i + 1;
            const tipo = album[i] ?? 0;
            const isHighlighted = activeHighlightId === id;
            return (
              <AlbumCell
                key={id}
                id={id}
                tipo={tipo}
                onToggle={handleToggle}
                isHighlighted={isHighlighted}
              />
            );
          })}
        </div>
      </div>

      {/* Grupos */}
      {GRUPOS_2026.map(renderGroup)}
    </div>
  );
};

export default AlbumGrid;

