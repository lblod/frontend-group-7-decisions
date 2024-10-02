import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';

const responses = [
  { uri: 'http://data.vlaanderen/ABB', foundIn: 'ABB' },
  {
    uri: 'http://data.vlaanderen/ABB',
    foundIn: 'Agentschap Binnenlands Bestuur',
  },
  { uri: 'http://data.vlaanderen/Test', foundIn: 'Test', alwaysFind: true },
];

/**
 * @typedef {object} Args
 * @property {import('@lblod/ember-rdfa-editor').SayController?} controller
 * */

/**
 * @extends {Component<Args>}
 * */
export default class EditorPluginsAiAnalyzerButtonComponent extends Component {
  @tracked modalOpen = false;
  @tracked spots = [];

  get controller() {
    return this.args.controller;
  }
  get content() {
    return this.controller.htmlContent;
  }

  findTextInEditor = (responses) => {
    const foundSpots = [];
    const doc = this.controller?.mainEditorState.doc;
    const unfoundResponses = new Set();
    for (const response of responses) {
      doc.descendants((node, pos) => {
        if (node.isText) {
          /** @type {string} */
          const content = node.textContent;
          const matches = [...content.matchAll(response.foundIn)];
          if (
            !matches.length &&
            response.alwaysFind &&
            !unfoundResponses.has(response.uri)
          ) {
            foundSpots.push({ type: response.uri, found: false });
            unfoundResponses.add(response.uri);
          }
          for (const match of matches) {
            console.log('match', match);
            const index = match.index;
            const textPos = pos + index;
            const foundText = match[0];
            const len = foundText.length;
            const contextText = foundText;
            foundSpots.push({
              from: textPos,
              to: textPos + len,
              text: foundText,
              contextText,
              type: response.uri,
              found: true,
            });
          }
        }
      });
    }
    return foundSpots;
  };
  fetchAiResponsesTask = task(async () => {
    // await timeout(400);
    // console.log('FETCH', this.content);
    const response = await fetch(
      'http://localhost:8080/extract_organisation/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // body: '{"input_text": "Vanaf 2022 tot en met 2026 kent de Vlaams Regering aan de gemeenten een algemene werkingssubsidie toe ter gedeeltelijke compensatie van hun verlies aan ontvangsten uit dividenden. Dat dividendverlies is een gevolg van de nieuwe tariefmethodologie die door de Vlaamse Regulator van de Elektriciteits- en Gasmarkt (VREG) werd vastgesteld voor de reguleringsperiode 2021-2024."}',
        body: JSON.stringify({
          input_text: this.controller.mainEditorState.doc.textContent,
        }),
      },
    );
    const json = await response.json();
    const orgs = json.organisations_list;
    return orgs.map((org) => ({ uri: 'http://test.com/test', foundIn: org }));
  });

  openModal = async () => {
    const responses = await this.fetchAiResponsesTask.perform();
    this.spots = this.findTextInEditor(responses);
    this.modalOpen = true;
  };

  onCloseModal = () => {
    this.modalOpen = false;
  };
}
