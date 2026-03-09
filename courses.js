require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function runSchema() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('✅ Schema created');
}

async function seedLevels() {
  const levels = [
    { id: 1, name: 'Débutant', min_points: 0, max_points: 99, badge_icon: '🌱', color: '#6B7280' },
    { id: 2, name: 'Apprenti', min_points: 100, max_points: 249, badge_icon: '📚', color: '#3B82F6' },
    { id: 3, name: 'Explorateur', min_points: 250, max_points: 499, badge_icon: '🔍', color: '#8B5CF6' },
    { id: 4, name: 'Confirmé', min_points: 500, max_points: 999, badge_icon: '⭐', color: '#F59E0B' },
    { id: 5, name: 'Expert', min_points: 1000, max_points: 1999, badge_icon: '🏆', color: '#EF4444' },
    { id: 6, name: 'Champion Numérique', min_points: 2000, max_points: null, badge_icon: '👑', color: '#10B981' },
  ];
  for (const l of levels) {
    await pool.query(
      `INSERT INTO levels (id, name, min_points, max_points, badge_icon, color) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
      [l.id, l.name, l.min_points, l.max_points, l.badge_icon, l.color]
    );
  }
  console.log('✅ Levels seeded');
}

async function seedUsers() {
  const adminPass = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Billy123', 12);
  const trainerPass = await bcrypt.hash(process.env.TRAINER_PASSWORD || 'LMDQ1000', 12);

  await pool.query(`
    INSERT INTO users (role, username, password_hash, first_name, last_name, avatar_color)
    VALUES ('admin', 'Admin', $1, 'Admin', 'DIGI REFERENT', '#1E3A5F')
    ON CONFLICT (username) DO NOTHING
  `, [adminPass]);

  const trainers = [
    { username: 'bilal', first: 'Bilal', color: '#FF6B6B' },
    { username: 'anthony', first: 'Anthony', color: '#4ECDC4' },
    { username: 'livio', first: 'Livio', color: '#45B7D1' },
    { username: 'jason', first: 'Jason', color: '#96CEB4' },
    { username: 'fiora', first: 'Fiora', color: '#FFEAA7' },
  ];
  for (const t of trainers) {
    await pool.query(`
      INSERT INTO users (role, username, password_hash, first_name, avatar_color)
      VALUES ('trainer', $1, $2, $3, $4)
      ON CONFLICT (username) DO NOTHING
    `, [t.username, trainerPass, t.first, t.color]);
  }
  console.log('✅ Admin & trainers seeded');
}

async function seedBadges() {
  const badges = [
    { name: 'Premier Pas', description: 'Premier exercice complété !', icon: '👣', condition_type: 'exercises_completed', condition_value: 1 },
    { name: 'En Route', description: '10 exercices complétés', icon: '🚀', condition_type: 'exercises_completed', condition_value: 10 },
    { name: 'Persévérant', description: '25 exercices complétés', icon: '💪', condition_type: 'exercises_completed', condition_value: 25 },
    { name: 'Expert Email', description: 'Module Email entièrement maîtrisé', icon: '📧', condition_type: 'module_completed', condition_value: 1 },
    { name: 'Expert Internet', description: 'Module Internet entièrement maîtrisé', icon: '🌐', condition_type: 'module_completed', condition_value: 2 },
    { name: 'Expert Ordinateur', description: 'Module Ordinateur entièrement maîtrisé', icon: '💻', condition_type: 'module_completed', condition_value: 3 },
    { name: 'Expert Smartphone', description: 'Module Smartphone entièrement maîtrisé', icon: '📱', condition_type: 'module_completed', condition_value: 4 },
    { name: '100 Points', description: '100 points atteints', icon: '💯', condition_type: 'points', condition_value: 100 },
    { name: '500 Points', description: '500 points atteints', icon: '🌟', condition_type: 'points', condition_value: 500 },
    { name: 'Champion', description: '1000 points atteints', icon: '👑', condition_type: 'points', condition_value: 1000 },
  ];
  for (const b of badges) {
    await pool.query(
      `INSERT INTO badges (name, description, icon, condition_type, condition_value) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
      [b.name, b.description, b.icon, b.condition_type, b.condition_value]
    );
  }
  console.log('✅ Badges seeded');
}

async function seedModules() {
  const modules = [
    { id: 1, name: 'Email', description: 'Créer et gérer vos emails avec Gmail et Outlook', icon: '📧', color: '#3B82F6', order_index: 1 },
    { id: 2, name: 'Ordinateur', description: 'Découvrir et maîtriser votre ordinateur Windows', icon: '💻', color: '#8B5CF6', order_index: 2 },
    { id: 3, name: 'Internet', description: 'Naviguer sur Internet en toute sécurité', icon: '🌐', color: '#10B981', order_index: 3 },
    { id: 4, name: 'Smartphone', description: 'Maîtriser votre téléphone Android ou iPhone', icon: '📱', color: '#F59E0B', order_index: 4 },
  ];
  for (const m of modules) {
    await pool.query(
      `INSERT INTO modules (id, name, description, icon, color, order_index) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
      [m.id, m.name, m.description, m.icon, m.color, m.order_index]
    );
  }
  console.log('✅ Modules seeded');
}

async function seedCourses() {
  const courses = [
    // Email module
    { id: 1, module_id: 1, name: 'Compte et Premiers Emails', description: 'Créer votre adresse email et envoyer vos premiers messages', difficulty: 'débutant', order_index: 1 },
    { id: 2, module_id: 1, name: 'Fonctions Avancées', description: 'Pièces jointes, CC, BCC, organisation de votre boîte mail', difficulty: 'intermédiaire', order_index: 2 },
    // Ordinateur module
    { id: 3, module_id: 2, name: 'Découvrir l\'ordinateur', description: 'Identifier les composants et comprendre le fonctionnement', difficulty: 'débutant', order_index: 1 },
    { id: 4, module_id: 2, name: 'Se repérer sur Windows', description: 'Le bureau, la barre des tâches, les fenêtres', difficulty: 'débutant', order_index: 2 },
    { id: 5, module_id: 2, name: 'Utiliser la souris et le clavier', description: 'Maîtriser les outils de base de l\'ordinateur', difficulty: 'débutant', order_index: 3 },
    { id: 6, module_id: 2, name: 'Gérer ses fichiers', description: 'Créer, déplacer, supprimer et organiser vos fichiers', difficulty: 'intermédiaire', order_index: 4 },
    // Internet module
    { id: 7, module_id: 3, name: 'Comment ça marche', description: 'Comprendre le fonctionnement d\'Internet', difficulty: 'débutant', order_index: 1 },
    { id: 8, module_id: 3, name: 'Naviguer sur Internet', description: 'Utiliser un navigateur web efficacement', difficulty: 'débutant', order_index: 2 },
    { id: 9, module_id: 3, name: 'L\'utilité d\'Internet', description: 'Services en ligne, achats, démarches administratives', difficulty: 'intermédiaire', order_index: 3 },
    // Smartphone module
    { id: 10, module_id: 4, name: 'Découvrir son smartphone', description: 'Identifier les éléments et comprendre les bases', difficulty: 'débutant', order_index: 1 },
    { id: 11, module_id: 4, name: 'Se repérer sur son smartphone', description: 'Navigation, gestes tactiles, paramètres essentiels', difficulty: 'débutant', order_index: 2 },
    { id: 12, module_id: 4, name: 'Gérer ses applications', description: 'Installer, utiliser et désinstaller des applications', difficulty: 'intermédiaire', order_index: 3 },
    { id: 13, module_id: 4, name: 'Gérer ses fichiers', description: 'Photos, documents, stockage et sauvegarde', difficulty: 'intermédiaire', order_index: 4 },
  ];
  for (const c of courses) {
    await pool.query(
      `INSERT INTO courses (id, module_id, name, description, difficulty, order_index) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
      [c.id, c.module_id, c.name, c.description, c.difficulty, c.order_index]
    );
  }
  console.log('✅ Courses seeded');
}

async function seedExercises() {
  const exercises = [
    // ===== COURSE 1: Compte et Premiers Emails =====
    {
      course_id: 1, title: 'Qu\'est-ce qu\'une adresse email ?', type: 'qcm', difficulty: 'facile', points: 10, order_index: 1,
      question: 'Quelle est la structure correcte d\'une adresse email ?',
      data: {
        options: ['marie.dupont#gmail.com', 'marie.dupont@gmail.com', 'marie.dupont/gmail.com', '@marie.dupont.gmail'],
        correct: 1
      },
      explanation: 'Une adresse email contient toujours le symbole @ entre le nom d\'utilisateur et le fournisseur (ex: gmail.com).'
    },
    {
      course_id: 1, title: 'Les parties d\'une adresse email', type: 'association', difficulty: 'moyen', points: 15, order_index: 2,
      question: 'Associez chaque partie de l\'adresse email "marie@gmail.com" à sa description.',
      data: {
        pairs: [
          { left: 'marie', right: 'Nom d\'utilisateur' },
          { left: '@', right: 'Symbole séparateur (arobase)' },
          { left: 'gmail', right: 'Nom du fournisseur' },
          { left: '.com', right: 'Extension du domaine' },
        ]
      },
      explanation: 'Chaque partie de l\'adresse a un rôle précis. L\'arobase (@) sépare le nom du fournisseur.'
    },
    {
      course_id: 1, title: 'Créer un compte email : vrai ou faux ?', type: 'vrai_faux', difficulty: 'facile', points: 10, order_index: 3,
      question: 'Répondez Vrai ou Faux pour chaque affirmation sur la création d\'un compte email.',
      data: {
        statements: [
          { text: 'Il faut payer pour créer un compte Gmail.', answer: false },
          { text: 'Il faut choisir un mot de passe sécurisé.', answer: true },
          { text: 'On peut avoir plusieurs adresses email.', answer: true },
          { text: 'L\'adresse email peut contenir des espaces.', answer: false },
        ]
      },
      explanation: 'Gmail est gratuit. Un bon mot de passe contient majuscules, chiffres et symboles. Les espaces ne sont pas autorisés dans une adresse email.'
    },
    {
      course_id: 1, title: 'Envoyer son premier email', type: 'ordre', difficulty: 'moyen', points: 15, order_index: 4,
      question: 'Remettez dans l\'ordre les étapes pour envoyer un email.',
      data: {
        items: [
          'Cliquer sur "Nouveau message" ou "Rédiger"',
          'Saisir l\'adresse email du destinataire dans le champ "À"',
          'Écrire le sujet dans le champ "Objet"',
          'Rédiger votre message dans la zone de texte',
          'Relire votre message',
          'Cliquer sur "Envoyer"'
        ],
        correct_order: [0, 1, 2, 3, 4, 5]
      },
      explanation: 'Il faut toujours vérifier l\'adresse du destinataire et relire le message avant d\'envoyer.'
    },
    {
      course_id: 1, title: 'La boîte de réception', type: 'qcm', difficulty: 'facile', points: 10, order_index: 5,
      question: 'Où trouvez-vous les emails que vous recevez ?',
      data: {
        options: ['Dans "Envoyés"', 'Dans "Boîte de réception"', 'Dans "Brouillons"', 'Dans "Corbeille"'],
        correct: 1
      },
      explanation: 'La boîte de réception (Inbox) contient tous les emails que vous recevez.'
    },
    {
      course_id: 1, title: 'Sécurité du mot de passe', type: 'texte_a_trous', difficulty: 'moyen', points: 15, order_index: 6,
      question: 'Complétez les phrases sur la sécurité du mot de passe.',
      data: {
        template: 'Un bon mot de passe doit contenir au moins ____ caractères. Il ne faut jamais utiliser votre ____ comme mot de passe. Il est conseillé de mélanger des ____, des chiffres et des symboles.',
        blanks: ['8', 'prénom', 'majuscules'],
        options: ['3', '8', '12', 'prénom', 'adresse', 'majuscules', 'espaces', 'couleurs']
      },
      explanation: '8 caractères minimum, jamais votre prénom, et mélangez les types de caractères pour un mot de passe solide.'
    },
    {
      course_id: 1, title: 'Identifier les dossiers d\'email', type: 'association', difficulty: 'moyen', points: 15, order_index: 7,
      question: 'Associez chaque dossier à son rôle.',
      data: {
        pairs: [
          { left: 'Boîte de réception', right: 'Emails reçus' },
          { left: 'Envoyés', right: 'Emails que j\'ai envoyés' },
          { left: 'Brouillons', right: 'Emails non terminés' },
          { left: 'Corbeille', right: 'Emails supprimés' },
          { left: 'Spam', right: 'Emails indésirables' },
        ]
      },
      explanation: 'Chaque dossier a un rôle précis. Le spam filtre les messages suspects automatiquement.'
    },

    // ===== COURSE 2: Fonctions Avancées =====
    {
      course_id: 2, title: 'Répondre vs Transférer', type: 'qcm', difficulty: 'moyen', points: 15, order_index: 1,
      question: 'Votre amie Marie vous envoie un email. Vous voulez lui répondre directement. Que faites-vous ?',
      data: {
        options: ['Cliquer sur "Transférer"', 'Cliquer sur "Répondre"', 'Créer un nouveau message', 'Archiver l\'email'],
        correct: 1
      },
      explanation: '"Répondre" envoie votre réponse directement à l\'expéditeur. "Transférer" envoie l\'email original à une autre personne.'
    },
    {
      course_id: 2, title: 'Les champs CC et CCI', type: 'association', difficulty: 'difficile', points: 20, order_index: 2,
      question: 'Associez chaque champ à son utilisation correcte.',
      data: {
        pairs: [
          { left: 'À (Destinataire)', right: 'La personne principale à qui vous écrivez' },
          { left: 'CC (Copie)', right: 'Personnes informées, qui voient les autres destinataires' },
          { left: 'CCI (Copie cachée)', right: 'Personnes informées, qui ne voient pas les autres' },
        ]
      },
      explanation: 'CC = tout le monde voit qui reçoit l\'email. CCI = discret, personne ne voit les autres destinataires.'
    },
    {
      course_id: 2, title: 'Ajouter une pièce jointe', type: 'ordre', difficulty: 'moyen', points: 15, order_index: 3,
      question: 'Remettez dans l\'ordre les étapes pour envoyer une photo par email.',
      data: {
        items: [
          'Rédiger votre email normalement',
          'Cliquer sur l\'icône trombone 📎 ou "Joindre un fichier"',
          'Chercher la photo dans vos dossiers',
          'Sélectionner la photo et cliquer sur "Ouvrir"',
          'Vérifier que la photo apparaît bien dans l\'email',
          'Envoyer l\'email'
        ],
        correct_order: [0, 1, 2, 3, 4, 5]
      },
      explanation: 'Le trombone (📎) est le symbole universel pour les pièces jointes.'
    },
    {
      course_id: 2, title: 'Les pièces jointes : vrai ou faux ?', type: 'vrai_faux', difficulty: 'moyen', points: 15, order_index: 4,
      question: 'Vrai ou Faux concernant les pièces jointes ?',
      data: {
        statements: [
          { text: 'On peut envoyer des photos par email.', answer: true },
          { text: 'Une pièce jointe peut être un virus.', answer: true },
          { text: 'Il n\'y a pas de limite de taille pour une pièce jointe.', answer: false },
          { text: 'On peut joindre des documents PDF.', answer: true },
        ]
      },
      explanation: 'Attention aux pièces jointes inconnues, elles peuvent contenir des virus. La limite est généralement 25 MB.'
    },
    {
      course_id: 2, title: 'Organiser sa boîte email', type: 'qcm', difficulty: 'moyen', points: 15, order_index: 5,
      question: 'Quel est le meilleur moyen d\'organiser ses emails importants ?',
      data: {
        options: ['Les laisser tous dans la boîte de réception', 'Créer des dossiers et classer les emails', 'Supprimer tous les emails', 'Ne jamais lire les emails'],
        correct: 1
      },
      explanation: 'Créer des dossiers thématiques (famille, médecin, banque...) aide à retrouver facilement vos emails.'
    },
    {
      course_id: 2, title: 'Sécurité des emails', type: 'texte_a_trous', difficulty: 'difficile', points: 20, order_index: 6,
      question: 'Complétez les conseils de sécurité pour les emails.',
      data: {
        template: 'Ne cliquez jamais sur un lien dans un email si vous ne connaissez pas l\'____. Les emails qui demandent vos informations bancaires sont souvent du ____. Si un email vous semble suspect, envoyez-le dans les ____.',
        blanks: ['expéditeur', 'phishing', 'spams'],
        options: ['expéditeur', 'destinataire', 'phishing', 'partage', 'spams', 'brouillons', 'objets']
      },
      explanation: 'Le phishing est une arnaque par email pour voler vos données. Méfiez-vous toujours des emails urgents ou suspects.'
    },

    // ===== COURSE 3: Découvrir l'ordinateur =====
    {
      course_id: 3, title: 'Les composants de l\'ordinateur', type: 'association', difficulty: 'facile', points: 10, order_index: 1,
      question: 'Associez chaque composant à sa description.',
      data: {
        pairs: [
          { left: 'Écran', right: 'Affiche les images et le texte' },
          { left: 'Clavier', right: 'Permet de taper du texte' },
          { left: 'Souris', right: 'Contrôle le curseur à l\'écran' },
          { left: 'Tour/Unité centrale', right: 'Le "cerveau" de l\'ordinateur' },
        ]
      },
      explanation: 'Ces quatre éléments sont les composants essentiels d\'un ordinateur de bureau.'
    },
    {
      course_id: 3, title: 'Allumer et éteindre l\'ordinateur', type: 'vrai_faux', difficulty: 'facile', points: 10, order_index: 2,
      question: 'Vrai ou Faux sur l\'utilisation de l\'ordinateur ?',
      data: {
        statements: [
          { text: 'On peut débrancher l\'ordinateur sans l\'éteindre correctement.', answer: false },
          { text: 'Il faut attendre que Windows charge complètement avant de l\'utiliser.', answer: true },
          { text: 'Pour éteindre, on utilise le menu Démarrer.', answer: true },
          { text: 'L\'ordinateur portable fonctionne sans batterie ni câble.', answer: false },
        ]
      },
      explanation: 'Toujours éteindre correctement via le menu Démarrer pour éviter de perdre des données.'
    },
    {
      course_id: 3, title: 'Les périphériques', type: 'qcm', difficulty: 'facile', points: 10, order_index: 3,
      question: 'Qu\'est-ce qu\'une clé USB ?',
      data: {
        options: ['Un type de clavier', 'Un petit support de stockage amovible', 'Un câble d\'alimentation', 'Une connexion internet'],
        correct: 1
      },
      explanation: 'La clé USB permet de stocker et transporter des fichiers facilement. Elle se branche dans les ports rectangulaires de l\'ordinateur.'
    },
    {
      course_id: 3, title: 'Ordinateur portable vs bureau', type: 'association', difficulty: 'moyen', points: 15, order_index: 4,
      question: 'Associez chaque avantage à son type d\'ordinateur.',
      data: {
        pairs: [
          { left: 'Se déplace facilement', right: 'Ordinateur portable' },
          { left: 'Écran généralement plus grand', right: 'Ordinateur de bureau' },
          { left: 'Fonctionne sur batterie', right: 'Ordinateur portable' },
          { left: 'Meilleure puissance pour le prix', right: 'Ordinateur de bureau' },
        ]
      },
      explanation: 'Chaque type a ses avantages selon vos besoins.'
    },
    {
      course_id: 3, title: 'Identifier les ports et connecteurs', type: 'qcm', difficulty: 'moyen', points: 15, order_index: 5,
      question: 'Quel port utilise-t-on pour connecter un casque audio à l\'ordinateur ?',
      data: {
        options: ['Le port USB (rectangulaire)', 'La prise jack 3.5mm (ronde)', 'Le port HDMI (trapézoïdal)', 'Le port réseau (carré)'],
        correct: 1
      },
      explanation: 'La prise jack 3.5mm est la petite prise ronde pour le casque ou les écouteurs. Elle est souvent verte ou avec un symbole de casque.'
    },
    {
      course_id: 3, title: 'L\'ordre de démarrage', type: 'ordre', difficulty: 'moyen', points: 15, order_index: 6,
      question: 'Remettez dans l\'ordre les étapes pour bien démarrer votre ordinateur.',
      data: {
        items: [
          'Vérifier que tous les câbles sont bien branchés',
          'Appuyer sur le bouton de démarrage',
          'Attendre que Windows se charge',
          'Entrer votre mot de passe si demandé',
          'Attendre que le bureau apparaisse complètement',
          'L\'ordinateur est prêt à être utilisé'
        ],
        correct_order: [0, 1, 2, 3, 4, 5]
      },
      explanation: 'Patience pendant le chargement ! Ne pas appuyer frénétiquement sur les touches.'
    },

    // ===== COURSE 4: Se repérer sur Windows =====
    {
      course_id: 4, title: 'Le bureau Windows', type: 'association', difficulty: 'facile', points: 10, order_index: 1,
      question: 'Associez chaque élément du bureau Windows à sa description.',
      data: {
        pairs: [
          { left: 'Icône', right: 'Petite image représentant un programme' },
          { left: 'Barre des tâches', right: 'Barre en bas de l\'écran' },
          { left: 'Bouton Démarrer', right: 'Logo Windows en bas à gauche' },
          { left: 'Bureau', right: 'L\'espace principal de l\'écran' },
        ]
      },
      explanation: 'Le bureau Windows ressemble à un vrai bureau de travail avec des raccourcis vers vos programmes.'
    },
    {
      course_id: 4, title: 'Les fenêtres Windows', type: 'qcm', difficulty: 'facile', points: 10, order_index: 2,
      question: 'Que fait le bouton "X" en haut à droite d\'une fenêtre ?',
      data: {
        options: ['Minimise la fenêtre', 'Agrandit la fenêtre', 'Ferme la fenêtre', 'Déplace la fenêtre'],
        correct: 2
      },
      explanation: 'X = Fermer, le rectangle = Agrandir/Réduire, le tiret (-) = Minimiser dans la barre des tâches.'
    },
    {
      course_id: 4, title: 'Les boutons de fenêtre', type: 'association', difficulty: 'moyen', points: 15, order_index: 3,
      question: 'Associez chaque bouton de fenêtre à son action.',
      data: {
        pairs: [
          { left: '❌', right: 'Fermer définitivement la fenêtre' },
          { left: '🔲', right: 'Agrandir en plein écran' },
          { left: '➖', right: 'Réduire dans la barre des tâches' },
        ]
      },
      explanation: 'Ces trois boutons se trouvent toujours en haut à droite de chaque fenêtre Windows.'
    },
    {
      course_id: 4, title: 'La barre des tâches', type: 'vrai_faux', difficulty: 'facile', points: 10, order_index: 4,
      question: 'Vrai ou Faux sur la barre des tâches Windows ?',
      data: {
        statements: [
          { text: 'La barre des tâches se trouve en bas de l\'écran par défaut.', answer: true },
          { text: 'On peut voir l\'heure dans la barre des tâches.', answer: true },
          { text: 'La barre des tâches ne peut pas être déplacée.', answer: false },
          { text: 'Le bouton Démarrer est dans la barre des tâches.', answer: true },
        ]
      },
      explanation: 'La barre des tâches est très pratique et peut être personnalisée selon vos préférences.'
    },
    {
      course_id: 4, title: 'Ouvrir un programme', type: 'ordre', difficulty: 'facile', points: 10, order_index: 5,
      question: 'Comment ouvrir un programme depuis le menu Démarrer ? Remettez dans l\'ordre.',
      data: {
        items: [
          'Cliquer sur le bouton Démarrer (logo Windows)',
          'Chercher le programme dans la liste ou taper son nom',
          'Cliquer sur le nom du programme',
          'Attendre que le programme s\'ouvre'
        ],
        correct_order: [0, 1, 2, 3]
      },
      explanation: 'Le menu Démarrer donne accès à tous vos programmes installés.'
    },

    // ===== COURSE 5: Utiliser la souris et le clavier =====
    {
      course_id: 5, title: 'Les boutons de la souris', type: 'association', difficulty: 'facile', points: 10, order_index: 1,
      question: 'Associez chaque action souris à sa description.',
      data: {
        pairs: [
          { left: 'Clic gauche', right: 'Sélectionner ou ouvrir un élément' },
          { left: 'Double-clic gauche', right: 'Ouvrir un fichier ou programme' },
          { left: 'Clic droit', right: 'Afficher le menu contextuel' },
          { left: 'Molette centrale', right: 'Faire défiler une page' },
        ]
      },
      explanation: 'Le clic gauche est le plus utilisé. Le clic droit donne accès à des options supplémentaires.'
    },
    {
      course_id: 5, title: 'Les touches spéciales du clavier', type: 'association', difficulty: 'moyen', points: 15, order_index: 2,
      question: 'Associez chaque touche à son rôle.',
      data: {
        pairs: [
          { left: 'Entrée (Enter)', right: 'Valider ou passer à la ligne' },
          { left: 'Suppr / Backspace', right: 'Effacer le caractère' },
          { left: 'Espace', right: 'Insérer un espace entre les mots' },
          { left: 'Maj (Shift)', right: 'Écrire une majuscule' },
          { left: 'Échap (Esc)', right: 'Annuler ou fermer une boîte' },
        ]
      },
      explanation: 'Ces touches spéciales sont essentielles pour utiliser votre ordinateur efficacement.'
    },
    {
      course_id: 5, title: 'Raccourcis clavier essentiels', type: 'qcm', difficulty: 'moyen', points: 15, order_index: 3,
      question: 'Quel raccourci clavier permet de copier un texte sélectionné ?',
      data: {
        options: ['Ctrl + V', 'Ctrl + C', 'Ctrl + X', 'Ctrl + Z'],
        correct: 1
      },
      explanation: 'Ctrl+C = Copier, Ctrl+V = Coller, Ctrl+X = Couper, Ctrl+Z = Annuler. Ces raccourcis fonctionnent partout !'
    },
    {
      course_id: 5, title: 'Vrai ou Faux : La souris', type: 'vrai_faux', difficulty: 'facile', points: 10, order_index: 4,
      question: 'Vrai ou Faux sur l\'utilisation de la souris ?',
      data: {
        statements: [
          { text: 'Il faut déplacer la souris lentement pour plus de précision.', answer: true },
          { text: 'Si la souris sort de l\'écran, on peut la "pousser" contre le bord.', answer: true },
          { text: 'Il faut appuyer très fort sur les boutons de la souris.', answer: false },
          { text: 'Une souris sans fil a besoin de piles.', answer: true },
        ]
      },
      explanation: 'La souris s\'utilise avec légèreté. Un mouvement doux suffit pour déplacer le curseur.'
    },
    {
      course_id: 5, title: 'Les raccourcis clavier', type: 'texte_a_trous', difficulty: 'moyen', points: 15, order_index: 5,
      question: 'Complétez avec les bons raccourcis clavier.',
      data: {
        template: 'Pour enregistrer un document, on utilise ____+S. Pour tout sélectionner, on utilise ____+A. Pour annuler une action, on utilise ____+Z.',
        blanks: ['Ctrl', 'Ctrl', 'Ctrl'],
        options: ['Ctrl', 'Alt', 'Shift', 'Entrée', 'Tab']
      },
      explanation: 'La touche Ctrl (Contrôle) combinée à une lettre donne accès à de nombreuses fonctions.'
    },

    // ===== COURSE 6: Gérer ses fichiers =====
    {
      course_id: 6, title: 'Les types de fichiers', type: 'association', difficulty: 'facile', points: 10, order_index: 1,
      question: 'Associez chaque extension à son type de fichier.',
      data: {
        pairs: [
          { left: '.jpg / .png', right: 'Image / Photo' },
          { left: '.pdf', right: 'Document non modifiable' },
          { left: '.docx', right: 'Document Word' },
          { left: '.mp3', right: 'Fichier audio (musique)' },
          { left: '.mp4', right: 'Fichier vidéo' },
        ]
      },
      explanation: 'L\'extension (après le point) indique le type de fichier et quel programme l\'ouvre.'
    },
    {
      course_id: 6, title: 'Créer un dossier', type: 'ordre', difficulty: 'facile', points: 10, order_index: 2,
      question: 'Remettez dans l\'ordre les étapes pour créer un nouveau dossier.',
      data: {
        items: [
          'Faire un clic droit dans l\'espace vide de l\'explorateur',
          'Choisir "Nouveau" dans le menu',
          'Cliquer sur "Dossier"',
          'Taper le nom du dossier',
          'Appuyer sur Entrée pour valider'
        ],
        correct_order: [0, 1, 2, 3, 4]
      },
      explanation: 'Créer des dossiers permet de bien organiser vos fichiers, comme des classeurs dans une armoire.'
    },
    {
      course_id: 6, title: 'La corbeille Windows', type: 'vrai_faux', difficulty: 'facile', points: 10, order_index: 3,
      question: 'Vrai ou Faux sur la Corbeille Windows ?',
      data: {
        statements: [
          { text: 'Un fichier dans la Corbeille peut encore être récupéré.', answer: true },
          { text: 'Vider la Corbeille libère de l\'espace sur l\'ordinateur.', answer: true },
          { text: 'Pour supprimer définitivement, il faut vider la Corbeille.', answer: true },
          { text: 'La Corbeille peut stocker des fichiers indéfiniment.', answer: false },
        ]
      },
      explanation: 'La Corbeille est votre "filet de sécurité" ! Ne videz que quand vous êtes sûr de ne plus avoir besoin.'
    },
    {
      course_id: 6, title: 'Copier vs Déplacer un fichier', type: 'qcm', difficulty: 'moyen', points: 15, order_index: 4,
      question: 'Quelle est la différence entre "Copier" et "Couper" un fichier ?',
      data: {
        options: [
          'Il n\'y a aucune différence',
          'Copier crée un double, Couper déplace le fichier original',
          'Copier supprime le fichier, Couper le garde',
          'Couper crée un double, Copier déplace le fichier'
        ],
        correct: 1
      },
      explanation: 'Copier (Ctrl+C) garde l\'original ET crée une copie. Couper (Ctrl+X) déplace l\'original sans copie.'
    },
    {
      course_id: 6, title: 'L\'explorateur de fichiers', type: 'association', difficulty: 'moyen', points: 15, order_index: 5,
      question: 'Associez chaque emplacement de stockage à sa description.',
      data: {
        pairs: [
          { left: 'Bureau', right: 'L\'écran principal, accessible dès le démarrage' },
          { left: 'Documents', right: 'Dossier pour vos fichiers personnels' },
          { left: 'Images', right: 'Dossier pour vos photos' },
          { left: 'Téléchargements', right: 'Fichiers téléchargés depuis Internet' },
        ]
      },
      explanation: 'Windows organise automatiquement vos fichiers dans ces dossiers pour vous aider à vous repérer.'
    },

    // ===== COURSE 7: Comment ça marche (Internet) =====
    {
      course_id: 7, title: 'Qu\'est-ce qu\'Internet ?', type: 'qcm', difficulty: 'facile', points: 10, order_index: 1,
      question: 'Qu\'est-ce qu\'Internet ?',
      data: {
        options: [
          'Un programme installé sur votre ordinateur',
          'Un réseau mondial d\'ordinateurs connectés entre eux',
          'Un câble électrique spécial',
          'Un type d\'antenne de télévision'
        ],
        correct: 1
      },
      explanation: 'Internet est un immense réseau qui relie des milliards d\'ordinateurs dans le monde entier.'
    },
    {
      course_id: 7, title: 'Types de connexion Internet', type: 'association', difficulty: 'moyen', points: 15, order_index: 2,
      question: 'Associez chaque type de connexion à sa description.',
      data: {
        pairs: [
          { left: 'Wi-Fi', right: 'Connexion sans fil par onde radio' },
          { left: 'Câble Ethernet', right: 'Connexion filaire, plus stable' },
          { left: '4G / 5G', right: 'Connexion mobile via l\'antenne téléphonique' },
        ]
      },
      explanation: 'Le Wi-Fi est pratique mais le câble est plus stable pour les activités importantes.'
    },
    {
      course_id: 7, title: 'Vocabulaire Internet', type: 'texte_a_trous', difficulty: 'moyen', points: 15, order_index: 3,
      question: 'Complétez les définitions du vocabulaire Internet.',
      data: {
        template: 'Un ____ est l\'adresse d\'un site web (ex: www.google.be). Le ____ est le programme qu\'on utilise pour visiter des sites web. Le ____ est la boîte qui connecte votre maison à Internet.',
        blanks: ['URL', 'navigateur', 'routeur'],
        options: ['URL', 'email', 'navigateur', 'écran', 'routeur', 'clavier', 'moteur']
      },
      explanation: 'Ces termes sont essentiels pour comprendre comment fonctionne votre connexion Internet.'
    },
    {
      course_id: 7, title: 'Internet : vrai ou faux ?', type: 'vrai_faux', difficulty: 'facile', points: 10, order_index: 4,
      question: 'Vrai ou Faux sur Internet ?',
      data: {
        statements: [
          { text: 'Internet fonctionne 24h/24, 7j/7.', answer: true },
          { text: 'Toutes les informations sur Internet sont vraies.', answer: false },
          { text: 'Le Wi-Fi peut être protégé par un mot de passe.', answer: true },
          { text: 'On peut utiliser Internet sur un smartphone.', answer: true },
        ]
      },
      explanation: 'Toujours vérifier les informations sur Internet ! Tout le monde peut publier n\'importe quoi en ligne.'
    },
    {
      course_id: 7, title: 'La connexion Wi-Fi', type: 'ordre', difficulty: 'moyen', points: 15, order_index: 5,
      question: 'Remettez dans l\'ordre les étapes pour vous connecter au Wi-Fi.',
      data: {
        items: [
          'Cliquer sur l\'icône Wi-Fi en bas à droite de l\'écran',
          'Voir la liste des réseaux disponibles',
          'Cliquer sur le nom de votre réseau (box)',
          'Entrer le mot de passe Wi-Fi',
          'Cliquer sur "Connexion"',
          'Attendre la confirmation de connexion'
        ],
        correct_order: [0, 1, 2, 3, 4, 5]
      },
      explanation: 'Le mot de passe Wi-Fi (clé de sécurité) se trouve généralement sous votre box Internet.'
    },

    // ===== COURSE 8: Naviguer sur Internet =====
    {
      course_id: 8, title: 'Les navigateurs web', type: 'association', difficulty: 'facile', points: 10, order_index: 1,
      question: 'Associez chaque navigateur à son logo/couleur caractéristique.',
      data: {
        pairs: [
          { left: 'Google Chrome', right: 'Cercle multicolore rouge/jaune/vert/bleu' },
          { left: 'Mozilla Firefox', right: 'Renard orange entourant un globe bleu' },
          { left: 'Microsoft Edge', right: 'Lettre E bleue avec vague verte' },
          { left: 'Safari', right: 'Boussole bleue (Apple uniquement)' },
        ]
      },
      explanation: 'Tous ces navigateurs permettent d\'accéder à Internet. Google Chrome est le plus utilisé dans le monde.'
    },
    {
      course_id: 8, title: 'La barre d\'adresse', type: 'qcm', difficulty: 'facile', points: 10, order_index: 2,
      question: 'Où tape-t-on l\'adresse d\'un site web pour y accéder ?',
      data: {
        options: ['Dans la barre de recherche Google', 'Dans la barre d\'adresse en haut du navigateur', 'Dans le menu Démarrer', 'Dans un email'],
        correct: 1
      },
      explanation: 'La barre d\'adresse (en haut du navigateur) affiche et accepte les adresses de sites web (URL).'
    },
    {
      course_id: 8, title: 'Navigation web : les boutons', type: 'association', difficulty: 'moyen', points: 15, order_index: 3,
      question: 'Associez chaque bouton du navigateur à son action.',
      data: {
        pairs: [
          { left: '← (Retour)', right: 'Revenir à la page précédente' },
          { left: '→ (Suivant)', right: 'Aller à la page suivante' },
          { left: '⟳ (Actualiser)', right: 'Recharger la page actuelle' },
          { left: '🏠 (Accueil)', right: 'Aller à la page d\'accueil' },
        ]
      },
      explanation: 'Ces boutons de navigation se trouvent en haut à gauche de votre navigateur.'
    },
    {
      course_id: 8, title: 'Utiliser un moteur de recherche', type: 'ordre', difficulty: 'facile', points: 10, order_index: 4,
      question: 'Comment rechercher une information sur Google ? Remettez dans l\'ordre.',
      data: {
        items: [
          'Ouvrir votre navigateur',
          'Aller sur www.google.be',
          'Taper votre recherche dans la barre de recherche',
          'Appuyer sur Entrée',
          'Lire les résultats proposés',
          'Cliquer sur le lien qui vous semble le plus adapté'
        ],
        correct_order: [0, 1, 2, 3, 4, 5]
      },
      explanation: 'Utilisez des mots-clés précis pour trouver rapidement ce que vous cherchez.'
    },
    {
      course_id: 8, title: 'Sécurité en ligne', type: 'vrai_faux', difficulty: 'moyen', points: 15, order_index: 5,
      question: 'Vrai ou Faux sur la sécurité sur Internet ?',
      data: {
        statements: [
          { text: 'Un site sécurisé commence par "https://" (avec le s).', answer: true },
          { text: 'On peut donner son mot de passe à n\'importe quel site.', answer: false },
          { text: 'Il faut se méfier des pop-ups qui disent que votre ordinateur est infecté.', answer: true },
          { text: 'Les achats en ligne sont toujours sécurisés.', answer: false },
        ]
      },
      explanation: 'Le "s" dans "https" garantit une connexion chiffrée. Méfiez-vous des sites et messages suspects.'
    },
    {
      course_id: 8, title: 'Chercher efficacement', type: 'texte_a_trous', difficulty: 'moyen', points: 15, order_index: 6,
      question: 'Complétez les conseils pour mieux chercher sur Internet.',
      data: {
        template: 'Pour une recherche précise, utilisez des ____ clés plutôt que des phrases complètes. Pour voir uniquement les résultats récents, cliquez sur ____. Pour vérifier une information, consultez plusieurs ____ différentes.',
        blanks: ['mots', 'Outils', 'sources'],
        options: ['mots', 'phrases', 'Outils', 'Images', 'sources', 'liens', 'navigateurs']
      },
      explanation: 'La qualité de votre recherche dépend des mots-clés que vous utilisez.'
    },

    // ===== COURSE 9: L'utilité d'Internet =====
    {
      course_id: 9, title: 'Les services disponibles en ligne', type: 'association', difficulty: 'facile', points: 10, order_index: 1,
      question: 'Associez chaque service à son utilité principale.',
      data: {
        pairs: [
          { left: 'YouTube', right: 'Regarder des vidéos gratuitement' },
          { left: 'Gmail / Outlook', right: 'Envoyer et recevoir des emails' },
          { left: 'Google Maps', right: 'Trouver un itinéraire' },
          { left: 'Itsme / MyBenefits', right: 'Démarches administratives belges' },
        ]
      },
      explanation: 'Internet offre des milliers de services gratuits très utiles au quotidien.'
    },
    {
      course_id: 9, title: 'Les achats en ligne', type: 'vrai_faux', difficulty: 'moyen', points: 15, order_index: 2,
      question: 'Vrai ou Faux sur les achats en ligne ?',
      data: {
        statements: [
          { text: 'On peut acheter en ligne depuis chez soi.', answer: true },
          { text: 'Les prix sont toujours moins chers en ligne qu\'en magasin.', answer: false },
          { text: 'Il faut vérifier que le site est sécurisé avant d\'acheter.', answer: true },
          { text: 'Les achats en ligne ne peuvent pas être remboursés.', answer: false },
        ]
      },
      explanation: 'En Belgique, vous avez 14 jours pour retourner un achat en ligne. Vérifiez toujours le "https" et les avis.'
    },
    {
      course_id: 9, title: 'Les arnaques sur Internet', type: 'qcm', difficulty: 'difficile', points: 20, order_index: 3,
      question: 'Vous recevez un email vous annonçant que vous avez gagné 10 000€. Il vous demande vos coordonnées bancaires. Que faites-vous ?',
      data: {
        options: [
          'Répondre immédiatement avec vos coordonnées',
          'Appeler votre banque d\'abord',
          'Ne jamais répondre, c\'est probablement une arnaque',
          'Partager l\'email avec des amis'
        ],
        correct: 2
      },
      explanation: 'C\'est une arnaque classique ! Personne ne vous offre de l\'argent sans raison. Ne jamais donner vos données bancaires par email.'
    },
    {
      course_id: 9, title: 'Services belges en ligne', type: 'association', difficulty: 'moyen', points: 15, order_index: 4,
      question: 'Associez chaque site belge à son service.',
      data: {
        pairs: [
          { left: 'MyBenefits (CPAS)', right: 'Gérer ses aides sociales' },
          { left: 'Brussels Mobility', right: 'Transports en commun bruxellois' },
          { left: 'Tax-on-web', right: 'Déclarer ses impôts en ligne' },
          { left: 'Itsme', right: 'Identification numérique sécurisée' },
        ]
      },
      explanation: 'Ces services belges vous permettent de faire vos démarches administratives depuis chez vous.'
    },
    {
      course_id: 9, title: 'Rester en contact en ligne', type: 'qcm', difficulty: 'facile', points: 10, order_index: 5,
      question: 'Quel service permet de faire des appels vidéo gratuits ?',
      data: {
        options: ['Google Maps', 'WhatsApp ou Skype', 'Amazon', 'Wikipedia'],
        correct: 1
      },
      explanation: 'WhatsApp, Skype, Facetime (Apple) permettent de voir et parler à vos proches gratuitement via Internet.'
    },

    // ===== COURSE 10: Découvrir son smartphone =====
    {
      course_id: 10, title: 'Les éléments du smartphone', type: 'association', difficulty: 'facile', points: 10, order_index: 1,
      question: 'Associez chaque partie du smartphone à sa description.',
      data: {
        pairs: [
          { left: 'Écran tactile', right: 'On touche pour interagir' },
          { left: 'Bouton d\'alimentation', right: 'Allumer/éteindre le téléphone' },
          { left: 'Boutons de volume', right: 'Monter ou baisser le son' },
          { left: 'Caméra', right: 'Prendre des photos et vidéos' },
          { left: 'Port de charge', right: 'Brancher le câble de recharge' },
        ]
      },
      explanation: 'Connaître les éléments de base de votre smartphone vous aidera à l\'utiliser correctement.'
    },
    {
      course_id: 10, title: 'Android vs iPhone', type: 'vrai_faux', difficulty: 'moyen', points: 15, order_index: 2,
      question: 'Vrai ou Faux sur les deux types de smartphones ?',
      data: {
        statements: [
          { text: 'iPhone fonctionne avec le système iOS d\'Apple.', answer: true },
          { text: 'Android est fabriqué uniquement par Samsung.', answer: false },
          { text: 'Les deux types de smartphone peuvent aller sur Internet.', answer: true },
          { text: 'On peut installer les mêmes applications sur Android et iPhone.', answer: false },
        ]
      },
      explanation: 'Android équipe de nombreuses marques (Samsung, Huawei...). Les applications se téléchargent sur des magasins différents (Play Store vs App Store).'
    },
    {
      course_id: 10, title: 'Les gestes tactiles de base', type: 'association', difficulty: 'facile', points: 10, order_index: 3,
      question: 'Associez chaque geste à son action sur l\'écran tactile.',
      data: {
        pairs: [
          { left: 'Appuyer (tap)', right: 'Ouvrir une application' },
          { left: 'Glisser (swipe)', right: 'Faire défiler l\'écran' },
          { left: 'Pincer', right: 'Zoom arrière' },
          { left: 'Écarter les doigts', right: 'Zoom avant' },
          { left: 'Appuyer longtemps', right: 'Afficher les options' },
        ]
      },
      explanation: 'L\'écran tactile réagit différemment selon comment vous le touchez.'
    },
    {
      course_id: 10, title: 'Prendre soin de son smartphone', type: 'vrai_faux', difficulty: 'facile', points: 10, order_index: 4,
      question: 'Vrai ou Faux sur l\'entretien du smartphone ?',
      data: {
        statements: [
          { text: 'Il est conseillé d\'utiliser une coque de protection.', answer: true },
          { text: 'On peut mettre son smartphone sous l\'eau librement.', answer: false },
          { text: 'Il faut recharger la batterie quand elle descend vers 20%.', answer: true },
          { text: 'On peut éteindre le smartphone de temps en temps pour le reposer.', answer: true },
        ]
      },
      explanation: 'Une coque protège votre investissement. Certains smartphones sont waterproof, vérifiez votre modèle.'
    },
    {
      course_id: 10, title: 'Allumer et éteindre le smartphone', type: 'ordre', difficulty: 'facile', points: 10, order_index: 5,
      question: 'Comment éteindre correctement votre smartphone ? Remettez dans l\'ordre.',
      data: {
        items: [
          'Appuyer et maintenir le bouton d\'alimentation',
          'Un menu apparaît à l\'écran',
          'Appuyer sur "Éteindre" ou "Redémarrer"',
          'Confirmer si demandé',
          'L\'écran devient noir : le téléphone est éteint'
        ],
        correct_order: [0, 1, 2, 3, 4]
      },
      explanation: 'Il ne faut pas retirer la batterie pour éteindre ! Utilisez toujours le menu d\'arrêt.'
    },

    // ===== COURSE 11: Se repérer sur son smartphone =====
    {
      course_id: 11, title: 'L\'écran d\'accueil', type: 'association', difficulty: 'facile', points: 10, order_index: 1,
      question: 'Associez chaque élément de l\'écran d\'accueil à sa description.',
      data: {
        pairs: [
          { left: 'Icônes d\'applications', right: 'Raccourcis pour ouvrir vos applis' },
          { left: 'Barre de statut (haut)', right: 'Heure, batterie, Wi-Fi, réseau' },
          { left: 'Barre de navigation (bas)', right: 'Boutons Accueil, Retour, Applications' },
          { left: 'Fond d\'écran', right: 'Image décorative en arrière-plan' },
        ]
      },
      explanation: 'L\'écran d\'accueil est votre point de départ. Personnalisez-le à votre goût !'
    },
    {
      course_id: 11, title: 'Les notifications', type: 'qcm', difficulty: 'facile', points: 10, order_index: 2,
      question: 'Comment voir toutes vos notifications sur Android ?',
      data: {
        options: [
          'Appuyer sur le bouton de volume',
          'Glisser le doigt du haut de l\'écran vers le bas',
          'Appuyer sur le bouton d\'alimentation',
          'Double-cliquer sur l\'écran'
        ],
        correct: 1
      },
      explanation: 'Le "rideau de notifications" s\'ouvre en glissant depuis le haut de l\'écran. Pratique !'
    },
    {
      course_id: 11, title: 'Paramètres essentiels', type: 'association', difficulty: 'moyen', points: 15, order_index: 3,
      question: 'Associez chaque paramètre à ce qu\'il permet de régler.',
      data: {
        pairs: [
          { left: 'Luminosité', right: 'Adapter la clarté de l\'écran' },
          { left: 'Volume', right: 'Régler le niveau sonore' },
          { left: 'Wi-Fi', right: 'Activer/désactiver la connexion sans fil' },
          { left: 'Bluetooth', right: 'Connecter des appareils sans fil (casque...)' },
        ]
      },
      explanation: 'L\'application "Paramètres" (engrenage ⚙️) donne accès à tous ces réglages.'
    },
    {
      course_id: 11, title: 'La batterie et la recharge', type: 'vrai_faux', difficulty: 'facile', points: 10, order_index: 4,
      question: 'Vrai ou Faux sur la batterie du smartphone ?',
      data: {
        statements: [
          { text: 'Baisser la luminosité économise la batterie.', answer: true },
          { text: 'Le Wi-Fi et le Bluetooth consomment de la batterie.', answer: true },
          { text: 'Il faut toujours laisser le téléphone branché toute la nuit.', answer: false },
          { text: 'Le mode avion arrête toutes les connexions et économise la batterie.', answer: true },
        ]
      },
      explanation: 'Pour économiser la batterie : baissez la luminosité et désactivez ce que vous n\'utilisez pas.'
    },

    // ===== COURSE 12: Gérer ses applications =====
    {
      course_id: 12, title: 'Installer une application', type: 'ordre', difficulty: 'facile', points: 10, order_index: 1,
      question: 'Remettez dans l\'ordre les étapes pour installer une application.',
      data: {
        items: [
          'Ouvrir le Play Store (Android) ou App Store (iPhone)',
          'Chercher l\'application par son nom',
          'Sélectionner l\'application dans les résultats',
          'Lire la description et vérifier les avis',
          'Appuyer sur "Installer"',
          'Attendre le téléchargement et l\'installation'
        ],
        correct_order: [0, 1, 2, 3, 4, 5]
      },
      explanation: 'Toujours lire les avis et vérifier qui publie l\'application avant d\'installer.'
    },
    {
      course_id: 12, title: 'Les types d\'applications', type: 'association', difficulty: 'facile', points: 10, order_index: 2,
      question: 'Associez chaque application à sa catégorie.',
      data: {
        pairs: [
          { left: 'WhatsApp', right: 'Communication / Messagerie' },
          { left: 'Google Maps', right: 'Navigation / Cartes' },
          { left: 'YouTube', right: 'Vidéos / Divertissement' },
          { left: 'MyHealth (mutuelle)', right: 'Santé / Administratif' },
        ]
      },
      explanation: 'Il existe des milliers d\'applications gratuites pour vous simplifier la vie au quotidien.'
    },
    {
      course_id: 12, title: 'Les autorisations d\'applications', type: 'vrai_faux', difficulty: 'moyen', points: 15, order_index: 3,
      question: 'Vrai ou Faux sur les autorisations des applications ?',
      data: {
        statements: [
          { text: 'Une lampe de poche n\'a pas besoin d\'accéder à vos contacts.', answer: true },
          { text: 'On peut refuser certaines autorisations à une application.', answer: true },
          { text: 'Si une application demande trop d\'autorisations, c\'est peut-être suspect.', answer: true },
          { text: 'Les applications gratuites sont toujours sûres.', answer: false },
        ]
      },
      explanation: 'Méfiez-vous des applications qui demandent des accès non justifiés. Une lampe de poche n\'a pas besoin de votre localisation !'
    },
    {
      course_id: 12, title: 'Désinstaller une application', type: 'ordre', difficulty: 'facile', points: 10, order_index: 4,
      question: 'Comment désinstaller une application (Android) ? Remettez dans l\'ordre.',
      data: {
        items: [
          'Appuyer longuement sur l\'icône de l\'application',
          'Un menu ou des options apparaissent',
          'Choisir "Désinstaller" ou glisser vers la corbeille',
          'Confirmer la désinstallation',
          'L\'application est supprimée'
        ],
        correct_order: [0, 1, 2, 3, 4]
      },
      explanation: 'Désinstaller les applications que vous n\'utilisez plus libère de l\'espace et améliore les performances.'
    },
    {
      course_id: 12, title: 'Mettre à jour les applications', type: 'qcm', difficulty: 'moyen', points: 15, order_index: 5,
      question: 'Pourquoi est-il important de mettre à jour ses applications ?',
      data: {
        options: [
          'Pour avoir de nouvelles couleurs',
          'Pour corriger les bugs et améliorer la sécurité',
          'Pour utiliser plus de données mobiles',
          'Ce n\'est pas nécessaire'
        ],
        correct: 1
      },
      explanation: 'Les mises à jour corrigent les problèmes de sécurité et ajoutent de nouvelles fonctionnalités. Toujours mettre à jour !'
    },

    // ===== COURSE 13: Gérer ses fichiers (Smartphone) =====
    {
      course_id: 13, title: 'Les fichiers sur smartphone', type: 'association', difficulty: 'facile', points: 10, order_index: 1,
      question: 'Associez chaque type de fichier à son emplacement habituel sur le smartphone.',
      data: {
        pairs: [
          { left: 'Photos prises avec le téléphone', right: 'Galerie / Photos' },
          { left: 'Fichiers téléchargés', right: 'Téléchargements' },
          { left: 'Musique', right: 'Musique / Fichiers musicaux' },
          { left: 'Documents PDF', right: 'Téléchargements ou Documents' },
        ]
      },
      explanation: 'L\'application "Fichiers" (ou "Mes fichiers" sur Samsung) vous montre tous vos fichiers organisés.'
    },
    {
      course_id: 13, title: 'Le stockage en nuage (Cloud)', type: 'vrai_faux', difficulty: 'moyen', points: 15, order_index: 2,
      question: 'Vrai ou Faux sur le stockage en nuage (Cloud) ?',
      data: {
        statements: [
          { text: 'Google Photos permet de sauvegarder vos photos gratuitement.', answer: true },
          { text: 'Si votre téléphone tombe, vos photos Cloud sont perdues.', answer: false },
          { text: 'On peut accéder au Cloud depuis n\'importe quel appareil.', answer: true },
          { text: 'Le Cloud nécessite une connexion Internet.', answer: true },
        ]
      },
      explanation: 'Le Cloud est votre sauvegarde en ligne. Vos fichiers sont protégés même si votre téléphone est perdu !'
    },
    {
      course_id: 13, title: 'Partager une photo', type: 'ordre', difficulty: 'facile', points: 10, order_index: 3,
      question: 'Comment envoyer une photo par WhatsApp depuis votre galerie ? Remettez dans l\'ordre.',
      data: {
        items: [
          'Ouvrir l\'application Galerie / Photos',
          'Trouver la photo que vous voulez envoyer',
          'Appuyer longuement sur la photo pour la sélectionner',
          'Appuyer sur le bouton "Partager" (flèche ou ≤)',
          'Choisir "WhatsApp"',
          'Sélectionner le contact et envoyer'
        ],
        correct_order: [0, 1, 2, 3, 4, 5]
      },
      explanation: 'Le bouton "Partager" (share) permet d\'envoyer des fichiers vers de nombreuses applications.'
    },
    {
      course_id: 13, title: 'Gérer l\'espace de stockage', type: 'qcm', difficulty: 'moyen', points: 15, order_index: 4,
      question: 'Votre téléphone affiche "Stockage presque plein". Que faire en premier ?',
      data: {
        options: [
          'Acheter un nouveau téléphone',
          'Supprimer les photos floues et applications inutilisées',
          'Ignorer le message',
          'Éteindre et rallumer le téléphone'
        ],
        correct: 1
      },
      explanation: 'Commencez par vider la corbeille, supprimer les applications inutiles et transférer les photos vers le Cloud ou un PC.'
    },
    {
      course_id: 13, title: 'La sécurité des données', type: 'vrai_faux', difficulty: 'difficile', points: 20, order_index: 5,
      question: 'Vrai ou Faux sur la sécurité de vos données sur smartphone ?',
      data: {
        statements: [
          { text: 'Activer le verrouillage par code PIN protège vos données.', answer: true },
          { text: 'Il faut éviter de se connecter à des Wi-Fi publics sans protection.', answer: true },
          { text: 'Partager son téléphone déverrouillé avec un inconnu est sans risque.', answer: false },
          { text: 'La reconnaissance faciale est un moyen de sécuriser son téléphone.', answer: true },
        ]
      },
      explanation: 'La sécurité commence par un code PIN ou une empreinte digitale. Ne laissez jamais votre téléphone déverrouillé.'
    },
  ];

  for (const ex of exercises) {
    await pool.query(
      `INSERT INTO exercises (course_id, title, type, question, data, points, difficulty, explanation, order_index)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT DO NOTHING`,
      [ex.course_id, ex.title, ex.type, ex.question, JSON.stringify(ex.data), ex.points, ex.difficulty, ex.explanation, ex.order_index]
    );
  }
  console.log(`✅ ${exercises.length} exercises seeded`);

  // Update total_points per course
  await pool.query(`
    UPDATE courses SET total_points = (
      SELECT COALESCE(SUM(points), 0) FROM exercises WHERE exercises.course_id = courses.id
    )
  `);
  console.log('✅ Course total_points updated');
}

async function main() {
  try {
    console.log('🚀 Starting database setup...');
    await runSchema();
    await seedLevels();
    await seedBadges();
    await seedModules();
    await seedCourses();
    await seedUsers();
    await seedExercises();
    console.log('🎉 Database setup complete!');
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
