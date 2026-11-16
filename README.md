# Proteste in Italia nel 2025

Esercitazione 4 — Il dettaglio · Laboratorio di Computergrafica / Information Design.

Aprire `index.html` tramite Live Server di VS Code, oppure avviare `python3 -m http.server 8000` nella cartella del progetto e visitare `http://localhost:8000`. Il CSV richiede un server HTTP.

`sketch.js` contiene la panoramica e il dettaglio nella stessa canvas. La variabile `regioneScelta` vale `-1` nella panoramica e contiene l’indice della regione nel dettaglio. Il clic su un rettangolo o sulla sua sigla apre il dettaglio; la freccia torna alla panoramica. Non vengono letti o modificati elementi HTML e non vengono usati parametri URL, selettori, API del browser o funzioni DOM di p5.js. `dettaglio.html` è un ingresso alternativo allo stesso sketch e parte dalla panoramica.

Testi, famiglia Helvetica Neue, pesi, dimensioni, spaziatura dei caratteri, interlinee, margini, paragrafi e soglie responsive riprendono la versione originale. Sono disegnati con `text()` nella canvas; non sono più testo HTML selezionabile. `adattaPagina()` prepara una lista di righe di testo con coordinate e stile, usando `paragrafo()` per i ritorni a capo. La lista viene aggiornata soltanto al cambio di regione o al ridimensionamento; `draw()` la disegna con un unico ciclo. La legenda viene impaginata una sola volta. Le tre categorie condividono gli stessi array di nomi, colonne del CSV, colori e descrizioni; `scorri()` gestisce lo scorrimento per rotella e trascinamento.

Nella panoramica sono rappresentate le 20 regioni nello stesso ordine del CSV. La larghezza dei rettangoli è proporzionale alla superficie regionale e l’altezza al numero di eventi; entrambe le scale partono da zero. Il rollover colora di rosa la regione e mostra nome, eventi e superficie. Su schermi piccoli il grafico mantiene una larghezza di almeno 1080 pixel. Per esplorarlo si usa lo scorrimento orizzontale del trackpad, Maiusc con la rotella oppure il trascinamento orizzontale.

Il dettaglio ha una griglia da 600 posti, con distanza uguale in orizzontale e verticale e altezza uguale alla legenda. Si disegnano soltanto gli eventi presenti nel CSV: prima Peaceful protest (bianco), poi Protest with intervention (rosa), infine Riots (rosso scuro). I pallini sono statici: nessun rollover, ingrandimento, tooltip o clic. Su mobile la legenda passa sotto la griglia. La pagina si scorre con la rotella, il trackpad o un trascinamento verticale; lo scorrimento è gestito da variabili p5.js.

Il file `assets/proteste_italia_2025.csv` contiene 20 regioni e 3.195 eventi, con un massimo regionale di 520. I dati sono aggregati e attribuiti ad ACLED: il CSV non contiene date e luoghi dei singoli eventi.

Per l’editor p5.js, usare p5.js 2.3.3, copiare `sketch.js` e caricare il CSV nella cartella `assets`. La stessa versione è inclusa nel progetto. Non occorrono p5.sound o altre librerie. I due HTML sono soltanto i file di avvio della libreria e dello sketch.

Il codice usa variabili, cicli `for`, condizioni, `map()`, funzioni personalizzate e primitive geometriche. I glifi usano `push()`, `translate()` e `pop()`; i rettangoli usano anche `rotate()` e `rectMode(CENTER)`. Il caricamento e il ciclo di calcolo di somma delle superfici e massimo degli eventi sono raccolti in `setup()`, nella funzione eseguita quando il CSV è disponibile. `disegnaGlifo()` disegna rettangoli e pallini con le stesse trasformazioni isolate. La legenda viene preparata insieme al dettaglio, senza una funzione di impaginazione separata. Non ci sono classi, sintassi OOP, promesse o funzioni async nel codice del progetto.

Per mantenere la tipografia originale vengono usate anche funzioni standard di p5.js 2.3.3 quali `textWeight()`, `fontWidth()`, `fontAscent()` e `fontDescent()`. Lo scorrimento usa `mouseWheel()` e `mouseDragged()`. Queste funzioni non sono nominate nell’elenco sintetico fornito; i primi tre esercizi e il codice del docente non sono presenti nel progetto per confrontarne puntualmente il contenuto.
