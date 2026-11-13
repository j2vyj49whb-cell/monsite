window.COURSES = window.COURSES || {};
window.COURSES.terraform = {
  id: "terraform",
  title: "Terraform",
  glyph: "Tf",
  hours: 8,
  certTitle: "Ingénieur Infrastructure as Code Terraform",
  tagline: "Décrire réseaux, VM et services cloud en code, planifier chaque changement avant de l'appliquer.",
  desc: "HCL, providers, plan et apply, variables, boucles, state distant et verrouillage, import, modules, environnements, pipeline CI/CD, politiques et tests. Avec la passerelle vers Ansible pour la configuration.",
  tags: ["HCL", "plan/apply", "state", "modules", "for_each", "CI/CD", "OpenTofu"],
  lessons: [
    /* ------------------------------------------------------------------ */
    {
      id: "l1", part: "Fondations", title: "Infrastructure as Code et Terraform", duration: 15,
      summary: "Déclaratif, providers, state, graphe de dépendances. Terraform face à Ansible.",
      objectives: ["Expliquer ce que fait Terraform et ce qu'il ne fait pas", "Comprendre le rôle du state", "Savoir quand choisir Terraform, Ansible, ou les deux"],
      blocks: [
        { t: "h2", text: "Le principe" },
        { t: "p", html: "Tu écris l'infrastructure voulue (un réseau, trois VM, un équilibreur) dans des fichiers <code>.tf</code>. Terraform compare cette description à ce qui existe réellement, calcule un <strong>plan</strong> (créer, modifier, détruire) et l'applique via l'API du fournisseur (Azure, AWS, vSphere, Nutanix, Proxmox, Cloudflare, Entra ID…)." },
        { t: "figure", caption: "Terraform compare trois choses : ton code (état voulu), le state (ce qu'il a déjà créé) et la réalité lue par l'API.", svg: `
<svg viewBox="0 0 720 230" role="img" aria-label="Fonctionnement de Terraform">
  <rect x="20" y="30" width="170" height="70" rx="12" style="fill:var(--terraform-soft);stroke:var(--terraform)"/>
  <text x="105" y="60" text-anchor="middle" font-weight="600">Code .tf</text><text x="105" y="82" text-anchor="middle" font-size="12" class="muted">état voulu</text>
  <rect x="20" y="130" width="170" height="70" rx="12" style="fill:var(--surface);stroke:var(--line)"/>
  <text x="105" y="160" text-anchor="middle" font-weight="600">State</text><text x="105" y="182" text-anchor="middle" font-size="12" class="muted">terraform.tfstate</text>
  <rect x="270" y="75" width="180" height="80" rx="40" style="fill:var(--surface-2);stroke:var(--terraform)"/>
  <text x="360" y="110" text-anchor="middle" font-weight="600">terraform plan</text><text x="360" y="132" text-anchor="middle" font-size="12" class="muted">calcule les écarts</text>
  <rect x="530" y="75" width="170" height="80" rx="12" style="fill:var(--surface);stroke:var(--line)"/>
  <text x="615" y="108" text-anchor="middle" font-weight="600">API fournisseur</text><text x="615" y="130" text-anchor="middle" font-size="12" class="muted">Azure, vSphere, Nutanix…</text>
  <line x1="190" y1="65" x2="270" y2="105" style="stroke:var(--fg-3)" stroke-width="2"/>
  <line x1="190" y1="165" x2="270" y2="125" style="stroke:var(--fg-3)" stroke-width="2"/>
  <line x1="450" y1="105" x2="530" y2="105" style="stroke:var(--fg-3)" stroke-width="2"/>
  <line x1="530" y1="125" x2="450" y2="125" style="stroke:var(--fg-3)" stroke-width="2" stroke-dasharray="4 4"/>
  <text x="490" y="98" text-anchor="middle" font-size="11" class="muted">apply</text>
  <text x="490" y="145" text-anchor="middle" font-size="11" class="muted">refresh</text>
</svg>` },
        { t: "h2", text: "Terraform ou Ansible ?" },
        { t: "table", head: ["", "Terraform", "Ansible"], rows: [
          ["Rôle principal", "<strong>provisionner</strong> : créer la VM, le réseau, le DNS", "<strong>configurer</strong> : ce qu'il y a dans la VM"],
          ["Approche", "déclarative avec state", "déclarative par module, procédurale par playbook"],
          ["Mémoire", "un fichier de state", "aucune : il relit la cible à chaque fois"],
          ["Suppression", "retirer le bloc = détruire la ressource", "il faut écrire <code>state: absent</code>"],
          ["Cas typique", "landing zone Azure, VM vSphere", "durcissement, patching, déploiement applicatif"],
        ] },
        { t: "callout", kind: "pro", html: "En entreprise on combine : Terraform crée la VM et l'enregistre dans le DNS, puis Ansible la configure (leçon 10). On ne fait pas de configuration fine d'OS avec Terraform, ni de création de réseau cloud avec Ansible." },
        { t: "callout", kind: "tip", title: "Terraform et OpenTofu", html: "Depuis 2023, Terraform est sous licence BSL. <strong>OpenTofu</strong> est le fork libre, maintenu par la Linux Foundation, compatible avec la même syntaxe (commande <code>tofu</code> au lieu de <code>terraform</code>). Tout ce module s'applique aux deux." },
        { t: "quiz", q: "Tu supprimes un bloc <code>resource \"azurerm_linux_virtual_machine\" \"web\"</code> de ton code et tu lances apply. Que se passe-t-il ?", options: ["Rien : Terraform ne supprime jamais", "La VM est détruite, car elle est dans le state mais plus dans le code", "Terraform demande de supprimer la VM à la main", "La VM est arrêtée mais conservée"], answer: 1, explain: "Le code est la source de vérité. Pour sortir une ressource de Terraform sans la détruire, on utilise un bloc <code>removed</code> ou <code>terraform state rm</code> (leçon 7)." },
        { t: "classify", task: "Quel outil est le plus adapté ?", buckets: ["Terraform", "Ansible"], items: [
          { t: "Créer un réseau virtuel Azure avec 3 sous-réseaux et des NSG", b: 0 },
          { t: "Désactiver SMBv1 sur 80 serveurs Windows", b: 1 },
          { t: "Créer 5 VM sur un cluster vSphere ou Nutanix", b: 0 },
          { t: "Déployer une nouvelle version d'application et redémarrer IIS", b: 1 },
          { t: "Créer des groupes et des applications dans Entra ID", b: 0, why: "Provider <code>azuread</code>. Ansible le peut aussi, mais le cycle de vie déclaratif de Terraform est plus adapté aux objets cloud." },
          { t: "Appliquer les correctifs mensuels", b: 1 },
        ] },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l2", part: "Fondations", title: "HCL et premier projet", duration: 25,
      summary: "Blocs terraform, provider, resource. Arguments, attributs, références.",
      objectives: ["Lire et écrire la syntaxe HCL", "Déclarer et épingler un provider", "Créer une ressource et référencer ses attributs"],
      blocks: [
        { t: "h2", text: "La syntaxe HCL" },
        { t: "code", lang: "hcl", title: "main.tf", code: `
terraform {
  required_version = ">= 1.6"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"          # >= 4.0 et < 5.0
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = "00000000-0000-0000-0000-000000000000"
}

#   type de ressource          nom local (dans le code)
resource "azurerm_resource_group" "infra" {
  name     = "rg-infra-prod-frc"
  location = "francecentral"
  tags = {
    owner = "equipe-infra"
    env   = "prod"
  }
}

resource "azurerm_virtual_network" "hub" {
  name                = "vnet-hub-prod"
  address_space       = ["10.10.0.0/16"]
  location            = azurerm_resource_group.infra.location   # référence
  resource_group_name = azurerm_resource_group.infra.name
}` },
        { t: "list", items: [
          "Un <strong>bloc</strong> : un type (<code>resource</code>), des étiquettes, un corps entre accolades.",
          "Un <strong>argument</strong> : <code>nom = valeur</code>. Types : chaîne, nombre, booléen, liste <code>[ ]</code>, map <code>{ }</code>.",
          "Une <strong>référence</strong> : <code>TYPE.NOM.ATTRIBUT</code>. Elle crée une dépendance implicite : le VNet attend le groupe de ressources.",
          "Le nom local (<code>infra</code>) n'existe que dans le code. Le nom réel dans Azure est l'argument <code>name</code>.",
        ] },
        { t: "h2", text: "Contraintes de version" },
        { t: "table", head: ["Contrainte", "Accepte"], rows: [
          ["<code>= 4.2.0</code>", "exactement 4.2.0"],
          ["<code>~> 4.2</code>", "4.2, 4.3… mais pas 5.0"],
          ["<code>~> 4.2.0</code>", "4.2.x uniquement"],
          ["<code>>= 4.0, < 4.10</code>", "intervalle explicite"],
        ] },
        { t: "callout", kind: "pro", title: ".terraform.lock.hcl", html: "Après <code>terraform init</code>, ce fichier enregistre la version exacte et les empreintes de chaque provider. <strong>Commite-le</strong> : toute l'équipe et la CI utilisent ainsi les mêmes binaires. Ne commite jamais le dossier <code>.terraform/</code> ni les fichiers <code>*.tfstate</code>." },
        { t: "quiz", q: "Comment référencer l'identifiant du VNet <code>hub</code> défini ci-dessus ?", options: ["<code>\"vnet-hub-prod\".id</code>", "<code>azurerm_virtual_network.hub.id</code>", "<code>resource.hub.id</code>", "<code>var.hub.id</code>"], answer: 1, explain: "Forme générale : <code>type.nom_local.attribut</code>." },
        { t: "editor", task: "Ajoute un sous-réseau <code>azurerm_subnet</code> nommé localement <code>admin</code>, nom Azure <code>snet-admin-t0</code>, plage <code>10.10.0.0/24</code>, rattaché au groupe de ressources et au VNet <code>hub</code> par <strong>références</strong> (pas de texte en dur).", lang: "hcl",
          starter: `
resource "azurerm_subnet" "admin" {

}
`,
          checks: [
            { re: /name\s*=\s*"snet-admin-t0"/, label: "<code>name = \"snet-admin-t0\"</code>" },
            { re: /resource_group_name\s*=\s*azurerm_resource_group\.infra\.name/, label: "<code>resource_group_name</code> par référence" },
            { re: /virtual_network_name\s*=\s*azurerm_virtual_network\.hub\.name/, label: "<code>virtual_network_name</code> par référence" },
            { re: /address_prefixes\s*=\s*\[\s*"10\.10\.0\.0\/24"\s*\]/, label: "<code>address_prefixes = [\"10.10.0.0/24\"]</code> (une liste)" },
          ],
          solution: `
resource "azurerm_subnet" "admin" {
  name                 = "snet-admin-t0"
  resource_group_name  = azurerm_resource_group.infra.name
  virtual_network_name = azurerm_virtual_network.hub.name
  address_prefixes     = ["10.10.0.0/24"]
}
` },
        { t: "quiz", q: "Quel fichier faut-il versionner dans Git ?", options: ["<code>.terraform/</code>", "<code>terraform.tfstate</code>", "<code>.terraform.lock.hcl</code>", "<code>terraform.tfstate.backup</code>"], answer: 2, explain: "Le lock file garantit des versions de providers identiques. Le state contient souvent des secrets en clair et ne va jamais dans Git." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l3", part: "Fondations", title: "Le workflow init, plan, apply", duration: 25,
      summary: "Les commandes du quotidien, lire un plan, plan enregistré, destroy.",
      objectives: ["Enchaîner init, fmt, validate, plan, apply", "Lire les symboles d'un plan (+, ~, -/+, -)", "Appliquer exactement le plan relu"],
      blocks: [
        { t: "term", ps: "admin@ctrl:~/infra$", task: "Initialise le répertoire de travail (téléchargement des providers).", steps: [
          { accept: [/^terraform\s+init\s*$/, /^tofu\s+init\s*$/], hint: "Première commande, toujours.", solution: "terraform init",
            output: `Initializing the backend...
Initializing provider plugins...
- Finding hashicorp/azurerm versions matching "~> 4.0"...
- Installing hashicorp/azurerm v4.14.0...
- Installed hashicorp/azurerm v4.14.0 (signed by HashiCorp)
Terraform has created a lock file .terraform.lock.hcl
<span class="okc">Terraform has been successfully initialized!</span>` },
          { ask: "Formate les fichiers selon la convention officielle.", accept: [/^(terraform|tofu)\s+fmt(\s+-recursive)?\s*$/], hint: "<code>terraform fmt</code>", solution: "terraform fmt",
            output: `main.tf` },
          { ask: "Vérifie la validité de la configuration (syntaxe, références, types).", accept: [/^(terraform|tofu)\s+validate\s*$/], hint: "<code>terraform validate</code>", solution: "terraform validate",
            output: `<span class="okc">Success! The configuration is valid.</span>` },
          { ask: "Calcule le plan et enregistre-le dans le fichier <code>tfplan</code>.", accept: [/^(terraform|tofu)\s+plan\s+(-out[= ]?\s*tfplan|-out=tfplan)\s*$/], hint: "Option <code>-out=tfplan</code>.", solution: "terraform plan -out=tfplan",
            output: `Terraform will perform the following actions:

  <span class="okc"># azurerm_resource_group.infra will be created
  + resource "azurerm_resource_group" "infra" {
      + id       = (known after apply)
      + location = "francecentral"
      + name     = "rg-infra-prod-frc"
    }</span>

  <span class="okc"># azurerm_virtual_network.hub will be created
  + resource "azurerm_virtual_network" "hub" {
      + address_space = ["10.10.0.0/16"]
      + name          = "vnet-hub-prod"
      ...
    }</span>

Plan: <span class="okc">2 to add</span>, 0 to change, 0 to destroy.

Saved the plan to: tfplan` },
          { ask: "Applique <strong>exactement</strong> ce plan enregistré.", accept: [/^(terraform|tofu)\s+apply\s+tfplan\s*$/], hint: "<code>terraform apply</code> suivi du fichier de plan.", solution: "terraform apply tfplan",
            near: [{ re: /^(terraform|tofu)\s+apply\s*$/, msg: "Sans le fichier, Terraform recalcule un nouveau plan qui peut différer de celui que tu as relu. Passe tfplan." }],
            output: `azurerm_resource_group.infra: Creating...
azurerm_resource_group.infra: Creation complete after 2s [id=/subscriptions/…/resourceGroups/rg-infra-prod-frc]
azurerm_virtual_network.hub: Creating...
azurerm_virtual_network.hub: Creation complete after 5s

<span class="okc">Apply complete! Resources: 2 added, 0 changed, 0 destroyed.</span>` },
        ], explain: "Avec un plan enregistré, ce qui est appliqué est exactement ce qui a été relu, sans nouvelle confirmation. C'est la base de tout pipeline sérieux.", xp: 35 },
        { t: "h2", text: "Lire un plan" },
        { t: "table", head: ["Symbole", "Signification", "Risque"], rows: [
          ["<code>+</code>", "création", "faible"],
          ["<code>~</code>", "modification sur place", "variable"],
          ["<code>-/+</code>", "<strong>destruction puis recréation</strong> (argument qui force un remplacement)", "<strong>élevé</strong> : perte de données, nouvelle IP"],
          ["<code>+/-</code>", "création puis destruction (<code>create_before_destroy</code>)", "moyen"],
          ["<code>-</code>", "destruction", "élevé"],
          ["<code>&lt;=</code>", "lecture d'une data source", "nul"],
        ] },
        { t: "code", lang: "text", title: "Extrait de plan à repérer", code: `
  # azurerm_linux_virtual_machine.db must be replaced
-/+ resource "azurerm_linux_virtual_machine" "db" {
      ~ size = "Standard_D2s_v5" -> "Standard_D4s_v5"
      ~ zone = "1" -> "2" # forces replacement
    }
Plan: 1 to add, 0 to change, 1 to destroy.` },
        { t: "callout", kind: "danger", title: "Lis toujours la dernière ligne", html: "<code>1 to destroy</code> sur une base de données doit te faire arrêter immédiatement. Ici, c'est le changement de zone qui force la recréation, pas le changement de taille. Ajoute <code>lifecycle { prevent_destroy = true }</code> sur les ressources critiques (leçon 6)." },
        { t: "order", task: "Remets le workflow quotidien dans l'ordre.", items: ["terraform init", "terraform fmt", "terraform validate", "terraform plan -out=tfplan", "relecture du plan (humaine ou en pull request)", "terraform apply tfplan"] },
        { t: "quiz", q: "Quelle commande supprime toutes les ressources gérées par la configuration ?", options: ["<code>terraform delete</code>", "<code>terraform destroy</code>", "<code>terraform apply -remove</code>", "<code>terraform state clean</code>"], answer: 1, explain: "<code>destroy</code> = <code>apply -destroy</code>. Pour une seule ressource : <code>terraform destroy -target=…</code>, à réserver aux urgences." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l4", part: "Le langage", title: "Variables, outputs et locals", duration: 30,
      summary: "Types, validation, sensitive, tfvars, priorités, outputs.",
      objectives: ["Déclarer des variables typées et validées", "Fournir des valeurs par fichier tfvars, environnement ou ligne de commande", "Exposer des sorties", "Factoriser avec locals"],
      blocks: [
        { t: "code", lang: "hcl", title: "variables.tf", code: `
variable "env" {
  description = "Environnement cible"
  type        = string
  validation {
    condition     = contains(["dev", "preprod", "prod"], var.env)
    error_message = "env doit valoir dev, preprod ou prod."
  }
}

variable "vm_count" {
  type    = number
  default = 2
}

variable "subnets" {
  type = map(object({
    cidr = string
    tier = number
  }))
}

variable "admin_password" {
  type      = string
  sensitive = true          # masqué dans plan et apply
}` },
        { t: "h2", text: "Donner une valeur" },
        { t: "p", html: "Du plus faible au plus fort : valeur <code>default</code>, variable d'environnement <code>TF_VAR_nom</code>, fichier <code>terraform.tfvars</code>, fichiers <code>*.auto.tfvars</code>, puis <code>-var-file</code> et <code>-var</code> sur la ligne de commande (dans l'ordre où ils sont passés)." },
        { t: "code", lang: "hcl", title: "prod.tfvars", code: `
env      = "prod"
vm_count = 3
subnets = {
  admin = { cidr = "10.10.0.0/24", tier = 0 }
  srv   = { cidr = "10.10.1.0/24", tier = 1 }
  wks   = { cidr = "10.10.2.0/24", tier = 2 }
}` },
        { t: "code", lang: "bash", code: `
export TF_VAR_admin_password="$(vault kv get -field=pwd secret/infra/vm)"
terraform plan -var-file=prod.tfvars -out=tfplan` },
        { t: "h2", text: "locals et outputs" },
        { t: "code", lang: "hcl", code: `
locals {
  prefix      = "\${var.env}-frc"
  common_tags = {
    env        = var.env
    managed_by = "terraform"
  }
}

output "vnet_id" {
  value       = azurerm_virtual_network.hub.id
  description = "Identifiant du VNet hub, utilisé par les autres stacks"
}` },
        { t: "callout", kind: "warn", title: "sensitive ne chiffre rien", html: "<code>sensitive = true</code> masque la valeur à l'écran. Elle est quand même écrite <strong>en clair</strong> dans le state. D'où l'importance d'un backend chiffré à accès restreint (leçon 7), ou des arguments <em>write-only</em> des providers récents qui n'écrivent jamais la valeur dans le state." },
        { t: "editor", task: "Déclare une variable <code>location</code> de type <code>string</code>, valeur par défaut <code>francecentral</code>, avec une validation qui n'accepte que <code>francecentral</code> ou <code>westeurope</code>.", lang: "hcl",
          starter: `
variable "location" {

}
`,
          checks: [
            { re: /type\s*=\s*string/, label: "<code>type = string</code>" },
            { re: /default\s*=\s*"francecentral"/, label: "<code>default = \"francecentral\"</code>" },
            { re: /validation\s*\{/, label: "Bloc <code>validation</code>" },
            { re: /condition\s*=\s*contains\(\s*\[\s*"(francecentral|westeurope)"\s*,\s*"(francecentral|westeurope)"\s*\]\s*,\s*var\.location\s*\)/, label: "<code>condition = contains([...], var.location)</code>" },
            { re: /error_message\s*=\s*".+\."/, label: "<code>error_message</code> (phrase terminée par un point)" },
          ],
          solution: `
variable "location" {
  type    = string
  default = "francecentral"
  validation {
    condition     = contains(["francecentral", "westeurope"], var.location)
    error_message = "La région doit être francecentral ou westeurope."
  }
}
` },
        { t: "quiz", q: "<code>env</code> est défini dans <code>terraform.tfvars</code> (\"dev\") et passé en <code>-var=\"env=prod\"</code>. Valeur retenue ?", options: ["dev", "prod", "Erreur de conflit", "La valeur par défaut"], answer: 1, explain: "La ligne de commande passe devant les fichiers tfvars chargés automatiquement." },
        { t: "term", ps: "admin@ctrl:~/infra$", task: "Affiche la valeur de la sortie <code>vnet_id</code>, brute, sans guillemets (pratique dans un script).", steps: [
          { accept: [/^(terraform|tofu)\s+output\s+-raw\s+vnet_id\s*$/], hint: "<code>terraform output</code> avec l'option <code>-raw</code>.", solution: "terraform output -raw vnet_id",
            output: `/subscriptions/00000000-…/resourceGroups/rg-infra-prod-frc/providers/Microsoft.Network/virtualNetworks/vnet-hub-prod` },
        ] },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l5", part: "Le langage", title: "Data sources, dépendances et fonctions", duration: 25,
      summary: "Lire l'existant, graphe implicite, depends_on, fonctions utiles, expressions for.",
      objectives: ["Lire une ressource existante avec un bloc data", "Comprendre le graphe de dépendances", "Utiliser les fonctions et expressions for courantes"],
      blocks: [
        { t: "h2", text: "data : lire sans gérer" },
        { t: "code", lang: "hcl", code: `
# Le Key Vault a été créé par une autre équipe : on le lit, on ne le gère pas.
data "azurerm_key_vault" "secu" {
  name                = "kv-secu-prod"
  resource_group_name = "rg-secu-prod"
}

data "azurerm_key_vault_secret" "join" {
  name         = "ad-join-password"
  key_vault_id = data.azurerm_key_vault.secu.id
}

# Image la plus récente
data "azurerm_platform_image" "win2022" {
  location  = var.location
  publisher = "MicrosoftWindowsServer"
  offer     = "WindowsServer"
  sku       = "2022-datacenter-azure-edition"
}` },
        { t: "h2", text: "Le graphe de dépendances" },
        { t: "p", html: "Chaque référence crée une arête dans un graphe. Terraform crée en parallèle tout ce qui ne dépend de rien (10 ressources à la fois par défaut, réglable par <code>-parallelism</code>) et détruit dans l'ordre inverse. <code>depends_on</code> ne sert que pour une dépendance <strong>invisible</strong> dans le code." },
        { t: "code", lang: "hcl", code: `
resource "azurerm_role_assignment" "vm_reader" {
  scope                = azurerm_storage_account.logs.id
  role_definition_name = "Storage Blob Data Reader"
  principal_id         = azurerm_linux_virtual_machine.app.identity[0].principal_id
}

resource "azurerm_virtual_machine_extension" "bootstrap" {
  # le script lit le stockage dès le démarrage : il faut que le droit existe avant
  depends_on = [azurerm_role_assignment.vm_reader]
  # ...
}` },
        { t: "term", ps: "admin@ctrl:~/infra$", task: "Génère le graphe des dépendances au format DOT.", steps: [
          { accept: [/^(terraform|tofu)\s+graph(\s*\|.*|\s*>\s*\S+)?\s*$/], hint: "<code>terraform graph</code>", solution: "terraform graph | dot -Tsvg > graph.svg",
            output: `digraph G {
  rankdir = "RL";
  "azurerm_virtual_network.hub" -> "azurerm_resource_group.infra";
  "azurerm_subnet.admin" -> "azurerm_virtual_network.hub";
  "azurerm_subnet.admin" -> "azurerm_resource_group.infra";
}` },
        ] },
        { t: "h2", text: "Fonctions et expressions utiles" },
        { t: "table", head: ["Expression", "Résultat"], rows: [
          ["<code>cidrsubnet(\"10.10.0.0/16\", 8, 2)</code>", "<code>\"10.10.2.0/24\"</code>"],
          ["<code>merge(local.common_tags, { role = \"web\" })</code>", "fusion de maps"],
          ["<code>lookup(var.sizes, var.env, \"Standard_B2s\")</code>", "valeur de map avec défaut"],
          ["<code>try(var.cfg.dns, [\"10.0.0.4\"])</code>", "valeur de repli si l'accès échoue"],
          ["<code>format(\"vm-%s-%02d\", var.env, 3)</code>", "<code>\"vm-prod-03\"</code>"],
          ["<code>[for s in var.subnets : s.cidr]</code>", "liste des CIDR"],
          ["<code>{ for k, s in var.subnets : k => s if s.tier == 0 }</code>", "map filtrée (tier 0 seulement)"],
          ["<code>var.env == \"prod\" ? 3 : 1</code>", "condition ternaire"],
          ["<code>templatefile(\"cloud-init.tftpl\", { fqdn = … })</code>", "rendre un fichier modèle"],
        ] },
        { t: "term", ps: "admin@ctrl:~/infra$", task: "Ouvre la console interactive pour tester des expressions.", steps: [
          { accept: [/^(terraform|tofu)\s+console\s*$/], hint: "<code>terraform console</code>", solution: "terraform console", output: `<span class="dim">(console interactive ouverte)</span>` },
          { ask: "Calcule le 3e sous-réseau en /24 de <code>10.10.0.0/16</code> (index 2) avec <code>cidrsubnet</code>.", accept: [/^cidrsubnet\(\s*"10\.10\.0\.0\/16"\s*,\s*8\s*,\s*2\s*\)\s*$/], hint: "Passer de /16 à /24, c'est ajouter 8 bits.", solution: "cidrsubnet(\"10.10.0.0/16\", 8, 2)", output: `"10.10.2.0/24"` },
        ] },
        { t: "quiz", q: "Quand faut-il utiliser <code>depends_on</code> ?", options: ["Sur toutes les ressources, par sécurité", "Quand une dépendance existe réellement mais n'apparaît dans aucune référence", "Pour accélérer l'apply", "Pour créer les ressources dans l'ordre du fichier"], answer: 1, explain: "Un depends_on inutile ralentit le plan et rend certaines valeurs inconnues jusqu'à l'apply. Les références suffisent dans 95 % des cas." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l6", part: "Le langage", title: "count, for_each, dynamic et lifecycle", duration: 35,
      summary: "Multiplier les ressources sans copier-coller, protéger les ressources critiques.",
      objectives: ["Choisir entre count et for_each", "Générer des sous-blocs avec dynamic", "Protéger et contrôler le cycle de vie avec lifecycle"],
      blocks: [
        { t: "h2", text: "count" },
        { t: "code", lang: "hcl", code: `
resource "azurerm_network_interface" "web" {
  count               = var.vm_count
  name                = "nic-web-\${count.index + 1}"
  location            = var.location
  resource_group_name = azurerm_resource_group.infra.name
  ip_configuration {
    name                          = "ipconfig"
    subnet_id                     = azurerm_subnet.srv.id
    private_ip_address_allocation = "Dynamic"
  }
}
# adresse : azurerm_network_interface.web[0], web[1]...` },
        { t: "h2", text: "for_each" },
        { t: "code", lang: "hcl", code: `
resource "azurerm_subnet" "this" {
  for_each             = var.subnets          # map : admin, srv, wks
  name                 = "snet-\${each.key}"
  resource_group_name  = azurerm_resource_group.infra.name
  virtual_network_name = azurerm_virtual_network.hub.name
  address_prefixes     = [each.value.cidr]
}
# adresse : azurerm_subnet.this["admin"], this["srv"]...` },
        { t: "callout", kind: "danger", title: "Le piège de count avec une liste", html: "Avec <code>count = length(var.users)</code>, si tu retires le premier élément de la liste, tous les index se décalent : Terraform veut <strong>modifier ou recréer toutes</strong> les ressources suivantes. Avec <code>for_each</code>, chaque ressource est identifiée par sa clé : seule celle retirée est détruite. Règle : <code>count</code> pour « N copies identiques » ou un interrupteur (<code>count = var.enable ? 1 : 0</code>), <code>for_each</code> pour tout le reste." },
        { t: "quiz", q: "Tu gères 3 comptes de stockage avec <code>count</code> sur la liste <code>[\"logs\", \"backup\", \"archive\"]</code>. Tu retires <code>\"logs\"</code>. Que montre le plan ?", options: ["1 destruction (logs)", "Les index se décalent : backup et archive sont recréés sous un autre index, et le dernier est détruit", "Rien ne change", "Une erreur"], answer: 1, explain: "index 0 devient « backup », index 1 « archive », index 2 disparaît. Avec for_each sur <code>toset([...])</code>, seule la clé \"logs\" serait détruite." },
        { t: "h2", text: "dynamic" },
        { t: "code", lang: "hcl", code: `
variable "nsg_rules" {
  type = list(object({ name = string, priority = number, port = string, source = string }))
}

resource "azurerm_network_security_group" "srv" {
  name                = "nsg-srv-t1"
  location            = var.location
  resource_group_name = azurerm_resource_group.infra.name

  dynamic "security_rule" {
    for_each = var.nsg_rules
    content {
      name                       = security_rule.value.name
      priority                   = security_rule.value.priority
      direction                  = "Inbound"
      access                     = "Allow"
      protocol                   = "Tcp"
      source_port_range          = "*"
      destination_port_range     = security_rule.value.port
      source_address_prefix      = security_rule.value.source
      destination_address_prefix = "*"
    }
  }
}` },
        { t: "h2", text: "lifecycle" },
        { t: "code", lang: "hcl", code: `
resource "azurerm_mssql_database" "erp" {
  # ...
  lifecycle {
    prevent_destroy       = true                 # tout plan qui la détruit échoue
    create_before_destroy = false
    ignore_changes        = [tags["last_backup"]] # modifié par un outil externe
    replace_triggered_by  = []                   # recréer si une autre ressource change
  }
}` },
        { t: "editor", task: "Transforme cette ressource pour créer un groupe de ressources <strong>par élément</strong> de la variable <code>teams</code> (un <code>set(string)</code>), nommé <code>rg-&lt;équipe&gt;</code>, et empêche leur destruction.", lang: "hcl",
          starter: `
variable "teams" {
  type    = set(string)
  default = ["infra", "secu", "data"]
}

resource "azurerm_resource_group" "team" {
  name     = "rg-infra"
  location = "francecentral"
}
`,
          checks: [
            { re: /for_each\s*=\s*var\.teams/, label: "<code>for_each = var.teams</code>" },
            { re: /name\s*=\s*"rg-\$\{each\.(key|value)\}"/, label: "<code>name = \"rg-${each.key}\"</code>" },
            { re: /lifecycle\s*\{[^}]*prevent_destroy\s*=\s*true/s, label: "<code>lifecycle { prevent_destroy = true }</code>" },
            { re: /\bcount\s*=/, not: true, label: "Pas de <code>count</code>" },
          ],
          solution: `
variable "teams" {
  type    = set(string)
  default = ["infra", "secu", "data"]
}

resource "azurerm_resource_group" "team" {
  for_each = var.teams
  name     = "rg-\${each.key}"
  location = "francecentral"

  lifecycle {
    prevent_destroy = true
  }
}
` },
        { t: "classify", task: "count ou for_each ?", buckets: ["count", "for_each"], items: [
          { t: "Créer ou non un bastion selon <code>var.enable_bastion</code>", b: 0 },
          { t: "Un sous-réseau par entrée d'une map <code>subnets</code>", b: 1 },
          { t: "Les comptes utilisateurs d'une liste qui évolue souvent", b: 1, why: "Un retrait au milieu de la liste ne doit pas toucher les autres comptes." },
          { t: "4 nœuds identiques et interchangeables d'un cluster", b: 0 },
          { t: "Une zone DNS privée par nom de domaine", b: 1 },
        ] },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l7", part: "Le state", title: "Le state en profondeur", duration: 40,
      summary: "Backend distant, verrouillage, commandes state, import, moved, removed, dérive.",
      objectives: ["Configurer un backend distant chiffré avec verrouillage", "Manipuler le state sans casser l'infrastructure", "Importer une ressource existante", "Détecter et traiter la dérive"],
      blocks: [
        { t: "h2", text: "Pourquoi un backend distant" },
        { t: "list", items: [
          "Un state local sur ton PC : tes collègues ne le voient pas, et ils recréent des doublons.",
          "Deux <code>apply</code> simultanés sur le même state le corrompent : il faut un <strong>verrou</strong>.",
          "Le state contient des secrets en clair : stockage chiffré, accès restreint, versionné pour pouvoir revenir en arrière.",
        ] },
        { t: "code", lang: "hcl", title: "backend.tf", code: `
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-tfstate"
    storage_account_name = "sttfstateinfraprod"
    container_name       = "tfstate"
    key                  = "network/prod.tfstate"
    use_azuread_auth     = true        # pas de clé d'accès partagée
  }
}
# Équivalents : s3 (+ use_lockfile ou DynamoDB), gcs, http (GitLab), remote/cloud (HCP Terraform)` },
        { t: "callout", kind: "pro", html: "Un state <strong>par périmètre et par environnement</strong> (réseau prod, VM prod, réseau preprod…). Un state géant de 2 000 ressources rend chaque plan lent et chaque erreur dangereuse : c'est la notion de <em>blast radius</em>." },
        { t: "h2", text: "Commandes de state" },
        { t: "term", ps: "admin@ctrl:~/infra$", task: "Liste les ressources connues du state.", steps: [
          { accept: [/^(terraform|tofu)\s+state\s+list\s*$/], hint: "<code>terraform state list</code>", solution: "terraform state list",
            output: `azurerm_resource_group.infra
azurerm_virtual_network.hub
azurerm_subnet.this["admin"]
azurerm_subnet.this["srv"]
azurerm_subnet.this["wks"]
azurerm_network_security_group.srv` },
          { ask: "Affiche le détail de la ressource <code>azurerm_subnet.this[\"admin\"]</code>.", accept: [/^(terraform|tofu)\s+state\s+show\s+['"]?azurerm_subnet\.this\[\\?"admin\\?"\]['"]?\s*$/], hint: "<code>terraform state show</code> + l'adresse (mets-la entre apostrophes dans un shell).", solution: "terraform state show 'azurerm_subnet.this[\"admin\"]'",
            output: `# azurerm_subnet.this["admin"]:
resource "azurerm_subnet" "this" {
    address_prefixes     = ["10.10.0.0/24"]
    id                   = "/subscriptions/…/subnets/snet-admin"
    name                 = "snet-admin"
    virtual_network_name = "vnet-hub-prod"
}` },
        ] },
        { t: "table", head: ["Commande", "Usage"], rows: [
          ["<code>terraform state mv A B</code>", "renommer une adresse (préférer un bloc <code>moved</code>)"],
          ["<code>terraform state rm ADDR</code>", "oublier une ressource sans la détruire"],
          ["<code>terraform state pull &gt; backup.tfstate</code>", "sauvegarder le state avant une opération risquée"],
          ["<code>terraform force-unlock ID</code>", "lever un verrou resté bloqué après un crash (avec prudence)"],
          ["<code>terraform plan -refresh-only</code>", "voir la dérive sans rien modifier"],
        ] },
        { t: "h2", text: "Refactoring sans destruction : moved et removed" },
        { t: "code", lang: "hcl", code: `
# Tu renommes une ressource ou tu la déplaces dans un module
moved {
  from = azurerm_subnet.admin
  to   = azurerm_subnet.this["admin"]
}

# Tu veux que Terraform arrête de gérer une ressource sans la supprimer
removed {
  from = azurerm_storage_account.legacy
  lifecycle {
    destroy = false
  }
}` },
        { t: "h2", text: "Importer l'existant" },
        { t: "p", html: "Une infrastructure créée à la main peut être reprise par Terraform. Depuis la 1.5, le bloc <code>import</code> se relit en pull request, et <code>-generate-config-out</code> écrit le code de départ pour toi." },
        { t: "code", lang: "hcl", title: "import.tf", code: `
import {
  to = azurerm_resource_group.legacy
  id = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-legacy-apps"
}` },
        { t: "term", ps: "admin@ctrl:~/infra$", task: "Génère automatiquement le code HCL de la ressource à importer dans <code>generated.tf</code>.", steps: [
          { accept: [/^(terraform|tofu)\s+plan\s+-generate-config-out[= ]\s*generated\.tf\s*$/], hint: "<code>terraform plan</code> avec <code>-generate-config-out=generated.tf</code>.", solution: "terraform plan -generate-config-out=generated.tf",
            output: `azurerm_resource_group.legacy: Preparing import... [id=/subscriptions/…/resourceGroups/rg-legacy-apps]
azurerm_resource_group.legacy: Refreshing state...

Terraform will perform the following actions:
  # azurerm_resource_group.legacy will be imported
  # (config will be generated)
    resource "azurerm_resource_group" "legacy" { ... }

Plan: <span class="okc">1 to import</span>, 0 to add, 0 to change, 0 to destroy.
<span class="chg">Terraform has generated configuration and written it to generated.tf.</span>` },
        ], explain: "Relis et nettoie le code généré (valeurs par défaut inutiles, références au lieu d'ID en dur), puis apply : la ressource est importée sans être modifiée." },
        { t: "h2", text: "La dérive" },
        { t: "p", html: "Quelqu'un ouvre un port dans le portail Azure. Au prochain plan, Terraform voit l'écart et propose de remettre la règle comme dans le code. Deux réponses possibles : <strong>annuler</strong> la modification manuelle (apply), ou <strong>l'adopter</strong> en l'écrivant dans le code. Dans les deux cas, le code redevient la vérité." },
        { t: "order", task: "Un collègue a renommé <code>module.vm</code> en <code>module.vm_app</code>. Le plan veut tout détruire et recréer. Remets la procédure de correction dans l'ordre.", items: [
          "Arrêter : ne pas appliquer ce plan",
          "Sauvegarder le state (terraform state pull)",
          "Ajouter un bloc moved { from = module.vm, to = module.vm_app }",
          "Relancer terraform plan",
          "Vérifier que le plan affiche 0 to add, 0 to destroy (seulement des « moved »)",
          "Appliquer et commiter",
        ] },
        { t: "quiz", q: "Le pipeline échoue avec <code>Error acquiring the state lock</code>. Que fais-tu en premier ?", options: ["<code>terraform force-unlock</code> immédiatement", "Vérifier qu'aucun autre apply n'est en cours (collègue, autre job CI) avant toute action", "Supprimer le fichier de state", "Passer en state local"], answer: 1, explain: "Le verrou protège d'une corruption. force-unlock seulement si on a la certitude que le processus qui le tenait est mort." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l8", part: "Industrialiser", title: "Modules", duration: 30,
      summary: "Écrire, versionner et consommer des modules. Registre, sources Git.",
      objectives: ["Concevoir un module avec une interface claire", "L'appeler depuis plusieurs environnements", "Versionner et publier un module"],
      blocks: [
        { t: "h2", text: "Structure" },
        { t: "code", lang: "text", code: `
modules/
└── windows-vm/
    ├── main.tf          # ressources
    ├── variables.tf     # entrées (l'API du module)
    ├── outputs.tf       # sorties
    ├── versions.tf      # required_providers
    └── README.md
environments/
├── prod/main.tf         # appelle le module
└── preprod/main.tf` },
        { t: "code", lang: "hcl", title: "environments/prod/main.tf", code: `
module "srv_app" {
  source  = "../../modules/windows-vm"           # local
  # source = "git::https://git.lab.local/infra/tf-modules.git//windows-vm?ref=v2.3.0"
  # source = "Azure/avm-res-compute-virtualmachine/azurerm"  + version = "~> 0.18"

  for_each       = toset(["app01", "app02"])
  name           = "srv-\${each.key}"
  subnet_id      = module.network.subnet_ids["srv"]
  size           = "Standard_D4s_v5"
  tier           = 1
  admin_password = data.azurerm_key_vault_secret.local_admin.value
}

output "app_ips" {
  value = { for k, m in module.srv_app : k => m.private_ip }
}` },
        { t: "list", items: [
          "Un module expose une <strong>interface</strong> : des variables documentées et validées, des outputs. L'appelant ne doit pas connaître ses détails internes.",
          "Pas de bloc <code>provider</code> dans un module réutilisable : c'est l'appelant qui configure les providers.",
          "Versionne avec des tags Git (<code>ref=v2.3.0</code>) ou un registre, jamais <code>ref=main</code> en production.",
          "Évite les modules « coquille » qui se contentent de renommer les arguments d'une ressource : un bon module encapsule une décision (une VM conforme à la politique de sécurité, avec ses disques, sa sauvegarde et ses tags).",
        ] },
        { t: "callout", kind: "pro", title: "Azure Verified Modules", html: "Microsoft maintient les <em>Azure Verified Modules</em> (AVM) sur le registre Terraform. Partir d'un AVM pour une landing zone évite de réinventer le hub-and-spoke, le pare-feu ou les diagnostics." },
        { t: "editor", task: "Écris le fichier <code>outputs.tf</code> du module : une sortie <code>private_ip</code> (adresse IP privée de <code>azurerm_network_interface.this</code>) et une sortie <code>vm_id</code> (id de <code>azurerm_windows_virtual_machine.this</code>), chacune avec une description.", lang: "hcl",
          starter: `
`,
          checks: [
            { re: /output\s+"private_ip"\s*\{[^}]*value\s*=\s*azurerm_network_interface\.this\.private_ip_address/s, label: "Sortie <code>private_ip</code>" },
            { re: /output\s+"vm_id"\s*\{[^}]*value\s*=\s*azurerm_windows_virtual_machine\.this\.id/s, label: "Sortie <code>vm_id</code>" },
            { re: /output\s+"private_ip"\s*\{[^}]*description\s*=/s, label: "Description sur <code>private_ip</code>" },
            { re: /output\s+"vm_id"\s*\{[^}]*description\s*=/s, label: "Description sur <code>vm_id</code>" },
          ],
          solution: `
output "private_ip" {
  description = "Adresse IP privée de la VM"
  value       = azurerm_network_interface.this.private_ip_address
}

output "vm_id" {
  description = "Identifiant Azure de la VM"
  value       = azurerm_windows_virtual_machine.this.id
}
` },
        { t: "quiz", q: "Pourquoi ne pas mettre de bloc <code>provider \"azurerm\"</code> dans un module partagé ?", options: ["C'est interdit par la syntaxe", "Cela empêche l'appelant de choisir l'abonnement, les identifiants ou un alias, et bloque count/for_each sur le module", "Cela ralentit le plan", "Les modules n'utilisent pas de provider"], answer: 1, explain: "Le module déclare ses <code>required_providers</code> ; l'appelant configure et transmet les providers (au besoin avec <code>providers = { azurerm = azurerm.hub }</code>)." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l9", part: "Industrialiser", title: "Environnements, CI/CD et politiques", duration: 35,
      summary: "Dossiers vs workspaces, pipeline plan/apply, OIDC, policy as code, terraform test.",
      objectives: ["Séparer proprement dev, preprod et prod", "Construire un pipeline plan en PR, apply après approbation", "S'authentifier sans secret avec OIDC", "Contrôler le code avec des politiques et des tests"],
      blocks: [
        { t: "h2", text: "Dossiers ou workspaces ?" },
        { t: "table", head: ["", "Un dossier par environnement", "Workspaces CLI"], rows: [
          ["State", "un backend/clé par dossier", "un state par workspace, même backend"],
          ["Différences entre envs", "faciles (code et versions de modules différents)", "seulement via variables / <code>terraform.workspace</code>"],
          ["Risque", "un peu de duplication", "oublier de changer de workspace et appliquer en prod"],
          ["Recommandation", "<strong>prod / préprod</strong>", "environnements éphémères identiques (une branche = un env)"],
        ] },
        { t: "h2", text: "Pipeline type" },
        { t: "code", lang: "yaml", title: ".github/workflows/terraform.yml", code: `
name: terraform-network-prod
on:
  pull_request:
    paths: ["environments/prod/network/**"]
  push:
    branches: [main]
    paths: ["environments/prod/network/**"]

permissions:
  id-token: write          # OIDC : pas de secret client stocké
  contents: read
  pull-requests: write

jobs:
  plan:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: environments/prod/network } }
    env:
      ARM_USE_OIDC: "true"
      ARM_CLIENT_ID: \${{ vars.AZURE_CLIENT_ID }}
      ARM_TENANT_ID: \${{ vars.AZURE_TENANT_ID }}
      ARM_SUBSCRIPTION_ID: \${{ vars.AZURE_SUBSCRIPTION_ID }}
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - run: terraform fmt -check -recursive
      - run: terraform init -input=false
      - run: terraform validate
      - run: terraform plan -input=false -out=tfplan
      - run: terraform show -no-color tfplan > plan.txt   # publié en commentaire de PR
      - uses: actions/upload-artifact@v4
        with: { name: tfplan, path: environments/prod/network/tfplan }

  apply:
    if: github.ref == 'refs/heads/main'
    needs: plan
    environment: production          # approbation manuelle obligatoire
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - uses: actions/download-artifact@v4
        with: { name: tfplan, path: environments/prod/network }
      - run: terraform init -input=false
        working-directory: environments/prod/network
      - run: terraform apply -input=false tfplan
        working-directory: environments/prod/network` },
        { t: "callout", kind: "pro", title: "Deux identités", html: "L'identité qui fait le <strong>plan</strong> sur une pull request n'a besoin que de la lecture (Reader + accès au state). Seule l'identité du job <strong>apply</strong>, protégé par l'environnement <code>production</code>, a le droit d'écrire. Une PR malveillante ne peut ainsi rien modifier." },
        { t: "h2", text: "Contrôles automatiques" },
        { t: "table", head: ["Outil", "Ce qu'il vérifie"], rows: [
          ["<code>terraform fmt -check</code>", "le formatage"],
          ["<code>tflint</code>", "erreurs propres au provider (taille de VM inexistante…)"],
          ["<code>checkov</code> / <code>trivy config</code>", "mauvaises pratiques de sécurité (stockage public, NSG ouvert à Internet)"],
          ["OPA / Conftest, Sentinel", "politiques maison sur le plan JSON (« pas de VM sans tag owner »)"],
          ["<code>terraform test</code>", "tests unitaires et d'intégration des modules (fichiers <code>.tftest.hcl</code>)"],
          ["<code>plan -detailed-exitcode</code> planifié", "détection de dérive chaque nuit (code 2 = écart)"],
        ] },
        { t: "code", lang: "hcl", title: "tests/naming.tftest.hcl", code: `
variables {
  name = "srv-app01"
  tier = 1
}

run "nom_et_tags_conformes" {
  command = plan
  assert {
    condition     = azurerm_windows_virtual_machine.this.tags["tier"] == "1"
    error_message = "Le tag tier doit refléter la variable tier."
  }
}` },
        { t: "order", task: "Remets dans l'ordre le parcours d'un changement réseau en production.", items: [
          "Créer une branche et modifier le code",
          "Ouvrir une pull request",
          "La CI lance fmt, validate, tflint, checkov puis plan",
          "Le plan est publié en commentaire et relu par un pair",
          "Fusion sur main",
          "Approbation manuelle de l'environnement production",
          "apply du plan enregistré",
        ] },
        { t: "quiz", q: "Le job nocturne lance <code>terraform plan -detailed-exitcode</code> et obtient le code 2. Que signifie-t-il ?", options: ["Erreur de syntaxe", "Le plan contient des changements : il y a une dérive (ou du code non appliqué)", "Aucun changement", "Le verrou est pris"], answer: 1, explain: "0 = aucun changement, 1 = erreur, 2 = changements présents. C'est le moyen standard d'alerter sur une dérive." },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "l10", part: "Industrialiser", title: "Terraform + Ansible et projet final", duration: 35,
      summary: "Chaîner provisionnement et configuration. Projet : une VM conforme, de bout en bout.",
      objectives: ["Passer les informations de Terraform à Ansible", "Éviter les provisioners", "Écrire un module complet de niveau production"],
      blocks: [
        { t: "h2", text: "Pourquoi éviter les provisioners" },
        { t: "p", html: "<code>provisioner \"remote-exec\"</code> et <code>local-exec</code> existent, mais HashiCorp les décrit comme un dernier recours : ils ne sont pas dans le plan, pas idempotents, et un échec laisse la ressource marquée <em>tainted</em>. Préfère <strong>cloud-init / custom_data</strong> pour l'amorçage minimal, puis Ansible pour la configuration." },
        { t: "h2", text: "Trois façons de passer le relais à Ansible" },
        { t: "list", ordered: true, items: [
          "<strong>Inventaire dynamique</strong> : Ansible interroge directement Azure/vSphere par tags (<code>tier: 1</code>, <code>role: web</code>) posés par Terraform. C'est la méthode la plus robuste.",
          "<strong>Fichier d'inventaire généré</strong> : Terraform écrit un <code>hosts.yml</code> avec <code>local_file</code> + <code>templatefile</code>.",
          "<strong>Provider Ansible</strong> (<code>ansible/ansible</code>) : des ressources <code>ansible_host</code> / <code>ansible_group</code> dans le state, lues par le plugin d'inventaire <code>cloud.terraform.terraform_provider</code>.",
        ] },
        { t: "code", lang: "hcl", title: "Inventaire généré", code: `
resource "local_file" "inventory" {
  filename = "\${path.root}/../ansible/inventories/prod/terraform.yml"
  content = templatefile("\${path.module}/inventory.yml.tftpl", {
    web = { for k, m in module.web : k => m.private_ip }
    db  = { for k, m in module.db : k => m.private_ip }
  })
}` },
        { t: "code", lang: "bash", title: "Enchaînement en CI", code: `
terraform -chdir=terraform/prod apply -input=false tfplan
ansible-playbook -i ansible/inventories/prod playbooks/site.yml --limit "tag_tier_1"` },
        { t: "h2", text: "Projet final" },
        { t: "p", html: "Écris la ressource principale d'un module <code>linux-vm</code> conforme : nom construit à partir des variables, image et taille issues de variables, authentification par clé SSH uniquement, tags obligatoires fusionnés, et protection contre la destruction en production." },
        { t: "editor", task: "Complète la ressource <code>azurerm_linux_virtual_machine.this</code> : <code>name = \"vm-${var.env}-${var.name}\"</code> ; <code>size = var.size</code> ; <code>disable_password_authentication = true</code> ; un bloc <code>admin_ssh_key</code> qui utilise <code>var.ssh_public_key</code> ; <code>tags = merge(var.tags, { tier = tostring(var.tier) })</code> ; et un bloc <code>lifecycle</code> qui ignore les changements de <code>tags[\"patch_date\"]</code>.", lang: "hcl", xp: 60,
          starter: `
resource "azurerm_linux_virtual_machine" "this" {
  resource_group_name   = var.resource_group_name
  location              = var.location
  admin_username        = "azureadmin"
  network_interface_ids = [azurerm_network_interface.this.id]

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
  }

  source_image_reference {
    publisher = "Debian"
    offer     = "debian-12"
    sku       = "12-gen2"
    version   = "latest"
  }
}
`,
          checks: [
            { re: /name\s*=\s*"vm-\$\{var\.env\}-\$\{var\.name\}"/, label: "<code>name = \"vm-${var.env}-${var.name}\"</code>" },
            { re: /\bsize\s*=\s*var\.size/, label: "<code>size = var.size</code>" },
            { re: /disable_password_authentication\s*=\s*true/, label: "Mot de passe désactivé" },
            { re: /admin_ssh_key\s*\{[^}]*public_key\s*=\s*var\.ssh_public_key/s, label: "Bloc <code>admin_ssh_key</code> avec <code>var.ssh_public_key</code>" },
            { re: /admin_ssh_key\s*\{[^}]*username\s*=\s*"azureadmin"/s, label: "<code>username = \"azureadmin\"</code> dans admin_ssh_key" },
            { re: /tags\s*=\s*merge\(\s*var\.tags\s*,\s*\{\s*tier\s*=\s*tostring\(\s*var\.tier\s*\)\s*\}\s*\)/, label: "Tags fusionnés avec <code>merge</code>" },
            { re: /lifecycle\s*\{[^}]*ignore_changes\s*=\s*\[\s*tags\[\s*"patch_date"\s*\]\s*\]/s, label: "<code>ignore_changes = [tags[\"patch_date\"]]</code>" },
          ],
          solution: `
resource "azurerm_linux_virtual_machine" "this" {
  name                  = "vm-\${var.env}-\${var.name}"
  resource_group_name   = var.resource_group_name
  location              = var.location
  size                  = var.size
  admin_username        = "azureadmin"
  network_interface_ids = [azurerm_network_interface.this.id]

  disable_password_authentication = true
  admin_ssh_key {
    username   = "azureadmin"
    public_key = var.ssh_public_key
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
  }

  source_image_reference {
    publisher = "Debian"
    offer     = "debian-12"
    sku       = "12-gen2"
    version   = "latest"
  }

  tags = merge(var.tags, { tier = tostring(var.tier) })

  lifecycle {
    ignore_changes = [tags["patch_date"]]
  }
}
` },
        { t: "callout", kind: "tip", html: "Note : <code>prevent_destroy</code> n'accepte pas de variable (il doit être connu au chargement). Pour le rendre conditionnel, on crée deux ressources avec <code>count</code> opposés, ou on protège au niveau de l'appelant et avec un verrou Azure (<code>azurerm_management_lock</code>)." },
        { t: "quiz", q: "Une VM créée par Terraform doit être jointe au domaine et durcie. Quelle répartition est la plus saine ?", options: ["Tout en <code>remote-exec</code> dans Terraform", "Terraform crée la VM avec des tags ; cloud-init installe le minimum ; Ansible (inventaire dynamique par tags) fait la jonction au domaine et le durcissement", "Tout à la main après création", "Ansible crée la VM et la configure, Terraform n'est pas utile"], answer: 1, explain: "Chaque outil dans son rôle, et des tags comme contrat entre les deux." },
      ],
    },
  ],

  /* ==================== EXAMEN ==================== */
  exam: [
    { q: "Le plan affiche <code>-/+</code> sur une VM de base de données. Que signifie ce symbole ?", options: ["Modification sur place", "Destruction puis recréation", "Importation", "Lecture d'une data source"], answer: 1, explain: "Un argument « forces replacement » a changé. Sur une ressource à état, c'est un signal d'arrêt." },
    { q: "Quelle méthode identifie chaque instance par une clé stable ?", options: ["count", "for_each", "dynamic", "depends_on"], answer: 1, explain: "for_each indexe par clé, count par position." },
    { q: "Où ne doit jamais aller le fichier terraform.tfstate ?", options: ["Dans un backend chiffré", "Dans Git", "Dans un compte de stockage versionné", "Dans HCP Terraform"], answer: 1, explain: "Il contient des secrets en clair et doit être partagé avec verrouillage." },
    { q: "Comment renommer <code>aws_instance.web</code> en <code>aws_instance.frontend</code> sans recréer l'instance ?", options: ["Renommer et apply", "Bloc <code>moved { from = aws_instance.web  to = aws_instance.frontend }</code>", "terraform taint", "terraform refresh"], answer: 1, explain: "moved est déclaratif, relu en PR, et fonctionne pour toute l'équipe." },
    { q: "Pourquoi utiliser <code>terraform apply tfplan</code> plutôt que <code>terraform apply</code> en CI ?", options: ["C'est plus rapide", "On applique exactement le plan relu, sans recalcul ni divergence", "Pour éviter le verrou", "Parce que apply seul est déprécié"], answer: 1, explain: "Entre le plan et l'apply, l'infrastructure ou le code peuvent avoir changé." },
    { q: "Une valeur marquée <code>sensitive = true</code> est :", options: ["chiffrée dans le state", "masquée à l'affichage mais présente en clair dans le state", "jamais envoyée au provider", "supprimée après apply"], answer: 1, explain: "D'où la nécessité de protéger le backend." },
    { q: "Quelle contrainte accepte 5.1, 5.2… mais pas 6.0 ?", options: ["<code>= 5.1</code>", "<code>~> 5.1</code>", "<code>~> 5.1.0</code>", "<code>>= 5.1</code>"], answer: 1, explain: "<code>~> 5.1.0</code> n'accepterait que 5.1.x." },
    { q: "Une ressource a été créée à la main dans le portail. Comment la reprendre dans Terraform proprement ?", options: ["La supprimer et la recréer", "Bloc <code>import</code> (+ <code>-generate-config-out</code>), relu puis appliqué", "La décrire et faire apply : Terraform la reconnaît", "terraform state push"], answer: 1, explain: "Sans import, Terraform tenterait de créer un doublon (ou échouerait sur un nom déjà pris)." },
    { q: "Quel est l'intérêt de l'authentification OIDC entre GitHub Actions et Azure ?", options: ["Elle est plus rapide", "Aucun secret de longue durée n'est stocké : un jeton éphémère est émis pour chaque job", "Elle évite le state distant", "Elle remplace les rôles RBAC"], answer: 1, explain: "Plus de client secret qui fuit ou expire en silence." },
    { q: "Deux apply lancés en même temps sur le même state. Qu'est-ce qui évite la corruption ?", options: ["Le lock file .terraform.lock.hcl", "Le verrouillage du backend", "Le plan enregistré", "Le provider"], answer: 1, explain: "Le lock file concerne les versions des providers, pas les exécutions concurrentes." },
    { q: "Que fait <code>terraform plan -refresh-only</code> ?", options: ["Met à jour les providers", "Montre l'écart entre le state et la réalité (dérive) et permet de mettre à jour le state sans toucher l'infrastructure", "Recrée tout", "Supprime le cache"], answer: 1, explain: "Il remplace l'ancienne commande <code>terraform refresh</code>." },
    { q: "Un module partagé doit-il contenir un bloc provider configuré ?", options: ["Oui, toujours", "Non : il déclare required_providers, l'appelant configure les providers", "Seulement en production", "Seulement pour Azure"], answer: 1, explain: "" },
    { q: "Quelle expression construit une map des sous-réseaux de tier 0 uniquement ?", options: ["<code>[for s in var.subnets : s if s.tier == 0]</code>", "<code>{ for k, s in var.subnets : k => s if s.tier == 0 }</code>", "<code>filter(var.subnets, tier == 0)</code>", "<code>lookup(var.subnets, 0)</code>"], answer: 1, explain: "Accolades = map, crochets = liste." },
    { q: "Comment empêcher qu'une modification de tag faite par l'outil de sauvegarde soit annulée à chaque apply ?", options: ["prevent_destroy", "<code>lifecycle { ignore_changes = [tags[\"last_backup\"]] }</code>", "depends_on", "sensitive"], answer: 1, explain: "" },
    { q: "Pourquoi les provisioners sont-ils un dernier recours ?", options: ["Ils sont payants", "Ils ne sont pas représentés dans le plan, pas idempotents, et un échec marque la ressource à recréer", "Ils ne marchent pas sur Linux", "Ils sont supprimés depuis la 1.0"], answer: 1, explain: "" },
    { q: "Pour séparer prod et préprod qui diffèrent sensiblement, l'approche recommandée est :", options: ["Un seul dossier et des workspaces", "Un dossier (et un state) par environnement, qui appellent les mêmes modules versionnés", "Un seul state pour tout", "Des branches Git différentes sans dossier"], answer: 1, explain: "On peut alors tester une nouvelle version de module en préprod avant la prod." },
    { q: "Quelle identité doit pouvoir écrire dans l'abonnement de production ?", options: ["Celle du job plan des pull requests", "Seulement celle du job apply, protégé par une approbation", "Tous les développeurs", "Le compte personnel de l'admin"], answer: 1, explain: "Une PR peut contenir du code arbitraire exécuté par le plan (data sources, providers externes)." },
    { q: "Quelle commande détecte la dérive dans un script en se basant sur le code retour ?", options: ["<code>terraform validate</code>", "<code>terraform plan -detailed-exitcode</code>", "<code>terraform show</code>", "<code>terraform fmt -check</code>"], answer: 1, explain: "Code 2 = changements à appliquer." },
  ],

  /* ==================== ANTISÈCHE ==================== */
  cheat: [
    { title: "Workflow", rows: [
      ["terraform init [-upgrade]", "backend + providers"],
      ["terraform fmt -recursive", "formater"], ["terraform validate", "valider"],
      ["terraform plan -out=tfplan", "planifier et enregistrer"],
      ["terraform apply tfplan", "appliquer le plan relu"],
      ["terraform destroy", "tout supprimer"],
      ["terraform output -raw nom", "lire une sortie"],
    ] },
    { title: "State", rows: [
      ["terraform state list / show ADDR", "inspecter"],
      ["terraform state pull > backup.tfstate", "sauvegarder"],
      ["terraform state rm ADDR", "oublier sans détruire"],
      ["moved { from = A  to = B }", "renommer sans recréer"],
      ["removed { from = A  lifecycle { destroy = false } }", "sortir de Terraform"],
      ["import { to = ADDR  id = \"...\" }", "reprendre l'existant"],
      ["terraform plan -refresh-only", "voir la dérive"],
      ["terraform force-unlock ID", "lever un verrou mort"],
    ] },
    { title: "Langage", rows: [
      ["type.nom.attribut", "référence de ressource"], ["var.x / local.x / data.t.n.attr / module.m.out", "autres références"],
      ["count = var.on ? 1 : 0", "ressource optionnelle"], ["for_each = var.map / toset(list)", "instances par clé"],
      ["each.key / each.value / count.index", "dans une ressource multiple"],
      ["dynamic \"bloc\" { for_each = ... content { } }", "sous-blocs générés"],
      ["{ for k, v in m : k => v if cond }", "expression for (map)"],
    ] },
    { title: "Fonctions fréquentes", rows: [
      ["merge(a, b)", "fusion de maps"], ["lookup(m, k, def)", "lecture avec défaut"],
      ["try(expr, def)", "repli sur erreur"], ["cidrsubnet(cidr, bits, n)", "découpe réseau"],
      ["format(\"vm-%s-%02d\", e, n)", "formatage"], ["templatefile(f, vars)", "fichier modèle"],
      ["toset() / tolist() / tostring()", "conversions"],
    ] },
    { title: "lifecycle", rows: [
      ["prevent_destroy = true", "bloquer toute destruction"],
      ["create_before_destroy = true", "remplacer sans coupure"],
      ["ignore_changes = [attr]", "ignorer une modif externe"],
      ["replace_triggered_by = [ref]", "recréer si une autre ressource change"],
    ] },
    { title: "Qualité et CI", rows: [
      ["terraform fmt -check", "formatage en CI"], ["tflint", "erreurs provider"],
      ["checkov -d . / trivy config .", "sécurité"], ["terraform test", "tests de modules"],
      ["plan -detailed-exitcode", "0 rien, 1 erreur, 2 changements"],
      ["ARM_USE_OIDC=true", "auth Azure sans secret en CI"],
    ] },
  ],
};
