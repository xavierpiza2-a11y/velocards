export default function MarketPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-[4px] text-gold-400/50 mb-1">ÉCHANGES</p>
        <h1 className="font-display text-4xl tracking-widest text-gold-200 mb-2">MARCHÉ</h1>
        <div className="h-px bg-gold-dark/60" />
      </div>
      <div className="text-center py-24 panel">
        <div className="text-5xl mb-6">⚡</div>
        <p className="font-display text-2xl tracking-widest text-gold-400/40 mb-3">
          BIENTÔT DISPONIBLE
        </p>
        <p className="font-body text-sm text-gold-400/30 max-w-sm mx-auto">
          Le marché d'échange de cartes ouvrira lors de la Phase 4.
          Vous pourrez vendre vos doublons et acheter des cartes manquantes.
        </p>
      </div>
    </div>
  )
}
