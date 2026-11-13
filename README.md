# InfraDojo

Plateforme de formation interactive, en français, pour atteindre un niveau professionnel sur :

- **Ansible** : 12 leçons, 40 exercices, examen de 20 questions
- **Terraform** : 10 leçons, 27 exercices, examen de 18 questions
- **Tiering Active Directory** : 12 leçons, 33 exercices, examen de 22 questions

Chaque leçon mélange cours, terminal simulé (vraies commandes `ansible`, `terraform`, PowerShell), exercices de code vérifiés automatiquement, mises en situation et quiz. La progression (XP, ceintures, badges, certificats) est enregistrée dans le navigateur.

## Structure

```
index.html                 page unique
assets/css/style.css       styles (thème clair et sombre)
assets/js/app.js           moteur : navigation, exercices, progression, examens
assets/js/data/*.js        contenu des modules (un fichier par module)
```

Site 100 % statique, sans dépendance ni étape de build : il suffit de servir le dossier (nginx, Apache, GitHub Pages).

## Ajouter une leçon

Ajouter un objet dans le tableau `lessons` du module concerné (`assets/js/data/ansible.js`, etc.). Types de blocs disponibles : `h2`, `h3`, `p`, `list`, `code`, `callout`, `table`, `figure`, et les exercices `quiz`, `term`, `editor`, `order`, `classify`.
