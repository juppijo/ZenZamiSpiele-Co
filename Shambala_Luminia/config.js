// Inhalte des Spiels: Ebenen, Weisheiten, Tageszeiten – hier leicht erweiterbar.
const LEVELS = [
  { name:'Tal des Bewusstseinsflusses', size:6,  hue:.33, ground:0x86c58a, path:0xcfe8b0,
    intro:'Zenjio: „Atme. Der Weg beginnt dort, wo du stehst.“',
    outro:'Der Fluss glitzert wie flüssiges Licht. Zenjio lächelt: „Drei Samen hast du gesammelt. Geh weiter zum Harfenwald.“' },
  { name:'Harfenwald', size:8, hue:.44, ground:0x5fae98, path:0xbfe3d4,
    intro:'Die Blätter klingen wie Harfen. Luna schnurrt: „Hör zu – der Wald erzählt Geheimnisse.“',
    outro:'Die Harfenblätter singen deinen Namen. Mia ruft: „Die Berge warten auf dich!“' },
  { name:'Goldene Berge', size:10, hue:.15, ground:0xcdbd6e, path:0xf0e2a8,
    intro:'Mia: „Alte Mauern, goldenes Licht – hier erinnert sich die Welt an sich selbst.“',
    outro:'Das Gold der Gipfel spiegelt sich in deinen Augen. Vor dir leuchtet der Kreis der Steine.' },
  { name:'Kreis der Kristallsteine', size:12, hue:.74, ground:0x8e86c8, path:0xd9d0f5,
    intro:'Zami: „Das letzte Labyrinth. Der Kristall pulsiert wie ein Herz – folge ihm.“',
    outro:'Du setzt dich in den Kreis. Der Kristall atmet mit dir. Keine Fragen, keine Antworten – nur Sein. 🌸' }
];

// 3 Weisheiten pro Ebene. c = Index der richtigen Antwort.
const WISDOMS = [
  { who:'Zenjio', q:'Ein voller Becher kann keinen Tee mehr aufnehmen. Was braucht dein Geist, um Neues zu lernen?',
    a:['Noch mehr Wissen','Leere und Offenheit','Strenge Regeln'], c:1,
    h:'Denke an einen Becher, der schon überläuft.', w:'Der Anfängergeist ist offen – im Geist des Anfängers liegen viele Möglichkeiten.' },
  { who:'Luna', q:'Miau! Ich habe mich verlaufen. Wo liegt der Weg?',
    a:['Im nächsten Schritt','Weit hinter mir','Nirgends'], c:0,
    h:'Katzen schauen nie zu lange zurück.', w:'Der Weg entsteht beim Gehen.' },
  { who:'Mia', q:'Eine zerbrochene Schale wird mit Gold geflickt (Kintsugi). Was sagt das über Risse?',
    a:['Man muss sie verstecken','Sie machen das Stück einzigartig','Sie machen es wertlos'], c:1,
    h:'Warum sollte man Gold verwenden, wenn man etwas verbergen wollte?', w:'Unvollkommenheit ist oft der erste Ort, an dem Schönheit beginnt.' },

  { who:'Zenjio', q:'Ein Koan fragt: „Wie klingt das Klatschen einer Hand?“ Wie näherst du dich?',
    a:['Ich lausche in die Stille','Ich klatsche lauter','Ich suche die Lösung nach'], c:0,
    h:'Manche Fragen löst man nicht mit dem Kopf.', w:'Manche Fragen löst man nicht durch Denken, sondern durch Stille.' },
  { who:'Zami', q:'Beim Aquarell: Was geschieht, wenn ich jeden Wassertropfen kontrollieren will?',
    a:['Das Bild wird besser','Die Farben verlieren ihre Leichtigkeit','Nichts'], c:1,
    h:'Wasser und Farbe kennen ihren Weg oft besser als ich.', w:'Loslassen schenkt Leichtigkeit – Wasser und Farbe wissen den Weg.' },
  { who:'Zenjio', q:'Der Fluss weicht Steinen aus und höhlt sie doch. Was lehrt er?',
    a:['Härte siegt','Sanftheit und Beharrlichkeit','Eile'], c:1,
    h:'Beim Tai-Chi gibt man nach – und gewinnt.', w:'Das Weiche überwindet das Harte.' },

  { who:'Mia', q:'Alte Mauern erzählen von gestern. Wann findet dein Leben statt?',
    a:['Gestern','Morgen','Jetzt'], c:2,
    h:'Nur in einem Augenblick kannst du atmen.', w:'Der gegenwärtige Augenblick ist der einzige, in dem wir leben.' },
  { who:'Luna', q:'Ich esse, putze mich, schlafe – ohne Eile. Was tue ich, wenn ich esse?',
    a:['Ich esse – nur das','Ich plane die Woche','Ich ärgere mich'], c:0,
    h:'Katzen sind immer ganz bei einer Sache.', w:'Wenn ich esse, dann esse ich. Achtsamkeit wohnt im Alltag.' },
  { who:'Zenjio', q:'Ein Mönch fragt: „Was ist der Weg?“ Der Meister sagt: „Trink Tee.“ Was meint er?',
    a:['Das Gewöhnliche ist der Weg','Tee ist heilig','Frag nicht'], c:0,
    h:'Wo ist der Weg, wenn nicht in dem, was du gerade tust?', w:'Das Gewöhnliche, ganz getan, ist der Weg.' },

  { who:'Zami', q:'Selbstzweifel tauchen auf. Was tust du mit ihnen?',
    a:['Ich bekämpfe sie','Ich lasse sie wie Wolken ziehen','Ich glaube ihnen'], c:1,
    h:'Wolken bleiben nie am Himmel hängen.', w:'Gedanken sind Wolken – du bist der Himmel.' },
  { who:'Mia', q:'Was macht ein Haus bewohnbar – sagt Laozi?',
    a:['Die Wände','Der leere Raum darin','Das Dach'], c:1,
    h:'Wo würdest du wohnen: in der Wand oder zwischen den Wänden?', w:'Das Leere macht das Nützliche nützlich.' },
  { who:'Zenjio', q:'Wo liegt Shambala Luminia?',
    a:['Hinter den Bergen','Im Herzen','In einem fernen Land'], c:1,
    h:'Du bist hier hineingegangen, indem du die Augen schlossest.', w:'Der Kristall ruht in dir.' }
];

const TIMES = {
  dawn: { sky:0xf7b7a3, fog:0xf3c9b4, hemi:.95, sun:0xffc48a, si:.7,  stars:0 },
  day:  { sky:0x9fd8f0, fog:0xcdeaf2, hemi:1.15, sun:0xffffff, si:.9,  stars:0 },
  dusk: { sky:0xc2678f, fog:0x9c6a9a, hemi:.75, sun:0xff8a5c, si:.6,  stars:.35 },
  night:{ sky:0x0d1030, fog:0x151a45, hemi:.55, sun:0x8fa4ff, si:.35, stars:1 }
};

// Heckenfarben: h = Farbton-Bereich (0–1), s = Sättigung, l = Helligkeit, fl = Blütenfarben. natur = Farbe der Ebene.
const HEDGES = {
  natur: null,
  bunt:  { h:[0, 1],      s:.55, l:.36, fl:[0xff5c93, 0xffe27a, 0x6ee7b7, 0x7aa8ff, 0xc9b3ff, 0xff9a5c] },
  herbst:{ h:[.0, .12],   s:.65, l:.34, fl:[0xff6a3d, 0xffb347, 0xffe27a, 0xd7263d, 0xffffff, 0xc9b3ff] },
  rosa:  { h:[.88, .98],  s:.5,  l:.45, fl:[0xff8fb8, 0xffc2dc, 0xffffff, 0xffd9e8, 0xff5c93, 0xffe27a] },
  frost: { h:[.5, .64],   s:.45, l:.5,  fl:[0xffffff, 0xcfe8ff, 0xc9b3ff, 0xa0e7ff, 0xffc2dc, 0xffe27a] },
  gold:  { h:[.09, .17],  s:.6,  l:.46, fl:[0xffe27a, 0xffd36b, 0xffffff, 0xff9a5c, 0xffc2dc, 0xfff0b8] }
};
