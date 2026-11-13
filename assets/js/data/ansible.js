window.COURSES = window.COURSES || {};
window.COURSES.ansible = {
  id: "ansible",
  title: "Ansible",
  glyph: "A",
  hours: 9,
  certTitle: "Ingénieur automatisation Ansible",
  tagline: "Configurer des dizaines de serveurs Linux et Windows en une commande, de façon idempotente et versionnée.",
  desc: "De l'inventaire au pipeline CI/CD : modules, playbooks, variables, Jinja2, rôles, collections, Vault, Windows et Active Directory, tests avec Molecule, AWX. Chaque notion se pratique dans un terminal simulé ou un éditeur de playbook.",
  tags: ["playbooks", "rôles", "Jinja2", "Vault", "WinRM", "Molecule", "AWX"],
  lessons: [
    /* ------------------------------------------------------------------ */
    {
      id: "l1", part: "Fondations", title: "Comprendre Ansible", duration: 15,
      summary: "Architecture sans agent, idempotence, vocabulaire de base.",
      objectives: ["Expliquer le fonctionnement sans agent d'Ansible", "Définir nœud de contrôle, nœud géré, module, tâche, play, playbook", "Comprendre l'idempotence et pourquoi elle change tout"],
      blocks: [
        { t: "h2", text: "Le problème qu'Ansible résout" },
        { t: "p", html: "Configurer un serveur à la main, c'est rapide. En configurer 40 de façon <strong>identique</strong>, tracer qui a changé quoi, et pouvoir tout reconstruire après un incident, c'est impossible à la main. Ansible décrit l'état voulu de tes machines dans des fichiers texte (YAML), versionnés dans Git, et l'applique partout." },
        { t: "h2", text: "Architecture : sans agent, en mode push" },
        { t: "figure", caption: "Le nœud de contrôle pousse de petits programmes (modules) via SSH ou WinRM, les exécute, récupère un résultat JSON, puis les supprime.", svg: `
<svg viewBox="0 0 720 260" role="img" aria-label="Architecture Ansible">
  <rect x="20" y="60" width="220" height="140" rx="12" style="fill:var(--ansible-soft);stroke:var(--ansible)"/>
  <text x="130" y="88" text-anchor="middle" font-weight="600">Nœud de contrôle</text>
  <text x="130" y="112" text-anchor="middle" class="muted" font-size="13">Linux / WSL + Python</text>
  <rect x="44" y="126" width="80" height="26" rx="6" style="fill:var(--surface);stroke:var(--line)"/><text x="84" y="144" text-anchor="middle" font-size="12" class="mono">inventaire</text>
  <rect x="134" y="126" width="80" height="26" rx="6" style="fill:var(--surface);stroke:var(--line)"/><text x="174" y="144" text-anchor="middle" font-size="12" class="mono">playbook</text>
  <rect x="89" y="160" width="80" height="26" rx="6" style="fill:var(--surface);stroke:var(--line)"/><text x="129" y="178" text-anchor="middle" font-size="12" class="mono">modules</text>
  <line x1="240" y1="110" x2="470" y2="50" style="stroke:var(--fg-3)" stroke-width="2"/>
  <line x1="240" y1="130" x2="470" y2="130" style="stroke:var(--fg-3)" stroke-width="2"/>
  <line x1="240" y1="150" x2="470" y2="210" style="stroke:var(--fg-3)" stroke-width="2"/>
  <text x="350" y="70" text-anchor="middle" font-size="12" class="muted">SSH (Linux)</text>
  <text x="350" y="122" text-anchor="middle" font-size="12" class="muted">SSH</text>
  <text x="350" y="200" text-anchor="middle" font-size="12" class="muted">WinRM / SSH (Windows)</text>
  <rect x="470" y="28" width="230" height="44" rx="10" style="fill:var(--surface);stroke:var(--line)"/><text x="585" y="55" text-anchor="middle" font-size="13">srv-web01 · Linux</text>
  <rect x="470" y="108" width="230" height="44" rx="10" style="fill:var(--surface);stroke:var(--line)"/><text x="585" y="135" text-anchor="middle" font-size="13">srv-db01 · Linux</text>
  <rect x="470" y="188" width="230" height="44" rx="10" style="fill:var(--surface);stroke:var(--line)"/><text x="585" y="215" text-anchor="middle" font-size="13">srv-app01 · Windows</text>
</svg>` },
        { t: "list", items: [
          "<strong>Sans agent</strong> : rien à installer sur les cibles, hormis Python (Linux) ou PowerShell (Windows). Il n'y a donc pas de service à patcher sur 200 machines.",
          "<strong>Push</strong> : c'est toi (ou ton pipeline) qui déclenches. Puppet ou Chef fonctionnent en <em>pull</em> avec un agent qui interroge un serveur.",
          "<strong>Déclaratif</strong> : tu décris l'état voulu (<code>state: present</code>), pas la suite de commandes pour y arriver.",
        ] },
        { t: "h2", text: "Le vocabulaire en 6 mots" },
        { t: "table", head: ["Terme", "Définition", "Exemple"], rows: [
          ["Inventaire", "La liste des machines, rangées en groupes", "<code>[web]</code> srv-web01, srv-web02"],
          ["Module", "Une unité de travail réutilisable", "<code>ansible.builtin.apt</code>, <code>ansible.windows.win_service</code>"],
          ["Tâche", "Un appel de module avec ses paramètres", "Installer nginx"],
          ["Play", "Un ensemble de tâches appliqué à un groupe d'hôtes", "Configurer les serveurs web"],
          ["Playbook", "Un fichier YAML qui contient un ou plusieurs plays", "<code>site.yml</code>"],
          ["Rôle", "Un paquet réutilisable de tâches, variables, templates", "<code>roles/nginx</code>"],
        ] },
        { t: "h2", text: "L'idempotence" },
        { t: "p", html: "Une opération est <strong>idempotente</strong> si l'exécuter une ou dix fois donne le même résultat. Si nginx est déjà installé, le module <code>apt</code> ne fait rien et répond <code>ok</code>. S'il ne l'est pas, il l'installe et répond <code>changed</code>. Tu peux donc relancer un playbook en toute sécurité : c'est ce qui permet de l'utiliser pour corriger la dérive de configuration." },
        { t: "callout", kind: "warn", title: "Le piège n°1 des débutants", html: "Les modules <code>command</code> et <code>shell</code> ne sont <strong>pas</strong> idempotents : ils exécutent la commande à chaque fois et répondent toujours <code>changed</code>. Utilise-les seulement quand aucun module dédié n'existe, et rends-les idempotents avec <code>creates:</code>, <code>removes:</code> ou <code>changed_when:</code>." },
        { t: "quiz", q: "Tu relances un playbook qui installe nginx sur un serveur où nginx est déjà installé. Que se passe-t-il ?", options: ["Ansible réinstalle nginx et affiche <code>changed</code>", "La tâche affiche <code>ok</code> : rien n'est modifié", "Le playbook échoue car le paquet existe", "Ansible demande confirmation"], answer: 1, explain: "Le module <code>apt</code> compare l'état réel à l'état voulu. Ils sont identiques, donc aucune action : c'est l'idempotence." },
        { t: "quiz", q: "Que faut-il installer sur un serveur Linux pour qu'Ansible puisse le gérer ?", options: ["Un agent Ansible qui tourne en service", "Rien d'autre qu'un accès SSH et Python", "Ansible lui-même", "Un serveur Puppet"], answer: 1, explain: "Ansible est sans agent : SSH pour se connecter, Python pour exécuter les modules. C'est le nœud de contrôle qui porte Ansible." },
        { t: "classify", task: "Ces opérations sont-elles idempotentes telles qu'écrites ?", buckets: ["Idempotente", "Non idempotente"], items: [
          { t: "<code>ansible.builtin.apt: name=nginx state=present</code>", b: 0, why: "Le module vérifie l'état avant d'agir." },
          { t: "<code>ansible.builtin.shell: echo 'x' >> /etc/hosts</code>", b: 1, why: "Chaque exécution ajoute une ligne de plus." },
          { t: "<code>ansible.builtin.lineinfile</code> avec une ligne précise", b: 0, why: "lineinfile ajoute la ligne seulement si elle est absente." },
          { t: "<code>ansible.builtin.command: useradd bob</code>", b: 1, why: "La 2e exécution échoue car l'utilisateur existe déjà. Utilise le module <code>user</code>." },
          { t: "<code>ansible.builtin.command: tar xf app.tgz</code> avec <code>creates: /opt/app</code>", b: 0, why: "<code>creates</code> saute la tâche si le chemin existe déjà." },
        ] },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l2", part: "Fondations", title: "L'inventaire", duration: 20,
      summary: "Hôtes, groupes, groupes imbriqués, host_vars et group_vars.",
      objectives: ["Écrire un inventaire INI et YAML", "Organiser des groupes et des groupes de groupes", "Placer les variables au bon endroit (group_vars, host_vars)", "Interroger l'inventaire avec ansible-inventory"],
      blocks: [
        { t: "h2", text: "Format INI" },
        { t: "code", lang: "ini", title: "inventory/hosts.ini", code: `
[web]
srv-web01 ansible_host=10.0.10.11
srv-web02 ansible_host=10.0.10.12

[db]
srv-db01 ansible_host=10.0.20.11

[linux:children]
web
db

[linux:vars]
ansible_user=deploy
ansible_become=true` },
        { t: "p", html: "Deux groupes existent toujours implicitement : <code>all</code> (toutes les machines) et <code>ungrouped</code>. Le suffixe <code>:children</code> crée un groupe de groupes, <code>:vars</code> attache des variables à un groupe." },
        { t: "h2", text: "Format YAML (recommandé pour les gros inventaires)" },
        { t: "code", lang: "yaml", title: "inventory/hosts.yml", code: `
all:
  children:
    linux:
      children:
        web:
          hosts:
            srv-web01: { ansible_host: 10.0.10.11 }
            srv-web02: { ansible_host: 10.0.10.12 }
        db:
          hosts:
            srv-db01: { ansible_host: 10.0.20.11 }
    windows:
      hosts:
        srv-app01:
      vars:
        ansible_connection: winrm` },
        { t: "h2", text: "group_vars et host_vars" },
        { t: "p", html: "Ne mets pas toutes les variables dans l'inventaire. Ansible charge automatiquement des fichiers placés à côté de l'inventaire ou du playbook :" },
        { t: "code", lang: "text", title: "Arborescence type", code: `
inventory/
├── hosts.yml
├── group_vars/
│   ├── all.yml          # NTP, DNS, proxy : valable partout
│   ├── web.yml          # port, vhosts
│   └── windows/
│       ├── main.yml
│       └── vault.yml    # secrets chiffrés
└── host_vars/
    └── srv-db01.yml     # spécifique à une machine` },
        { t: "callout", kind: "pro", title: "Bonne pratique pro", html: "Un inventaire par environnement (<code>inventories/prod</code>, <code>inventories/preprod</code>) avec la même structure de groupes. Le même playbook s'applique alors partout, seules les variables changent." },
        { t: "h2", text: "Cibler avec les patterns" },
        { t: "table", head: ["Pattern", "Signification"], rows: [
          ["<code>web</code>", "le groupe web"],
          ["<code>web:db</code>", "web <strong>ou</strong> db (union)"],
          ["<code>linux:&amp;prod</code>", "dans linux <strong>et</strong> dans prod (intersection)"],
          ["<code>linux:!db</code>", "linux <strong>sauf</strong> db"],
          ["<code>srv-web0*</code>", "joker sur le nom"],
        ] },
        { t: "term", task: "Affiche l'arbre de ton inventaire <code>inventory/hosts.yml</code> sous forme de graphe.", steps: [
          { accept: [/^ansible-inventory\s+(-i\s+\S+\s+)?--graph(\s+-i\s+\S+)?\s*$/], hint: "La commande s'appelle <code>ansible-inventory</code>, avec l'option <code>--graph</code> et <code>-i</code> pour le fichier.", solution: "ansible-inventory -i inventory/hosts.yml --graph",
            output: `@all:
  |--@ungrouped:
  |--@linux:
  |  |--@web:
  |  |  |--srv-web01
  |  |  |--srv-web02
  |  |--@db:
  |  |  |--srv-db01
  |--@windows:
  |  |--srv-app01` },
        ], explain: "<code>ansible-inventory --graph</code> est le premier réflexe pour vérifier qu'un inventaire est bien construit. <code>--list</code> affiche aussi toutes les variables résolues." },
        { t: "term", task: "Vérifie quelles variables Ansible voit pour <code>srv-db01</code>.", steps: [
          { accept: [/^ansible-inventory\s+(-i\s+\S+\s+)?--host\s+srv-db01(\s+-i\s+\S+)?\s*$/], hint: "Même commande, option <code>--host</code> suivie du nom.", solution: "ansible-inventory -i inventory/hosts.yml --host srv-db01",
            output: `{
    "ansible_become": true,
    "ansible_host": "10.0.20.11",
    "ansible_user": "deploy",
    "postgres_version": "16"
}` },
        ] },
        { t: "quiz", q: "Quel pattern cible les serveurs Linux de production qui ne sont pas des bases de données ?", options: ["<code>linux:prod:db</code>", "<code>linux:&amp;prod:!db</code>", "<code>linux,prod,!db</code>", "<code>linux&amp;prod&amp;!db</code>"], answer: 1, explain: "<code>:&amp;</code> fait l'intersection, <code>:!</code> l'exclusion. On peut les enchaîner." },
        { t: "editor", task: "Complète cet inventaire INI : crée un groupe <code>prod</code> qui contient les groupes <code>web</code> et <code>db</code>, et donne à tout ce groupe la variable <code>env=prod</code>.", lang: "ini",
          starter: `
[web]
srv-web01
srv-web02

[db]
srv-db01
`,
          checks: [
            { re: /^\[prod:children\]\s*$/m, label: "Section <code>[prod:children]</code>" },
            { re: /\[prod:children\][^\[]*\bweb\b/s, label: "Le groupe <code>web</code> est enfant de prod" },
            { re: /\[prod:children\][^\[]*\bdb\b/s, label: "Le groupe <code>db</code> est enfant de prod" },
            { re: /^\[prod:vars\]\s*$[^\[]*^env\s*=\s*prod\s*$/ms, label: "Section <code>[prod:vars]</code> avec <code>env=prod</code>" },
          ],
          solution: `
[web]
srv-web01
srv-web02

[db]
srv-db01

[prod:children]
web
db

[prod:vars]
env=prod
` },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l3", part: "Fondations", title: "Commandes ad-hoc et modules", duration: 20,
      summary: "ansible -m, become, documentation des modules, FQCN.",
      objectives: ["Lancer une commande sur un groupe sans playbook", "Utiliser become pour l'élévation de privilèges", "Lire la documentation d'un module avec ansible-doc", "Comprendre les noms complets (FQCN)"],
      blocks: [
        { t: "p", html: "Une commande ad-hoc applique <strong>un seul module</strong> à un groupe d'hôtes, sans écrire de playbook. Parfait pour vérifier, dépanner, ou faire une action ponctuelle (redémarrer un service sur 20 serveurs)." },
        { t: "code", lang: "bash", title: "Syntaxe", code: `
ansible <pattern> -i <inventaire> -m <module> -a "<arguments>" [-b] [--limit ...]` },
        { t: "table", head: ["Option", "Rôle"], rows: [
          ["<code>-m</code>", "module à utiliser (par défaut <code>command</code>)"],
          ["<code>-a</code>", "arguments du module"],
          ["<code>-b</code> / <code>--become</code>", "exécuter en root (sudo par défaut)"],
          ["<code>-K</code>", "demander le mot de passe sudo"],
          ["<code>-f 20</code>", "20 hôtes en parallèle (forks, 5 par défaut)"],
          ["<code>--limit srv-web01</code>", "restreindre la cible"],
          ["<code>-C</code> / <code>--check</code>", "simulation, aucun changement"],
        ] },
        { t: "term", task: "Teste la connexion à <strong>tous</strong> les hôtes de l'inventaire <code>inventory/hosts.yml</code> avec le module <code>ping</code>.", steps: [
          { accept: [/^ansible\s+all\s+(-i\s+\S+\s+)?-m\s+(ansible\.builtin\.)?ping(\s+-i\s+\S+)?\s*$/], hint: "<code>ansible all -i … -m ping</code>", solution: "ansible all -i inventory/hosts.yml -m ping",
            near: [{ re: /^ping\b/, msg: "Ici on ne veut pas un ping ICMP : le module ansible ping vérifie SSH + Python. Utilise la commande ansible." }],
            output: `<span class="okc">srv-web01 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}</span>
<span class="okc">srv-web02 | SUCCESS => { "changed": false, "ping": "pong" }</span>
<span class="okc">srv-db01 | SUCCESS => { "changed": false, "ping": "pong" }</span>
<span class="err">srv-app01 | UNREACHABLE! => {
    "msg": "Failed to connect to the host via ssh: Connection refused"
}</span>` },
        ], explain: "Le module <code>ping</code> d'Ansible n'est pas un ping réseau : il vérifie qu'on peut se connecter <strong>et</strong> exécuter Python. srv-app01 est un Windows : il faut le module <code>win_ping</code> et une connexion WinRM (leçon 10)." },
        { t: "term", task: "Redémarre le service <code>nginx</code> sur le groupe <code>web</code>. Il faut les droits root.", steps: [
          { accept: [/^ansible\s+web\s+.*-m\s+(ansible\.builtin\.)?(service|systemd|systemd_service)\s+.*-a\s+["']?(name=nginx\s+state=restarted|state=restarted\s+name=nginx)["']?.*(\s-b|--become)/, /^ansible\s+web\s+.*(\s-b|--become)\s.*-m\s+(ansible\.builtin\.)?(service|systemd|systemd_service)\s+.*-a\s+["']?(name=nginx\s+state=restarted|state=restarted\s+name=nginx)["']?/],
            hint: "Module <code>service</code>, arguments <code>name=nginx state=restarted</code>, et <code>-b</code> pour devenir root.", solution: "ansible web -i inventory/hosts.yml -m service -a \"name=nginx state=restarted\" -b",
            near: [{ re: /systemctl/, msg: "Évite de passer par command/shell avec systemctl : le module service est fait pour ça." }, { re: /^ansible\s+web\b(?!.*(\s-b|--become))/, msg: "Permission refusée : redémarrer un service exige les droits root. Ajoute -b." }],
            output: `<span class="chg">srv-web01 | CHANGED => {
    "changed": true,
    "name": "nginx",
    "state": "started"
}</span>
<span class="chg">srv-web02 | CHANGED => { "changed": true, "name": "nginx", "state": "started" }</span>` },
        ] },
        { t: "h2", text: "Trouver et lire un module" },
        { t: "p", html: "Il existe des milliers de modules, rangés en <strong>collections</strong>. On les nomme par leur FQCN (<em>Fully Qualified Collection Name</em>) : <code>espace.collection.module</code>. Exemple : <code>ansible.builtin.copy</code>, <code>community.general.ufw</code>, <code>microsoft.ad.user</code>." },
        { t: "term", task: "Affiche un exemple prêt à copier pour le module <code>ansible.builtin.user</code> (option snippet).", steps: [
          { accept: [/^ansible-doc\s+(-s|--snippet)\s+(ansible\.builtin\.)?user\s*$/, /^ansible-doc\s+(ansible\.builtin\.)?user\s+(-s|--snippet)\s*$/], hint: "<code>ansible-doc</code> avec l'option <code>-s</code>.", solution: "ansible-doc -s ansible.builtin.user",
            output: `- name: Manage user accounts
  ansible.builtin.user:
      append:      # If yes, add the user to the groups specified in groups
      groups:      # A list of supplementary groups
      name:        # (required) Name of the user to create, remove or modify
      password:    # Optionally set the user's password to this crypted value
      shell:       # Optionally set the user's shell
      state:       # Whether the account should exist or not
      ...` },
        ] },
        { t: "callout", kind: "pro", title: "Toujours utiliser le FQCN", html: "Écris <code>ansible.builtin.copy</code> plutôt que <code>copy</code>. C'est obligatoire selon <code>ansible-lint</code> en profil production, et cela évite les ambiguïtés quand deux collections ont un module du même nom." },
        { t: "quiz", q: "Tu veux voir l'espace disque sur tous les serveurs web, sans rien modifier. Quelle commande est la plus adaptée ?", options: ["<code>ansible web -m shell -a \"df -h\"</code>", "<code>ansible web -m command -a \"df -h\"</code>", "<code>ansible-playbook df.yml</code>", "<code>ansible web -m copy -a \"df -h\"</code>"], answer: 1, explain: "<code>command</code> suffit (pas besoin de pipe ni de redirection) et il est plus sûr que <code>shell</code>, qui passe par un interpréteur. Pour une lecture ponctuelle, l'ad-hoc est parfait." },
        { t: "order", task: "Remets dans l'ordre ce qu'Ansible fait réellement pour chaque tâche sur un hôte Linux.", items: [
          "Lire l'inventaire et résoudre les variables de l'hôte",
          "Ouvrir la connexion SSH",
          "Copier le module Python dans un dossier temporaire distant",
          "Exécuter le module avec ses arguments",
          "Récupérer le résultat JSON (ok / changed / failed)",
          "Supprimer le fichier temporaire",
        ], explain: "C'est pour ça qu'Ansible n'a pas besoin d'agent. L'option <code>pipelining = True</code> supprime la copie de fichier et accélère fortement l'exécution (leçon 11)." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l4", part: "Playbooks", title: "Ton premier playbook", duration: 25,
      summary: "Structure YAML, plays, tâches, become, check et diff.",
      objectives: ["Écrire un playbook valide en YAML", "Comprendre plays, tâches et become", "Lancer, simuler (--check --diff) et lire le récapitulatif"],
      blocks: [
        { t: "h2", text: "Anatomie d'un playbook" },
        { t: "code", lang: "yaml", title: "web.yml", code: `
---
- name: Configurer les serveurs web       # un play
  hosts: web                              # cible (pattern d'inventaire)
  become: true                            # sudo pour toutes les tâches

  tasks:
    - name: Installer nginx               # une tâche = un module
      ansible.builtin.apt:
        name: nginx
        state: present
        update_cache: true

    - name: Démarrer nginx au boot
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true

    - name: Déployer la page d'accueil
      ansible.builtin.copy:
        content: "Bonjour depuis {{ inventory_hostname }}\\n"
        dest: /var/www/html/index.html
        owner: www-data
        mode: "0644"` },
        { t: "list", items: [
          "<code>---</code> : début de document YAML (facultatif mais conventionnel).",
          "Un playbook est une <strong>liste</strong> de plays (d'où le tiret).",
          "L'indentation se fait en <strong>espaces</strong>, jamais en tabulations. Deux espaces par niveau.",
          "Chaque tâche a un <code>name</code> clair : c'est ce qui s'affiche à l'exécution et dans les logs.",
          "Le mode (<code>\"0644\"</code>) est entre guillemets : sinon YAML l'interprète comme un nombre octal ou décimal.",
        ] },
        { t: "h2", text: "Exécuter et lire le résultat" },
        { t: "term", task: "Lance d'abord le playbook <code>web.yml</code> en <strong>simulation</strong>, en affichant les différences de fichiers.", steps: [
          { accept: [/^ansible-playbook\s+.*web\.yml.*(--check|-C)\b.*(--diff|-D)\b/, /^ansible-playbook\s+.*(--check|-C)\b.*(--diff|-D)\b.*web\.yml/, /^ansible-playbook\s+.*(--diff|-D)\b.*(--check|-C)\b/],
            hint: "Deux options : <code>--check</code> (simuler) et <code>--diff</code> (montrer les différences).", solution: "ansible-playbook -i inventory/hosts.yml web.yml --check --diff",
            output: `
<span class="dim">PLAY [Configurer les serveurs web] *********************************</span>

TASK [Gathering Facts] *********************************************
<span class="okc">ok: [srv-web01]</span>
<span class="okc">ok: [srv-web02]</span>

TASK [Installer nginx] *********************************************
<span class="okc">ok: [srv-web01]</span>
<span class="chg">changed: [srv-web02]</span>

TASK [Démarrer nginx au boot] **************************************
<span class="okc">ok: [srv-web01]</span>
<span class="chg">changed: [srv-web02]</span>

TASK [Déployer la page d'accueil] **********************************
--- before: /var/www/html/index.html
+++ after: /var/www/html/index.html
@@ -1 +1 @@
<span class="err">-Welcome to nginx!</span>
<span class="okc">+Bonjour depuis srv-web01</span>
<span class="chg">changed: [srv-web01]</span>
<span class="chg">changed: [srv-web02]</span>

<span class="dim">PLAY RECAP *********************************************************</span>
srv-web01 : <span class="okc">ok=3</span> <span class="chg">changed=1</span> unreachable=0 failed=0 skipped=0
srv-web02 : <span class="okc">ok=1</span> <span class="chg">changed=3</span> unreachable=0 failed=0 skipped=0` },
          { ask: "La simulation est bonne. Applique maintenant pour de vrai, mais <strong>uniquement</strong> sur srv-web01 pour commencer.", accept: [/^ansible-playbook\s+.*web\.yml.*(--limit|-l)\s+srv-web01/, /^ansible-playbook\s+.*(--limit|-l)\s+srv-web01.*web\.yml/],
            hint: "Option <code>--limit</code> (ou <code>-l</code>), sans --check.", solution: "ansible-playbook -i inventory/hosts.yml web.yml --limit srv-web01",
            near: [{ re: /--check|-C\b/, msg: "Tu es encore en simulation. Retire --check pour appliquer." }],
            output: `<span class="dim">PLAY RECAP *********************************************************</span>
srv-web01 : <span class="okc">ok=4</span> <span class="chg">changed=1</span> unreachable=0 failed=0 skipped=0` },
        ], explain: "Réflexe pro : <code>--check --diff</code> d'abord, puis un déploiement limité (canari) avec <code>--limit</code>, puis le reste. En CI, on garde la sortie de <code>--check</code> comme preuve de revue." },
        { t: "callout", kind: "warn", title: "Limites de --check", html: "En simulation, une tâche qui dépend du résultat d'une tâche précédente (un paquet qui n'est pas encore installé) peut échouer. Les modules <code>command</code>/<code>shell</code> sont sautés en check sauf si tu ajoutes <code>check_mode: false</code>." },
        { t: "editor", task: "Ce playbook a 4 erreurs. Corrige-le : indentation de <code>tasks</code>, élévation de privilèges, module en FQCN, et mode de fichier en chaîne.", lang: "yaml",
          starter: `
---
- name: Configurer NTP
  hosts: linux
tasks:
    - name: Installer chrony
      apt:
        name: chrony
        state: present

    - name: Déployer la config
      ansible.builtin.copy:
        src: files/chrony.conf
        dest: /etc/chrony/chrony.conf
        mode: 0644
`,
          checks: [
            { re: /^  tasks:\s*$/m, label: "<code>tasks:</code> est indenté de 2 espaces, au niveau de <code>hosts</code>" },
            { re: /^  become:\s*(true|yes)\s*$/m, label: "<code>become: true</code> au niveau du play" },
            { re: /ansible\.builtin\.apt:/, label: "Le module apt est écrit <code>ansible.builtin.apt</code>" },
            { re: /mode:\s*["']0644["']/, label: "Le mode est une chaîne : <code>\"0644\"</code>" },
          ],
          solution: `
---
- name: Configurer NTP
  hosts: linux
  become: true
  tasks:
    - name: Installer chrony
      ansible.builtin.apt:
        name: chrony
        state: present

    - name: Déployer la config
      ansible.builtin.copy:
        src: files/chrony.conf
        dest: /etc/chrony/chrony.conf
        mode: "0644"
` },
        { t: "quiz", q: "Dans le PLAY RECAP, une machine affiche <code>ok=5 changed=0</code> lors de la 2e exécution. Que peux-tu en conclure ?", options: ["Le playbook n'a rien fait, il est cassé", "Le serveur était déjà dans l'état voulu : le playbook est idempotent", "Les tâches ont été sautées", "Ansible n'a pas pu se connecter"], answer: 1, explain: "C'est exactement le résultat attendu : un 2e passage sans <code>changed</code> prouve l'idempotence. Un <code>changed</code> à chaque passage signale une tâche mal écrite." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l5", part: "Playbooks", title: "Variables, facts et register", duration: 30,
      summary: "Où définir une variable, priorités, facts, register, set_fact.",
      objectives: ["Définir des variables aux bons niveaux", "Connaître les règles de priorité essentielles", "Utiliser les facts et les variables magiques", "Capturer un résultat avec register"],
      blocks: [
        { t: "h2", text: "Utiliser une variable" },
        { t: "code", lang: "yaml", code: `
- name: Créer les comptes d'équipe
  hosts: linux
  become: true
  vars:
    admin_group: sysadmins
    admins:
      - hmubenga
      - tlefevre
  tasks:
    - name: Créer le groupe
      ansible.builtin.group:
        name: "{{ admin_group }}"

    - name: Créer les comptes
      ansible.builtin.user:
        name: "{{ item }}"
        groups: "{{ admin_group }}"
        append: true
      loop: "{{ admins }}"` },
        { t: "callout", kind: "warn", title: "Guillemets obligatoires", html: "Si une valeur YAML <strong>commence</strong> par <code>{{</code>, mets-la entre guillemets : <code>name: \"{{ admin_group }}\"</code>. Sans eux, YAML croit ouvrir un dictionnaire et le playbook ne se charge pas." },
        { t: "h2", text: "Priorité des variables (la version utile)" },
        { t: "p", html: "Ansible a 22 niveaux de priorité. Retiens l'ordre suivant, du plus faible au plus fort :" },
        { t: "table", head: ["Priorité", "Source", "Usage typique"], rows: [
          ["1 (faible)", "<code>defaults/main.yml</code> d'un rôle", "valeurs par défaut, faites pour être surchargées"],
          ["2", "<code>group_vars/all</code>", "valeurs globales de l'environnement"],
          ["3", "<code>group_vars/&lt;groupe&gt;</code>", "par type de serveur"],
          ["4", "<code>host_vars/&lt;hôte&gt;</code>", "exception sur une machine"],
          ["5", "facts, <code>vars:</code> du play, <code>vars_files</code>", "calculées ou propres au playbook"],
          ["6", "<code>vars/main.yml</code> d'un rôle, <code>set_fact</code>, <code>register</code>", "valeurs internes"],
          ["7 (forte)", "<code>-e</code> / <code>--extra-vars</code>", "gagne toujours"],
        ] },
        { t: "quiz", q: "<code>http_port</code> vaut 80 dans <code>group_vars/web.yml</code> et 8080 dans <code>host_vars/srv-web02.yml</code>. Quelle valeur srv-web02 utilise-t-il ?", options: ["80", "8080", "Le playbook échoue (conflit)", "Ça dépend de l'ordre dans l'inventaire"], answer: 1, explain: "host_vars est plus spécifique que group_vars, donc il l'emporte. Seuls les extra-vars (<code>-e</code>) ou des variables de play/rôle passeraient devant." },
        { t: "h2", text: "Les facts" },
        { t: "p", html: "Au début de chaque play, la tâche <em>Gathering Facts</em> exécute le module <code>setup</code> et remplit <code>ansible_facts</code> : OS, IP, mémoire, disques, etc." },
        { t: "term", task: "Récupère uniquement les facts liés à la distribution sur srv-db01, avec un filtre.", steps: [
          { accept: [/^ansible\s+srv-db01\s+.*-m\s+(ansible\.builtin\.)?setup\s+.*-a\s+["']?filter=\*?ansible_distribution\*?["']?/], hint: "Module <code>setup</code> avec <code>-a \"filter=ansible_distribution*\"</code>.", solution: "ansible srv-db01 -i inventory/hosts.yml -m setup -a \"filter=ansible_distribution*\"",
            output: `<span class="okc">srv-db01 | SUCCESS => {
    "ansible_facts": {
        "ansible_distribution": "Debian",
        "ansible_distribution_file_variety": "Debian",
        "ansible_distribution_major_version": "12",
        "ansible_distribution_release": "bookworm",
        "ansible_distribution_version": "12.7"
    },
    "changed": false
}</span>` },
        ] },
        { t: "table", head: ["Variable magique", "Contient"], rows: [
          ["<code>inventory_hostname</code>", "le nom de l'hôte dans l'inventaire"],
          ["<code>ansible_facts['default_ipv4']['address']</code>", "l'IP principale"],
          ["<code>groups['web']</code>", "la liste des hôtes du groupe web"],
          ["<code>hostvars['srv-db01']</code>", "toutes les variables d'un autre hôte"],
          ["<code>group_names</code>", "les groupes de l'hôte courant"],
        ] },
        { t: "h2", text: "register : capturer un résultat" },
        { t: "code", lang: "yaml", code: `
- name: Lire la version de PostgreSQL
  ansible.builtin.command: psql --version
  register: pg_version
  changed_when: false          # une lecture ne change rien

- name: Afficher
  ansible.builtin.debug:
    msg: "Version installée : {{ pg_version.stdout }}"` },
        { t: "p", html: "Une variable enregistrée contient notamment <code>stdout</code>, <code>stdout_lines</code>, <code>stderr</code>, <code>rc</code> (code retour), <code>changed</code>, <code>failed</code>." },
        { t: "editor", task: "Complète le playbook : enregistre la sortie de <code>uptime</code> dans une variable <code>up</code>, marque la tâche comme ne changeant rien, puis affiche <code>up.stdout</code> avec le module debug.", lang: "yaml",
          starter: `
- name: Diagnostic
  hosts: linux
  tasks:
    - name: Lire l'uptime
      ansible.builtin.command: uptime

    - name: Afficher l'uptime
`,
          checks: [
            { re: /register:\s*up\s*$/m, label: "<code>register: up</code>" },
            { re: /changed_when:\s*(false|no)\b/, label: "<code>changed_when: false</code>" },
            { re: /ansible\.builtin\.debug:/, label: "Module <code>ansible.builtin.debug</code>" },
            { re: /\{\{\s*up\.stdout\s*\}\}/, label: "Affiche <code>{{ up.stdout }}</code>" },
          ],
          solution: `
- name: Diagnostic
  hosts: linux
  tasks:
    - name: Lire l'uptime
      ansible.builtin.command: uptime
      register: up
      changed_when: false

    - name: Afficher l'uptime
      ansible.builtin.debug:
        msg: "{{ up.stdout }}"
` },
        { t: "quiz", q: "Tu lances <code>ansible-playbook site.yml -e \"http_port=9000\"</code> alors que le rôle définit <code>http_port: 80</code> dans <code>vars/main.yml</code>. Résultat ?", options: ["80 : les variables de rôle sont prioritaires", "9000 : les extra-vars gagnent toujours", "Erreur de conflit", "80 sur Linux, 9000 sur Windows"], answer: 1, explain: "<code>-e</code> est au sommet de la pile de priorité. C'est utile pour un correctif ponctuel, dangereux si on en abuse : le playbook ne reflète plus la réalité de Git." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l6", part: "Playbooks", title: "Conditions, boucles et gestion d'erreurs", duration: 30,
      summary: "when, loop, block/rescue/always, failed_when, changed_when.",
      objectives: ["Exécuter une tâche sous condition", "Boucler sur des listes et des dictionnaires", "Rattraper une erreur avec block/rescue/always", "Définir soi-même succès et échec"],
      blocks: [
        { t: "h2", text: "when" },
        { t: "code", lang: "yaml", code: `
- name: Installer le paquet selon la famille d'OS
  ansible.builtin.package:
    name: "{{ 'httpd' if ansible_facts['os_family'] == 'RedHat' else 'apache2' }}"
    state: present

- name: Redémarrer seulement si un noyau a été installé
  ansible.builtin.reboot:
    reboot_timeout: 600
  when:
    - kernel_update is changed
    - reboot_allowed | default(false) | bool     # liste = ET logique` },
        { t: "callout", kind: "tip", html: "Dans <code>when</code>, on n'écrit <strong>pas</strong> les accolades <code>{{ }}</code> : c'est déjà une expression Jinja2. <code>when: \"{{ x }}\"</code> déclenche un avertissement et peut être évalué de façon inattendue." },
        { t: "h2", text: "loop" },
        { t: "code", lang: "yaml", code: `
- name: Ouvrir les ports du pare-feu
  community.general.ufw:
    rule: allow
    port: "{{ item.port }}"
    proto: "{{ item.proto }}"
  loop:
    - { port: "22",  proto: tcp }
    - { port: "443", proto: tcp }
    - { port: "123", proto: udp }
  loop_control:
    label: "{{ item.port }}/{{ item.proto }}"    # sortie lisible

- name: Boucler sur un dictionnaire
  ansible.builtin.user:
    name: "{{ item.key }}"
    shell: "{{ item.value.shell }}"
  loop: "{{ users | dict2items }}"` },
        { t: "callout", kind: "pro", title: "Performance", html: "Pour installer plusieurs paquets, passe une liste au module (<code>name: [nginx, git, curl]</code>) plutôt qu'une boucle : une seule transaction apt au lieu de trois." },
        { t: "h2", text: "block / rescue / always" },
        { t: "code", lang: "yaml", code: `
- name: Mise à jour applicative avec retour arrière
  block:
    - name: Sortir le serveur du load balancer
      ansible.builtin.uri:
        url: "https://lb.lab.local/api/pool/web/{{ inventory_hostname }}/disable"
        method: POST
    - name: Déployer la nouvelle version
      ansible.builtin.unarchive:
        src: "app-{{ app_version }}.tgz"
        dest: /opt/app
  rescue:
    - name: Restaurer la version précédente
      ansible.builtin.command: /opt/app/bin/rollback.sh
  always:
    - name: Remettre le serveur dans le pool
      ansible.builtin.uri:
        url: "https://lb.lab.local/api/pool/web/{{ inventory_hostname }}/enable"
        method: POST` },
        { t: "p", html: "<code>rescue</code> ne s'exécute qu'en cas d'échec dans <code>block</code>. <code>always</code> s'exécute dans tous les cas : c'est l'équivalent d'un <code>try / catch / finally</code>." },
        { t: "h2", text: "Définir succès et échec" },
        { t: "code", lang: "yaml", code: `
- name: Vérifier le certificat
  ansible.builtin.command: openssl x509 -checkend 2592000 -noout -in /etc/ssl/site.crt
  register: cert
  changed_when: false
  failed_when: cert.rc not in [0, 1]     # 1 = expire bientôt : pas une erreur technique

- name: Alerter si le certificat expire dans moins de 30 jours
  ansible.builtin.debug:
    msg: "Certificat à renouveler sur {{ inventory_hostname }}"
  when: cert.rc == 1` },
        { t: "quiz", q: "Quelle écriture de condition est correcte ?", options: ["<code>when: \"{{ ansible_facts['os_family'] == 'Debian' }}\"</code>", "<code>when: ansible_facts['os_family'] == 'Debian'</code>", "<code>if: ansible_facts['os_family'] == 'Debian'</code>", "<code>when: {{ os_family }} is Debian</code>"], answer: 1, explain: "<code>when</code> attend une expression brute, sans accolades." },
        { t: "editor", task: "Écris une tâche qui installe les paquets <code>htop</code>, <code>vim</code> et <code>tcpdump</code> en <strong>une seule tâche</strong> (sans loop), uniquement si la famille d'OS est <code>Debian</code>.", lang: "yaml",
          starter: `
- name: Outils d'administration
  hosts: linux
  become: true
  tasks:
    - name: Installer les outils
`,
          checks: [
            { re: /ansible\.builtin\.(apt|package):/, label: "Module <code>ansible.builtin.apt</code> ou <code>package</code>" },
            { re: /htop/, label: "htop dans la liste" }, { re: /vim/, label: "vim dans la liste" }, { re: /tcpdump/, label: "tcpdump dans la liste" },
            { re: /loop:|with_items:/, not: true, label: "Pas de boucle" },
            { re: /when:\s*ansible_(facts\[['"]os_family['"]\]|os_family)\s*==\s*['"]Debian['"]/, label: "<code>when: ansible_facts['os_family'] == 'Debian'</code>" },
          ],
          solution: `
- name: Outils d'administration
  hosts: linux
  become: true
  tasks:
    - name: Installer les outils
      ansible.builtin.apt:
        name:
          - htop
          - vim
          - tcpdump
        state: present
      when: ansible_facts['os_family'] == 'Debian'
` },
        { t: "classify", task: "Pour chaque besoin, quel mot-clé utiliser ?", buckets: ["when", "loop", "rescue", "always", "failed_when"], items: [
          { t: "Ne lancer la tâche que sur Windows Server 2022", b: 0 },
          { t: "Créer 15 comptes utilisateurs listés dans une variable", b: 1 },
          { t: "Restaurer la sauvegarde si la migration de base échoue", b: 2 },
          { t: "Supprimer le fichier de verrou, que le déploiement réussisse ou non", b: 3 },
          { t: "Considérer comme une erreur un script qui affiche « ERROR » mais renvoie 0", b: 4, why: "<code>failed_when: \"'ERROR' in result.stdout\"</code>" },
        ] },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l7", part: "Playbooks", title: "Handlers et templates Jinja2", duration: 30,
      summary: "notify, handlers, module template, filtres, validate.",
      objectives: ["Redémarrer un service seulement quand sa config change", "Générer des fichiers de config avec Jinja2", "Utiliser les filtres les plus courants", "Valider une config avant de l'installer"],
      blocks: [
        { t: "h2", text: "Handlers : agir seulement en cas de changement" },
        { t: "code", lang: "yaml", code: `
- name: Serveur web
  hosts: web
  become: true
  tasks:
    - name: Déployer la configuration nginx
      ansible.builtin.template:
        src: templates/site.conf.j2
        dest: /etc/nginx/sites-available/site.conf
        mode: "0644"
        validate: nginx -t -c %s        # refuse un fichier invalide
      notify: Recharger nginx

  handlers:
    - name: Recharger nginx
      ansible.builtin.service:
        name: nginx
        state: reloaded` },
        { t: "list", items: [
          "Un handler ne s'exécute que si une tâche qui le <code>notify</code> a le statut <code>changed</code>.",
          "Il s'exécute <strong>une seule fois</strong>, à la fin du play, même si dix tâches l'ont notifié.",
          "Pour le forcer plus tôt : <code>- ansible.builtin.meta: flush_handlers</code>.",
          "Si le play échoue avant la fin, les handlers ne partent pas, sauf avec <code>--force-handlers</code>.",
        ] },
        { t: "h2", text: "Templates Jinja2" },
        { t: "code", lang: "text", title: "templates/site.conf.j2", code: `
# {{ ansible_managed }}
upstream app {
{% for host in groups['app'] %}
    server {{ hostvars[host]['ansible_host'] }}:{{ app_port | default(8080) }};
{% endfor %}
}

server {
    listen 443 ssl;
    server_name {{ site_fqdn }};
{% if enable_hsts | default(true) %}
    add_header Strict-Transport-Security "max-age=31536000" always;
{% endif %}
    location / { proxy_pass http://app; }
}` },
        { t: "table", head: ["Filtre", "Effet", "Exemple"], rows: [
          ["<code>default(x)</code>", "valeur si variable indéfinie", "<code>{{ port | default(80) }}</code>"],
          ["<code>upper</code> / <code>lower</code>", "casse", "<code>{{ env | upper }}</code>"],
          ["<code>join(', ')</code>", "liste vers texte", "<code>{{ dns_servers | join(' ') }}</code>"],
          ["<code>to_nice_yaml</code> / <code>to_json</code>", "sérialiser", "fichier de config structuré"],
          ["<code>bool</code>", "\"yes\"/\"true\" vers booléen", "<code>when: x | bool</code>"],
          ["<code>regex_replace</code>", "remplacement", "<code>{{ fqdn | regex_replace('\\..*', '') }}</code>"],
          ["<code>password_hash('sha512')</code>", "hacher un mot de passe", "module user"],
          ["<code>selectattr</code> / <code>map</code>", "filtrer une liste d'objets", "<code>users | selectattr('admin') | map(attribute='name')</code>"],
        ] },
        { t: "quiz", q: "Trois tâches modifient trois fichiers de config nginx et notifient toutes « Recharger nginx ». Combien de fois nginx est-il rechargé ?", options: ["3 fois, une par tâche", "1 fois, à la fin du play", "0 fois : il faut flush_handlers", "Autant de fois que de serveurs"], answer: 1, explain: "Les notifications sont dédupliquées : un handler s'exécute une fois par hôte à la fin du play." },
        { t: "editor", task: "Écris un template Jinja2 <code>resolv.conf.j2</code> : une ligne <code>search</code> avec la variable <code>dns_domain</code>, puis une ligne <code>nameserver X</code> pour chaque élément de la liste <code>dns_servers</code>.", lang: "text",
          starter: `
# {{ ansible_managed }}
`,
          checks: [
            { re: /search\s+\{\{\s*dns_domain\s*\}\}/, label: "<code>search {{ dns_domain }}</code>" },
            { re: /\{%-?\s*for\s+(\w+)\s+in\s+dns_servers\s*-?%\}/, label: "Boucle <code>{% for … in dns_servers %}</code>" },
            { re: /nameserver\s+\{\{\s*\w+\s*\}\}/, label: "<code>nameserver {{ … }}</code> dans la boucle" },
            { re: /\{%-?\s*endfor\s*-?%\}/, label: "<code>{% endfor %}</code>" },
          ],
          solution: `
# {{ ansible_managed }}
search {{ dns_domain }}
{% for ns in dns_servers %}
nameserver {{ ns }}
{% endfor %}
` },
        { t: "callout", kind: "pro", title: "ansible_managed", html: "Mets toujours <code>{{ ansible_managed }}</code> en tête des fichiers générés. Un collègue qui ouvre le fichier sur le serveur sait qu'une modification manuelle sera écrasée au prochain passage." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l8", part: "Industrialiser", title: "Rôles et collections", duration: 30,
      summary: "Structure d'un rôle, defaults vs vars, dépendances, Galaxy, requirements.yml.",
      objectives: ["Découper un playbook en rôles réutilisables", "Distinguer defaults et vars", "Installer des rôles et collections avec requirements.yml", "Structurer un dépôt Ansible pro"],
      blocks: [
        { t: "h2", text: "Pourquoi des rôles" },
        { t: "p", html: "Un playbook de 600 lignes devient illisible. Un rôle regroupe tout ce qu'il faut pour une fonction (nginx, durcissement, agent EDR) dans une arborescence standard. Le playbook devient une simple liste de rôles." },
        { t: "term", task: "Crée le squelette d'un rôle nommé <code>hardening</code> dans le dossier <code>roles/</code>.", steps: [
          { accept: [/^ansible-galaxy\s+(role\s+)?init\s+(--init-path\s+roles\/?\s+hardening|roles\/hardening|hardening\s+--init-path\s+roles\/?)\s*$/], hint: "<code>ansible-galaxy role init</code> suivi du chemin.", solution: "ansible-galaxy role init roles/hardening",
            output: `- Role roles/hardening was created successfully
roles/hardening/
├── defaults/main.yml     <span class="dim"># variables par défaut (priorité la plus faible)</span>
├── files/                <span class="dim"># fichiers copiés tels quels</span>
├── handlers/main.yml
├── meta/main.yml         <span class="dim"># auteur, plateformes, dépendances</span>
├── tasks/main.yml        <span class="dim"># point d'entrée</span>
├── templates/            <span class="dim"># fichiers .j2</span>
├── tests/
└── vars/main.yml         <span class="dim"># constantes internes (priorité haute)</span>` },
        ] },
        { t: "h2", text: "defaults ou vars ?" },
        { t: "table", head: ["", "defaults/main.yml", "vars/main.yml"], rows: [
          ["Priorité", "la plus faible", "élevée (au-dessus de group_vars)"],
          ["Usage", "les réglages que l'utilisateur du rôle peut changer", "les constantes internes (noms de paquets par OS)"],
          ["Exemple", "<code>ssh_port: 22</code>", "<code>sshd_package: openssh-server</code>"],
        ] },
        { t: "callout", kind: "danger", title: "Erreur classique", html: "Mettre un paramètre réglable dans <code>vars/</code> : l'équipe le surcharge dans <code>group_vars</code> et rien ne change, car <code>vars/</code> est prioritaire. Résultat : une heure de débogage." },
        { t: "h2", text: "Utiliser les rôles" },
        { t: "code", lang: "yaml", title: "site.yml", code: `
- name: Socle commun
  hosts: linux
  become: true
  roles:
    - role: hardening
    - role: monitoring_agent
      vars:
        agent_server: zabbix.lab.local

- name: Serveurs web
  hosts: web
  become: true
  tasks:
    - name: Inclure le rôle nginx seulement en prod
      ansible.builtin.include_role:
        name: nginx
      when: env == "prod"` },
        { t: "p", html: "<code>import_role</code> / <code>import_tasks</code> sont <strong>statiques</strong> (résolus au chargement, les tags s'y propagent). <code>include_role</code> / <code>include_tasks</code> sont <strong>dynamiques</strong> (résolus à l'exécution, utilisables dans une boucle ou avec un nom calculé)." },
        { t: "h2", text: "Collections et requirements.yml" },
        { t: "code", lang: "yaml", title: "collections/requirements.yml", code: `
collections:
  - name: community.general
    version: ">=9.0.0,<10.0.0"
  - name: ansible.windows
    version: "2.5.0"
  - name: microsoft.ad
    version: "1.7.1"
roles:
  - name: geerlingguy.docker
    version: "7.4.1"` },
        { t: "term", task: "Installe les collections listées dans <code>collections/requirements.yml</code>.", steps: [
          { accept: [/^ansible-galaxy\s+collection\s+install\s+-r\s+collections\/requirements\.yml\s*$/, /^ansible-galaxy\s+install\s+-r\s+collections\/requirements\.yml\s*$/], hint: "<code>ansible-galaxy collection install -r …</code>", solution: "ansible-galaxy collection install -r collections/requirements.yml",
            output: `Starting galaxy collection install process
Process install dependency map
Downloading https://galaxy.ansible.com/.../community-general-9.5.0.tar.gz
Installing 'community.general:9.5.0' to '~/.ansible/collections/ansible_collections/community/general'
<span class="okc">community.general:9.5.0 was installed successfully</span>
<span class="okc">ansible.windows:2.5.0 was installed successfully</span>
<span class="okc">microsoft.ad:1.7.1 was installed successfully</span>` },
        ], explain: "Épingle toujours les versions : un pipeline qui marche aujourd'hui doit marcher dans six mois." },
        { t: "h2", text: "Arborescence d'un dépôt pro" },
        { t: "code", lang: "text", code: `
infra-ansible/
├── ansible.cfg
├── inventories/
│   ├── prod/  { hosts.yml, group_vars/, host_vars/ }
│   └── preprod/
├── collections/requirements.yml
├── roles/            # rôles maison
├── playbooks/
│   ├── site.yml      # tout
│   ├── web.yml
│   └── patching.yml
├── .ansible-lint
└── .gitlab-ci.yml    # ou .github/workflows/` },
        { t: "order", task: "Remets dans l'ordre la démarche pour transformer un playbook monolithique en rôle.", items: [
          "Créer le squelette avec ansible-galaxy role init",
          "Déplacer les tâches dans tasks/main.yml",
          "Déplacer les handlers et les templates dans leurs dossiers",
          "Sortir les réglages dans defaults/main.yml",
          "Remplacer les tâches du playbook par roles: - nom_du_role",
          "Relancer en --check --diff : aucun changement attendu",
        ], explain: "La dernière étape est la plus importante : un refactoring réussi ne change rien sur les serveurs." },
        { t: "quiz", q: "Tu veux inclure un rôle différent selon une variable <code>db_engine</code> (postgres ou mariadb). Que choisis-tu ?", options: ["<code>roles:</code> au niveau du play", "<code>import_role</code> avec <code>name: \"{{ db_engine }}\"</code>", "<code>include_role</code> avec <code>name: \"{{ db_engine }}\"</code>", "Impossible en Ansible"], answer: 2, explain: "Un nom calculé à l'exécution exige un include dynamique. <code>import_role</code> est résolu au chargement, avant que la variable ait forcément sa valeur." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l9", part: "Industrialiser", title: "Ansible Vault et secrets", duration: 25,
      summary: "Chiffrer des fichiers et des variables, vault-id, no_log, coffres externes.",
      objectives: ["Chiffrer un fichier de variables", "Organiser vars et vault pour garder le code lisible", "Éviter les fuites de secrets dans les logs", "Connaître les alternatives (HashiCorp Vault, CyberArk)"],
      blocks: [
        { t: "p", html: "Un mot de passe en clair dans Git reste dans l'historique pour toujours. Ansible Vault chiffre en AES-256 des fichiers ou des valeurs, qu'on peut alors versionner." },
        { t: "term", task: "Chiffre le fichier <code>inventories/prod/group_vars/windows/vault.yml</code>.", steps: [
          { accept: [/^ansible-vault\s+encrypt\s+inventories\/prod\/group_vars\/windows\/vault\.yml\s*$/], hint: "<code>ansible-vault encrypt &lt;fichier&gt;</code>", solution: "ansible-vault encrypt inventories/prod/group_vars/windows/vault.yml",
            output: `New Vault password:
Confirm New Vault password:
<span class="okc">Encryption successful</span>` },
          { ask: "Affiche maintenant son contenu déchiffré, sans le modifier.", accept: [/^ansible-vault\s+view\s+inventories\/prod\/group_vars\/windows\/vault\.yml\s*$/], hint: "Sous-commande <code>view</code>.", solution: "ansible-vault view inventories/prod/group_vars/windows/vault.yml",
            output: `Vault password:
vault_win_admin_password: "S3cr3t-Prod!2026"
vault_ad_join_password: "J01n-Domain!"` },
        ] },
        { t: "h2", text: "Le motif vars + vault" },
        { t: "code", lang: "yaml", title: "group_vars/windows/main.yml (en clair)", code: `
ansible_user: svc-ansible@LAB.LOCAL
ansible_password: "{{ vault_win_admin_password }}"
ad_join_password: "{{ vault_ad_join_password }}"` },
        { t: "p", html: "Toutes les variables restent visibles et cherchables avec <code>grep</code> ; seules les valeurs sensibles, préfixées <code>vault_</code>, sont dans le fichier chiffré. C'est la convention recommandée par la documentation officielle." },
        { t: "h2", text: "Exécuter avec un vault" },
        { t: "code", lang: "bash", code: `
# mot de passe saisi au clavier
ansible-playbook site.yml --ask-vault-pass

# mot de passe dans un fichier (chmod 600, hors du dépôt)
ansible-playbook site.yml --vault-password-file ~/.vault_prod

# plusieurs vaults avec identifiants
ansible-playbook site.yml --vault-id prod@~/.vault_prod --vault-id dev@prompt

# chiffrer une seule valeur à coller dans un YAML
ansible-vault encrypt_string 'S3cr3t!' --name 'vault_db_password'` },
        { t: "h2", text: "Ne pas fuiter dans les logs" },
        { t: "code", lang: "yaml", code: `
- name: Créer le compte de service
  ansible.windows.win_user:
    name: svc-backup
    password: "{{ vault_svc_backup_password }}"
  no_log: true          # masque arguments et résultat dans la sortie et dans AWX` },
        { t: "callout", kind: "danger", title: "-vvv affiche tout", html: "En mode verbeux, Ansible affiche les arguments des modules, mots de passe compris, sauf si <code>no_log: true</code> est posé. Pense-y avant de coller une sortie dans un ticket Freshservice." },
        { t: "callout", kind: "pro", title: "Au-delà de Vault", html: "En entreprise, les secrets vivent souvent dans un coffre central : HashiCorp Vault (lookup <code>community.hashi_vault.hashi_vault</code>), CyberArk (collection <code>cyberark.pas</code>, lookup CCP), Azure Key Vault. Ansible lit le secret au moment de l'exécution, sans jamais le stocker." },
        { t: "quiz", q: "Un collègue a commité <code>vault_password.txt</code> dans le dépôt, à côté des fichiers chiffrés. Quelle est la bonne réaction ?", options: ["Le supprimer dans un nouveau commit, c'est suffisant", "Le supprimer, réécrire l'historique ou considérer les secrets comme compromis, changer le mot de passe vault avec rekey ET tous les secrets qu'il protégeait", "Rien : le fichier est dans un dépôt privé", "Ajouter le fichier au .gitignore"], answer: 1, explain: "Un secret qui a été dans Git est compromis. On le retire, on fait <code>ansible-vault rekey</code>, et surtout on change les mots de passe réels protégés. Le .gitignore n'agit que pour l'avenir." },
        { t: "classify", task: "Où ranger chaque élément ?", buckets: ["group_vars/…/main.yml", "group_vars/…/vault.yml", "Hors du dépôt"], items: [
          { t: "<code>ansible_user: svc-ansible</code>", b: 0 },
          { t: "<code>vault_ad_join_password</code>", b: 1 },
          { t: "Le mot de passe qui déchiffre le vault", b: 2, why: "Dans un fichier chmod 600 sur le contrôleur, une variable CI masquée ou un coffre." },
          { t: "<code>ad_join_password: \"{{ vault_ad_join_password }}\"</code>", b: 0 },
          { t: "La clé privée SSH du compte d'automatisation", b: 2, why: "Dans un agent SSH, un secret CI ou un coffre, jamais dans Git, même chiffrée si possible." },
        ] },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l10", part: "Industrialiser", title: "Windows et Active Directory", duration: 35,
      summary: "WinRM ou SSH, Kerberos, modules win_*, microsoft.ad, GPO, patching.",
      objectives: ["Connecter Ansible à Windows proprement (WinRM HTTPS + Kerberos)", "Gérer services, fonctionnalités, registre et mises à jour", "Créer des objets AD avec la collection microsoft.ad", "Respecter le tiering avec Ansible"],
      blocks: [
        { t: "h2", text: "Connexion" },
        { t: "code", lang: "yaml", title: "group_vars/windows/main.yml", code: `
ansible_connection: winrm
ansible_port: 5986                      # HTTPS
ansible_winrm_transport: kerberos       # ou ntlm / credssp
ansible_winrm_server_cert_validation: validate
ansible_user: svc-ans-t1@LAB.LOCAL
ansible_password: "{{ vault_svc_ans_t1_password }}"` },
        { t: "callout", kind: "warn", title: "À éviter en production", html: "WinRM HTTP (5985) avec <code>basic</code> : identifiants faiblement protégés. Préfère HTTPS + Kerberos, ou le serveur OpenSSH intégré à Windows (<code>ansible_connection: ssh</code>, <code>ansible_shell_type: powershell</code>), aujourd'hui pleinement supporté." },
        { t: "term", task: "Teste la connexion aux machines du groupe <code>windows</code>.", steps: [
          { accept: [/^ansible\s+windows\s+(-i\s+\S+\s+)?-m\s+(ansible\.windows\.)?win_ping(\s+-i\s+\S+)?\s*$/], hint: "Le module ping de Windows s'appelle <code>win_ping</code>.", solution: "ansible windows -i inventory/hosts.yml -m ansible.windows.win_ping",
            near: [{ re: /-m\s+(ansible\.builtin\.)?ping\b/, msg: "Le module ping utilise Python, absent sur Windows. Utilise win_ping." }],
            output: `<span class="okc">srv-app01 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}</span>` },
        ] },
        { t: "h2", text: "Modules Windows essentiels" },
        { t: "code", lang: "yaml", code: `
- name: Socle Windows Tier 1
  hosts: windows
  tasks:
    - name: Désactiver SMBv1
      ansible.windows.win_optional_feature:
        name: SMB1Protocol
        state: absent

    - name: Installer IIS
      ansible.windows.win_feature:
        name: Web-Server
        include_management_tools: true

    - name: Service de spouleur arrêté et désactivé
      ansible.windows.win_service:
        name: Spooler
        state: stopped
        start_mode: disabled

    - name: Exiger la signature SMB
      ansible.windows.win_regedit:
        path: HKLM:\\SYSTEM\\CurrentControlSet\\Services\\LanmanServer\\Parameters
        name: RequireSecuritySignature
        data: 1
        type: dword

    - name: Installer les mises à jour de sécurité
      ansible.windows.win_updates:
        category_names: [SecurityUpdates, CriticalUpdates]
        reboot: true
        reboot_timeout: 1800` },
        { t: "h2", text: "Active Directory avec microsoft.ad" },
        { t: "code", lang: "yaml", code: `
- name: Comptes et groupes du support
  hosts: dc01
  tasks:
    - name: OU des comptes d'administration Tier 1
      microsoft.ad.ou:
        name: Tier1-Admins
        path: "OU=Admin,DC=lab,DC=local"
        protect_from_deletion: true

    - name: Compte admin séparé
      microsoft.ad.user:
        identity: adm-t1-hmubenga
        firstname: Hénok
        surname: Mubenga
        path: "OU=Tier1-Admins,OU=Admin,DC=lab,DC=local"
        password: "{{ vault_initial_password }}"
        update_password: on_create
        state: present
        groups:
          set: [GG-T1-ServerAdmins]
      no_log: true

    - name: Joindre un serveur au domaine
      microsoft.ad.membership:
        dns_domain_name: lab.local
        domain_ou_path: "OU=Servers,OU=Tier1,DC=lab,DC=local"
        domain_admin_user: svc-join@lab.local
        domain_admin_password: "{{ vault_ad_join_password }}"
        state: domain
        reboot: true
      delegate_to: srv-app02` },
        { t: "callout", kind: "pro", title: "Ansible et tiering", html: "Le compte qu'Ansible utilise <strong>est un compte à privilèges</strong>. Un seul compte d'automatisation Domain Admin qui se connecte à tous les serveurs Tier 1 et 2 casse complètement le modèle de tiering (voir le module Tiering). Il faut <strong>un compte et un contrôleur Ansible par tier</strong> : le contrôleur Tier 0 est lui-même un actif Tier 0." },
        { t: "quiz", q: "Le contrôleur Ansible qui gère les contrôleurs de domaine doit être classé :", options: ["Tier 2, c'est un simple poste Linux", "Tier 1, c'est un serveur", "Tier 0 : il contrôle des actifs Tier 0", "Il n'a pas de tier"], answer: 2, explain: "Règle du tiering : tout ce qui peut contrôler un actif Tier 0 est Tier 0. Qui compromet ce contrôleur compromet les DC." },
        { t: "classify", task: "Quel module Windows utiliser ?", buckets: ["win_feature", "win_service", "win_regedit", "win_updates", "microsoft.ad.group"], items: [
          { t: "Installer le rôle DHCP", b: 0 },
          { t: "Mettre le service WinRM en démarrage automatique", b: 1 },
          { t: "Désactiver LLMNR via la clé EnableMulticast", b: 2 },
          { t: "Appliquer les correctifs critiques du mois", b: 3 },
          { t: "Vider et remplir le groupe GG-T2-HelpDesk", b: 4 },
        ] },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l11", part: "Niveau pro", title: "Qualité, tests et performance", duration: 35,
      summary: "ansible-lint, Molecule, tags, stratégies, forks, pipelining, ansible.cfg.",
      objectives: ["Faire passer un projet à ansible-lint en profil production", "Tester un rôle avec Molecule", "Cibler une partie d'un playbook avec des tags", "Accélérer l'exécution sur 200 serveurs"],
      blocks: [
        { t: "h2", text: "ansible.cfg de référence" },
        { t: "code", lang: "ini", title: "ansible.cfg", code: `
[defaults]
inventory = inventories/prod/hosts.yml
roles_path = roles
collections_path = collections
forks = 30
host_key_checking = True
stdout_callback = ansible.builtin.default
callback_result_format = yaml
callbacks_enabled = ansible.posix.profile_tasks, ansible.posix.timer
interpreter_python = auto_silent

[ssh_connection]
pipelining = True
ssh_args = -o ControlMaster=auto -o ControlPersist=60s` },
        { t: "callout", kind: "warn", title: "host_key_checking", html: "Le désactiver fait disparaître des erreurs gênantes, mais ouvre la porte à l'usurpation de serveur. Remplis plutôt <code>known_hosts</code> (module <code>known_hosts</code> ou <code>ssh-keyscan</code> dans le pipeline)." },
        { t: "h2", text: "Accélérer" },
        { t: "table", head: ["Levier", "Effet"], rows: [
          ["<code>forks = 30</code>", "30 hôtes traités en parallèle au lieu de 5"],
          ["<code>pipelining = True</code>", "supprime la copie du module sur disque (nécessite <code>requiretty</code> désactivé dans sudoers)"],
          ["<code>ControlPersist</code>", "réutilise la connexion SSH entre tâches"],
          ["<code>gather_facts: false</code> ou <code>gather_subset</code>", "évite la collecte quand elle est inutile"],
          ["<code>strategy: free</code>", "chaque hôte avance à son rythme au lieu d'attendre les autres à chaque tâche"],
          ["<code>serial: 25%</code>", "pas plus rapide, mais déploiement par vagues (rolling update)"],
          ["<code>async</code> + <code>poll: 0</code>", "lancer une tâche longue en arrière-plan"],
        ] },
        { t: "h2", text: "Tags" },
        { t: "code", lang: "yaml", code: `
- name: Déployer la config sshd
  ansible.builtin.template:
    src: sshd_config.j2
    dest: /etc/ssh/sshd_config
    validate: /usr/sbin/sshd -t -f %s
  tags: [ssh, hardening]` },
        { t: "term", task: "Lance <code>site.yml</code> en n'exécutant que les tâches taguées <code>ssh</code>.", steps: [
          { accept: [/^ansible-playbook\s+.*site\.yml.*(--tags|-t)\s+["']?ssh["']?\s*$/, /^ansible-playbook\s+.*(--tags|-t)\s+["']?ssh["']?\s+.*site\.yml\s*$/], hint: "Option <code>--tags</code>.", solution: "ansible-playbook site.yml --tags ssh",
            output: `<span class="dim">PLAY [Socle commun] ************************************************</span>
TASK [hardening : Déployer la config sshd] *************************
<span class="okc">ok: [srv-web01]</span>
<span class="chg">changed: [srv-db01]</span>
RUNNING HANDLER [hardening : Redémarrer sshd] **********************
<span class="chg">changed: [srv-db01]</span>` },
          { ask: "Avant de lancer, tu aurais pu lister les tâches qui seraient exécutées. Fais-le.", accept: [/^ansible-playbook\s+.*--list-tasks.*/, /^ansible-playbook\s+.*--tags\s+ssh.*--list-tasks/], hint: "Option <code>--list-tasks</code>.", solution: "ansible-playbook site.yml --tags ssh --list-tasks",
            output: `playbook: site.yml
  play #1 (linux): Socle commun	TAGS: []
    tasks:
      hardening : Déployer la config sshd	TAGS: [hardening, ssh]` },
        ] },
        { t: "h2", text: "ansible-lint" },
        { t: "term", task: "Analyse ton dépôt avec <code>ansible-lint</code> en profil <code>production</code>.", steps: [
          { accept: [/^ansible-lint\s+(--profile|-p|--profile=)\s*=?production\b.*$/, /^ansible-lint\s+.*--profile[= ]production/], hint: "<code>ansible-lint --profile production</code>", solution: "ansible-lint --profile production",
            output: `<span class="err">fqcn[action-core]: Use FQCN for builtin module actions (copy).</span>
roles/nginx/tasks/main.yml:12 Task/Handler: Déployer la page

<span class="err">no-changed-when: Commands should not change things if nothing needs doing.</span>
roles/app/tasks/main.yml:30 Task/Handler: Lire la version

<span class="err">risky-file-permissions: File permissions unset or incorrect.</span>
playbooks/web.yml:18 Task/Handler: Copier le certificat

<span class="err">name[casing]: All names should start with an uppercase letter.</span>
roles/hardening/tasks/main.yml:4 Task/Handler: désactiver ipv6

Failed: 4 failure(s), 0 warning(s) on 41 files. Profile 'production' was required, but 'basic' profile passed.` },
        ], explain: "Chaque règle a un identifiant (<code>fqcn</code>, <code>no-changed-when</code>…). Tu les retrouves toutes dans les leçons précédentes : le linter vérifie précisément les bonnes pratiques que tu viens d'apprendre." },
        { t: "h2", text: "Tester un rôle avec Molecule" },
        { t: "code", lang: "bash", code: `
pip install molecule molecule-plugins[docker]
cd roles/hardening
molecule init scenario --driver-name docker
molecule test     # create → converge → idempotence → verify → destroy` },
        { t: "p", html: "L'étape <strong>idempotence</strong> rejoue le rôle et échoue si une tâche affiche <code>changed</code> au second passage. L'étape <strong>verify</strong> lance des assertions (Ansible ou Testinfra) : port 22 en écoute, <code>PermitRootLogin no</code> présent, etc." },
        { t: "order", task: "Remets dans l'ordre les étapes de <code>molecule test</code>.", items: ["dependency (collections et rôles requis)", "create (instance de test)", "converge (application du rôle)", "idempotence (second passage sans changed)", "verify (assertions)", "destroy (suppression de l'instance)"] },
        { t: "quiz", q: "Tu patches 120 serveurs web derrière un load balancer. Tu ne veux jamais en avoir plus de 10 % hors service. Que mets-tu dans le play ?", options: ["<code>forks: 12</code>", "<code>serial: \"10%\"</code>", "<code>strategy: free</code>", "<code>throttle: 10</code> sur chaque tâche"], answer: 1, explain: "<code>serial</code> découpe le play en vagues : chaque vague passe toutes les tâches avant la suivante. Ajoute <code>max_fail_percentage</code> pour stopper si une vague échoue." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l12", part: "Niveau pro", title: "CI/CD, AWX et projet final", duration: 40,
      summary: "Pipeline GitHub Actions, AWX/AAP, inventaires dynamiques, projet de synthèse.",
      objectives: ["Construire un pipeline lint → check → déploiement", "Comprendre AWX / Ansible Automation Platform", "Utiliser un inventaire dynamique", "Écrire un playbook complet de niveau production"],
      blocks: [
        { t: "h2", text: "Pipeline CI/CD" },
        { t: "code", lang: "yaml", title: ".github/workflows/ansible.yml", code: `
name: Ansible
on:
  pull_request:
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install ansible-core ansible-lint
      - run: ansible-galaxy collection install -r collections/requirements.yml
      - run: ansible-lint --profile production

  check:
    needs: lint
    runs-on: [self-hosted, ansible-tier1]      # runner dans le réseau d'admin
    steps:
      - uses: actions/checkout@v4
      - run: echo "$VAULT_PASS" > .vault && chmod 600 .vault
        env: { VAULT_PASS: "\${{ secrets.VAULT_PASS }}" }
      - run: ansible-playbook playbooks/site.yml --check --diff --vault-password-file .vault

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: check
    environment: production                    # approbation manuelle
    runs-on: [self-hosted, ansible-tier1]
    steps:
      - uses: actions/checkout@v4
      - run: echo "$VAULT_PASS" > .vault && chmod 600 .vault
        env: { VAULT_PASS: "\${{ secrets.VAULT_PASS }}" }
      - run: ansible-playbook playbooks/site.yml --vault-password-file .vault` },
        { t: "callout", kind: "pro", html: "Pull request = lint + <code>--check --diff</code> visibles par le relecteur. Fusion sur main = déploiement après approbation. Les runners tournent <strong>dans</strong> le réseau d'administration du tier concerné, jamais un runner cloud avec un accès direct aux serveurs." },
        { t: "h2", text: "AWX / Ansible Automation Platform" },
        { t: "table", head: ["Objet AWX", "Rôle"], rows: [
          ["Project", "un dépôt Git synchronisé"],
          ["Inventory", "statique, ou dynamique (vCenter, Nutanix, Azure, AD…)"],
          ["Credential", "secrets stockés chiffrés, jamais visibles par l'opérateur"],
          ["Job Template", "projet + playbook + inventaire + credential = bouton « Lancer »"],
          ["Workflow", "enchaînement de templates avec branches succès/échec"],
          ["RBAC", "le support peut lancer « Redémarrer IIS » sans voir le mot de passe"],
          ["Schedules / Survey", "planification, formulaire de saisie avant lancement"],
        ] },
        { t: "h2", text: "Inventaire dynamique" },
        { t: "code", lang: "yaml", title: "inventories/prod/vmware.yml", code: `
plugin: vmware.vmware.vms
hostname: vcenter.lab.local
validate_certs: true
hostnames: [config.name]
keyed_groups:
  - key: tags                     # tag vSphere « Tier1 » → groupe tags_Tier1
    prefix: tags
compose:
  ansible_host: guest.ipAddress` },
        { t: "h2", text: "Projet final : le playbook de durcissement" },
        { t: "p", html: "Mets tout ensemble. Écris un play complet de niveau production qui respecte toutes les règles vues dans ce module." },
        { t: "editor", task: "Play <code>Durcissement SSH</code> sur le groupe <code>linux</code> : élévation de privilèges, déploiement par vagues de 20 %, template <code>sshd_config.j2</code> vers <code>/etc/ssh/sshd_config</code> avec mode <code>\"0600\"</code> et validation par <code>sshd -t -f %s</code>, notification d'un handler <code>Redémarrer sshd</code>, tag <code>ssh</code>, et le handler correspondant.", lang: "yaml", xp: 60,
          starter: `
---
- name: Durcissement SSH
`,
          checks: [
            { re: /hosts:\s*linux/, label: "<code>hosts: linux</code>" },
            { re: /become:\s*(true|yes)/, label: "<code>become: true</code>" },
            { re: /serial:\s*["']?20%["']?/, label: "<code>serial: \"20%\"</code>" },
            { re: /ansible\.builtin\.template:/, label: "Module <code>ansible.builtin.template</code>" },
            { re: /src:\s*["']?(templates\/)?sshd_config\.j2/, label: "<code>src: sshd_config.j2</code>" },
            { re: /dest:\s*["']?\/etc\/ssh\/sshd_config["']?\s*$/m, label: "<code>dest: /etc/ssh/sshd_config</code>" },
            { re: /mode:\s*["']0600["']/, label: "<code>mode: \"0600\"</code>" },
            { re: /validate:\s*["']?(\/usr\/sbin\/)?sshd\s+-t\s+-f\s+%s/, label: "<code>validate: sshd -t -f %s</code>" },
            { re: /notify:\s*(\n\s*-\s*)?["']?Redémarrer sshd/, label: "<code>notify: Redémarrer sshd</code>" },
            { re: /tags:\s*(\[\s*)?["']?ssh/, label: "<code>tags: [ssh]</code>" },
            { re: /handlers:\s*\n[\s\S]*name:\s*["']?Redémarrer sshd[\s\S]*ansible\.builtin\.(service|systemd)/, label: "Handler <code>Redémarrer sshd</code> avec le module service" },
          ],
          solution: `
---
- name: Durcissement SSH
  hosts: linux
  become: true
  serial: "20%"

  tasks:
    - name: Déployer sshd_config
      ansible.builtin.template:
        src: sshd_config.j2
        dest: /etc/ssh/sshd_config
        owner: root
        group: root
        mode: "0600"
        validate: /usr/sbin/sshd -t -f %s
      notify: Redémarrer sshd
      tags: [ssh]

  handlers:
    - name: Redémarrer sshd
      ansible.builtin.service:
        name: sshd
        state: restarted
` },
        { t: "quiz", q: "Pourquoi la ligne <code>validate</code> est-elle critique sur sshd_config ?", options: ["Elle accélère le déploiement", "Elle évite de pousser une config invalide qui couperait l'accès SSH à tous les serveurs au redémarrage du service", "Elle est obligatoire pour le module template", "Elle chiffre le fichier"], answer: 1, explain: "Une faute de frappe dans sshd_config + un redémarrage = plus aucun accès SSH, donc plus d'Ansible pour corriger. <code>validate</code> teste le fichier temporaire avant de remplacer l'original." },
      ],
    },
  ],

  /* ==================== EXAMEN ==================== */
  exam: [
    { q: "Une tâche <code>ansible.builtin.shell: systemctl restart app</code> affiche <code>changed</code> à chaque exécution. Quelle est la meilleure correction ?", options: ["Ajouter <code>changed_when: false</code>", "Utiliser <code>ansible.builtin.service</code> avec un handler notifié par la tâche de config", "Ajouter <code>ignore_errors: true</code>", "Passer en <code>command</code>"], answer: 1, explain: "Le redémarrage ne doit avoir lieu que si quelque chose a changé : c'est exactement le rôle d'un handler. <code>changed_when: false</code> masquerait un vrai redémarrage." },
    { q: "Dans quel fichier mets-tu le port d'écoute réglable d'un rôle nginx ?", options: ["<code>roles/nginx/vars/main.yml</code>", "<code>roles/nginx/defaults/main.yml</code>", "<code>roles/nginx/meta/main.yml</code>", "<code>ansible.cfg</code>"], answer: 1, explain: "defaults = priorité la plus faible, donc surchargeable par group_vars et host_vars." },
    { q: "Quel pattern cible les hôtes du groupe <code>windows</code> qui sont aussi dans <code>tier1</code> ?", options: ["<code>windows,tier1</code>", "<code>windows:tier1</code>", "<code>windows:&amp;tier1</code>", "<code>windows:!tier1</code>"], answer: 2, explain: "<code>:&amp;</code> = intersection." },
    { q: "Que fait <code>ansible-playbook site.yml --check --diff</code> ?", options: ["Vérifie la syntaxe seulement", "Simule l'exécution et montre les modifications de fichiers qui seraient faites", "Applique puis annule", "Compare deux playbooks"], answer: 1, explain: "Pour la syntaxe seule, c'est <code>--syntax-check</code>." },
    { q: "Une valeur YAML commence par une expression Jinja2. Laquelle est valide ?", options: ["<code>dest: {{ base_dir }}/app</code>", "<code>dest: \"{{ base_dir }}/app\"</code>", "<code>dest: ${base_dir}/app</code>", "<code>dest: {base_dir}/app</code>"], answer: 1, explain: "Sans guillemets, YAML lit <code>{</code> comme un dictionnaire." },
    { q: "Comment garder un mot de passe hors de la sortie d'Ansible, même en <code>-vvv</code> ?", options: ["Le chiffrer avec Vault suffit", "<code>no_log: true</code> sur la tâche", "Utiliser <code>debug</code> avec verbosity 0", "Le mettre dans host_vars"], answer: 1, explain: "Vault protège au repos ; à l'exécution la valeur est déchiffrée et peut apparaître dans les logs sans <code>no_log</code>." },
    { q: "Tu dois redémarrer 60 serveurs d'un cluster sans perdre le quorum (max 3 à la fois). Que choisis-tu ?", options: ["<code>forks: 3</code>", "<code>serial: 3</code>", "<code>strategy: free</code>", "<code>async: 3</code>"], answer: 1, explain: "forks limite le parallélisme par tâche, mais toutes les machines avancent ensemble tâche après tâche ; serial garantit que seules 3 machines sont dans le play à la fois." },
    { q: "Différence entre <code>import_tasks</code> et <code>include_tasks</code> ?", options: ["Aucune", "import est statique (chargement), include est dynamique (exécution)", "include est plus rapide", "import ne fonctionne qu'avec des rôles"], answer: 1, explain: "C'est pourquoi les tags et <code>--list-tasks</code> voient le contenu d'un import mais pas celui d'un include." },
    { q: "Le module <code>ansible.builtin.ping</code> échoue sur un serveur Windows. Pourquoi ?", options: ["WinRM est désactivé", "Il a besoin de Python sur la cible ; il faut <code>ansible.windows.win_ping</code>", "Le pare-feu bloque ICMP", "Le compte n'est pas admin"], answer: 1, explain: "Les modules builtin sont écrits en Python ; les modules Windows sont en PowerShell." },
    { q: "Quelle option rend un déploiement SSH nettement plus rapide en supprimant la copie des modules sur disque ?", options: ["<code>gather_facts: true</code>", "<code>pipelining = True</code>", "<code>host_key_checking = False</code>", "<code>forks = 1</code>"], answer: 1, explain: "Pipelining envoie le module par l'entrée standard de la session SSH." },
    { q: "Ton rôle passe <code>molecule converge</code> mais échoue à l'étape <code>idempotence</code>. Qu'est-ce que ça signifie ?", options: ["Le conteneur n'a pas démarré", "Au moins une tâche affiche changed au second passage", "Les tests verify échouent", "Une collection manque"], answer: 1, explain: "Typiquement un <code>command</code>/<code>shell</code> sans <code>changed_when</code>, ou un template qui contient une date." },
    { q: "Un collègue veut un compte Domain Admin unique pour qu'Ansible gère tous les serveurs et postes. Ta réponse ?", options: ["Bonne idée, c'est plus simple", "Refuser : un compte et un contrôleur par tier, sinon une compromission d'un poste Tier 2 donne le domaine", "Accepter si le mot de passe est dans Vault", "Accepter s'il est membre de Protected Users"], answer: 1, explain: "Le compte d'automatisation qui se connecte à un actif Tier 2 y expose ses identifiants : il ne doit pas avoir de droits Tier 0." },
    { q: "Comment exécuter une tâche sur un autre hôte que celui du play (par exemple déclarer le serveur dans le DNS du DC) ?", options: ["<code>hosts:</code> dans la tâche", "<code>delegate_to: dc01</code>", "<code>run_once: true</code>", "<code>local_action</code> uniquement"], answer: 1, explain: "<code>delegate_to</code> exécute la tâche ailleurs tout en gardant les variables de l'hôte courant." },
    { q: "Dans un template, quelle expression liste les IP de tous les serveurs du groupe <code>app</code> ?", options: ["<code>{{ app.ip }}</code>", "<code>{% for h in groups['app'] %}{{ hostvars[h]['ansible_host'] }}{% endfor %}</code>", "<code>{{ inventory_hostname }}</code>", "<code>{{ ansible_facts['app'] }}</code>"], answer: 1, explain: "<code>groups</code> et <code>hostvars</code> sont les deux variables magiques à connaître pour les configs multi-serveurs." },
    { q: "Quelle est la priorité la plus haute ?", options: ["host_vars", "vars du rôle (vars/main.yml)", "extra-vars <code>-e</code>", "group_vars/all"], answer: 2, explain: "Les extra-vars gagnent toujours." },
    { q: "Tu veux être sûr qu'un fichier de config Apache est valide avant de le poser. Option du module template ?", options: ["<code>backup: true</code>", "<code>validate: apachectl -t -f %s</code>", "<code>force: false</code>", "<code>check_mode: true</code>"], answer: 1, explain: "<code>%s</code> est remplacé par le chemin du fichier temporaire." },
    { q: "Un module renvoie <code>rc=1</code> qui, pour ce script, signifie « rien à faire ». Comment l'exprimer ?", options: ["<code>ignore_errors: true</code>", "<code>failed_when: result.rc not in [0, 1]</code> et <code>changed_when: result.rc == 0</code>", "<code>rescue:</code>", "<code>until: result.rc == 1</code>"], answer: 1, explain: "ignore_errors masquerait aussi les vraies erreurs (rc=2, 127…)." },
    { q: "Dans AWX, comment permettre au support de lancer un playbook sans lui donner le mot de passe du compte de service ?", options: ["Lui envoyer le vault", "Credential stocké dans AWX + Job Template + rôle Execute sur ce template", "Un compte partagé", "Un script sur son poste"], answer: 1, explain: "Le RBAC d'AWX sépare le droit d'exécuter du droit de voir le secret." },
    { q: "Quelle commande installe toutes les collections listées dans un fichier ?", options: ["<code>pip install -r requirements.yml</code>", "<code>ansible-galaxy collection install -r requirements.yml</code>", "<code>ansible-playbook requirements.yml</code>", "<code>ansible-doc -r requirements.yml</code>"], answer: 1, explain: "" },
    { q: "Une tâche doit s'exécuter une seule fois pour tout le groupe (une migration de base). Que mets-tu ?", options: ["<code>serial: 1</code>", "<code>run_once: true</code>", "<code>throttle: 1</code>", "<code>when: inventory_hostname == 1</code>"], answer: 1, explain: "Combine-le avec <code>delegate_to</code> pour choisir l'hôte qui l'exécute." },
  ],

  /* ==================== ANTISÈCHE ==================== */
  cheat: [
    { title: "Ad-hoc", rows: [
      ["ansible all -m ping", "tester connexion + Python"],
      ["ansible windows -m ansible.windows.win_ping", "tester un Windows"],
      ["ansible web -m service -a \"name=nginx state=restarted\" -b", "action ponctuelle en root"],
      ["ansible db -m setup -a \"filter=ansible_mem*\"", "lire des facts"],
      ["ansible all -m command -a \"uptime\" -f 30", "30 hôtes en parallèle"],
    ] },
    { title: "Playbooks", rows: [
      ["ansible-playbook site.yml --syntax-check", "vérifier la syntaxe"],
      ["ansible-playbook site.yml --check --diff", "simuler et voir les différences"],
      ["ansible-playbook site.yml -l srv-web01", "limiter à un hôte"],
      ["ansible-playbook site.yml --tags ssh", "seulement certaines tâches"],
      ["ansible-playbook site.yml --list-tasks", "voir ce qui va tourner"],
      ["ansible-playbook site.yml --start-at-task \"Nom\"", "reprendre à une tâche"],
      ["ansible-playbook site.yml -e \"version=2.1\"", "variable prioritaire"],
    ] },
    { title: "Inventaire", rows: [
      ["ansible-inventory --graph", "arbre des groupes"],
      ["ansible-inventory --host srv-db01", "variables d'un hôte"],
      ["web:db", "union"], ["linux:&prod", "intersection"], ["linux:!db", "exclusion"],
    ] },
    { title: "Vault", rows: [
      ["ansible-vault create|edit|view f.yml", "gérer un fichier chiffré"],
      ["ansible-vault encrypt|decrypt f.yml", "chiffrer / déchiffrer"],
      ["ansible-vault rekey f.yml", "changer le mot de passe"],
      ["ansible-vault encrypt_string 'x' --name v", "chiffrer une valeur"],
      ["--ask-vault-pass / --vault-password-file", "fournir le mot de passe"],
      ["no_log: true", "masquer une tâche sensible"],
    ] },
    { title: "Mots-clés de tâche", rows: [
      ["when:", "condition (sans {{ }})"], ["loop: / loop_control:", "boucle"],
      ["register:", "capturer le résultat"], ["notify: / handlers:", "réagir à un changement"],
      ["changed_when: / failed_when:", "redéfinir changed / failed"],
      ["block: rescue: always:", "try / catch / finally"],
      ["delegate_to: / run_once:", "exécuter ailleurs / une seule fois"],
      ["become: / become_user:", "élévation de privilèges"],
    ] },
    { title: "Rôles et outillage", rows: [
      ["ansible-galaxy role init roles/x", "squelette de rôle"],
      ["ansible-galaxy collection install -r req.yml", "installer les dépendances"],
      ["ansible-doc -s ansible.builtin.copy", "exemple d'un module"],
      ["ansible-lint --profile production", "contrôle qualité"],
      ["molecule test", "test complet d'un rôle"],
      ["serial: \"20%\" / max_fail_percentage:", "déploiement par vagues"],
    ] },
  ],
};
