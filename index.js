import hh from "hyperscript-helpers"; // Importiert hyperscript-helpers, um HTML-Elemente einfacher zu erstellen
import { h, diff, patch } from "virtual-dom"; // Importiert Funktionen für den virtuellen DOM
import createElement from "virtual-dom/create-element"; // Zum Erstellen von DOM-Elementen

// Extrahiert HTML-Helferfunktionen aus hyperscript-helpers
const { div, button, input, h1, label, span } = hh(h);

// TailwindCSS-Stil für die Buttons
const btnStyle = "bg-blue-600 text-white px-6 py-3 rounded text-lg";

// Definiert verschiedene Nachrichten (Actions) für die Interaktion mit der UI
const MSGS = {
  TOGGLE_FORM: "TOGGLE_FORM", // Öffnet oder schließt das Formular zum Hinzufügen einer Flashcard
  ADD_CARD: "ADD_CARD", // Fügt eine neue Karte hinzu
  DELETE_CARD: "DELETE_CARD", // (Nicht verwendet) Löscht eine Karte
  TOGGLE_ANSWER: "TOGGLE_ANSWER", // Zeigt oder versteckt die Antwort einer Karte
  RATE_CARD: "RATE_CARD", // Bewertet eine Karte (Good, Great, Bad)
  TOGGLE_EDIT: "TOGGLE_EDIT", // Öffnet oder schließt den Bearbeitungsmodus für eine Karte
  SAVE_EDIT: "SAVE_EDIT", // Speichert die Änderungen an einer Karte im Bearbeitungsmodus
};

// Hauptansichtsfunktion, die das Layout und die Flashcards anzeigt
function view(dispatch, model) {
  return div({ className: "container mx-auto flex-grow" }, [
    // Titel der Anwendung
    h1({ className: "text-4xl font-bold text-left mb-6" }, "Modul323 - Quizkarten"),
    // Schaltfläche zum Öffnen des Formulars für neue Flashcards
    button({ className: btnStyle, onclick: () => dispatch(MSGS.TOGGLE_FORM) }, "+ Add Flashcard"),
    // Zeigt das Formular an, wenn der Benutzer es öffnet
    model.showForm && createFormView(dispatch, model),
    // Überschrift für die Quizkarten-Sektion
    h1({ className: "text-3xl font-extrabold mb-4 text-center" }, "Your Quiz Cards"),
    // Container, der alle erstellten Karten anzeigt
    div({ id: "quiz-cards", className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" }, 
        model.cards.map((card, index) => createCardView(dispatch, card, index)) // Mappt jede Karte zur Anzeige
    ),
  ]);
}

// Funktion zum Erstellen des Formulars, um eine neue Karte hinzuzufügen
function createFormView(dispatch, model) {
  return div({ className: "bg-yellow-200 shadow-lg rounded p-4 max-w-xs" }, [
    // Label und Eingabefeld für die Frage
    label({ className: "font-bold text-lg" }, "Question:"),
    input({
      id: "question-input",
      type: "text",
      className: "border p-3 w-full mt-2 rounded",
      value: model.newQuestion, // Das aktuelle Modell steuert den Wert
      oninput: (e) => dispatch({ type: "UPDATE_NEW_QUESTION", value: e.target.value }), // Aktualisiert den Wert im Modell
    }),
    // Label und Eingabefeld für die Antwort
    label({ className: "font-bold text-lg mt-4" }, "Answer:"),
    input({
      id: "answer-input",
      type: "text",
      className: "border p-3 w-full mt-2 rounded",
      value: model.newAnswer, // Das aktuelle Modell steuert den Wert
      oninput: (e) => dispatch({ type: "UPDATE_NEW_ANSWER", value: e.target.value }), // Aktualisiert den Wert im Modell
    }),
    // Schaltfläche zum Speichern der neuen Karte
    button({ className: btnStyle, onclick: () => dispatch(MSGS.ADD_CARD) }, "Save Card"),
  ]);
}

// Funktion zum Erstellen einer einzelnen Karte 
function createCardView(dispatch, card, index) {
  return div({ className: "bg-yellow-100 shadow-lg rounded p-4 max-w-xs relative" }, [
    // Wenn die Karte im Bearbeitungsmodus ist, zeige das Bearbeitungsformular, andernfalls die normale Anzeige
    card.isEditing ? createEditView(dispatch, card, index) : createDisplayView(dispatch, card, index)
  ]);
}

// Ansicht für die normale Anzeige einer Karte 
function createDisplayView(dispatch, card, index) {
  return div({}, [
    // Frage der Karte
    span({ className: "font-bold" }, `Question: ${card.question}`),
    // Schaltfläche, um die Antwort ein- oder auszublenden
    span({
      className: "cursor-pointer text-blue-500",
      onclick: () => dispatch({ type: MSGS.TOGGLE_ANSWER, index }),
    }, card.showAnswer ? "Hide Answer" : "Show Answer"),
    // Zeigt die Antwort nur an, wenn die `showAnswer`-Eigenschaft wahr ist
    card.showAnswer && div({ className: "mt-2" }, `Answer: ${card.answer}`),
    // Bewertungsoptionen (Good, Great, Bad)
    div({ className: "flex justify-between mt-4" }, [
      button({ className: btnStyle, onclick: () => dispatch({ type: MSGS.RATE_CARD, index, rating: 1 }) }, "Good"),
      button({ className: btnStyle, onclick: () => dispatch({ type: MSGS.RATE_CARD, index, rating: 2 }) }, "Great"),
      button({ className: btnStyle, onclick: () => dispatch({ type: MSGS.RATE_CARD, index, rating: 0 }) }, "Bad"),
    ]),
    // Zeigt das aktuelle Ranking der Karte an
    div({}, `Ranking: ${card.ranking}`),
  ]);
}

// Ansicht für den Bearbeitungsmodus einer Karte
function createEditView(dispatch, card, index) {
  return div({}, [
    // Eingabefeld zum Bearbeiten der Frage
    input({
      type: "text",
      className: "border p-2 w-full",
      value: card.question, // Zeigt die aktuelle Frage im Eingabefeld an
      oninput: (e) => dispatch({ type: MSGS.SAVE_EDIT, index, field: "question", value: e.target.value }), // Speichert Änderungen im Modell
    }),
    // Eingabefeld zum Bearbeiten der Antwort
    input({
      type: "text",
      className: "border p-2 w-full mt-2",
      value: card.answer, // Zeigt die aktuelle Antwort im Eingabefeld an
      oninput: (e) => dispatch({ type: MSGS.SAVE_EDIT, index, field: "answer", value: e.target.value }), // Speichert Änderungen im Modell
    }),
    // Schaltfläche zum Speichern der Bearbeitung
    button({ className: btnStyle, onclick: () => dispatch({ type: MSGS.TOGGLE_EDIT, index }) }, "Save"),
  ]);
}

// Update-Funktion, um den Zustand (State) der Anwendung basierend auf Benutzeraktionen zu ändern
function update(msg, model) {
  switch (msg.type) {
    case MSGS.TOGGLE_FORM:
      // Zeigt oder versteckt das Formular zum Hinzufügen einer neuen Karte
      return { ...model, showForm: !model.showForm };
    case MSGS.ADD_CARD:
      // Fügt eine neue Karte zum Modell hinzu
      const newCard = { question: model.newQuestion, answer: model.newAnswer, ranking: 0, showAnswer: false, isEditing: false };
      return { ...model, cards: [...model.cards, newCard], newQuestion: "", newAnswer: "" };
    case MSGS.TOGGLE_ANSWER:
      // Zeigt oder versteckt die Antwort einer Karte
      return {
        ...model,
        cards: model.cards.map((card, i) => (i === msg.index ? { ...card, showAnswer: !card.showAnswer } : card)),
      };
    case MSGS.RATE_CARD:
      // Aktualisiert das Ranking der Karte basierend auf der Bewertung
      const rating = msg.rating;
      return {
        ...model,
        cards: model.cards.map((card, i) =>
          i === msg.index ? { ...card, ranking: card.ranking + rating } : card
        ),
      };
    case MSGS.SAVE_EDIT:
      // Speichert Änderungen an der Frage oder Antwort der Karte
      return {
        ...model,
        cards: model.cards.map((card, i) =>
          i === msg.index ? { ...card, [msg.field]: msg.value } : card
        ),
      };
    case MSGS.TOGGLE_EDIT:
      // Aktiviert oder deaktiviert den Bearbeitungsmodus für eine Karte
      return {
        ...model,
        cards: model.cards.map((card, i) => (i === msg.index ? { ...card, isEditing: !card.isEditing } : card)),
      };
    default:
      return model;
  }
}

// Initialmodell, das den anfänglichen Zustand der Anwendung definiert
const initModel = {
  showForm: false, // Das Formular zum Hinzufügen von Flashcards ist standardmäßig ausgeblendet
  newQuestion: "", // Leerer String für neue Frage
  newAnswer: "", // Leerer String für neue Antwort
  cards: [], // Leeres Array für die Flashcards
};

// ⚠️ Impure code below (not avoidable but controllable)
function app(initModel, update, view, node) {
  let model = initModel;
  let currentView = view(dispatch, model);
  let rootNode = createElement(currentView);
  node.appendChild(rootNode);
  function dispatch(msg) {
    model = update(msg, model);
    const updatedView = view(dispatch, model);
    const patches = diff(currentView, updatedView);
    rootNode = patch(rootNode, patches);
    currentView = updatedView;
  }
}

// The root node of the app (the div with id="app" in index.html)
const rootNode = document.getElementById("app");

// Start the app
app(initModel, update, view, rootNode);
