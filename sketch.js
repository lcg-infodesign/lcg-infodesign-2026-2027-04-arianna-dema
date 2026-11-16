let tabella;
let messaggio = "Caricamento…";
let regioneScelta = -1, regioneAttiva = -1;
let massimoEventi = 0, superficieTotale = 0;

const rosso = "#d43616", bianco = "#ffffff", rosa = "#ed9b94", rossoScuro = "#a8130e";
const carattere = "Helvetica Neue, Helvetica, Arial, sans-serif";

const sottotitolo = "Visualizzazione grafica delle proteste in Italia nel 2025, suddivise per regione.";
const introduzione = "Un’infografica per sensibilizzare sulle proteste avvenute in Italia nel 2025: quante sono, come si distribuiscono sul territorio e a quali tipologie appartengono. Ogni evento rientra in una delle tre categorie: Peaceful protest, Protest with intervention o Riots.";
const fonte = "Il dataset è stato estratto attraverso i filtri di ACLED — Armed Conflict Location & Event Data Project, un’organizzazione non governativa senza scopo di lucro che raccoglie, analizza e mappa dati sui conflitti nel mondo.";
const nomiTipi = ["Peaceful protest", "Protest with intervention", "Riots"];
const colonneTipi = ["pacifiche", "con_intervento", "violente"];
const coloriTipi = [bianco, rosa, rossoScuro];
const descrizioni = [
  "Manifestanti pacifici che non ricorrono alla violenza né a comportamenti da rivolta e non incontrano alcuna forma di forza o intervento. La protesta si svolge senza scontri, da nessuna delle due parti.",
  "Manifestanti pacifici che subiscono un tentativo di dispersione o repressione, senza feriti gravi o mortali segnalati, oppure si trovano di fronte ad armi letali. I manifestanti restano non violenti, ma le forze dell’ordine o altri soggetti intervengono.",
  "Eventi violenti in cui manifestanti o folle compiono atti di disturbo: manifestazioni violente con vandalismo, blocchi stradali o copertoni bruciati, e violenza di massa con scontri tra gruppi o contro civili.",
];

let xPagina, yPagina, larghezzaPagina, altezzaPagina, yGrafico, larghezzaGrafico;
let xLegenda, yLegenda, larghezzaLegenda, larghezzaGriglia, altezzaGriglia;
let colonnePunti = 30, passoPunti = 0, diametroPunti = 0;
let scorrimento = 0, scorrimentoGrafico = 0;
let trascinato = false;
let testi = [], yTipi = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  adattaPagina();
  loadTable("assets/proteste_italia_2025.csv", ",", true, function(dati) {
    tabella = dati;
    for (let i = 0; i < tabella.getRowCount(); i++) {
      superficieTotale += tabella.getNum(i, "superficie_km2");
      massimoEventi = max(massimoEventi, tabella.getNum(i, "eventi_totali"));
    }
    adattaPagina();
  }, function() {
    messaggio = "CSV non disponibile.";
    adattaPagina();
  });
}

function adattaPagina() {
  let margine = 32; yPagina = 30;
  if (width <= 900) { margine = 20; yPagina = 24; }
  if (width <= 650) { margine = 16; yPagina = 22; }
  let larghezza = min(width, 1800);
  xPagina = (width - larghezza) / 2 + margine;
  larghezzaPagina = larghezza - margine * 2;
  larghezzaGrafico = max(larghezzaPagina, 1080);
  testi = [];
  if (regioneScelta < 0) altezzaPagina = preparaPanoramica();
  else altezzaPagina = preparaDettaglio();
  scorri(0, 0, false);
  scorrimentoGrafico = constrain(scorrimentoGrafico, 0, larghezzaGrafico - larghezzaPagina);
}
function stileTesto(dimensione, peso, famiglia = carattere) { textFont(famiglia, dimensione); textWeight(peso); }
// Ritorni a capo anche nei nomi con trattino.
function paragrafo(contenuto, x, y, larghezza, dimensione, peso, interlinea, spazio = 0, famiglia = carattere) {
  stileTesto(dimensione, peso, famiglia);
  interlinea = round(interlinea * 128) / 128;
  let base = (interlinea - fontAscent() - fontDescent()) / 2 + fontAscent();
  let righe = [], riga = "";
  for (let i = 0; i <= contenuto.length; i++) {
    if (i == contenuto.length || contenuto[i] == "\n") {
      righe.push(riga.trim());
      riga = "";
    } else {
      riga += contenuto[i];
      if (riga.length > 1 && fontWidth(riga) + spazio * riga.length > larghezza) {
        let taglio = max(riga.lastIndexOf(" "), riga.lastIndexOf("-", riga.length - 2) + 1);
        if (taglio <= 0) taglio = riga.length - 1;
        righe.push(riga.substring(0, taglio).trim());
        riga = riga.substring(taglio).trimStart();
      }
    }
  }
  // Riga: testo, x, y, dimensione, peso, spaziatura, font.
  for (let i = 0; i < righe.length; i++)
    testi.push([righe[i], x, y + i * interlinea + base, dimensione, peso, spazio, famiglia]);
  return righe.length * interlinea;
}

function preparaPanoramica() {
  let dimensione = constrain(width * 0.0965, 56, 170), distanza = 32;
  if (width <= 650) { dimensione = width * 0.102; distanza = 24; }
  let y = yPagina + paragrafo("PROTESTE IN ITALIA\nNEL 2025", xPagina, yPagina, larghezzaPagina, dimensione, 700, dimensione * 0.84, -dimensione * 0.075) + distanza;
  dimensione = constrain(width * 0.028, 25, 48);
  let spazio = larghezzaPagina;
  if (width >= 1000) spazio = 10000;
  y += paragrafo(sottotitolo, xPagina, y, spazio, dimensione, 200, dimensione * 1.08, -dimensione * 0.045) + 25;
  spazio = min(larghezzaPagina, 740);
  y += paragrafo(introduzione, xPagina, y, spazio, 14, 400, 20.3) + 12;
  y += paragrafo(fonte, xPagina, y, spazio, 14, 400, 20.3);
  distanza = 34;
  if (width <= 650) distanza = 28;
  yGrafico = y + distanza;
  if (!tabella) paragrafo(messaggio, xPagina, yGrafico + 15, larghezzaPagina, 12, 400, 15);
  y = yGrafico + 507;
  y += paragrafo("La larghezza di ogni rettangolo è proporzionale alla superficie della regione; l’altezza al numero di proteste.", xPagina, y, larghezzaPagina, 14, 400, 20.3) + 12;
  y += paragrafo("Passa su una regione per leggere i dati, clicca per esplorarla.", xPagina, y, larghezzaPagina, 14, 400, 20.3);
  return y + 22;
}

function preparaDettaglio() {
  let dimensione = constrain(width * 0.079, 44, 130);
  let y = yPagina + 45, spazio = larghezzaPagina - 100, distanza = 20;
  if (width <= 650) { dimensione = width * 0.12; y -= 2; spazio += 55; distanza = 24; }
  y += paragrafo(tabella.getString(regioneScelta, "regione").toUpperCase(), xPagina, y, spazio, dimensione, 700, dimensione * 0.95, -dimensione * 0.075) + distanza;
  dimensione = constrain(width * 0.18, 150, 280);
  let totale = tabella.getNum(regioneScelta, "eventi_totali").toLocaleString("it-IT");
  let altezza = paragrafo(totale, xPagina, y, 10000, dimensione, 100, dimensione * 0.85, -dimensione * 0.085);
  let xEtichetta = xPagina + (fontWidth(totale) - dimensione * 0.085 * totale.length);
  dimensione = 18; distanza = 27;
  if (width <= 650) { dimensione = 16; distanza = 20; }
  let interlinea = round(dimensione * 1.15 * 128) / 128;
  paragrafo("eventi registrati\nnel 2025", xEtichetta + distanza, y + altezza - interlinea * 2 - 8, 10000, dimensione, 200, interlinea);
  yGrafico = y + altezza + floor((37 + 96 / 2.54) * 64) / 64;
  distanza = 36;
  larghezzaLegenda = max(290, (larghezzaPagina - distanza) / 4);
  if (width <= 900) { distanza = 24; larghezzaLegenda = 275; }
  larghezzaGriglia = larghezzaPagina - distanza - larghezzaLegenda;
  if (width <= 650) { yGrafico -= 7; larghezzaGriglia = larghezzaPagina; larghezzaLegenda = larghezzaPagina; }
  let inizioLegenda = testi.length;
  let margine = 20, sopra = 22; dimensione = 18;
  if (width <= 900) { margine = 16; sopra = 20; }
  if (width <= 650) dimensione = 16;
  let testoX = margine + 1, testoY = sopra + 1;
  spazio = larghezzaLegenda - margine * 2 - 2;
  testoY += paragrafo("LEGENDA", testoX, testoY, spazio, dimensione, 700, dimensione * 1.2, 0, "Helvetica, Arial, sans-serif") + 15;
  testoY += paragrafo("Un pallino = un evento.\nIl colore ne indica la tipologia.", testoX, testoY, spazio, dimensione, 700, dimensione * 1.2, 0, "Helvetica, Arial, sans-serif") + 25;
  for (let i = 0; i < 3; i++) {
    yTipi[i] = testoY;
    let xTipo = testoX + 25;
    let conteggio = tabella.getNum(regioneScelta, colonneTipi[i]);
    if (width <= 650) {
      stileTesto(13, 500);
      let xConteggio = xTipo + fontWidth(nomiTipi[i] + " ") + 8;
      stileTesto(19, 200);
      let interlinea = round(24.7 * 128) / 128;
      let base = testoY + (interlinea - fontAscent() - fontDescent()) / 2 + fontAscent();
      testi.push([conteggio, xConteggio, base, 19, 200, 0, carattere],
        [nomiTipi[i], xTipo, base, 13, 500, 0, carattere]);
      testoY += interlinea;
    } else {
      testoY += paragrafo(nomiTipi[i], xTipo, testoY, spazio - 25, 13, 500, 16.9) + 4;
      testoY += paragrafo("" + conteggio, xTipo, testoY, spazio - 25, 26, 200, 33.8);
    }
    testoY += 7;
    testoY += paragrafo(descrizioni[i], xTipo, testoY, spazio - 25, 12, 300, 17.4);
    if (i < 2) testoY += 22;
  }
  altezzaGriglia = testoY + sopra + 1;
  for (let colonne = 1; colonne <= 600; colonne++) {
    if (600 % colonne == 0) {
      let passo = altezzaGriglia / (600 / colonne - 1 + 0.65);
      if ((colonne - 1 + 0.65) * passo <= larghezzaGriglia) { colonnePunti = colonne; passoPunti = passo; }
    }
  }
  diametroPunti = passoPunti * 0.65;
  xLegenda = xPagina + larghezzaGriglia + distanza; yLegenda = yGrafico;
  if (width <= 650) { xLegenda = xPagina; yLegenda += altezzaGriglia + 30; }
  for (let i = inizioLegenda; i < testi.length; i++) {
    testi[i][1] += xLegenda;
    testi[i][2] += yLegenda;
  }
  return yLegenda + altezzaGriglia + 30;
}

function draw() {
  background(rosso); cursor(ARROW);
  push(); translate(0, -scorrimento);
  noStroke();
  if (regioneScelta < 0) {
    if (tabella) disegnaRegioni();
    fill(255, 153);
    rect(xPagina, yGrafico + 489, larghezzaPagina, 1);
  } else disegnaDettaglio();
  fill(bianco); textAlign(LEFT, BASELINE);
  for (let i = 0; i < testi.length; i++) {
    let riga = testi[i];
    stileTesto(riga[3], riga[4], riga[6]);
    if (riga[5] == 0) text(riga[0], riga[1], riga[2]);
    else for (let j = 0; j < riga[0].length; j++) {
      let x = fontWidth(riga[0].substring(0, j + 1)) - fontWidth(riga[0][j]);
      text(riga[0][j], riga[1] + x + j * riga[5], riga[2]);
    }
  }
  pop();
}

function disegnaRegioni() {
  let x = 0, spazio = larghezzaGrafico - 5 * (tabella.getRowCount() - 1);
  let mx = mouseX - xPagina + scorrimentoGrafico, my = mouseY + scorrimento - yGrafico;
  regioneAttiva = -1;
  stileTesto(10, 400);
  push();
  translate(xPagina - scorrimentoGrafico, yGrafico);
  for (let i = 0; i < tabella.getRowCount(); i++) {
    let larghezza = map(tabella.getNum(i, "superficie_km2"), 0, superficieTotale, 0, spazio);
    let altezza = map(tabella.getNum(i, "eventi_totali"), 0, massimoEventi, 0, 345);
    let sigla = tabella.getString(i, "sigla"), metaSigla = textWidth(sigla) / 2;
    let xSigla = constrain(x + larghezza / 2, metaSigla + 1, larghezzaGrafico - metaSigla - 1);
    let sopra = mx >= x && mx <= x + larghezza && my >= 422 - altezza && my <= 422;
    let sopraSigla = mx >= min(x - 2.5, xSigla - metaSigla) && mx <= max(x + larghezza + 2.5, xSigla + metaSigla) && my > 422 && my <= 455;
    let attivo = (sopra || sopraSigla) && mouseX >= xPagina && mouseX <= xPagina + larghezzaPagina;
    let colore = bianco;
    if (attivo) { regioneAttiva = i; colore = rosa; cursor(HAND); }
    disegnaGlifo(x + larghezza / 2, 422, larghezza, colore, altezza);
    fill(bianco); textAlign(CENTER, TOP);
    text(sigla, xSigla, 434);
    x += larghezza + 5;
  }
  pop();
  // Margini del grafico durante lo scorrimento.
  fill(rosso);
  rect(0, yGrafico, xPagina, 465);
  rect(xPagina + larghezzaPagina, yGrafico, width - xPagina - larghezzaPagina, 465);
  if (regioneAttiva >= 0) {
    fill(rosa); stileTesto(15, 400); textAlign(LEFT, TOP);
    let nome = tabella.getString(regioneAttiva, "regione"), eventi = tabella.getNum(regioneAttiva, "eventi_totali");
    let superficie = tabella.getNum(regioneAttiva, "superficie_km2").toLocaleString("it-IT");
    text(nome + " / " + eventi + " eventi / " + superficie + " km²", xPagina, yGrafico + 8);
  }
}

function disegnaDettaglio() {
  let pacifiche = tabella.getNum(regioneScelta, "pacifiche"), intervento = tabella.getNum(regioneScelta, "con_intervento");
  for (let i = 0; i < tabella.getNum(regioneScelta, "eventi_totali"); i++) {
    let tipo = 0;
    if (i >= pacifiche + intervento) tipo = 2;
    else if (i >= pacifiche) tipo = 1;
    disegnaGlifo(xPagina + diametroPunti / 2 + i % colonnePunti * passoPunti,
      yGrafico + diametroPunti / 2 + floor(i / colonnePunti) * passoPunti, diametroPunti, coloriTipi[tipo]);
  }
  let margine = 20;
  if (width <= 900) margine = 16;
  for (let i = 0; i < 3; i++) disegnaGlifo(xLegenda + margine + 7.5, yLegenda + yTipi[i] + 7.5, 13, coloriTipi[i]);
  noFill(); stroke(bianco);
  rect(xLegenda + 0.5, yLegenda + 0.5, larghezzaLegenda - 1, altezzaGriglia - 1);
  let colore = bianco;
  if (sopraIndietro()) { colore = rosa; cursor(HAND); }
  let x = xPagina + larghezzaPagina - 48, y = yPagina + 21.5;
  noStroke(); fill(colore);
  rect(x, y, 40, 1);
  stroke(colore);
  line(x + 5.5, y - 7.3, x - 2.3, y + 0.5);
  line(x - 2.3, y + 0.5, x + 5.5, y + 8.3);
  noStroke();
}

function disegnaGlifo(x, y, larghezza, colore, altezza = 0) {
  push();
  if (altezza > 0) y -= altezza / 2;
  translate(x, y); fill(colore);
  if (altezza > 0) {
    rotate(HALF_PI); rectMode(CENTER);
    rect(0, 0, altezza, larghezza);
  } else ellipse(0, 0, larghezza, larghezza);
  pop();
}

function sopraIndietro() {
  return mouseX >= xPagina + larghezzaPagina - 56 && mouseX <= xPagina + larghezzaPagina &&
    mouseY + scorrimento >= yPagina && mouseY + scorrimento <= yPagina + 44;
}

function mouseClicked() {
  if (!tabella || trascinato) return;
  if (regioneScelta < 0 && regioneAttiva >= 0) regioneScelta = regioneAttiva;
  else if (regioneScelta >= 0 && sopraIndietro()) regioneScelta = -1;
  else return;
  regioneAttiva = -1; scorrimento = scorrimentoGrafico = 0;
  adattaPagina();
}

function scorri(dx, dy, orizzontale) {
  if (regioneScelta < 0 && mouseY + scorrimento >= yGrafico && mouseY + scorrimento <= yGrafico + 465 && orizzontale)
    scorrimentoGrafico = constrain(scorrimentoGrafico + dx, 0, larghezzaGrafico - larghezzaPagina);
  else scorrimento = constrain(scorrimento + dy, 0, max(0, altezzaPagina - height));
}

function mouseWheel(evento) {
  let dx = evento.deltaX;
  if (evento.shiftKey) dx += evento.deltaY;
  scorri(dx, evento.deltaY, evento.deltaX != 0 || evento.shiftKey);
  return false;
}
function mousePressed() { trascinato = false; }

function mouseDragged() {
  let dx = pmouseX - mouseX, dy = pmouseY - mouseY;
  if (abs(dx) + abs(dy) > 3) trascinato = true;
  scorri(dx, dy, abs(dx) > abs(dy));
  return false;
}
function windowResized() { resizeCanvas(windowWidth, windowHeight); adattaPagina(); }
