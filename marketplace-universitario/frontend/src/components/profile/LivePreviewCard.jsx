export default function LivePreviewCard({ name, description, photo, contactInfo }) {
  const initial = name?.trim()?.[0]?.toUpperCase() || '?';

  return (
    <div
      className="bg-white border border-[#E8E8E8] p-5 hover:border-[#CCCCCC] hover:shadow-card-hover transition-all duration-300"
      style={{ borderRadius: '4px 16px 4px 16px' }}
    >
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#999999] mb-4">
        Así verán tu perfil los compradores
      </p>

      <div className="flex items-center gap-3 mb-3">
        <div className="w-14 h-14 rounded-full bg-[rgba(153,1,0,0.08)] border-2 border-[#E8E8E8] flex items-center justify-center shrink-0 overflow-hidden">
          {photo ? (
            <img src={photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-display font-bold text-xl text-[#990100]">{initial}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-display font-bold text-[#1A1A1A] truncate text-sm">
            {name || <span className="text-[#CCCCCC]">Nombre del emprendimiento</span>}
          </p>
          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider bg-[#990100] text-[#F6F6F6]">
            Emprendedor UAO
          </span>
        </div>
      </div>

      <p className="text-sm text-[#666666] leading-relaxed line-clamp-3 min-h-[3.5rem]">
        {description || <span className="text-[#CCCCCC]">Tu descripción aparecerá aquí…</span>}
      </p>

      {contactInfo && (
        <p className="text-xs text-[#999999] mt-3 truncate">📞 {contactInfo}</p>
      )}

      <div className="border-t border-[#E8E8E8] mt-4 pt-4">
        <p className="text-[10px] font-mono text-[#CCCCCC] uppercase tracking-widest">
          0 productos publicados
        </p>
      </div>
    </div>
  );
}
