import Component from '@glimmer/component';
/**
 * @typedef {object} Args
 * @property {import('@lblod/ember-rdfa-editor').SayController?} controller
 * */

/**
 * @extends {Component<Args>}
 * */
export default class EditorPluginsAiAnalyzerModalComponent extends Component {
  get controller() {
    return this.args.controller;
  }
  get schema() {
    return this.controller?.schema;
  }

  annotate = (spot) => {
    this.controller.withTransaction(
      (t) => {
        t.replaceRangeWith(
          spot.from,
          spot.to,
          this.schema.node('inline_rdfa', {}, this.schema.text(spot.text)),
        );

        return t;
      },
      { view: this.controller.mainEditorView },
    );
    this.args.closeModal();
  };
  docAnnotate = (spot) => {
    this.args.closeModal();
  };
}
