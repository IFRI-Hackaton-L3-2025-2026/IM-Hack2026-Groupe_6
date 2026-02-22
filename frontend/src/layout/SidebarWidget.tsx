export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-brand-50/50 px-4 py-5 text-center dark:bg-brand-500/5`}
    >
      <h3 className="mb-2 font-bold text-gray-900 dark:text-white text-sm">
        AI4BMI Intelligence
      </h3>
      <p className="mb-4 text-gray-500 text-[11px] dark:text-gray-400 leading-relaxed">
        Système expert d'analyse vibratoire et thermique pour la maintenance prédictive 4.0.
      </p>
      <div className="inline-flex items-center justify-center px-4 py-2 font-bold text-brand-600 dark:text-brand-400 rounded-lg border border-brand-200 dark:border-brand-800 text-[10px] uppercase tracking-widest">
        Moteur IA Actif
      </div>
    </div>
  );
}
