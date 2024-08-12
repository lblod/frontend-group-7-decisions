import ZittingModel from './zitting';
import { attr, belongsTo } from '@ember-data/model';

export default class InstallatieVergaderingModel extends ZittingModel {
  @belongsTo('installatievergadering-synchronization-status') synchronizationStatus;
}
