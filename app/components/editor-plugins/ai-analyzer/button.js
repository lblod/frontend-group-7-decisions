import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class EditorPluginsAiAnalyzerButtonComponent extends Component {
  @tracked modalOpen = false;
  openModal = () => {
    this.modalOpen = true;
  };

  onCloseModal = () => {
    this.modalOpen = false;
  };
}
