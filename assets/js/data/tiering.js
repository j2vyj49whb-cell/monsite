window.COURSES = window.COURSES || {};
window.COURSES.tiering = {
  id: "tiering",
  title: "Tiering AD",
  glyph: "T0",
  hours: 11,
  certTitle: "Architecte sécurité des accès à privilèges (Tiering AD)",
  tagline: "Empêcher qu'un poste compromis mène au contrôleur de domaine : modèle Tier 0/1/2, PAW, silos, LAPS, détection.",
  desc: "Le module de référence sur la protection de l'Active Directory : vol d'identifiants et mouvement latéral, classification des actifs, règles de connexion, Enterprise Access Model, comptes et postes d'administration, GPO et silos d'authentification, Windows LAPS, durcissement du Tier 0 (DC, ADCS, krbtgt), audit avec PingCastle et BloodHound, détection, et feuille de route de déploiement.",
  tags: ["Tier 0/1/2", "PAW", "silos Kerberos", "Protected Users", "LAPS", "ADCS", "BloodHound"],
  lessons: [
    /* ------------------------------------------------------------------ */
    {
      id: "l1", part: "Comprendre la menace", title: "Pourquoi le tiering existe", duration: 20,
      summary: "Vol d'identifiants, mouvement latéral, chemin d'attaque type vers Domain Admin.",
      objectives: ["Décrire un scénario réel de compromission de domaine", "Comprendre pourquoi un correctif ou un antivirus ne suffit pas", "Énoncer le principe central du tiering"],
      blocks: [
        { t: "h2", text: "Un scénario qui se répète" },
        { t: "list", ordered: true, items: [
          "Un utilisateur ouvre une pièce jointe piégée. L'attaquant a la main sur son <strong>poste de travail</strong>, avec les droits de l'utilisateur.",
          "Il élève ses privilèges localement (faille non corrigée, service mal configuré) : il est <strong>administrateur local</strong>.",
          "Il lit la mémoire du processus LSASS. Il y trouve les identifiants d'un technicien du support qui s'est connecté hier pour dépanner : le compte est <strong>administrateur de tous les postes</strong>.",
          "Avec ce compte, il se connecte à d'autres postes, dont celui d'un administrateur système. Il y trouve un compte <strong>administrateur des serveurs</strong>.",
          "Sur un serveur, il trouve une session ou une tâche planifiée d'un compte <strong>Domain Admin</strong>.",
          "Il est maître du domaine : il crée des comptes, déploie un rançongiciel par GPO sur toutes les machines.",
        ] },
        { t: "callout", kind: "danger", title: "Ce qui a permis l'attaque", html: "Aucune faille exotique : simplement des comptes <strong>très privilégiés</strong> qui se sont connectés sur des machines <strong>moins protégées</strong> qu'eux, et y ont laissé des identifiants réutilisables. C'est ce qu'on appelle le mouvement latéral par vol d'identifiants (<em>credential theft</em>)." },
        { t: "h2", text: "Le principe du tiering en une phrase" },
        { t: "p", html: "On range chaque actif (machine, compte, application) dans un niveau de confiance, et <strong>un compte d'un niveau ne se connecte jamais sur une machine d'un niveau inférieur</strong>. Si un poste est compromis, l'attaquant n'y trouve que des identifiants de son propre niveau : la propagation s'arrête." },
        { t: "figure", caption: "Les identifiants d'un niveau supérieur ne doivent jamais être exposés sur un niveau inférieur.", svg: `
<svg viewBox="0 0 720 300" role="img" aria-label="Les trois tiers">
  <rect x="160" y="16" width="400" height="74" rx="12" style="fill:var(--tiering-soft);stroke:var(--tiering)" stroke-width="2"/>
  <text x="360" y="46" text-anchor="middle" font-weight="700" font-size="17">Tier 0 · Identité</text>
  <text x="360" y="70" text-anchor="middle" font-size="12" class="muted">DC, ADCS, Entra Connect, comptes Domain Admins, PAW T0</text>
  <rect x="110" y="112" width="500" height="74" rx="12" style="fill:var(--surface);stroke:var(--line)" stroke-width="2"/>
  <text x="360" y="142" text-anchor="middle" font-weight="700" font-size="17">Tier 1 · Serveurs et applications</text>
  <text x="360" y="166" text-anchor="middle" font-size="12" class="muted">serveurs membres, bases, ERP, admins serveurs</text>
  <rect x="60" y="208" width="600" height="74" rx="12" style="fill:var(--surface-2);stroke:var(--line)" stroke-width="2"/>
  <text x="360" y="238" text-anchor="middle" font-weight="700" font-size="17">Tier 2 · Postes et utilisateurs</text>
  <text x="360" y="262" text-anchor="middle" font-size="12" class="muted">PC, imprimantes, support N1/N2, utilisateurs</text>
  <line x1="640" y1="200" x2="640" y2="40" style="stroke:var(--ok)" stroke-width="3"/>
  <polygon points="632,48 648,48 640,32" style="fill:var(--ok)"/>
  <text x="660" y="120" font-size="12" style="fill:var(--ok)" transform="rotate(90 660 120)">contrôle : du haut vers le bas</text>
  <line x1="80" y1="40" x2="80" y2="196" style="stroke:var(--bad)" stroke-width="3" stroke-dasharray="6 5"/>
  <text x="64" y="120" font-size="12" style="fill:var(--bad)" transform="rotate(-90 64 120)">connexion vers le bas : interdite</text>
</svg>` },
        { t: "quiz", q: "Un administrateur de domaine ouvre une session RDP sur le poste d'une comptable pour l'aider. Quel est le risque principal ?", options: ["Aucun, s'il se déconnecte proprement", "Ses identifiants peuvent rester dans la mémoire du poste ; si le poste est (ou devient) compromis, l'attaquant obtient le domaine", "Il va saturer le réseau", "La comptable verra son mot de passe"], answer: 1, explain: "Une connexion RDP interactive laisse des éléments réutilisables (hash NT, tickets Kerberos) dans LSASS. Un poste de travail est la machine la plus exposée du SI." },
        { t: "quiz", q: "Pourquoi un EDR à jour ne suffit-il pas à remplacer le tiering ?", options: ["Les EDR ne détectent rien", "Un attaquant qui réutilise des identifiants légitimes ressemble à un administrateur légitime ; le tiering supprime la possibilité, l'EDR ne fait que tenter de détecter", "Les EDR sont incompatibles avec AD", "Le tiering est obligatoire par la loi"], answer: 1, explain: "Défense en profondeur : l'EDR détecte, le tiering empêche structurellement l'escalade." },
        { t: "order", task: "Remets dans l'ordre les étapes typiques d'une compromission par mouvement latéral.", items: [
          "Accès initial sur un poste utilisateur (phishing)",
          "Élévation de privilèges locale",
          "Vol des identifiants en mémoire (LSASS)",
          "Réutilisation des identifiants vers d'autres machines",
          "Obtention d'un compte à privilèges sur le domaine",
          "Déploiement massif (rançongiciel par GPO)",
        ] },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l2", part: "Comprendre la menace", title: "Où restent les identifiants", duration: 30,
      summary: "Types d'ouverture de session, ce qui reste en mémoire, Kerberos et NTLM en bref.",
      objectives: ["Savoir quels types de connexion exposent des identifiants réutilisables", "Comprendre pass-the-hash et pass-the-ticket", "Choisir un outil d'administration selon son exposition"],
      blocks: [
        { t: "h2", text: "Ce qu'un attaquant récupère" },
        { t: "table", head: ["Élément", "Où", "Réutilisation"], rows: [
          ["Hash NT du mot de passe", "mémoire LSASS, base SAM, NTDS.dit", "<strong>pass-the-hash</strong> (authentification NTLM sans connaître le mot de passe)"],
          ["Ticket Kerberos (TGT)", "mémoire LSASS", "<strong>pass-the-ticket</strong> pendant sa durée de vie (10 h par défaut)"],
          ["Mot de passe en clair", "anciens fournisseurs (WDigest), scripts, tâches planifiées", "tout"],
          ["Secrets LSA", "registre (comptes de service, tâches)", "mots de passe des services"],
          ["Identifiants mis en cache (DCC2)", "registre", "cassage hors ligne, lent"],
        ] },
        { t: "h2", text: "Types d'ouverture de session" },
        { t: "p", html: "Le type d'ouverture de session (champ <code>LogonType</code> de l'événement 4624) détermine si des identifiants réutilisables restent sur la machine cible." },
        { t: "table", head: ["Type", "Exemple", "Identifiants réutilisables sur la cible ?"], rows: [
          ["2 · Interactive", "connexion à la console, <code>runas</code>", "<strong>Oui</strong>"],
          ["3 · Network", "accès à un partage, <code>Enter-PSSession</code>, MMC distante, WMI", "Non (sauf délégation, CredSSP)"],
          ["4 · Batch", "tâche planifiée", "<strong>Oui</strong> (secret LSA)"],
          ["5 · Service", "service lancé sous un compte", "<strong>Oui</strong> (secret LSA)"],
          ["8 · NetworkCleartext", "IIS en authentification basique", "<strong>Oui</strong>"],
          ["9 · NewCredentials", "<code>runas /netonly</code>", "<strong>Oui</strong> (sur la machine source)"],
          ["10 · RemoteInteractive", "RDP classique", "<strong>Oui</strong>"],
          ["10 · RDP en Restricted Admin / Remote Credential Guard", "<code>mstsc /restrictedAdmin</code>, <code>mstsc /remoteGuard</code>", "Non"],
          ["11 · CachedInteractive", "ouverture hors connexion au domaine", "Oui"],
        ] },
        { t: "callout", kind: "tip", title: "Règle pratique", html: "Les outils d'administration à distance qui utilisent une ouverture de type <strong>Network</strong> (consoles MMC, PowerShell Remoting sans CredSSP, Windows Admin Center) sont nettement moins exposants que RDP. Mais attention : la machine <strong>source</strong> d'où tu lances l'outil, elle, contient tes identifiants. D'où les postes d'administration dédiés (leçon 7)." },
        { t: "classify", task: "Cette action laisse-t-elle des identifiants réutilisables du compte d'admin sur le serveur cible ?", buckets: ["Oui", "Non"], items: [
          { t: "RDP classique sur le serveur", b: 0 },
          { t: "<code>Enter-PSSession srv-app01</code> (Kerberos, sans CredSSP)", b: 1 },
          { t: "Tâche planifiée qui tourne sous ton compte admin", b: 0, why: "Le mot de passe est stocké comme secret LSA pour pouvoir lancer la tâche." },
          { t: "Ouverture du partage <code>\\\\srv-app01\\c$</code>", b: 1 },
          { t: "Service Windows configuré avec ton compte admin", b: 0 },
          { t: "RDP avec <code>mstsc /remoteGuard</code>", b: 1, why: "Remote Credential Guard redirige les demandes Kerberos vers le poste source : rien n'est envoyé au serveur." },
          { t: "Console locale sur le serveur (ouverture de session interactive)", b: 0 },
        ] },
        { t: "h2", text: "Kerberos et NTLM en 2 minutes" },
        { t: "list", items: [
          "<strong>Kerberos</strong> : l'utilisateur obtient un TGT auprès du KDC (sur le DC), puis des tickets de service (TGS) pour chaque serveur. Le TGT est chiffré avec la clé du compte <code>krbtgt</code> : qui possède cette clé peut forger des TGT (<em>Golden Ticket</em>).",
          "<strong>NTLM</strong> : défi-réponse calculé à partir du hash NT. Le hash suffit à s'authentifier, d'où le pass-the-hash. NTLM permet aussi le relais d'authentification (NTLM relay).",
          "Réduire NTLM, imposer la signature SMB et LDAP, et activer Credential Guard sur les postes réduit fortement ces attaques.",
        ] },
        { t: "quiz", q: "Un attaquant a obtenu le hash NT d'un compte, mais pas le mot de passe. Peut-il l'utiliser ?", options: ["Non, il doit d'abord le casser", "Oui, via pass-the-hash, partout où NTLM est accepté et où ce compte a des droits", "Seulement sur le DC", "Seulement si le compte est désactivé"], answer: 1, explain: "C'est pour ça que changer un mot de passe complexe ne suffit pas si les identifiants sont exposés sur des machines non sûres." },
        { t: "quiz", q: "Quel est l'outil d'administration le moins exposant pour gérer un serveur Tier 1 depuis une PAW Tier 1 ?", options: ["RDP classique avec le compte Domain Admin", "PowerShell Remoting (Enter-PSSession) avec le compte admin Tier 1", "Partager le mot de passe par mail au technicien sur place", "TeamViewer avec un compte local partagé"], answer: 1, explain: "Ouverture de type Network, compte du bon tier, depuis une machine source du bon tier." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l3", part: "Le modèle", title: "Le modèle Tier 0, 1, 2", duration: 35,
      summary: "Définir chaque tier et classer les actifs, y compris les Tier 0 cachés.",
      objectives: ["Définir précisément chaque tier", "Appliquer la règle de transitivité du contrôle", "Repérer les actifs Tier 0 que tout le monde oublie"],
      blocks: [
        { t: "h2", text: "Les définitions" },
        { t: "table", head: ["Tier", "Contient", "Comptes typiques"], rows: [
          ["<strong>Tier 0</strong>", "tout ce qui contrôle l'identité de l'entreprise : contrôleurs de domaine, AD lui-même, PKI d'entreprise (ADCS), ADFS, Entra Connect, et tout ce qui peut agir sur eux", "Domain Admins, Enterprise Admins, Schema Admins, Administrators du domaine, opérateurs (Backup, Server, Account, Print), comptes avec droits DCSync"],
          ["<strong>Tier 1</strong>", "serveurs membres et applications de l'entreprise : fichiers, bases de données, ERP, messagerie, serveurs web, et leurs consoles", "administrateurs serveurs, DBA, administrateurs applicatifs, comptes de service"],
          ["<strong>Tier 2</strong>", "postes de travail, terminaux mobiles, imprimantes, et leurs outils de gestion", "support N1/N2 (helpdesk), administrateurs postes, utilisateurs"],
        ] },
        { t: "h2", text: "La règle qui classe tout : la transitivité du contrôle" },
        { t: "callout", kind: "pro", title: "Règle d'or", html: "<strong>Un actif a le tier le plus élevé de tout ce qu'il peut contrôler.</strong> Si un système peut exécuter du code, modifier la configuration ou lire les secrets d'un actif Tier 0, il est Tier 0, quelle que soit sa fonction apparente." },
        { t: "p", html: "C'est là que se cachent les vrais risques. Voici les actifs Tier 0 « oubliés » qu'on retrouve dans presque tous les audits :" },
        { t: "list", items: [
          "<strong>L'hyperviseur et sa console</strong> qui hébergent un DC (vCenter, Nutanix Prism, Hyper-V) : un administrateur du cluster peut copier le disque du DC et extraire NTDS.dit.",
          "<strong>La solution de sauvegarde</strong> qui sauvegarde les DC : elle détient une copie de la base AD.",
          "<strong>Les outils de déploiement</strong> qui gèrent les DC : SCCM/MECM, Intune, Ansible, WSUS si les DC en dépendent.",
          "<strong>La console EDR/antivirus</strong> capable de lancer un script sur les DC.",
          "<strong>Le coffre de mots de passe</strong> (CyberArk, KeePass d'équipe) qui stocke des secrets Tier 0, et ses serveurs (PVWA, PSM, CPM).",
          "<strong>Les serveurs avec délégation Kerberos non contrainte</strong> et les comptes qui peuvent modifier les GPO liées aux DC.",
          "<strong>Le serveur Entra Connect</strong> (Azure AD Connect) : il synchronise les hash de mots de passe et a des droits élevés sur AD et sur le tenant.",
          "<strong>Les postes</strong> d'où se connectent les administrateurs Tier 0.",
        ] },
        { t: "classify", task: "Classe chaque actif dans le bon tier. Pense à la transitivité du contrôle.", buckets: ["Tier 0", "Tier 1", "Tier 2"], xp: 40, items: [
          { t: "Contrôleur de domaine DC01", b: 0 },
          { t: "Serveur de fichiers FS01", b: 1 },
          { t: "Portable d'un commercial", b: 2 },
          { t: "Cluster Nutanix qui héberge DC01 et FS01", b: 0, why: "Il héberge un DC : il est Tier 0 (et donc ses admins aussi)." },
          { t: "Autorité de certification d'entreprise (ADCS)", b: 0, why: "Une CA d'entreprise peut émettre un certificat d'authentification pour n'importe quel compte, y compris un Domain Admin." },
          { t: "Serveur SQL de l'ERP", b: 1 },
          { t: "Serveur Veeam qui sauvegarde aussi les DC", b: 0, why: "Il détient une copie de NTDS.dit." },
          { t: "Imprimante multifonction", b: 2 },
          { t: "Serveur Entra Connect", b: 0 },
          { t: "Serveur Freshservice / ticketing interne", b: 1 },
          { t: "Console de l'EDR qui couvre tous les postes et serveurs, DC compris", b: 0, why: "Elle peut exécuter du code (live response) sur les DC." },
          { t: "Poste du technicien support N1", b: 2 },
        ] },
        { t: "h2", text: "Les groupes AD qui sont Tier 0 par nature" },
        { t: "code", lang: "ps", title: "Lister les membres des groupes sensibles", code: `
$groupes = "Domain Admins","Enterprise Admins","Schema Admins","Administrators",
           "Account Operators","Server Operators","Backup Operators","Print Operators",
           "DnsAdmins","Group Policy Creator Owners","Key Admins","Enterprise Key Admins"
foreach ($g in $groupes) {
  Get-ADGroupMember -Identity $g -Recursive -ErrorAction SilentlyContinue |
    Select-Object @{n="Groupe";e={$g}}, Name, SamAccountName, objectClass
}` },
        { t: "callout", kind: "warn", title: "Les groupes d'opérateurs", html: "<code>Backup Operators</code>, <code>Server Operators</code>, <code>Account Operators</code> et <code>Print Operators</code> peuvent ouvrir une session sur les DC et, chacun à leur manière, mener au domaine (sauvegarde de NTDS.dit, modification de services, de comptes ou chargement de pilotes). Ils devraient être <strong>vides</strong>." },
        { t: "term", ps: "PS C:\\> ", task: "Affiche les membres, récursivement, du groupe <code>Domain Admins</code>.", steps: [
          { accept: [/^Get-ADGroupMember\s+(-Identity\s+)?["']Domain Admins["']\s+-Recursive\s*$/i, /^Get-ADGroupMember\s+-Recursive\s+(-Identity\s+)?["']Domain Admins["']\s*$/i], hint: "<code>Get-ADGroupMember</code> avec <code>-Recursive</code> ; le nom contient un espace, mets-le entre guillemets.", solution: "Get-ADGroupMember \"Domain Admins\" -Recursive",
            output: `distinguishedName : CN=Administrator,CN=Users,DC=lab,DC=local
name              : Administrator
objectClass       : user

distinguishedName : CN=adm-t0-hmubenga,OU=Accounts,OU=Tier0,OU=Admin,DC=lab,DC=local
name              : adm-t0-hmubenga
objectClass       : user

<span class="err">distinguishedName : CN=svc-backup,OU=Services,DC=lab,DC=local
name              : svc-backup
objectClass       : user</span>

<span class="err">distinguishedName : CN=jdupont,OU=Utilisateurs,DC=lab,DC=local
name              : jdupont
objectClass       : user</span>` },
        ], explain: "Deux anomalies classiques : un compte de service de sauvegarde Domain Admin (il ouvre des sessions de service sur des dizaines de serveurs) et un compte utilisateur nominatif quotidien (qui lit ses mails et navigue sur Internet avec les droits du domaine)." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l4", part: "Le modèle", title: "Les règles de connexion et de contrôle", duration: 25,
      summary: "Contrôle descendant, connexions interdites, source propre, exceptions.",
      objectives: ["Appliquer les règles de connexion entre tiers", "Comprendre le principe de source propre (clean source)", "Gérer correctement les exceptions"],
      blocks: [
        { t: "h2", text: "Les trois règles" },
        { t: "list", ordered: true, items: [
          "<strong>Contrôle</strong> : un compte d'un tier peut administrer son tier et les tiers inférieurs <em>uniquement à distance via des outils qui n'exposent pas ses identifiants</em>, ou en pratique, chaque tier a ses propres administrateurs. On évite au maximum qu'un admin Tier 0 gère du Tier 1.",
          "<strong>Connexion</strong> : un compte d'un tier ne s'ouvre <strong>jamais</strong> de session (interactive, RDP, service, tâche) sur un actif d'un tier inférieur.",
          "<strong>Source propre</strong> : la sécurité d'un actif ne peut pas être supérieure à celle de l'appareil utilisé pour l'administrer. Un admin Tier 0 administre depuis un poste Tier 0.",
        ] },
        { t: "table", head: ["Compte ↓  /  Machine →", "Tier 0", "Tier 1", "Tier 2"], rows: [
          ["Admin Tier 0", "<strong>Autorisé</strong> (depuis PAW T0)", "Interdit", "Interdit"],
          ["Admin Tier 1", "Interdit", "<strong>Autorisé</strong> (depuis PAW T1)", "Interdit"],
          ["Admin Tier 2 / support", "Interdit", "Interdit", "<strong>Autorisé</strong>"],
          ["Utilisateur standard", "Interdit", "accès applicatif seulement (réseau)", "<strong>son poste</strong>"],
        ] },
        { t: "callout", kind: "tip", html: "Un admin Tier 1 ne se connecte pas sur Tier 0 non plus : il n'y a <strong>aucune raison</strong> qu'il y ait des sessions sur un DC. Les interdictions vont dans les deux sens pour les ouvertures de session ; seul l'accès applicatif (un utilisateur qui ouvre un partage ou l'ERP) traverse les tiers." },
        { t: "h2", text: "Le principe de source propre" },
        { t: "figure", caption: "Une chaîne de contrôle n'est pas plus solide que son maillon le plus faible.", svg: `
<svg viewBox="0 0 720 150" role="img" aria-label="Chaîne de source propre">
  <rect x="10" y="45" width="150" height="60" rx="10" style="fill:var(--bad-soft);stroke:var(--bad)"/><text x="85" y="72" text-anchor="middle" font-weight="600" font-size="13">Poste bureautique</text><text x="85" y="92" text-anchor="middle" font-size="11" class="muted">mails, Internet</text>
  <rect x="200" y="45" width="150" height="60" rx="10" style="fill:var(--surface);stroke:var(--line)"/><text x="275" y="72" text-anchor="middle" font-weight="600" font-size="13">Serveur de rebond</text><text x="275" y="92" text-anchor="middle" font-size="11" class="muted">« jump server »</text>
  <rect x="390" y="45" width="150" height="60" rx="10" style="fill:var(--tiering-soft);stroke:var(--tiering)"/><text x="465" y="72" text-anchor="middle" font-weight="600" font-size="13">Contrôleur de domaine</text><text x="465" y="92" text-anchor="middle" font-size="11" class="muted">Tier 0</text>
  <line x1="160" y1="75" x2="200" y2="75" style="stroke:var(--fg-3)" stroke-width="2"/><line x1="350" y1="75" x2="390" y2="75" style="stroke:var(--fg-3)" stroke-width="2"/>
  <text x="560" y="62" font-size="12" style="fill:var(--bad)" font-weight="600">Niveau réel de sécurité</text>
  <text x="560" y="82" font-size="12" class="muted">= celui du poste bureautique.</text>
  <text x="560" y="102" font-size="12" class="muted">Un keylogger suffit.</text>
</svg>` },
        { t: "p", html: "Un serveur de rebond ne « nettoie » rien : si l'administrateur s'y connecte depuis un poste bureautique compromis, l'attaquant capture la frappe clavier, l'écran ou la session. Il faut un poste propre <strong>en amont</strong>." },
        { t: "h2", text: "Gérer les exceptions" },
        { t: "list", items: [
          "Une exception est <strong>documentée</strong> (qui, quoi, pourquoi, jusqu'à quand), validée par le responsable sécurité, et revue périodiquement.",
          "Un logiciel métier qui exige un compte Domain Admin pour fonctionner est presque toujours mal configuré : on cherche les droits réels nécessaires (délégation ciblée sur une OU, droits locaux).",
          "Si un actif Tier 1 ne peut vraiment pas être découplé d'un actif Tier 0 (agent qui doit tourner sur les DC), il <strong>devient</strong> Tier 0 et est traité comme tel.",
        ] },
        { t: "classify", task: "Chaque situation respecte-t-elle le modèle ?", buckets: ["Conforme", "Violation"], items: [
          { t: "Un admin Tier 0 se connecte en RDP à un DC depuis sa PAW Tier 0", b: 0 },
          { t: "Le support N2 utilise un compte Tier 2 pour prendre la main sur un poste utilisateur", b: 0 },
          { t: "Un admin serveurs utilise son compte Tier 1 pour ouvrir une session sur son propre poste bureautique", b: 1, why: "Le poste bureautique est Tier 2 : il doit y utiliser son compte standard." },
          { t: "Un service de supervision tourne sous un compte Domain Admin sur 60 serveurs", b: 1, why: "Ouverture de type Service = identifiants Tier 0 sur 60 machines Tier 1." },
          { t: "Un utilisateur ouvre le partage <code>\\\\fs01\\compta</code> depuis son poste", b: 0, why: "Accès applicatif de type réseau, avec son compte standard." },
          { t: "Un admin Tier 0 gère le DC depuis le serveur de rebond, auquel il accède depuis son PC bureautique", b: 1, why: "Violation du principe de source propre." },
          { t: "Le compte de jonction au domaine (droits délégués sur l'OU Postes) est utilisé par le support sur les postes", b: 0, why: "Droits limités à l'OU des postes : c'est un compte de niveau Tier 2." },
        ] },
        { t: "quiz", q: "L'éditeur d'un logiciel de sauvegarde exige que son agent tourne en Domain Admin sur tous les serveurs. Que fais-tu ?", options: ["Accepter, c'est l'éditeur qui le demande", "Identifier les droits réellement nécessaires (Backup Operators local, droits sur les dossiers), utiliser des comptes de service distincts par tier ou des gMSA, et refuser le Domain Admin", "Mettre le compte dans Protected Users", "Désactiver la sauvegarde des DC"], answer: 1, explain: "Le moindre privilège passe avant la commodité. Les DC sont sauvegardés par une instance dédiée, classée Tier 0." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l5", part: "Le modèle", title: "Enterprise Access Model et cloud", duration: 25,
      summary: "Plans de contrôle, de gestion et de données. Entra ID, Intune, Azure dans le modèle.",
      objectives: ["Situer le tiering dans l'Enterprise Access Model de Microsoft", "Classer les rôles Entra ID et Azure", "Comprendre les liens de compromission entre AD et cloud"],
      blocks: [
        { t: "p", html: "En 2020, Microsoft a fait évoluer le modèle « AD tiering » vers l'<strong>Enterprise Access Model</strong> (EAM), qui couvre aussi le cloud, les applications et les accès utilisateurs. Le tiering AD reste valable : c'est l'application de l'EAM à Active Directory." },
        { t: "table", head: ["EAM", "Correspondance", "Exemples"], rows: [
          ["<strong>Plan de contrôle</strong> (control plane)", "≈ Tier 0", "AD, Entra ID (Global Admin, Privileged Role Admin), Entra Connect, PKI, gestion des identités"],
          ["<strong>Plan de gestion</strong> (management plane)", "≈ Tier 1 (gestion)", "administration des serveurs, abonnements Azure, outils de supervision"],
          ["<strong>Plan de données / charges</strong> (data/workload plane)", "≈ Tier 1 (applications)", "applications, bases de données, VM"],
          ["<strong>Accès utilisateur</strong> et <strong>accès applicatif</strong>", "≈ Tier 2", "postes, mobiles, utilisateurs, clients, partenaires"],
          ["<strong>Accès à privilèges</strong> (privileged access)", "transversal", "PAW, serveurs intermédiaires, PIM, bastion, PAM"],
        ] },
        { t: "h2", text: "Ce qui est Tier 0 dans le cloud" },
        { t: "list", items: [
          "Rôles Entra ID : <strong>Global Administrator</strong>, <strong>Privileged Role Administrator</strong>, <strong>Privileged Authentication Administrator</strong>, Hybrid Identity Administrator, Conditional Access Administrator, Application Administrator (qui peut ajouter des secrets à des applications privilégiées).",
          "Les comptes de synchronisation et le serveur <strong>Entra Connect</strong> / Cloud Sync agent.",
          "Les applications (principaux de service) avec des permissions Graph comme <code>RoleManagement.ReadWrite.Directory</code> ou <code>AppRoleAssignment.ReadWrite.All</code>.",
          "Le rôle <strong>Owner</strong> ou <strong>User Access Administrator</strong> sur un abonnement qui héberge un DC dans Azure.",
          "Intune, si Intune gère des PAW Tier 0 ou les DC (rare : à éviter).",
        ] },
        { t: "callout", kind: "danger", title: "Les ponts entre AD et Entra ID", html: "Un admin AD peut compromettre le cloud (via Entra Connect, ou en modifiant un compte synchronisé qui a un rôle cloud). Un admin cloud peut compromettre l'AD (via Entra Connect, ou un agent Arc / Intune sur les DC). Règles : les comptes à privilèges Entra ID sont des comptes <strong>cloud-only</strong> (jamais synchronisés), protégés par MFA résistant au phishing (FIDO2), activés à la demande via <strong>PIM</strong>." },
        { t: "classify", task: "Plan de contrôle (Tier 0) ou non ?", buckets: ["Plan de contrôle", "Autre plan"], items: [
          { t: "Rôle Entra ID Global Administrator", b: 0 },
          { t: "Rôle Entra ID Helpdesk Administrator (réinitialise les mots de passe des non-admins)", b: 1, why: "Il ne peut pas réinitialiser les comptes admins : c'est un rôle de niveau support." },
          { t: "Application avec la permission Graph <code>RoleManagement.ReadWrite.Directory</code>", b: 0, why: "Elle peut s'attribuer Global Admin." },
          { t: "Owner de l'abonnement Azure où tourne un DC", b: 0 },
          { t: "Contributor d'un groupe de ressources applicatif", b: 1 },
          { t: "Serveur Entra Connect", b: 0 },
        ] },
        { t: "quiz", q: "Ton compte <code>adm-t0-hmubenga</code> est synchronisé depuis l'AD et a le rôle Global Admin dans Entra ID. Pourquoi est-ce une mauvaise pratique ?", options: ["Ce n'est pas un problème", "Une compromission de l'AD (ou d'Entra Connect) permet de prendre la main sur ce compte et donc sur tout le tenant ; les admins cloud doivent être cloud-only", "Les comptes synchronisés n'ont pas de MFA", "Global Admin ne peut pas être synchronisé"], answer: 1, explain: "On isole les deux plans de contrôle l'un de l'autre autant que possible." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l6", part: "Mise en œuvre", title: "Comptes, groupes et structure d'OU", duration: 35,
      summary: "Comptes séparés par tier, nommage, OU d'administration, Protected Users, gMSA, comptes bris de glace.",
      objectives: ["Concevoir la structure d'OU d'administration", "Créer les comptes et groupes par tier", "Protéger les comptes Tier 0 (Protected Users, non délégable)", "Gérer comptes de service et comptes de secours"],
      blocks: [
        { t: "h2", text: "Un humain, plusieurs comptes" },
        { t: "table", head: ["Compte", "Usage", "Se connecte sur"], rows: [
          ["<code>hmubenga</code>", "mails, Internet, Teams, Freshservice", "son poste (Tier 2)"],
          ["<code>adm-t2-hmubenga</code>", "support des postes", "postes de travail"],
          ["<code>adm-t1-hmubenga</code>", "administration des serveurs", "PAW T1, serveurs Tier 1"],
          ["<code>adm-t0-hmubenga</code>", "administration AD", "PAW T0, DC et actifs Tier 0"],
        ] },
        { t: "callout", kind: "warn", html: "Les comptes d'administration n'ont <strong>pas de boîte mail</strong>, ne naviguent pas sur Internet, et ont un mot de passe différent de tous les autres. Une seule personne n'a pas forcément besoin des trois : on ne crée que les comptes justifiés par le poste." },
        { t: "h2", text: "Structure d'OU d'administration" },
        { t: "code", lang: "text", code: `
DC=lab,DC=local
├── OU=Admin                     (héritage des droits bloqué, protégée contre la suppression)
│   ├── OU=Tier0
│   │   ├── OU=Accounts          comptes adm-t0-*
│   │   ├── OU=Groups            GG-T0-*
│   │   ├── OU=Devices           PAW T0
│   │   ├── OU=ServiceAccounts   gMSA T0
│   │   └── OU=Servers           ADCS, Entra Connect, sauvegarde T0…
│   ├── OU=Tier1   (Accounts, Groups, Devices, ServiceAccounts)
│   └── OU=Tier2   (Accounts, Groups, Devices, ServiceAccounts)
├── OU=Domain Controllers
├── OU=Serveurs                  serveurs Tier 1
└── OU=Postes                    postes Tier 2` },
        { t: "p", html: "Pourquoi ranger les objets par tier ? Pour pouvoir lier des GPO de restriction différentes, et surtout pour que les <strong>droits délégués</strong> (réinitialiser un mot de passe, gérer un groupe) ne traversent jamais d'un tier inférieur vers un tier supérieur. Un helpdesk qui peut réinitialiser le mot de passe d'un admin Tier 0 est, de fait, Tier 0." },
        { t: "h2", text: "Protéger les comptes Tier 0" },
        { t: "table", head: ["Mesure", "Effet"], rows: [
          ["Groupe <strong>Protected Users</strong>", "pas d'authentification NTLM, pas de chiffrement DES/RC4 pour Kerberos, pas de délégation, TGT de 4 h non renouvelable, pas d'identifiants mis en cache"],
          ["« Le compte est sensible et ne peut pas être délégué »", "aucun service ne peut usurper ce compte via la délégation Kerberos"],
          ["Carte à puce ou FIDO2 obligatoire", "pas de mot de passe à voler"],
          ["Politique de mot de passe affinée (PSO)", "longueur minimale plus forte pour les admins"],
          ["Silo d'authentification (leçon 8)", "le compte ne peut obtenir un TGT que depuis les machines Tier 0"],
        ] },
        { t: "callout", kind: "danger", title: "Protected Users : à ne pas mettre", html: "N'y ajoute <strong>jamais</strong> de comptes de service ni de comptes d'ordinateur : ils tomberaient en panne (pas de NTLM, pas de délégation, pas de cache). Teste d'abord avec un compte, car certaines applications anciennes ne parlent que NTLM. Garde un compte de secours hors de Protected Users." },
        { t: "term", ps: "PS C:\\> ", task: "Ajoute le compte <code>adm-t0-hmubenga</code> au groupe <code>Protected Users</code>.", steps: [
          { accept: [/^Add-ADGroupMember\s+(-Identity\s+)?["']Protected Users["']\s+-Members\s+["']?adm-t0-hmubenga["']?\s*$/i], hint: "<code>Add-ADGroupMember \"Protected Users\" -Members …</code>", solution: "Add-ADGroupMember \"Protected Users\" -Members adm-t0-hmubenga", output: `<span class="dim">(aucune sortie : commande réussie)</span>` },
          { ask: "Marque maintenant ce compte comme sensible et non délégable.", accept: [/^Set-ADAccountControl\s+(-Identity\s+)?["']?adm-t0-hmubenga["']?\s+-AccountNotDelegated\s+\$true\s*$/i, /^Set-ADUser\s+(-Identity\s+)?["']?adm-t0-hmubenga["']?\s+-AccountNotDelegated\s+\$true\s*$/i], hint: "<code>Set-ADAccountControl</code> avec <code>-AccountNotDelegated $true</code>.", solution: "Set-ADAccountControl adm-t0-hmubenga -AccountNotDelegated $true", output: `<span class="dim">(aucune sortie : commande réussie)</span>` },
          { ask: "Vérifie le résultat en affichant la propriété <code>AccountNotDelegated</code> et les groupes du compte.", accept: [/^Get-ADUser\s+(-Identity\s+)?["']?adm-t0-hmubenga["']?\s+-Properties\s+.*(AccountNotDelegated|\*).*/i], hint: "<code>Get-ADUser … -Properties AccountNotDelegated,MemberOf</code>", solution: "Get-ADUser adm-t0-hmubenga -Properties AccountNotDelegated,MemberOf",
            output: `AccountNotDelegated : <span class="okc">True</span>
DistinguishedName   : CN=adm-t0-hmubenga,OU=Accounts,OU=Tier0,OU=Admin,DC=lab,DC=local
MemberOf            : {CN=<span class="okc">Protected Users</span>,CN=Users,DC=lab,DC=local, CN=GG-T0-DomainAdmins,OU=Groups,OU=Tier0,OU=Admin,DC=lab,DC=local}
SamAccountName      : adm-t0-hmubenga` },
        ] },
        { t: "h2", text: "Comptes de service" },
        { t: "list", items: [
          "Préfère les <strong>gMSA</strong> (group Managed Service Accounts) : mot de passe de 240 caractères changé automatiquement par AD, lisible seulement par les machines autorisées.",
          "Un compte de service par application <strong>et par tier</strong>. Jamais de compte de service membre de Domain Admins.",
          "Interdire l'ouverture de session interactive aux comptes de service.",
          "Repérer ceux qui ont un SPN et un mot de passe faible : ils sont exposés au <em>Kerberoasting</em> (n'importe quel utilisateur peut demander leur ticket et le casser hors ligne).",
        ] },
        { t: "code", lang: "ps", code: `
# Créer un gMSA utilisable uniquement par les serveurs du groupe GG-T1-SQLServers
New-ADServiceAccount -Name gmsa-sql-erp -DNSHostName gmsa-sql-erp.lab.local \`
  -PrincipalsAllowedToRetrieveManagedPassword "GG-T1-SQLServers" \`
  -Path "OU=ServiceAccounts,OU=Tier1,OU=Admin,DC=lab,DC=local"

# Sur le serveur SQL
Install-ADServiceAccount gmsa-sql-erp
Test-ADServiceAccount gmsa-sql-erp     # True` },
        { t: "h2", text: "Comptes bris de glace (break-glass)" },
        { t: "p", html: "Deux comptes d'urgence Tier 0 (dont le compte <code>Administrator</code> intégré, renommé ou non), mot de passe très long, découpé et mis sous scellés (coffre physique), <strong>hors</strong> des restrictions qui pourraient tout bloquer (silo, Protected Users), et dont <strong>chaque utilisation déclenche une alerte</strong>." },
        { t: "quiz", q: "Le helpdesk a le droit de réinitialiser les mots de passe dans tout le domaine, y compris l'OU Admin. Quel est le tier réel du helpdesk ?", options: ["Tier 2, c'est le support", "Tier 0 : il peut prendre le contrôle des comptes Tier 0 en changeant leur mot de passe", "Tier 1", "Hors tier"], answer: 1, explain: "C'est un des chemins d'attaque les plus fréquents. Les délégations doivent être limitées à l'OU des utilisateurs standard (et AdminSDHolder protège en plus les membres des groupes protégés)." },
        { t: "classify", task: "Faut-il ajouter ce compte à Protected Users ?", buckets: ["Oui", "Non"], items: [
          { t: "<code>adm-t0-hmubenga</code> (admin AD nominatif)", b: 0 },
          { t: "<code>gmsa-sql-erp</code> (compte de service)", b: 1, why: "Jamais de compte de service dans Protected Users." },
          { t: "<code>SRV-APP01$</code> (compte d'ordinateur)", b: 1 },
          { t: "<code>adm-t1-tlefevre</code> (admin serveurs)", b: 0, why: "Recommandé pour tous les comptes d'administration nominatifs, après test." },
          { t: "Le compte bris de glace de secours", b: 1, why: "On le garde hors des mécanismes qui pourraient bloquer l'accès en cas de panne Kerberos." },
        ] },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l7", part: "Mise en œuvre", title: "PAW, rebonds et protocoles d'administration", duration: 30,
      summary: "Postes d'administration dédiés, serveurs de rebond, RDP Restricted Admin et Remote Credential Guard, bastions.",
      objectives: ["Concevoir une PAW par tier", "Placer correctement un serveur de rebond ou un bastion", "Choisir le bon mode RDP"],
      blocks: [
        { t: "h2", text: "La PAW (Privileged Access Workstation)" },
        { t: "p", html: "Un poste <strong>dédié</strong> à l'administration d'un tier, durci, sans messagerie ni navigation Internet libre, sur lequel seuls les comptes de ce tier peuvent se connecter. C'est la « source propre »." },
        { t: "list", items: [
          "Matériel récent avec TPM 2.0, démarrage sécurisé, BitLocker, Credential Guard, HVCI.",
          "Contrôle applicatif strict (WDAC / AppLocker) : seuls les outils d'administration s'exécutent.",
          "Pas de droits administrateur local pour l'utilisateur ; installation centralisée.",
          "Pare-feu sortant : seulement vers les cibles du tier et les services nécessaires (mises à jour).",
          "Gérée par un outil du <strong>même tier</strong> (une PAW Tier 0 gérée par l'Intune de toute l'entreprise devient Tier 2 de fait).",
          "Variantes : PAW physique dédiée (le mieux), ou poste bureautique en machine virtuelle <em>sur</em> la PAW (jamais l'inverse).",
        ] },
        { t: "callout", kind: "danger", title: "Erreur fréquente", html: "Faire tourner la « PAW » comme une VM sur le poste bureautique de l'admin. L'hôte (Tier 2) contrôle la VM : il peut lire sa mémoire et capturer le clavier. La PAW doit être l'hôte, le poste bureautique la VM." },
        { t: "h2", text: "Serveurs de rebond et bastions" },
        { t: "p", html: "Un serveur de rebond (jump server) ou un bastion (Guacamole, Azure Bastion, CyberArk PSM, Wallix) centralise l'accès, enregistre les sessions et peut injecter les identifiants sans les montrer. C'est utile, mais il ne remplace pas la source propre : l'accès <strong>au</strong> bastion doit partir d'un poste du bon tier, et le bastion qui donne accès au Tier 0 est lui-même Tier 0." },
        { t: "table", head: ["Composant", "Tier"], rows: [
          ["Bastion / PSM qui ouvre des sessions sur les DC", "Tier 0"],
          ["Bastion qui ouvre des sessions uniquement sur les serveurs applicatifs", "Tier 1"],
          ["Coffre (vault) qui stocke des mots de passe Tier 0", "Tier 0"],
          ["Un seul bastion pour tous les tiers", "Tier 0 (il contrôle tout) : à éviter, ou à isoler fortement par tier"],
        ] },
        { t: "h2", text: "Les modes RDP" },
        { t: "table", head: ["Mode", "Commande", "Identifiants sur le serveur", "Remarques"], rows: [
          ["RDP classique", "<code>mstsc</code>", "<strong>Oui</strong>", "à proscrire vers un tier inférieur"],
          ["Restricted Admin", "<code>mstsc /restrictedAdmin</code>", "Non", "la session n'a pas d'identité réseau vers d'autres serveurs ; le hash peut servir à se connecter (pass-the-hash vers RDP) : à réserver aux connexions vers des machines moins sûres, en connaissance de cause"],
          ["Remote Credential Guard", "<code>mstsc /remoteGuard</code>", "Non", "Kerberos uniquement, les demandes sont renvoyées vers le poste source ; garde l'accès réseau depuis la session ; recommandé"],
        ] },
        { t: "code", lang: "ps", title: "Activer Remote Credential Guard côté serveur", code: `
# Sur le serveur cible (ou par GPO : Système > Délégation d'informations d'identification)
New-ItemProperty -Path "HKLM:\\System\\CurrentControlSet\\Control\\Lsa" \`
  -Name "DisableRestrictedAdmin" -Value 0 -PropertyType DWORD -Force

# Côté client, forcer le mode via GPO :
# "Restreindre la délégation d'informations d'identification à des serveurs distants"
#   = Exiger Remote Credential Guard` },
        { t: "term", ps: "PS C:\\> ", task: "Depuis ta PAW Tier 1, ouvre une session RDP sur <code>srv-app01</code> en mode Remote Credential Guard.", steps: [
          { accept: [/^mstsc(\.exe)?\s+(\/v:\s*srv-app01\s+\/remoteGuard|\/remoteGuard\s+\/v:\s*srv-app01)\s*$/i], hint: "<code>mstsc /v:… /remoteGuard</code>", solution: "mstsc /v:srv-app01 /remoteGuard",
            near: [{ re: /restrictedAdmin/i, msg: "Restricted Admin fonctionne, mais ta session n'aurait aucune identité réseau et le mode reste exposé au pass-the-hash vers RDP. Préfère /remoteGuard." }],
            output: `<span class="okc">Connexion à srv-app01 (Kerberos, Remote Credential Guard actif)…
Session ouverte. Aucun identifiant réutilisable n'est envoyé au serveur.</span>` },
        ] },
        { t: "quiz", q: "Pour administrer les DC, l'équipe se connecte au bastion Guacamole depuis ses PC bureautiques, puis rebondit en RDP sur les DC. Que manque-t-il ?", options: ["Rien, le bastion protège", "Une source propre : l'accès au bastion qui mène aux DC doit partir de PAW Tier 0, et le bastion lui-même doit être géré comme Tier 0", "Un deuxième bastion", "L'enregistrement des sessions"], answer: 1, explain: "Un PC bureautique compromis capture les identifiants saisis dans le bastion ou détourne la session." },
        { t: "order", task: "Remets dans l'ordre la chaîne d'accès correcte pour administrer un DC.", items: [
          "PAW Tier 0 (démarrage sécurisé, Credential Guard)",
          "Ouverture de session avec le compte adm-t0 (carte à puce / FIDO2)",
          "Activation du rôle à la demande si PIM/PAM (durée limitée)",
          "Connexion au DC via outil réseau ou RDP Remote Credential Guard",
          "Session journalisée et terminée, rôle désactivé",
        ] },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l8", part: "Mise en œuvre", title: "Restreindre les connexions : GPO et silos", duration: 40,
      summary: "User Rights Assignment par tier, authentication policies et silos Kerberos.",
      objectives: ["Écrire les GPO « Refuser l'ouverture de session » pour chaque tier", "Comprendre les limites des GPO", "Mettre en place une stratégie et un silo d'authentification"],
      blocks: [
        { t: "h2", text: "Première couche : les droits d'ouverture de session (GPO)" },
        { t: "p", html: "Dans <em>Configuration ordinateur › Stratégies › Paramètres Windows › Paramètres de sécurité › Stratégies locales › Attribution des droits utilisateur</em>, cinq paramètres « Interdire » couvrent tous les types d'ouverture de session :" },
        { t: "table", head: ["Paramètre (FR)", "Nom anglais", "Type bloqué"], rows: [
          ["Interdire l'ouverture d'une session locale", "Deny log on locally", "2, 11"],
          ["Interdire l'ouverture de session par les services Bureau à distance", "Deny log on through Remote Desktop Services", "10"],
          ["Interdire l'accès à cet ordinateur à partir du réseau", "Deny access to this computer from the network", "3"],
          ["Interdire l'ouverture de session en tant que tâche", "Deny log on as a batch job", "4"],
          ["Interdire l'ouverture de session en tant que service", "Deny log on as a service", "5"],
        ] },
        { t: "h3", text: "Matrice à appliquer" },
        { t: "table", head: ["GPO liée à…", "Refuser à (les 5 droits, sauf réseau selon besoin)"], rows: [
          ["OU <strong>Postes</strong> (Tier 2)", "groupes Tier 0 (<code>Domain Admins</code>, <code>Enterprise Admins</code>, <code>GG-T0-*</code>) et Tier 1 (<code>GG-T1-*</code>)"],
          ["OU <strong>Serveurs</strong> (Tier 1)", "groupes Tier 0 et Tier 2 (<code>GG-T2-*</code>)"],
          ["OU <strong>Domain Controllers</strong> + serveurs Tier 0", "groupes Tier 1 et Tier 2"],
          ["Partout", "<code>S-1-5-114</code> « Compte local et membre du groupe Administrateurs » pour l'accès réseau et RDP (bloque le mouvement latéral avec un admin local partagé)"],
        ] },
        { t: "callout", kind: "warn", title: "Le droit « accès réseau »", html: "Refuser l'accès réseau aux Domain Admins sur les postes empêche aussi les outils de gestion qui en ont besoin. C'est voulu : le Tier 0 n'a rien à faire sur les postes. En revanche, ne refuse pas l'accès réseau aux comptes Tier 1 sur… le Tier 1 ! Teste chaque GPO sur une OU pilote." },
        { t: "callout", kind: "danger", title: "Limites des GPO", html: "Une GPO de restriction s'applique sur la <strong>machine cible</strong>. Un administrateur local de cette machine (ou un attaquant qui l'est devenu) peut la contourner. Elle protège contre les erreurs et les mauvaises habitudes, pas contre un poste déjà compromis. D'où la deuxième couche, appliquée par les DC : les silos." },
        { t: "h2", text: "Deuxième couche : stratégies et silos d'authentification" },
        { t: "p", html: "Une <strong>stratégie d'authentification</strong> (Authentication Policy) est appliquée par le <strong>KDC</strong> sur les contrôleurs de domaine : le compte n'obtient tout simplement pas de TGT s'il tente de s'authentifier depuis une machine non autorisée. Un <strong>silo</strong> regroupe les comptes utilisateurs, ordinateurs et services d'un tier sous une même stratégie." },
        { t: "list", items: [
          "Prérequis : niveau fonctionnel du domaine <strong>Windows Server 2012 R2</strong> minimum.",
          "GPO sur les DC : <em>Prise en charge du contrôleur de domaine Kerberos pour les revendications, l'authentification composée et le blindage Kerberos</em> = Activé (Pris en charge, puis Toujours fournir des revendications).",
          "GPO sur les clients : <em>Prise en charge du client Kerberos pour les revendications, l'authentification composée et le blindage Kerberos</em> = Activé.",
          "Les comptes du silo ne peuvent plus utiliser NTLM : combine avec Protected Users.",
        ] },
        { t: "code", lang: "ps", title: "Silo Tier 0", code: `
# 1. Stratégie : TGT de 4 h, uniquement depuis les machines membres du silo Tier0
New-ADAuthenticationPolicy -Name "AP-Tier0" -Enforce \`
  -UserTGTLifetimeMins 240 \`
  -UserAllowedToAuthenticateFrom 'O:SYG:SYD:(XA;OICI;CR;;;WD;(@USER.ad://ext/AuthenticationSilo == "Tier0"))' \`
  -ProtectedFromAccidentalDeletion $true

# 2. Silo
New-ADAuthenticationPolicySilo -Name "Tier0" -Enforce \`
  -UserAuthenticationPolicy "AP-Tier0" \`
  -ComputerAuthenticationPolicy "AP-Tier0" \`
  -ServiceAuthenticationPolicy "AP-Tier0"

# 3. Autoriser puis affecter les comptes (utilisateurs ET ordinateurs Tier 0)
$membres = @("adm-t0-hmubenga","DC01$","DC02$","PAW-T0-01$")
foreach ($m in $membres) {
  Grant-ADAuthenticationPolicySiloAccess -Identity "Tier0" -Account $m
  Set-ADAccountAuthenticationPolicySilo -Identity $m \`
    -AuthenticationPolicySilo "Tier0"
}` },
        { t: "callout", kind: "pro", title: "Déployer sans se verrouiller dehors", html: "Crée d'abord la stratégie et le silo <strong>sans</strong> <code>-Enforce</code> (mode audit). Surveille les événements du journal <em>Microsoft-Windows-Authentication/AuthenticationPolicyFailures-DomainController</em> (ID 105, 305) pendant quelques semaines. Garde un compte bris de glace hors silo. Puis passe en <code>-Enforce</code>." },
        { t: "term", ps: "PS C:\\> ", task: "Crée la stratégie d'authentification <code>AP-Tier0</code> en mode <strong>audit</strong> (sans -Enforce), avec un TGT de 240 minutes.", steps: [
          { accept: [/^New-ADAuthenticationPolicy\s+(-Name\s+)?["']?AP-Tier0["']?\s+-UserTGTLifetimeMins\s+240\s*$/i, /^New-ADAuthenticationPolicy\s+-UserTGTLifetimeMins\s+240\s+(-Name\s+)?["']?AP-Tier0["']?\s*$/i], hint: "<code>New-ADAuthenticationPolicy -Name … -UserTGTLifetimeMins …</code>, sans -Enforce.", solution: "New-ADAuthenticationPolicy -Name \"AP-Tier0\" -UserTGTLifetimeMins 240",
            near: [{ re: /-Enforce/i, msg: "Pas encore ! En appliquant directement, tu risques de bloquer des comptes Tier 0. Commence en audit." }],
            output: `<span class="dim">(aucune sortie : stratégie créée en mode audit)</span>` },
          { ask: "Vérifie la stratégie créée.", accept: [/^Get-ADAuthenticationPolicy\s+(-Identity\s+)?["']?AP-Tier0["']?(\s+\|.*)?\s*$/i, /^Get-ADAuthenticationPolicy\s+-Filter\s+.*/i], hint: "Le verbe inverse : <code>Get-ADAuthenticationPolicy</code>.", solution: "Get-ADAuthenticationPolicy AP-Tier0",
            output: `DistinguishedName      : CN=AP-Tier0,CN=AuthN Policies,CN=AuthN Policy Configuration,CN=Services,CN=Configuration,DC=lab,DC=local
Enforce                : <span class="chg">False</span>
Name                   : AP-Tier0
UserTGTLifetimeMins    : 240` },
        ] },
        { t: "editor", task: "Complète le script pour affecter au silo <code>Tier0</code> le compte <code>adm-t0-jmartin</code> et la PAW <code>PAW-T0-02$</code> : chaque compte doit être <strong>autorisé</strong> dans le silo puis <strong>affecté</strong> au silo.", lang: "ps",
          starter: `
$membres = @()
foreach ($m in $membres) {

}
`,
          checks: [
            { re: /\$membres\s*=\s*@\(\s*["']adm-t0-jmartin["']\s*,\s*["']PAW-T0-02\$["']\s*\)|\$membres\s*=\s*@\(\s*["']PAW-T0-02\$["']\s*,\s*["']adm-t0-jmartin["']\s*\)/i, label: "Les deux comptes dans <code>$membres</code> (sans oublier le <code>$</code> du compte ordinateur)" },
            { re: /Grant-ADAuthenticationPolicySiloAccess\s+(-Identity\s+)?["']?Tier0["']?\s+-Account\s+\$m/i, label: "<code>Grant-ADAuthenticationPolicySiloAccess</code>" },
            { re: /Set-ADAccountAuthenticationPolicySilo\s+(-Identity\s+)?\$m\s+-AuthenticationPolicySilo\s+["']?Tier0["']?/i, label: "<code>Set-ADAccountAuthenticationPolicySilo</code>" },
          ],
          solution: `
$membres = @("adm-t0-jmartin", "PAW-T0-02$")
foreach ($m in $membres) {
  Grant-ADAuthenticationPolicySiloAccess -Identity "Tier0" -Account $m
  Set-ADAccountAuthenticationPolicySilo -Identity $m -AuthenticationPolicySilo "Tier0"
}
` },
        { t: "quiz", q: "Quelle est la différence fondamentale entre une GPO « Interdire l'ouverture de session » et un silo d'authentification ?", options: ["Aucune", "La GPO est appliquée par la machine cible (contournable par son administrateur), le silo est appliqué par les DC au moment de délivrer le TGT", "Le silo ne marche que sur Linux", "La GPO est plus sûre"], answer: 1, explain: "Les deux sont complémentaires : la GPO bloque aussi NTLM et les comptes locaux ; le silo résiste à une machine compromise." },
        { t: "classify", task: "Pour la GPO liée à l'OU <strong>Postes</strong> (Tier 2), faut-il mettre ce groupe dans « Interdire l'ouverture de session par les services Bureau à distance » ?", buckets: ["Oui, l'interdire", "Non"], items: [
          { t: "Domain Admins", b: 0 },
          { t: "GG-T1-ServerAdmins", b: 0 },
          { t: "GG-T2-HelpDesk", b: 1, why: "Le support doit pouvoir prendre la main sur les postes." },
          { t: "Enterprise Admins", b: 0 },
          { t: "S-1-5-114 (compte local membre des Administrateurs)", b: 0, why: "Empêche la réutilisation d'un mot de passe d'admin local d'un poste à l'autre." },
          { t: "Utilisateurs du domaine", b: 1 },
        ] },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l9", part: "Mise en œuvre", title: "Windows LAPS et comptes locaux", duration: 25,
      summary: "Un mot de passe unique par machine, déploiement de Windows LAPS, droits de lecture par tier.",
      objectives: ["Comprendre pourquoi un admin local partagé annule le tiering", "Déployer Windows LAPS", "Déléguer la lecture des mots de passe par tier"],
      blocks: [
        { t: "p", html: "Si tous les postes ont le même mot de passe d'administrateur local (image disque clonée), un attaquant qui le récupère sur un poste se connecte à <strong>tous</strong> les autres par pass-the-hash. C'est le premier chemin de mouvement latéral exploité dans les incidents." },
        { t: "h2", text: "Windows LAPS" },
        { t: "list", items: [
          "Intégré à Windows (Windows 10/11, Server 2019 et plus récents) depuis la mise à jour d'avril 2023 : plus besoin de l'ancien LAPS (MSI).",
          "Mot de passe unique et aléatoire par machine, renouvelé automatiquement (et après chaque utilisation si configuré).",
          "Stockage dans l'AD (chiffré si le niveau fonctionnel est 2016+) ou dans Entra ID.",
          "Peut aussi gérer le mot de passe DSRM des contrôleurs de domaine.",
        ] },
        { t: "code", lang: "ps", title: "Mise en place", code: `
# 1. Étendre le schéma (une fois, compte Schema Admin, depuis une PAW Tier 0)
Update-LapsADSchema

# 2. Permettre aux machines d'écrire leur propre mot de passe
Set-LapsADComputerSelfPermission -Identity "OU=Postes,DC=lab,DC=local"
Set-LapsADComputerSelfPermission -Identity "OU=Serveurs,DC=lab,DC=local"

# 3. Déléguer la LECTURE par tier
Set-LapsADReadPasswordPermission -Identity "OU=Postes,DC=lab,DC=local" \`
  -AllowedPrincipals "LAB\\GG-T2-HelpDesk"
Set-LapsADReadPasswordPermission -Identity "OU=Serveurs,DC=lab,DC=local" \`
  -AllowedPrincipals "LAB\\GG-T1-ServerAdmins"

# 4. GPO : Système > LAPS
#    Configurer le répertoire de sauvegarde = Active Directory
#    Activer le chiffrement du mot de passe = Activé (lecteurs : GG-T2-HelpDesk…)
#    Paramètres de mot de passe : 20 caractères, 30 jours
#    Actions après authentification = réinitialiser le mot de passe et fermer la session` },
        { t: "term", ps: "PS C:\\> ", task: "Tu es au support. Récupère le mot de passe LAPS du poste <code>PC-COMPTA-07</code> en clair.", steps: [
          { accept: [/^Get-LapsADPassword\s+(-Identity\s+)?["']?PC-COMPTA-07["']?\s+-AsPlainText\s*$/i, /^Get-LapsADPassword\s+-AsPlainText\s+(-Identity\s+)?["']?PC-COMPTA-07["']?\s*$/i], hint: "<code>Get-LapsADPassword … -AsPlainText</code>", solution: "Get-LapsADPassword PC-COMPTA-07 -AsPlainText",
            output: `ComputerName        : PC-COMPTA-07
DistinguishedName   : CN=PC-COMPTA-07,OU=Postes,DC=lab,DC=local
Account             : Administrator
Password            : <span class="chg">k7#Rv2!pQz9@Lw4$Hn6e</span>
PasswordUpdateTime  : 02/11/2026 08:14:22
ExpirationTimestamp : 02/12/2026 08:14:22
Source              : EncryptedPassword
DecryptionStatus    : Success
AuthorizedDecryptor : LAB\\GG-T2-HelpDesk` },
          { ask: "Tente maintenant de lire celui du serveur <code>SRV-APP01</code>, en tant que membre du support.", accept: [/^Get-LapsADPassword\s+(-Identity\s+)?["']?SRV-APP01["']?(\s+-AsPlainText)?\s*$/i], hint: "Même commande, autre machine.", solution: "Get-LapsADPassword SRV-APP01 -AsPlainText",
            output: `ComputerName        : SRV-APP01
Password            :
Source              : EncryptedPassword
<span class="err">DecryptionStatus    : Unauthorized</span>
AuthorizedDecryptor : LAB\\GG-T1-ServerAdmins` },
        ], explain: "C'est le tiering appliqué aux comptes locaux : le support lit les mots de passe des postes, pas ceux des serveurs." },
        { t: "callout", kind: "pro", html: "Combine LAPS avec la GPO qui refuse l'accès réseau et RDP au SID <code>S-1-5-114</code> : même avec le mot de passe local d'un poste, on ne peut pas l'utiliser à distance. L'admin local ne sert plus qu'en local, en dépannage." },
        { t: "quiz", q: "Un groupe Tier 2 a le droit de lire les mots de passe LAPS de l'OU Serveurs. Quel est le problème ?", options: ["Aucun, ce sont des mots de passe locaux", "Le support devient de fait administrateur des serveurs Tier 1 : violation du modèle", "LAPS ne fonctionne pas sur les serveurs", "Le chiffrement est désactivé"], answer: 1, explain: "Le droit de lire un mot de passe d'admin local = le droit d'administrer la machine." },
        { t: "order", task: "Remets dans l'ordre le déploiement de Windows LAPS.", items: [
          "Étendre le schéma AD (Update-LapsADSchema)",
          "Donner aux ordinateurs le droit d'écrire leur mot de passe (Set-LapsADComputerSelfPermission)",
          "Déléguer la lecture par tier (Set-LapsADReadPasswordPermission)",
          "Créer la GPO LAPS sur une OU pilote",
          "Vérifier avec Get-LapsADPassword, puis généraliser",
        ] },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l10", part: "Durcir le Tier 0", title: "Durcir le Tier 0 : DC, ADCS, krbtgt", duration: 40,
      summary: "Contrôleurs de domaine, ACL et AdminSDHolder, DCSync, ADCS (ESC), krbtgt, délégations.",
      objectives: ["Appliquer le socle de durcissement des DC", "Détecter et retirer les droits dangereux (DCSync, ACL)", "Comprendre les attaques sur ADCS", "Renouveler correctement le mot de passe krbtgt"],
      blocks: [
        { t: "h2", text: "Socle des contrôleurs de domaine" },
        { t: "list", items: [
          "Rien d'autre que AD DS et DNS : pas de navigateur, pas d'agent tiers non indispensable, pas de rôle d'impression (<strong>Spooler désactivé</strong> : il permet de forcer l'authentification du DC, attaque PrinterBug).",
          "Signature LDAP et liaison de canal LDAPS exigées, signature SMB exigée, SMBv1 retiré.",
          "NTLMv1 et LM refusés (« Niveau d'authentification LAN Manager » = NTLMv2 uniquement, refuser LM et NTLM), puis réduction progressive de NTLM.",
          "Pas d'accès Internet sortant. Mises à jour mensuelles prioritaires.",
          "Niveau fonctionnel le plus élevé possible, sauvegarde système hors ligne testée (restauration forêt documentée).",
        ] },
        { t: "h2", text: "Droits dangereux dans l'annuaire" },
        { t: "table", head: ["Droit", "Danger"], rows: [
          ["Réplication (<code>DS-Replication-Get-Changes</code> + <code>-All</code>) sur le domaine", "<strong>DCSync</strong> : récupérer le hash de tous les comptes, krbtgt compris"],
          ["<code>GenericAll</code> / <code>WriteDACL</code> / <code>WriteOwner</code> sur un groupe ou un compte Tier 0", "prise de contrôle directe"],
          ["Modification de GPO liées aux DC", "exécution de code sur les DC"],
          ["<code>msDS-AllowedToActOnBehalfOfOtherIdentity</code> (RBCD) modifiable", "usurpation via délégation contrainte basée sur les ressources"],
          ["Délégation <strong>non contrainte</strong> sur un serveur", "il reçoit les TGT de quiconque s'y connecte"],
        ] },
        { t: "p", html: "<strong>AdminSDHolder</strong> : toutes les heures, le processus SDProp recopie les permissions de l'objet <code>CN=AdminSDHolder,CN=System</code> sur les membres des groupes protégés (attribut <code>adminCount=1</code>). Une ACE malveillante ajoutée sur AdminSDHolder se propage à tous les admins : c'est une technique de persistance classique à surveiller." },
        { t: "code", lang: "ps", title: "Qui peut faire un DCSync ?", code: `
$dn = (Get-ADDomain).DistinguishedName
(Get-Acl "AD:$dn").Access |
  Where-Object { $_.ObjectType -in @(
      "1131f6aa-9c07-11d1-f79f-00c04fc2dcd2",   # DS-Replication-Get-Changes
      "1131f6ad-9c07-11d1-f79f-00c04fc2dcd2") } | # DS-Replication-Get-Changes-All
  Select-Object IdentityReference, ObjectType -Unique
# Attendu : Domain Controllers, Enterprise Domain Controllers, Administrators
# (et le compte de synchronisation Entra Connect pour la synchro de hash)` },
        { t: "h2", text: "ADCS : la PKI est Tier 0" },
        { t: "p", html: "Une autorité de certification d'entreprise mal configurée permet à un simple utilisateur d'obtenir un certificat au nom d'un Domain Admin, puis de s'authentifier avec (PKINIT). Les configurations vulnérables sont classées <strong>ESC1 à ESC15</strong> :" },
        { t: "table", head: ["Cas", "Configuration vulnérable", "Correction"], rows: [
          ["ESC1", "modèle où le demandeur fournit le sujet/SAN, avec EKU d'authentification client, inscription ouverte aux utilisateurs", "désactiver « Fournir dans la demande », approbation du gestionnaire, restreindre l'inscription"],
          ["ESC4", "droits d'écriture sur un modèle de certificat pour des non-admins", "ACL des modèles réservées au Tier 0"],
          ["ESC6", "drapeau <code>EDITF_ATTRIBUTESUBJECTALTNAME2</code> sur la CA", "retirer le drapeau"],
          ["ESC8", "inscription web HTTP sans EPA (relais NTLM vers /certsrv)", "HTTPS + Extended Protection, ou supprimer le rôle Web Enrollment"],
        ] },
        { t: "term", ps: "PS C:\\> ", task: "Un auditeur te fournit l'outil <code>Certify</code>. Liste les modèles vulnérables de ta PKI (mode recherche de vulnérabilités).", steps: [
          { accept: [/^\.?\\?Certify(\.exe)?\s+find\s+\/vulnerable\s*$/i], hint: "<code>Certify.exe find /vulnerable</code> (ou avec Certipy sous Linux : <code>certipy find -vulnerable</code>).", solution: "Certify.exe find /vulnerable",
            output: `[*] Action: Find certificate templates
[*] Using the search base 'CN=Configuration,DC=lab,DC=local'
[!] Vulnerable Certificates Templates :

    CA Name                               : PKI01.lab.local\\LAB-ROOT-CA
    Template Name                         : <span class="err">ModeleVPN</span>
    msPKI-Certificate-Name-Flag           : <span class="err">ENROLLEE_SUPPLIES_SUBJECT</span>
    pkiextendedkeyusage                   : Client Authentication
    Permissions
      Enrollment Rights                   : <span class="err">LAB\\Domain Users</span>` },
        ], explain: "C'est un ESC1 : n'importe quel utilisateur du domaine peut demander un certificat VPN en indiquant comme sujet le nom d'un Domain Admin. Correction immédiate : retirer le drapeau ENROLLEE_SUPPLIES_SUBJECT ou restreindre l'inscription, puis révoquer les certificats déjà émis suspects." },
        { t: "h2", text: "Le compte krbtgt" },
        { t: "p", html: "Sa clé chiffre tous les TGT du domaine. Qui la détient forge des <strong>Golden Tickets</strong> valables même après changement des mots de passe des admins. On renouvelle son mot de passe régulièrement (annuel au minimum) et <strong>impérativement</strong> après une compromission." },
        { t: "list", ordered: true, items: [
          "Vérifier la santé de la réplication (<code>repadmin /replsummary</code>).",
          "Premier changement du mot de passe krbtgt (script officiel <code>New-KrbtgtKeys.ps1</code> de Microsoft, mode simulation d'abord).",
          "Attendre que la réplication soit complète <strong>et</strong> au moins la durée de vie maximale d'un TGT (10 h par défaut) : les tickets en cours restent valides avec l'ancienne clé (n-1).",
          "Deuxième changement : l'ancienne clé compromise n'est plus du tout acceptée.",
        ] },
        { t: "callout", kind: "danger", html: "Changer deux fois de suite <strong>sans attendre</strong> invalide tous les TGT en cours : authentifications cassées sur tout le domaine. En réponse à incident, c'est parfois un choix assumé, mais il doit être décidé et préparé." },
        { t: "classify", task: "Cette configuration est-elle un risque pour le Tier 0 ?", buckets: ["Risque", "Normal"], items: [
          { t: "Le service Spouleur d'impression actif sur les DC", b: 0 },
          { t: "Le compte MSOL_ d'Entra Connect a les droits de réplication", b: 1, why: "Normal pour la synchronisation des hash, mais ce compte et son serveur sont donc Tier 0." },
          { t: "Un serveur de fichiers configuré en délégation non contrainte", b: 0 },
          { t: "Le groupe « Domain Users » peut s'inscrire à un modèle avec ENROLLEE_SUPPLIES_SUBJECT et EKU client", b: 0, why: "ESC1." },
          { t: "Mot de passe krbtgt changé il y a 6 ans", b: 0 },
          { t: "Les DC n'ont pas d'accès Internet sortant", b: 1 },
          { t: "Un groupe Helpdesk a WriteDACL sur l'OU Admin", b: 0 },
        ] },
        { t: "quiz", q: "Après une compromission avérée du domaine, l'équipe change les mots de passe de tous les admins. L'attaquant revient deux semaines plus tard. Explication la plus probable ?", options: ["Les nouveaux mots de passe sont faibles", "Persistance non traitée : Golden Ticket (krbtgt non renouvelé deux fois), ACE sur AdminSDHolder, certificat ADCS, compte ou GPO cachés", "Le pare-feu est mal configuré", "Les PAW sont mal installées"], answer: 1, explain: "La remédiation d'un AD compromis suit une procédure complète (souvent avec un prestataire de réponse à incident), pas seulement un changement de mots de passe." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l11", part: "Piloter", title: "Auditer et détecter", duration: 35,
      summary: "PingCastle, BloodHound, Purple Knight, événements clés, comptes leurres, Defender for Identity.",
      objectives: ["Mesurer le niveau de sécurité de l'AD", "Lire un chemin d'attaque BloodHound", "Connaître les événements Windows à surveiller", "Mettre en place des leurres"],
      blocks: [
        { t: "h2", text: "Les outils d'audit" },
        { t: "table", head: ["Outil", "Usage"], rows: [
          ["<strong>PingCastle</strong>", "score de risque global de l'AD (0 = parfait), rapport HTML détaillé, idéal pour un point de départ et un suivi trimestriel"],
          ["<strong>Purple Knight</strong> / Forest Druid (Semperis)", "indicateurs d'exposition et de compromission, focus Tier 0"],
          ["<strong>BloodHound</strong> (Community Edition) + SharpHound/AzureHound", "graphe des chemins d'attaque vers les objets Tier 0, AD et Entra ID"],
          ["<strong>ORADAD</strong> (ANSSI) / Points de contrôle AD de l'ANSSI", "référentiel français, collecte pour analyse"],
          ["<strong>Locksmith</strong> / Certipy", "audit ADCS (ESC)"],
        ] },
        { t: "term", ps: "PS C:\\Outils> ", task: "Lance un audit PingCastle complet (health check) du domaine <code>lab.local</code>.", steps: [
          { accept: [/^\.?\\?PingCastle(\.exe)?\s+--healthcheck(\s+--server\s+lab\.local)?\s*$/i], hint: "<code>PingCastle.exe --healthcheck --server lab.local</code>", solution: "PingCastle.exe --healthcheck --server lab.local",
            output: `Starting the task: Perform analysis for lab.local
[OK] Gathering data
[OK] Analyzing data
Domain Risk Level: <span class="err">68 / 100</span>
  Stale objects        : <span class="chg">25</span>
  Privileged accounts  : <span class="err">40</span>   (Domain Admins: 9 membres, compte de service DA, délégation non contrainte)
  Trusts               : 0
  Anomalies            : <span class="err">40</span>   (pas de LAPS sur 112 postes, Spooler actif sur DC, krbtgt > 180 jours)
Report: ad_hc_lab.local.html` },
        ], explain: "Le score global est le maximum des quatre catégories. Objectif réaliste : passer sous 30 en traitant d'abord les comptes à privilèges et les anomalies." },
        { t: "h2", text: "Lire un chemin BloodHound" },
        { t: "code", lang: "text", title: "Chemin le plus court vers Domain Admins", code: `
(user) jdupont ──MemberOf──▶ (group) GG-Support-N2
   ──AdminTo──▶ (computer) PC-ADM-04
   ──HasSession──▶ (user) adm-t1-tlefevre
   ──MemberOf──▶ (group) GG-T1-ServerAdmins
   ──AdminTo──▶ (computer) SRV-BACKUP01
   ──HasSession──▶ (user) svc-backup
   ──MemberOf──▶ (group) DOMAIN ADMINS` },
        { t: "p", html: "Chaque arête est une violation du tiering : une session Tier 1 sur un poste Tier 2 (<code>HasSession</code>), un compte de service Domain Admin qui a une session sur un serveur. Couper <strong>une</strong> arête suffit à casser ce chemin, mais l'objectif est qu'aucun chemin n'existe depuis les utilisateurs standard." },
        { t: "quiz", q: "Dans ce chemin, quelle correction casse le plus de chemins à la fois dans un AD typique ?", options: ["Supprimer jdupont", "Retirer svc-backup de Domain Admins et lui donner seulement les droits de sauvegarde nécessaires (compte de service par tier)", "Redémarrer PC-ADM-04", "Désactiver BloodHound"], answer: 1, explain: "Un compte de service Domain Admin avec des sessions sur des dizaines de serveurs est un point de passage de nombreux chemins." },
        { t: "h2", text: "Les événements à surveiller" },
        { t: "table", head: ["ID", "Événement", "Ce qu'on cherche"], rows: [
          ["4624", "ouverture de session réussie", "compte Tier 0 sur une machine non Tier 0 ; LogonType 10 ou 2 d'un admin hors PAW"],
          ["4625 / 4771", "échec d'ouverture / de pré-authentification Kerberos", "pulvérisation de mots de passe (password spraying)"],
          ["4672", "privilèges spéciaux attribués", "repère les ouvertures de session administratives"],
          ["4768 / 4769", "demande de TGT / de ticket de service", "Kerberoasting (nombreuses 4769 en RC4 vers des comptes de service)"],
          ["4728 / 4732 / 4756", "ajout à un groupe global / local / universel", "ajout dans Domain Admins, Administrators, Enterprise Admins"],
          ["4662", "opération sur un objet AD", "DCSync (GUID de réplication) par un compte qui n'est pas un DC"],
          ["5136", "modification d'un objet du service d'annuaire", "changement de GPO, d'AdminSDHolder, d'ACL"],
          ["4886 / 4887", "demande / émission de certificat (ADCS)", "certificat émis avec un SAN différent du demandeur"],
          ["105 / 305", "échecs de stratégie d'authentification (journal AuthenticationPolicyFailures)", "violations du silo Tier 0"],
        ] },
        { t: "h2", text: "Leurres (honeytokens)" },
        { t: "list", items: [
          "Un compte nommé de façon attirante (<code>adm-backup-old</code>), membre d'aucun groupe privilégié, jamais utilisé : <strong>toute</strong> authentification ou demande de ticket le concernant est une alerte certaine.",
          "Un faux compte de service avec un SPN (cible de Kerberoasting) : une 4769 le concernant trahit un attaquant.",
          "Microsoft Defender for Identity propose nativement des comptes leurres et détecte DCSync, Golden Ticket, Pass-the-Hash, énumération, etc.",
        ] },
        { t: "classify", task: "Quel événement déclenche une alerte pour chaque situation ?", buckets: ["4624", "4662", "4728", "4769"], items: [
          { t: "Un compte utilisateur demande des tickets pour 300 comptes de service en 2 minutes", b: 3 },
          { t: "Un poste de travail réplique les attributs secrets de l'annuaire", b: 1, why: "4662 avec les GUID de réplication, source non-DC : DCSync." },
          { t: "Un compte inconnu est ajouté dans Domain Admins à 3 h du matin", b: 2 },
          { t: "adm-t0-hmubenga ouvre une session RDP sur PC-COMPTA-07", b: 0 },
        ] },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l12", part: "Piloter", title: "Feuille de route de déploiement", duration: 35,
      summary: "Par où commencer, phases, indicateurs, conduite du changement, mise en situation finale.",
      objectives: ["Planifier un projet de tiering réaliste", "Prioriser les gains rapides", "Mesurer l'avancement", "Traiter un cas complet"],
      blocks: [
        { t: "p", html: "Le tiering est un projet de <strong>plusieurs mois</strong> qui touche les habitudes de toute l'équipe IT. Le piège est de vouloir tout faire d'un coup (et de bloquer la production) ou de ne jamais finir (et d'avoir un Tier 0 « presque » isolé, donc pas isolé)." },
        { t: "h2", text: "Phase 0 · Préparer (2 à 4 semaines)" },
        { t: "list", items: [
          "Audit initial : PingCastle, BloodHound, inventaire des comptes à privilèges et de leurs usages réels.",
          "Inventaire des actifs Tier 0, y compris les cachés (hyperviseurs, sauvegarde, outils de déploiement, EDR, coffre).",
          "Soutien de la direction : les nouvelles règles changent le quotidien des administrateurs.",
        ] },
        { t: "h2", text: "Phase 1 · Gains rapides (1 à 2 mois)" },
        { t: "list", items: [
          "Vider les groupes Tier 0 de tout ce qui n'est pas indispensable ; vider les groupes d'opérateurs.",
          "Comptes d'administration séparés pour chaque admin ; plus de compte nominatif quotidien Domain Admin.",
          "<strong>Windows LAPS</strong> sur tous les postes et serveurs.",
          "GPO refusant l'ouverture de session des groupes Tier 0 sur les postes et serveurs.",
          "Désactiver le Spouleur sur les DC, corriger les modèles ADCS vulnérables, renouveler krbtgt.",
          "Comptes bris de glace et leur alerte.",
        ] },
        { t: "h2", text: "Phase 2 · Isoler le Tier 0 (2 à 4 mois)" },
        { t: "list", items: [
          "PAW Tier 0 pour chaque administrateur Tier 0.",
          "OU Admin, Protected Users, compte non délégable, MFA forte.",
          "Silo d'authentification Tier 0 : audit puis application.",
          "Reclasser ou découpler les Tier 0 cachés (cluster dédié aux DC, sauvegarde dédiée).",
          "Supervision des événements Tier 0 dans le SIEM, Defender for Identity.",
        ] },
        { t: "h2", text: "Phase 3 · Tier 1 et Tier 2 (3 à 6 mois)" },
        { t: "list", items: [
          "GPO de restriction pour Tier 1 et Tier 2, délégations par OU.",
          "PAW (ou bastion depuis PAW) pour le Tier 1, gMSA pour les comptes de service.",
          "Réduction de NTLM, signature SMB/LDAP généralisée, Credential Guard sur les postes.",
        ] },
        { t: "h2", text: "Phase 4 · Maintenir" },
        { t: "list", items: [
          "Revue trimestrielle des membres des groupes privilégiés et des exceptions.",
          "PingCastle et BloodHound à intervalle régulier : le score ne doit pas remonter.",
          "Intégrer le tiering aux procédures : arrivée d'un admin, nouveau serveur (dans quel tier ?), nouveau logiciel (quel compte de service ?).",
        ] },
        { t: "table", head: ["Indicateur", "Cible"], rows: [
          ["Membres permanents de Domain Admins", "≤ 5 (idéalement 0 permanent avec PIM/PAM)"],
          ["Score PingCastle", "&lt; 30"],
          ["Chemins BloodHound d'un utilisateur standard vers Tier 0", "0"],
          ["Postes et serveurs couverts par LAPS", "100 %"],
          ["Connexions de comptes Tier 0 hors machines Tier 0 (4624)", "0"],
          ["Exceptions ouvertes et échues", "0 échue"],
        ] },
        { t: "order", task: "Remets ces chantiers dans l'ordre de priorité recommandé.", items: [
          "Audit (PingCastle, BloodHound) et inventaire du Tier 0",
          "Comptes admins séparés et nettoyage des groupes privilégiés",
          "Windows LAPS partout",
          "PAW Tier 0 et silo d'authentification Tier 0",
          "Restrictions et PAW pour le Tier 1",
          "Revue périodique et intégration aux processus",
        ], xp: 25 },
        { t: "h2", text: "Mise en situation finale" },
        { t: "p", html: "Tu prends le poste de responsable sécurité d'un groupe de 300 personnes. Voici ce que tu découvres la première semaine. Classe chaque constat selon l'urgence de traitement." },
        { t: "classify", task: "Classe chaque constat selon sa priorité.", xp: 50, buckets: ["Immédiat (semaine)", "Phase 1 (mois)", "Phase 2-3"], items: [
          { t: "Le modèle de certificat « Utilisateur-VPN » permet à tous les utilisateurs de choisir le sujet (ESC1)", b: 0, why: "Chemin direct et trivial vers Domain Admin depuis n'importe quel compte." },
          { t: "Le compte <code>svc-veeam</code> est Domain Admin et tourne en service sur 40 serveurs", b: 0, why: "Identifiants Tier 0 présents sur 40 machines : à traiter tout de suite." },
          { t: "Tous les postes ont le même mot de passe administrateur local", b: 1, why: "Déploiement de LAPS en phase 1." },
          { t: "Les admins utilisent leur compte nominatif quotidien, membre de Domain Admins", b: 1, why: "Création des comptes séparés en phase 1 (et retrait rapide des droits du compte quotidien)." },
          { t: "Pas de PAW : les admins Tier 0 travaillent depuis leur portable bureautique", b: 2 },
          { t: "Aucun silo d'authentification", b: 2 },
          { t: "Le mot de passe krbtgt n'a jamais été changé depuis la création du domaine en 2009", b: 1, why: "Renouvellement planifié (deux changements espacés) en phase 1." },
        ] },
        { t: "callout", kind: "pro", title: "Pour aller plus loin", html: "Références à connaître : la documentation Microsoft « Securing privileged access » et l'Enterprise Access Model, le guide ANSSI « Recommandations pour l'administration sécurisée des SI reposant sur AD » et les points de contrôle AD de l'ANSSI, ainsi que le modèle de tiering publié par l'ANSSI (« Tiering model » / cloisonnement en trois niveaux)." },
      ],
    },
  ],

  /* ==================== EXAMEN ==================== */
  exam: [
    { q: "Un serveur Nutanix héberge deux DC et dix serveurs applicatifs. Dans quel tier sont le cluster et ses administrateurs ?", options: ["Tier 1, ce sont des serveurs", "Tier 0, car ils contrôlent des DC", "Tier 2", "Hors tier"], answer: 1, explain: "Transitivité du contrôle. Idéalement, les DC sont sur un cluster dédié." },
    { q: "Quel type d'ouverture de session ne laisse pas d'identifiants réutilisables sur la cible ?", options: ["RDP classique (type 10)", "Service (type 5)", "Réseau (type 3), par exemple Enter-PSSession sans CredSSP", "Tâche planifiée (type 4)"], answer: 2, explain: "" },
    { q: "Pourquoi un admin Tier 0 ne doit-il jamais ouvrir de session sur un poste utilisateur, même pour dépanner ?", options: ["Pour ne pas gêner l'utilisateur", "Ses identifiants y restent en mémoire ; un poste est la machine la plus exposée et sa compromission donnerait le domaine", "Parce que le poste n'a pas les outils", "Pour des raisons de licence"], answer: 1, explain: "" },
    { q: "Différence essentielle entre GPO de restriction et silo d'authentification ?", options: ["Le silo est appliqué par les DC (pas de TGT hors des machines autorisées), la GPO par la machine cible", "La GPO est appliquée par les DC", "Aucune", "Le silo ne concerne que les comptes de service"], answer: 0, explain: "" },
    { q: "Prérequis pour utiliser les silos d'authentification ?", options: ["Niveau fonctionnel 2008", "Niveau fonctionnel 2012 R2 minimum + GPO de prise en charge des revendications et du blindage Kerberos", "Entra ID P2", "Un HSM"], answer: 1, explain: "" },
    { q: "Quels comptes ne faut-il pas ajouter à Protected Users ?", options: ["Les admins Tier 0 nominatifs", "Les comptes de service et d'ordinateur", "Les admins Tier 1 nominatifs", "Aucun, tout le monde peut y être"], answer: 1, explain: "Pas de NTLM, pas de délégation, pas de cache : les services cassent." },
    { q: "Un modèle de certificat permet aux utilisateurs du domaine de fournir le sujet, avec l'EKU Client Authentication. Comment s'appelle cette vulnérabilité ?", options: ["ESC8", "ESC1", "Golden Ticket", "Kerberoasting"], answer: 1, explain: "" },
    { q: "Procédure correcte de renouvellement du mot de passe krbtgt en exploitation normale ?", options: ["Un seul changement suffit", "Deux changements espacés d'au moins la réplication complète et la durée de vie max d'un TGT (10 h)", "Deux changements immédiats", "Supprimer et recréer le compte"], answer: 1, explain: "" },
    { q: "Que permet un droit DS-Replication-Get-Changes-All accordé à un compte non-DC ?", options: ["Rien de grave", "Un DCSync : extraire les hash de tous les comptes, dont krbtgt", "Modifier le schéma", "Lire les GPO"], answer: 1, explain: "" },
    { q: "Pourquoi exécuter la PAW comme VM sur le poste bureautique est-il une erreur ?", options: ["C'est trop lent", "L'hôte (moins sûr) contrôle la VM : il peut lire sa mémoire et capturer le clavier", "Les VM ne supportent pas BitLocker", "Ce n'est pas une erreur"], answer: 1, explain: "La PAW doit être l'hôte." },
    { q: "Que fait le SID S-1-5-114 dans « Interdire l'accès à cet ordinateur à partir du réseau » ?", options: ["Bloque tous les utilisateurs du domaine", "Bloque l'utilisation à distance des comptes locaux membres du groupe Administrateurs (mouvement latéral)", "Bloque les DC", "Bloque les comptes de service"], answer: 1, explain: "" },
    { q: "Le helpdesk peut réinitialiser le mot de passe d'un compte de l'OU Admin\\Tier0. Conséquence ?", options: ["Aucune", "Le helpdesk est de fait Tier 0", "Le compte Tier 0 sera verrouillé", "Les GPO ne s'appliquent plus"], answer: 1, explain: "" },
    { q: "Dans l'Enterprise Access Model, à quoi correspond le Tier 0 ?", options: ["Au plan de données", "Au plan de contrôle", "À l'accès utilisateur", "Au plan de gestion"], answer: 1, explain: "" },
    { q: "Un rôle Entra ID Global Administrator doit être porté par :", options: ["un compte synchronisé depuis l'AD", "un compte cloud-only, MFA résistante au phishing, activé via PIM", "le compte de synchronisation Entra Connect", "un compte partagé de l'équipe"], answer: 1, explain: "" },
    { q: "Beaucoup d'événements 4769 en RC4 depuis un même utilisateur vers des comptes de service. Attaque probable ?", options: ["DCSync", "Kerberoasting", "Pass-the-hash", "Golden Ticket"], answer: 1, explain: "Correction : gMSA ou mots de passe très longs, AES uniquement." },
    { q: "Mode RDP recommandé pour administrer sans exposer ses identifiants tout en gardant l'accès réseau depuis la session ?", options: ["RDP classique", "Restricted Admin", "Remote Credential Guard", "VNC"], answer: 2, explain: "" },
    { q: "Pourquoi la solution de sauvegarde qui sauvegarde les DC est-elle Tier 0 ?", options: ["Elle est chère", "Elle détient une copie de NTDS.dit, donc de tous les hash du domaine", "Elle tourne sous Linux", "Elle n'est pas Tier 0"], answer: 1, explain: "" },
    { q: "Première action d'un projet de tiering ?", options: ["Acheter des PAW", "Auditer (PingCastle, BloodHound) et inventorier le Tier 0 réel", "Activer le silo en mode Enforce", "Changer tous les mots de passe"], answer: 1, explain: "On ne protège bien que ce qu'on a identifié." },
    { q: "Un bastion (PSM, Guacamole) qui ouvre des sessions sur les DC est :", options: ["Tier 1", "Tier 0", "Tier 2", "Hors tier car il enregistre les sessions"], answer: 1, explain: "" },
    { q: "Que fait SDProp avec AdminSDHolder ?", options: ["Il sauvegarde l'AD", "Il recopie toutes les heures les permissions d'AdminSDHolder sur les comptes et groupes protégés", "Il change le mot de passe krbtgt", "Il nettoie les comptes inactifs"], answer: 1, explain: "Une ACE malveillante sur AdminSDHolder se propage donc à tous les admins." },
    { q: "Windows LAPS chiffré dans l'AD exige quel niveau fonctionnel de domaine ?", options: ["2008 R2", "2012 R2", "2016", "2025"], answer: 2, explain: "" },
    { q: "Comment déployer un silo d'authentification sans bloquer la production ?", options: ["Directement en -Enforce un vendredi soir", "En mode audit, surveillance des événements 105/305, compte bris de glace hors silo, puis -Enforce", "Sur tous les comptes du domaine", "Sans GPO KDC"], answer: 1, explain: "" },
  ],

  /* ==================== ANTISÈCHE ==================== */
  cheat: [
    { title: "Les tiers", rows: [
      ["Tier 0", "identité : DC, AD, ADCS, ADFS, Entra Connect, et tout ce qui les contrôle (hyperviseur, sauvegarde, déploiement, EDR, coffre, PAW T0)"],
      ["Tier 1", "serveurs membres, applications, bases, leurs admins et consoles"],
      ["Tier 2", "postes, mobiles, imprimantes, support, utilisateurs"],
      ["Transitivité", "un actif prend le tier le plus élevé de ce qu'il contrôle"],
      ["Connexion", "jamais de session d'un compte sur un tier inférieur"],
      ["Source propre", "on administre un tier depuis un poste de ce tier"],
    ] },
    { title: "Types d'ouverture de session", rows: [
      ["2 Interactive / 10 RDP", "identifiants exposés"],
      ["3 Network", "non exposés (sauf CredSSP, délégation)"],
      ["4 Batch / 5 Service", "exposés (secret LSA)"],
      ["9 NewCredentials (runas /netonly)", "exposés sur la source"],
      ["mstsc /remoteGuard", "RDP sans exposition, recommandé"],
      ["mstsc /restrictedAdmin", "RDP sans exposition, sans identité réseau"],
    ] },
    { title: "PowerShell AD", rows: [
      ["Get-ADGroupMember \"Domain Admins\" -Recursive", "membres d'un groupe"],
      ["Add-ADGroupMember \"Protected Users\" -Members x", "protéger un compte"],
      ["Set-ADAccountControl x -AccountNotDelegated $true", "non délégable"],
      ["New-ADServiceAccount gmsa-x -PrincipalsAllowedToRetrieveManagedPassword G", "gMSA"],
      ["New-ADAuthenticationPolicy / New-ADAuthenticationPolicySilo", "silo"],
      ["Grant-ADAuthenticationPolicySiloAccess + Set-ADAccountAuthenticationPolicySilo", "affecter au silo"],
    ] },
    { title: "Windows LAPS", rows: [
      ["Update-LapsADSchema", "étendre le schéma"],
      ["Set-LapsADComputerSelfPermission -Identity OU", "écriture par les machines"],
      ["Set-LapsADReadPasswordPermission -Identity OU -AllowedPrincipals G", "lecture par tier"],
      ["Get-LapsADPassword PC -AsPlainText", "lire un mot de passe"],
      ["Reset-LapsPassword", "forcer la rotation (sur la machine)"],
    ] },
    { title: "Événements", rows: [
      ["4624 (+ LogonType)", "ouverture de session"], ["4625 / 4771", "échecs (spraying)"],
      ["4672", "privilèges spéciaux"], ["4768 / 4769", "TGT / TGS (Kerberoasting)"],
      ["4728 / 4732 / 4756", "ajout à un groupe"], ["4662", "accès objet AD (DCSync)"],
      ["5136", "modification d'objet AD (GPO, ACL)"], ["4886 / 4887", "certificats ADCS"],
      ["105 / 305", "échecs de silo (journal AuthenticationPolicyFailures)"],
    ] },
    { title: "Durcissement Tier 0", rows: [
      ["Groupes d'opérateurs", "vides"], ["Spooler sur DC", "désactivé"],
      ["krbtgt", "2 changements espacés, au moins annuel"],
      ["ADCS", "pas d'ESC1/4/6/8 (Locksmith, Certipy)"],
      ["Délégation non contrainte", "aucune hors DC"],
      ["AdminSDHolder / DCSync", "ACL surveillées"],
      ["Audit", "PingCastle < 30, 0 chemin BloodHound"],
    ] },
  ],
};
