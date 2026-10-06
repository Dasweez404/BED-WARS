# 🏴‍☠️ Jouer en ligne : héberger et rejoindre une partie

Le multijoueur de *Pirates & Trésors* est du **pair-à-pair** (WebRTC) : il n'y a **aucun serveur de jeu à installer**.
Un joueur, **l'hôte**, fait tourner la partie dans son navigateur ; les autres (jusqu'à **3 invités**, donc 4 joueurs en tout) se connectent à lui avec un **code de salon** de 5 caractères. Les équipages restants sont joués par des bots.

> Seul un petit « courtier » public (PeerJS Cloud) sert à mettre les joueurs en relation au moment de la connexion. Ensuite, les données passent directement entre les navigateurs.

---

## 1. Ce qu'il faut

| | Hôte | Invités |
|---|---|---|
| Navigateur récent (Chrome, Edge, Firefox, Safari) | ✅ | ✅ |
| Connexion Internet | ✅ (stable, de préférence en filaire ou Wi-Fi 5 GHz) | ✅ |
| Le jeu ouvert dans le navigateur | ✅ | ✅ |

**Tout le monde doit ouvrir la même version du jeu.** Le plus simple est de mettre le jeu en ligne une fois (étape 2) et de partager le lien.

## 2. Mettre le jeu en ligne (une seule fois, gratuit)

### Option A – GitHub Pages (recommandé)
1. Sur GitHub, ouvre le dépôt du jeu → **Settings** → **Pages**.
2. *Source* : **Deploy from a branch**. Choisis la branche qui contient le jeu (par exemple `main`, après avoir fusionné `claude/gallant-einstein-uprbq8`) et le dossier **/ (root)**, puis **Save**.
3. Au bout d'une minute, le jeu est accessible à une adresse du type `https://<ton-pseudo>.github.io/<nom-du-depot>/`. Partage ce lien à tes amis.

### Option B – Aucun hébergement (tout le monde a les fichiers)
Chaque joueur télécharge le dépôt (**Code → Download ZIP**), le décompresse et double-clique sur `index.html`. Cela fonctionne aussi, à condition que **tous aient exactement la même version**.

### Option C – Sur ton réseau local (LAN)
Dans le dossier du jeu : `python3 -m http.server 8000`, puis les autres ouvrent `http://<ton-ip-locale>:8000`. Le courtier PeerJS reste nécessaire (Internet) pour la mise en relation, mais la partie elle-même passe ensuite directement entre les machines.

## 3. Héberger une partie

1. Ouvre le jeu. Dans le menu, règle **ton pirate** (nom, classe, apparence) et les **options de partie** (mode 2v2, carte, ressources, roster, événements, difficulté des bots…). *Ce sont les options de l'hôte qui s'appliquent à tout le monde.*
2. Descends à **Multijoueur en ligne** et clique sur **Héberger**.
3. Un **code de salon** s'affiche (ex. `K7P2X`). Envoie-le à tes amis (message, Discord…).
4. Les joueurs apparaissent dans la liste au fur et à mesure (« Joueurs : … »).
5. Quand tout le monde est là, clique sur **▶ Lancer la partie**.

L'hôte garde son onglet ouvert **et au premier plan pendant toute la partie** : s'il le ferme, la partie s'arrête pour tous (et un onglet en arrière-plan est ralenti par le navigateur).

## 4. Rejoindre une partie

1. Ouvre le jeu, choisis ton **nom**, ta **classe** et ton **apparence**.
2. Dans **Multijoueur en ligne**, tape le **code du salon** reçu, puis **Rejoindre**.
3. Quand l'état indique *« Connecté… En attente de l'hôte »*, attends que l'hôte lance la partie. Tu peux encore changer de classe ou d'apparence avant le départ.
4. Les invités prennent les équipes 2, 3 puis 4 (Rouges, Verts, Jaunes) ; l'hôte joue les Bleus.

Les commandes sont les mêmes qu'en solo (ZQSD, Espace, souris, 1-0, Tab, E pour la boutique…). La boutique et l'inventaire sont **personnels**.

## 5. En cours de partie

- Si un invité quitte ou perd la connexion, **un bot reprend son pirate**.
- Si l'hôte quitte, les invités reviennent au menu avec un message.
- La partie en ligne se termine quand il ne reste **qu'un équipage** ou plus aucun humain en vie. Un clic ramène au menu.
- Les événements aléatoires (requin, tempête…) et le roster d'objets sont gérés par l'hôte et vus par tous.

## 6. Dépannage

| Problème | Piste |
|---|---|
| « Erreur réseau : network » | Pas d'accès Internet, ou courtier PeerJS bloqué (réseau d'entreprise ou d'école). Essaie un partage de connexion 4G. |
| « Salon introuvable » | Mauvais code, ou l'hôte n'a pas (encore) cliqué sur *Héberger*. Les codes n'utilisent ni `0/O` ni `1/I`. |
| Reste sur *« Connexion… »* | NAT très strict ou VPN : WebRTC ne peut pas relier les deux machines sans relais (TURN). Désactive le VPN, essaie un autre réseau, ou héberge depuis une autre machine. |
| Ça saccade chez l'invité | L'hôte simule tout : il lui faut une bonne connexion ET un PC correct. Baisse la qualité avec **G**, ferme les autres onglets. |
| « Salon complet ou partie déjà lancée » | Maximum 3 invités, et personne ne peut rejoindre après le lancement. |
| Comportements bizarres, objets manquants | Les versions ne correspondent pas : rechargez tous la page (Ctrl+F5) ou re-téléchargez le jeu. |

## 6 bis. Le journal réseau (diagnostic)

Dans la section *Multijoueur en ligne* du menu, déplie **« Journal réseau (diagnostic) »** : il montre chaque étape (courtier joint, invité connecté, état de la liaison WebRTC `ICE`, premiers messages reçus…). Clique sur **Copier le journal** et envoie-le-moi si la connexion échoue : il indique exactement où ça bloque.

- *« courtier OK » puis « pas de réponse de l'hôte »* : mauvais code, hôte hors ligne, ou liaison directe bloquée (pare-feu / VPN).
- *« ICE: failed »* : NAT trop strict. Le jeu essaie aussi un relais TURN public gratuit, mais il peut être saturé ; change de réseau si possible.
- *Rien après « Connexion au courtier »* : le courtier PeerJS est inaccessible depuis ton réseau.

## 7. Avancé

- **Courtier personnel** (si le public est bloqué ou instable) : sur une machine accessible, lance `npx peerjs --port 9000`, puis ouvre le jeu avec  
  `index.html?peerhost=mon-serveur.exemple&peerport=9000&peerpath=/&peersecure=0`  
  (`peersecure=1` si ton serveur est en HTTPS). Hôte **et** invités doivent utiliser les mêmes paramètres.
- **Test local à deux onglets** : coche *« test local (2 onglets) »* puis **Héberger** dans un onglet ; dans un second onglet **du même navigateur**, coche la même case et entre le code (il commence par `L-`). Pratique pour tester sans Internet.
- Les relais **TURN** (pour les réseaux très stricts) ne sont pas fournis : seul le STUN public par défaut de PeerJS est utilisé.

## 8. Comment ça marche (pour les curieux)

- L'hôte exécute toute la simulation (`js/sim.js`) et envoie ~15 fois par seconde un instantané (pirates, projectiles, blocs modifiés, événements) aux invités.
- Les invités n'exécutent **pas** la simulation : ils envoient leurs commandes (déplacement, visée, clic, saut, achats…) et affichent ce que l'hôte renvoie, avec lissage et une petite prédiction du déplacement pour rester réactifs.
- Le code réseau est dans `js/net.js` ; la bibliothèque PeerJS (`js/peerjs.min.js`) est incluse dans le dépôt.
