import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

const CONTACT_EMAIL = "LRNPORTAGE@gmail.com";
const CONTACT_PHONE_DISPLAY = "06 34 38 30 78";
const CONTACT_PHONE_TEL = "+33634383078";

const TELEPHONE_FORFAIT = 50;
const TELEPHONE_REMBOURSEMENT = TELEPHONE_FORFAIT * 0.5;
const PANIER_REPAS = 10;

const TAUX_CHARGES_PATRONALES = 0.42;
const TAUX_CHARGES_SALARIALES = 0.22;

const NAV_ITEMS = [
  ["#portage", "Portage"],
  ["#services", "Services"],
  ["#valeurs", "Valeurs"],
  ["#simulation", "Simulation"],
  ["#faq", "FAQ"],
  ["#contact", "Contact"],
];

const SERVICES = [
  "Support N1 / N2 / N3",
  "Technicien proximité",
  "Administrateur systèmes",
  "Consultant ServiceNow",
  "Infrastructure & réseaux",
  "Remote support",
  "Pilotage incidents",
  "Assistance utilisateurs",
];

const VALUES = [
  {
    icon: "shield",
    title: "Sécurité",
    text: "Un cadre salarié pour travailler avec plus de sérénité : contrat, paie, cotisations et suivi administratif.",
  },
  {
    icon: "check",
    title: "Transparence",
    text: "Une lecture claire du chiffre d’affaires, des frais de gestion, des charges et du net estimatif.",
  },
  {
    icon: "laptop",
    title: "Expertise IT",
    text: "Une structure pensée par un profil terrain, avec une vraie compréhension du support, des incidents et des environnements clients.",
  },
  {
    icon: "users",
    title: "Proximité",
    text: "Un accompagnement direct, humain et réactif, aussi bien pour les consultants que pour les entreprises.",
  },
];

const FAQ = [
  {
    q: "LRN PORTAGE est-il uniquement orienté informatique ?",
    a: "L’activité principale vise les profils IT et services : support, proximité, infrastructure, exploitation, gestion d’incidents, assistance utilisateurs et conseil opérationnel.",
  },
  {
    q: "Puis-je venir avec ma propre mission ?",
    a: "Oui. Le consultant peut venir avec une mission déjà trouvée. LRN PORTAGE peut alors prendre en charge la partie contrat, facturation, paie et suivi administratif.",
  },
  {
    q: "Le simulateur donne-t-il mon salaire exact ?",
    a: "Non. Il donne une estimation indicative. Le net réel dépend des charges, frais, mutuelle, prévoyance, convention applicable et paramètres du contrat.",
  },
  {
    q: "Une entreprise peut-elle demander un profil ?",
    a: "Oui. LRN PORTAGE peut accompagner les entreprises qui recherchent un renfort IT rapide, en prestation ou via une mise à disposition de consultant.",
  },
];

function calculateIK(distanceAnnuelleKm, cv) {
  const puissance = Number(cv);
  const distance = Math.max(0, Number(distanceAnnuelleKm) || 0);

  let rateA;
  let rateB;
  let rateC;
  let fixedB;

  if (puissance <= 3) {
    rateA = 0.529;
    rateB = 0.316;
    rateC = 0.37;
    fixedB = 1065;
  } else if (puissance === 4) {
    rateA = 0.606;
    rateB = 0.34;
    rateC = 0.407;
    fixedB = 1330;
  } else if (puissance === 5) {
    rateA = 0.636;
    rateB = 0.357;
    rateC = 0.427;
    fixedB = 1395;
  } else if (puissance === 6) {
    rateA = 0.665;
    rateB = 0.374;
    rateC = 0.447;
    fixedB = 1457;
  } else {
    rateA = 0.697;
    rateB = 0.394;
    rateC = 0.47;
    fixedB = 1515;
  }

  if (distance <= 5000) return distance * rateA;
  if (distance <= 20000) return distance * rateB + fixedB;
  return distance * rateC;
}

function calculateSalaireFromCoutEmployeur(coutEmployeur) {
  const cout = Math.max(0, Number(coutEmployeur) || 0);
  const brut = cout / (1 + TAUX_CHARGES_PATRONALES);
  const netAvantImpot = brut * (1 - TAUX_CHARGES_SALARIALES);
  const chargesPatronales = brut * TAUX_CHARGES_PATRONALES;
  const chargesSalariales = brut * TAUX_CHARGES_SALARIALES;

  return { brut, netAvantImpot, chargesPatronales, chargesSalariales };
}

function calculateSimulation(tjm, jours, fraisGestionPourcent, kmDomicileClient = 0, cv = 5) {
  const ca = Math.max(0, Number(tjm) || 0) * Math.max(0, Number(jours) || 0);
  const fraisGestion = ca * (Math.max(0, Number(fraisGestionPourcent) || 0) / 100);
  const enveloppeDisponible = Math.max(ca - fraisGestion, 0);

  const joursTravailles = Math.max(0, Number(jours) || 0);
  const distanceAllerRetour = Math.max(0, Number(kmDomicileClient) || 0) * 2;
  const kmMensuel = distanceAllerRetour * joursTravailles;
  const kmAnnuel = kmMensuel * 12;
  const ikAnnuel = calculateIK(kmAnnuel, cv);
  const ikMensuel = ikAnnuel / 12;

  const repas = joursTravailles * PANIER_REPAS;
  const tel = TELEPHONE_REMBOURSEMENT;
  const remboursements = ikMensuel + repas + tel;

  const coutEmployeurSalaire = Math.max(enveloppeDisponible - remboursements, 0);
  const salaire = calculateSalaireFromCoutEmployeur(coutEmployeurSalaire);
  const netEstime = salaire.netAvantImpot + remboursements;

  return {
    ca,
    fraisGestion,
    enveloppeDisponible,
    kmMensuel,
    kmAnnuel,
    ik: ikMensuel,
    repas,
    tel,
    remboursements,
    coutEmployeurSalaire,
    salaireBrut: salaire.brut,
    chargesPatronales: salaire.chargesPatronales,
    chargesSalariales: salaire.chargesSalariales,
    salaireNet: salaire.netAvantImpot,
    netEstime,
  };
}

function formatCurrency(n) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

function buildMailto({ subject, body }) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function runSmokeTests() {
  const result = calculateSimulation(230, 20, 7);
  console.assert(result.ca === 4600, "Test CA mensuel échoué");
  console.assert(Math.round(result.fraisGestion) === 322, "Test frais de gestion échoué");
  console.assert(Math.round(result.repas) === 200, "Test panier repas échoué");
  console.assert(result.tel === 25, "Test forfait téléphone échoué");
  console.assert(Math.round(result.netEstime) === 2425, "Test net estimé avec frais fixes échoué");

  const lowTjmResult = calculateSimulation(120, 20, 7);
  console.assert(lowTjmResult.ca === 2400, "Test TJM minimum 120 échoué");

  const ikResult = calculateSimulation(230, 20, 7, 10, 5);
  console.assert(ikResult.kmMensuel === 400, "Test km mensuel aller-retour échoué");
  console.assert(Math.round(ikResult.ik) === 254, "Test IK mensuel échoué");
  console.assert(Math.round(ikResult.netEstime) === 2482, "Test net avec IK après charges employeur échoué");

  const zeroResult = calculateSimulation(0, 0, 7);
  console.assert(zeroResult.ca === 0, "Test CA zéro échoué");
  console.assert(zeroResult.repas === 0, "Test panier zéro échoué");
  console.assert(zeroResult.netEstime === 25, "Test net minimum téléphone échoué");

  const salaryResult = calculateSalaireFromCoutEmployeur(1420);
  console.assert(Math.round(salaryResult.brut) === 1000, "Test conversion coût employeur vers brut échoué");
  console.assert(Math.round(salaryResult.netAvantImpot) === 780, "Test conversion brut vers net échoué");
}

runSmokeTests();

export default function LRNPortageSite() {
  const [tjm, setTjm] = useState(230);
  const [jours, setJours] = useState(20);
  const [frais, setFrais] = useState(7);
  const [km, setKm] = useState(0);
  const [cv, setCv] = useState(5);
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", profile: "Consultant", message: "" });

  const simulation = useMemo(() => calculateSimulation(tjm, jours, frais, km, cv), [tjm, jours, frais, km, cv]);

  const contactMailto = buildMailto({
    subject: `Demande de contact - LRN PORTAGE - ${form.profile}`,
    body: `Bonjour LRN PORTAGE,\n\nNom / société : ${form.name}\nEmail : ${form.email}\nTéléphone : ${form.phone}\nProfil : ${form.profile}\n\nMessage :\n${form.message}\n\nCordialement,`,
  });

  const simulationMailto = buildMailto({
    subject: "Demande de simulation - LRN PORTAGE",
    body: `Bonjour LRN PORTAGE,\n\nJe souhaite avoir une simulation en portage salarial.\n\nTJM : ${tjm} €\nJours travaillés / mois : ${jours}\nFrais de gestion estimés : ${frais}%\nDistance domicile-client : ${km} km aller, soit ${simulation.kmMensuel} km/mois aller-retour\nPuissance fiscale : ${cv} CV\nCA mensuel estimé : ${formatCurrency(simulation.ca)}\nIK mensuelles estimées : ${formatCurrency(simulation.ik)}\nPanier repas : ${formatCurrency(simulation.repas)}\nForfait téléphone : ${formatCurrency(simulation.tel)}\nFrais remboursés estimés : ${formatCurrency(simulation.remboursements)}\nBudget salaire chargé employeur : ${formatCurrency(simulation.coutEmployeurSalaire)}\nSalaire brut estimé : ${formatCurrency(simulation.salaireBrut)}\nSalaire net estimé avant impôt : ${formatCurrency(simulation.salaireNet)}\nNet total indicatif avec frais : ${formatCurrency(simulation.netEstime)}\n\nCordialement,`,
  });

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <a href="#accueil" className="flex items-end gap-2" onClick={() => setMenuOpen(false)}>
            <div className="text-3xl font-black tracking-tight text-slate-950">LRN</div>
            <div className="mb-1 text-sm font-semibold tracking-[0.35em] text-blue-700">PORTAGE</div>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-700 lg:flex">
            {NAV_ITEMS.map(([href, label]) => (
              <a key={href} href={href} className="hover:text-blue-700">{label}</a>
            ))}
          </nav>

          <a href={`tel:${CONTACT_PHONE_TEL}`} className="hidden md:block">
            <Button className="rounded-full bg-blue-700 px-5 hover:bg-blue-800">Être rappelé</Button>
          </a>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-900 lg:hidden"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Ouvrir le menu"
          >
            <Icon name={menuOpen ? "close" : "menu"} className="h-6 w-6" />
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
            <nav className="grid gap-3 text-base font-semibold text-slate-800">
              {NAV_ITEMS.map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-2xl bg-slate-50 px-4 py-3 hover:bg-blue-50">
                  {label}
                </a>
              ))}
              <a href={`tel:${CONTACT_PHONE_TEL}`} className="mt-2 rounded-full bg-blue-700 px-5 py-4 text-center text-white">
                Appeler LRN PORTAGE
              </a>
            </nav>
          </div>
        )}
      </header>

      <main id="accueil">
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
          <div className="absolute -right-10 top-0 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="mb-4 inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-100">
                Portage salarial · prestations IT · mise à disposition
              </p>

              <h1 className="text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
                Le portage salarial pensé pour les consultants IT.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-200 md:text-lg md:leading-8">
                LRN PORTAGE accompagne les consultants indépendants et les entreprises dans leurs besoins de flexibilité : contrat, paie, facturation, suivi administratif et missions informatiques.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a href="#simulation" className="w-full sm:w-auto">
                  <Button className="w-full rounded-full bg-blue-600 px-7 py-6 text-base hover:bg-blue-700 sm:w-auto">
                    Faire une simulation <Icon name="arrow" className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <a href={`tel:${CONTACT_PHONE_TEL}`} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full rounded-full border-white/30 bg-white/5 px-7 py-6 text-base text-white hover:bg-white/10 sm:w-auto">
                    Appeler maintenant
                  </Button>
                </a>
              </div>

              <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
                <MiniStat value="IT" label="Spécialisation" />
                <MiniStat value="SASU" label="Structure" />
                <MiniStat value="2026" label="Lancement" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }}>
              <Card className="rounded-[2rem] border-white/10 bg-white/10 text-white shadow-2xl backdrop-blur">
                <CardContent className="p-6 md:p-8">
                  <div className="mb-8 flex items-center justify-between gap-6">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-blue-200">LRN PORTAGE</p>
                      <h2 className="mt-2 text-2xl font-bold">Un cadre simple pour travailler sereinement</h2>
                    </div>
                    <Icon name="shield" className="h-10 w-10 shrink-0 text-blue-300" />
                  </div>

                  <div className="grid gap-4">
                    {[
                      "Contrat client et contrat de travail",
                      "Gestion administrative, sociale et contractuelle",
                      "Facturation, paie et suivi mensuel",
                      "Accompagnement orienté métiers IT",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                        <Icon name="check" className="h-5 w-5 shrink-0 text-blue-300" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
          <div className="grid gap-6 md:grid-cols-3">
            <Feature icon="briefcase" title="Plus de missions" text="Un positionnement clair pour les profils IT opérationnels, support, infrastructure et conseil." />
            <Feature icon="shield" title="Plus de sécurité" text="Le consultant garde son autonomie tout en bénéficiant du cadre salarié." />
            <Feature icon="file" title="Moins d’administratif" text="LRN PORTAGE gère la partie contrat, paie, facturation et suivi." />
          </div>
        </section>

        <section id="portage" className="bg-slate-50 py-14 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-2 md:px-6">
            <div>
              <p className="font-semibold text-blue-700">Fonctionnement</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">Comment fonctionne le portage salarial ?</h2>
              <p className="mt-6 text-lg leading-8 text-slate-700">
                Le portage salarial permet au consultant de réaliser une mission chez un client tout en bénéficiant d’un statut salarié. LRN PORTAGE contractualise avec le client, facture la prestation, établit la paie et assure le suivi administratif.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#simulation"><Button className="w-full rounded-full bg-slate-950 px-7 py-6 hover:bg-slate-800 sm:w-auto">Comprendre le portage</Button></a>
                <a href={`mailto:${CONTACT_EMAIL}`}><Button variant="outline" className="w-full rounded-full border-slate-300 px-7 py-6 text-slate-950 sm:w-auto">Poser une question</Button></a>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                ["1", "Le consultant trouve ou reçoit une mission"],
                ["2", "LRN PORTAGE contractualise avec le client"],
                ["3", "Le client valide l’activité réalisée"],
                ["4", "Le chiffre d’affaires est transformé en salaire"],
              ].map(([num, text]) => (
                <div key={num} className="flex items-center gap-5 rounded-3xl bg-white p-5 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700 font-bold text-white">{num}</div>
                  <p className="text-lg font-semibold text-slate-800">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
          <div className="mb-10 text-center">
            <p className="font-semibold text-blue-700">Offres</p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">Une structure hybride : portage, IT et renfort opérationnel</h2>
            <p className="mx-auto mt-4 max-w-3xl text-slate-600">LRN PORTAGE ne se limite pas à l’administratif. L’objectif est de proposer un cadre sérieux pour les consultants et une réponse concrète aux besoins terrain des entreprises.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <OfferCard icon="users" title="Consultants portés" items={["Accompagnement administratif", "Contrat de travail", "Paie et cotisations", "Suivi mensuel"]} />
            <OfferCard icon="laptop" title="Prestations IT" items={["Support N1, N2, N3", "Gestion d’incidents", "Assistance utilisateurs", "Conseil opérationnel"]} />
            <OfferCard icon="building" title="Entreprises" items={["Renfort rapide", "Profils IT opérationnels", "Mise à disposition", "Souplesse contractuelle"]} />
          </div>
        </section>

        <section id="valeurs" className="bg-slate-950 py-14 text-white md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-10 max-w-3xl">
              <p className="font-semibold text-blue-300">Valeurs</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">Une approche simple, transparente et orientée terrain.</h2>
              <p className="mt-5 leading-8 text-slate-300">LRN PORTAGE est construit autour d’une logique claire : sécuriser le consultant, simplifier la gestion et répondre efficacement aux besoins IT des clients.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-4">
              {VALUES.map((value) => (
                <div key={value.title} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                  <Icon name={value.icon} className="mb-5 h-8 w-8 text-blue-300" />
                  <h3 className="text-xl font-black">{value.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{value.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="simulation" className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
          <div className="mb-10 text-center">
            <p className="font-semibold text-blue-700">Simulation</p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">Estimez votre revenu en portage</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">Simulation indicative à affiner avec LRN PORTAGE pour obtenir une projection précise.</p>
          </div>

          <Card className="rounded-[2rem] border-slate-100 shadow-xl">
            <CardContent className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
              <div className="space-y-7">
                <InputRange label="TJM" value={tjm} setValue={setTjm} min={120} max={600} suffix="€" allowManualInput helper="Vous pouvez utiliser le curseur ou saisir directement votre TJM." />
                <InputRange label="Jours travaillés / mois" value={jours} setValue={setJours} min={1} max={23} suffix="j" />
                <InputRange label="Frais de gestion" value={frais} setValue={setFrais} min={3} max={12} suffix="%" />
                <InputRange label="Distance domicile → client" value={km} setValue={setKm} min={0} max={200} step={1} suffix="km" allowManualInput helper="Indiquez la distance aller simple. Le calcul IK applique automatiquement l’aller-retour." />
                <InputRange label="Puissance fiscale" value={cv} setValue={setCv} min={3} max={10} step={1} suffix="CV" allowManualInput />
              </div>

              <div className="rounded-[2rem] bg-slate-950 p-6 text-white md:p-8">
                <Icon name="calculator" className="mb-6 h-10 w-10 text-blue-300" />
                <Result label="Chiffre d’affaires mensuel" value={formatCurrency(simulation.ca)} />
                <Result label="Frais de gestion estimés" value={formatCurrency(simulation.fraisGestion)} />
                <Result label="Enveloppe après frais de gestion" value={formatCurrency(simulation.enveloppeDisponible)} />
                <Result label="Kilomètres mensuels retenus" value={`${Math.round(simulation.kmMensuel)} km`} />
                <Result label="Frais kilométriques estimés (IK)" value={formatCurrency(simulation.ik)} />
                <Result label="Panier repas" value={formatCurrency(simulation.repas)} />
                <Result label="Forfait téléphone" value={formatCurrency(simulation.tel)} />
                <Result label="Total frais remboursés" value={formatCurrency(simulation.remboursements)} />
                <Result label="Budget salaire chargé employeur" value={formatCurrency(simulation.coutEmployeurSalaire)} />
                <Result label="Salaire brut estimé" value={formatCurrency(simulation.salaireBrut)} />
                <Result label="Charges patronales estimées" value={formatCurrency(simulation.chargesPatronales)} />
                <Result label="Charges salariales estimées" value={formatCurrency(simulation.chargesSalariales)} />
                <Result label="Salaire net estimé avant impôt" value={formatCurrency(simulation.salaireNet)} />
                <Result label="Net total indicatif avec frais" value={formatCurrency(simulation.netEstime)} highlight />
                <a href={simulationMailto} className="mt-6 block">
                  <Button className="w-full rounded-full bg-blue-600 py-6 hover:bg-blue-700">Recevoir cette simulation par email</Button>
                </a>
                <div className="mt-5 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-4 text-xs leading-5 text-yellow-200">
                  ⚠️ Simulation indicative uniquement. Cette estimation est purement théorique et ne constitue en aucun cas un devis réel.
                  <br />
                  Le montant dépend de nombreux paramètres : charges, frais réellement éligibles, situation personnelle, contrat, mission et règles applicables.
                  <br />
                  Pour une estimation précise et personnalisée, contactez directement LRN PORTAGE.
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="bg-slate-50 py-14 md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-10 text-center">
              <p className="font-semibold text-blue-700">Métiers ciblés</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">Une spécialisation IT dès le départ</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {SERVICES.map((m) => (
                <div key={m} className="rounded-3xl bg-white p-6 font-semibold shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <Icon name="laptop" className="mb-4 h-7 w-7 text-blue-700" />
                  {m}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 md:grid-cols-2 md:px-6 md:py-20">
          <Card id="independant" className="rounded-[2rem] border-slate-100 shadow-sm">
            <CardContent className="p-6 md:p-8">
              <Icon name="users" className="mb-5 h-10 w-10 text-blue-700" />
              <h3 className="text-2xl font-black">Vous êtes consultant indépendant</h3>
              <p className="mt-4 leading-7 text-slate-700">Gardez votre liberté commerciale tout en déléguant l’administratif : contrat, paie, cotisations, facturation et suivi mensuel.</p>
              <ul className="mt-5 space-y-3 text-slate-700">
                {["Vous gardez votre autonomie", "Vous bénéficiez d’un cadre salarié", "Vous réduisez la charge administrative"].map((item) => (
                  <li key={item} className="flex gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 text-blue-700" /> {item}</li>
                ))}
              </ul>
              <a href="#contact"><Button className="mt-6 rounded-full bg-blue-700 hover:bg-blue-800">Passer en portage</Button></a>
            </CardContent>
          </Card>

          <Card id="entreprise" className="rounded-[2rem] border-slate-100 shadow-sm">
            <CardContent className="p-6 md:p-8">
              <Icon name="building" className="mb-5 h-10 w-10 text-blue-700" />
              <h3 className="text-2xl font-black">Vous êtes une entreprise</h3>
              <p className="mt-4 leading-7 text-slate-700">Renforcez vos équipes rapidement avec des profils IT opérationnels, sans alourdir votre structure interne.</p>
              <ul className="mt-5 space-y-3 text-slate-700">
                {["Renfort ponctuel ou longue durée", "Profils support et infrastructure", "Souplesse de contractualisation"].map((item) => (
                  <li key={item} className="flex gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 text-blue-700" /> {item}</li>
                ))}
              </ul>
              <a href="#contact"><Button className="mt-6 rounded-full bg-slate-950 hover:bg-slate-800">Demander un profil</Button></a>
            </CardContent>
          </Card>
        </section>

        <section id="faq" className="bg-slate-50 py-14 md:py-20">
          <div className="mx-auto max-w-5xl px-4 md:px-6">
            <div className="mb-10 text-center">
              <p className="font-semibold text-blue-700">FAQ</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">Questions fréquentes</h2>
            </div>
            <div className="grid gap-4">
              {FAQ.map((item) => (
                <details key={item.q} className="group rounded-3xl bg-white p-6 shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-bold text-slate-900">
                    {item.q}
                    <span className="rounded-full bg-blue-50 p-2 text-blue-700 group-open:rotate-45"><Icon name="plus" className="h-5 w-5" /></span>
                  </summary>
                  <p className="mt-4 leading-7 text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="bg-slate-950 py-14 text-white md:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-2 md:px-6">
            <div>
              <p className="font-semibold text-blue-300">Contact</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">Parlons de votre mission ou de votre besoin.</h2>
              <p className="mt-5 leading-8 text-slate-300">LRN PORTAGE accompagne les consultants et les entreprises avec une approche simple, directe et orientée terrain.</p>
              <div className="mt-8 space-y-3 text-slate-200">
                <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 hover:bg-white/10">
                  <Icon name="mail" className="h-5 w-5 text-blue-300" /> {CONTACT_EMAIL}
                </a>
                <a href={`tel:${CONTACT_PHONE_TEL}`} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 hover:bg-white/10">
                  <Icon name="phone" className="h-5 w-5 text-blue-300" /> {CONTACT_PHONE_DISPLAY}
                </a>
              </div>
            </div>

            <Card className="rounded-[2rem] border-white/10 bg-white text-slate-950">
              <CardContent className="space-y-4 p-6 md:p-8">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700" placeholder="Nom / société" />
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700" placeholder="Email" />
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700" placeholder="Téléphone" />
                <select value={form.profile} onChange={(e) => setForm({ ...form, profile: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700">
                  <option>Consultant</option>
                  <option>Entreprise</option>
                  <option>Partenaire</option>
                  <option>Autre demande</option>
                </select>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-700" placeholder="Votre besoin" />
                <a href={contactMailto} className="block">
                  <Button className="w-full rounded-full bg-blue-700 py-6 hover:bg-blue-800">Envoyer la demande</Button>
                </a>
                <p className="text-center text-xs text-slate-500">Le bouton ouvre votre application mail avec le message prérempli.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-white px-4 py-8 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-slate-500 md:flex-row">
          <p>© 2026 LRN PORTAGE. Portage salarial et prestations IT.</p>
          <div className="flex flex-wrap gap-5">
            <a href="#">Mentions légales</a>
            <a href="#">Confidentialité</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Card({ className = "", id, children }) {
  return <div id={id} className={className}>{children}</div>;
}

function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function Button({ className = "", variant = "default", children, ...props }) {
  const base = "inline-flex items-center justify-center font-semibold transition";
  const variantClass = variant === "outline" ? "" : "";
  return (
    <button className={`${base} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center">
      <p className="text-xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-300">{label}</p>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <Card className="rounded-[2rem] border border-slate-100 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <CardContent className="p-7">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <Icon name={icon} className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-black">{title}</h3>
        <p className="mt-3 leading-7 text-slate-600">{text}</p>
      </CardContent>
    </Card>
  );
}

function OfferCard({ icon, title, items }) {
  return (
    <Card className="rounded-[2rem] border border-slate-100 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <CardContent className="p-7">
        <Icon name={icon} className="mb-5 h-9 w-9 text-blue-700" />
        <h3 className="text-xl font-black">{title}</h3>
        <ul className="mt-5 space-y-3 text-slate-700">
          {items.map((item) => (
            <li key={item} className="flex gap-3"><Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" /> {item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function InputRange({ label, value, setValue, min, max, suffix, step = 1, allowManualInput = false, helper = "" }) {
  const handleValueChange = (rawValue) => {
    if (rawValue === "") {
      setValue(min);
      return;
    }

    const numericValue = Number(rawValue);
    if (Number.isNaN(numericValue)) return;

    const safeValue = Math.max(min, Math.min(max, numericValue));
    setValue(safeValue);
  };

  return (
    <label className="block">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-semibold text-slate-800">{label}</span>

        {allowManualInput ? (
          <div className="flex items-center overflow-hidden rounded-full border border-blue-100 bg-blue-50">
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              className="w-28 bg-transparent px-4 py-2 text-right font-bold text-blue-700 outline-none"
            />
            <span className="pr-4 font-bold text-blue-700">{suffix}</span>
          </div>
        ) : (
          <span className="w-fit rounded-full bg-blue-50 px-3 py-1 font-bold text-blue-700">{value}{suffix}</span>
        )}
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => handleValueChange(e.target.value)}
        className="w-full accent-blue-700"
      />

      {helper && <p className="mt-2 text-xs text-slate-500">{helper}</p>}
    </label>
  );
}

function Result({ label, value, highlight }) {
  return (
    <div className="border-b border-white/10 py-4">
      <p className="text-sm text-slate-300">{label}</p>
      <p className={highlight ? "mt-1 text-3xl font-black text-blue-300" : "mt-1 text-2xl font-bold"}>{value}</p>
    </div>
  );
}

function Icon({ name, className = "h-6 w-6" }) {
  const commonProps = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  const icons = {
    arrow: <svg {...commonProps}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>,
    plus: <svg {...commonProps}><path d="M12 5v14" /><path d="M5 12h14" /></svg>,
    check: <svg {...commonProps}><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 4.5-5" /></svg>,
    shield: <svg {...commonProps}><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" /><path d="m9 12 2 2 4-5" /></svg>,
    briefcase: <svg {...commonProps}><path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" /><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 12h18" /></svg>,
    file: <svg {...commonProps}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M8 13h8" /><path d="M8 17h5" /></svg>,
    calculator: <svg {...commonProps}><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M8 6h8" /><path d="M8 10h.01" /><path d="M12 10h.01" /><path d="M16 10h.01" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>,
    laptop: <svg {...commonProps}><rect x="4" y="5" width="16" height="11" rx="2" /><path d="M2 19h20" /></svg>,
    users: <svg {...commonProps}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    building: <svg {...commonProps}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 21v-4h6v4" /><path d="M8 7h.01" /><path d="M12 7h.01" /><path d="M16 7h.01" /><path d="M8 11h.01" /><path d="M12 11h.01" /><path d="M16 11h.01" /></svg>,
    mail: <svg {...commonProps}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>,
    phone: <svg {...commonProps}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.6 2.6a2 2 0 0 1-.45 2.11L8 9.7a16 16 0 0 0 6.3 6.3l1.27-1.27a2 2 0 0 1 2.11-.45c.83.28 1.7.48 2.6.6A2 2 0 0 1 22 16.92Z" /></svg>,
    menu: <svg {...commonProps}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></svg>,
    close: <svg {...commonProps}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>,
  };

  return icons[name] || icons.check;
}
