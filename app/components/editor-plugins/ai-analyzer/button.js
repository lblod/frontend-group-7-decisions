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

  findTextInEditor = () => {
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
  });

  openModal = async () => {
    this.spots = this.findTextInEditor();
    await this.fetchAiResponsesTask.perform();
    this.modalOpen = true;
  };

  onCloseModal = () => {
    this.modalOpen = false;
  };
}
